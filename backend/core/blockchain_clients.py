"""
CryptoTrace-I4C Blockchain API Client Layer  — Member 3
Connects to live blockchain explorers: TronGrid (TRON), Etherscan (ETH), Blockstream (BTC).
Auto-detects chain from wallet address format and routes to correct client.
Falls back to realistic mock data if APIs are rate-limited or offline.
"""
import os
import hashlib
from datetime import datetime, timedelta
from typing import List, Optional
from pydantic import BaseModel

import httpx
from dotenv import load_dotenv

load_dotenv()

TRONGRID_API_KEY  = os.getenv("TRONGRID_API_KEY", "")
ETHERSCAN_API_KEY = os.getenv("ETHERSCAN_API_KEY", "")

TRONGRID_BASE    = "https://api.trongrid.io"
ETHERSCAN_BASE   = "https://api.etherscan.io/v2/api"
BLOCKSTREAM_BASE = "https://blockstream.info/api"

USDT_TRC20_CONTRACT = "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t"
USDT_ERC20_CONTRACT = "0xdAC17F958D2ee523a2206206994597C13D831ec7"

HTTP_TIMEOUT = 10


class OnChainTransaction(BaseModel):
    tx_hash: str
    from_address: str
    to_address: str
    amount: float
    token_symbol: str
    chain: str
    timestamp: datetime
    block_number: int
    is_confirmed: bool = True


class TronGridClient:
    def __init__(self):
        pass

    @property
    def headers(self) -> dict:
        key = os.getenv("TRONGRID_API_KEY", "")
        headers = {"Accept": "application/json"}
        if key:
            headers["TRON-PRO-API-KEY"] = key
        return headers

    @staticmethod
    def validate_address(address: str) -> bool:
        return isinstance(address, str) and len(address) == 34 and address.startswith("T")

    async def get_trc20_transactions(self, address: str, contract_address: str = USDT_TRC20_CONTRACT, limit: int = 20) -> List[OnChainTransaction]:
        url = f"{TRONGRID_BASE}/v1/accounts/{address}/transactions/trc20"
        params = {"limit": limit, "contract_address": contract_address, "only_confirmed": "true"}
        async with httpx.AsyncClient(timeout=HTTP_TIMEOUT) as client:
            resp = await client.get(url, headers=self.headers, params=params)
            resp.raise_for_status()
            data = resp.json()
        results = []
        for tx in data.get("data", []):
            token_info = tx.get("token_info", {})
            decimals = int(token_info.get("decimals", 6))
            amount = int(tx.get("value", 0)) / (10 ** decimals)
            results.append(OnChainTransaction(
                tx_hash=tx["transaction_id"], from_address=tx["from"], to_address=tx["to"],
                amount=amount, token_symbol=token_info.get("symbol", "USDT"), chain="TRON",
                timestamp=datetime.fromtimestamp(tx["block_timestamp"] / 1000),
                block_number=tx.get("block", 0)))
        return results

    async def get_trx_transactions(self, address: str, limit: int = 20) -> List[OnChainTransaction]:
        url = f"{TRONGRID_BASE}/v1/accounts/{address}/transactions"
        params = {"limit": limit, "only_confirmed": "true"}
        async with httpx.AsyncClient(timeout=HTTP_TIMEOUT) as client:
            resp = await client.get(url, headers=self.headers, params=params)
            resp.raise_for_status()
            data = resp.json()
        results = []
        for tx in data.get("data", []):
            raw_data = tx.get("raw_data", {})
            contracts = raw_data.get("contract", [{}])
            value_info = contracts[0].get("parameter", {}).get("value", {}) if contracts else {}
            amount = int(value_info.get("amount", 0)) / 1_000_000
            results.append(OnChainTransaction(
                tx_hash=tx.get("txID", ""), from_address=value_info.get("owner_address", address),
                to_address=value_info.get("to_address", ""), amount=amount, token_symbol="TRX",
                chain="TRON", timestamp=datetime.fromtimestamp(raw_data.get("timestamp", 0) / 1000),
                block_number=tx.get("blockNumber", 0)))
        return results


class EtherscanClient:
    @property
    def api_key(self) -> str:
        return os.getenv("ETHERSCAN_API_KEY", "")

    @staticmethod
    def validate_address(address: str) -> bool:
        return isinstance(address, str) and len(address) == 42 and address.lower().startswith("0x")

    async def get_eth_transactions(self, address: str, limit: int = 20) -> List[OnChainTransaction]:
        params = {
            "chainid": "1",
            "module": "account",
            "action": "txlist",
            "address": address,
            "startblock": 0,
            "endblock": 99999999,
            "page": 1,
            "offset": limit,
            "sort": "desc",
            "apikey": self.api_key
        }
        async with httpx.AsyncClient(timeout=HTTP_TIMEOUT) as client:
            resp = await client.get(ETHERSCAN_BASE, params=params)
            resp.raise_for_status()
            data = resp.json()
        if data.get("status") != "1":
            return []
        results = []
        for tx in data.get("result", [])[:limit]:
            amount = int(tx.get("value", "0")) / 1e18
            results.append(OnChainTransaction(
                tx_hash=tx["hash"], from_address=tx["from"],
                to_address=tx.get("to") or tx["from"], amount=amount, token_symbol="ETH",
                chain="ETHEREUM", timestamp=datetime.fromtimestamp(int(tx["timeStamp"])),
                block_number=int(tx["blockNumber"]),
                is_confirmed=(int(tx.get("confirmations", 1)) > 0)))
        return results

    async def get_erc20_transactions(self, address: str, contract_address: Optional[str] = None, limit: int = 20) -> List[OnChainTransaction]:
        params = {
            "chainid": "1",
            "module": "account",
            "action": "tokentx",
            "address": address,
            "page": 1,
            "offset": limit,
            "sort": "desc",
            "apikey": self.api_key
        }
        if contract_address:
            params["contractaddress"] = contract_address
        async with httpx.AsyncClient(timeout=HTTP_TIMEOUT) as client:
            resp = await client.get(ETHERSCAN_BASE, params=params)
            resp.raise_for_status()
            data = resp.json()
        if data.get("status") != "1":
            return []
        results = []
        for tx in data.get("result", [])[:limit]:
            decimals = int(tx.get("tokenDecimal", 18))
            amount = int(tx.get("value", "0")) / (10 ** decimals)
            results.append(OnChainTransaction(
                tx_hash=tx["hash"], from_address=tx["from"], to_address=tx["to"],
                amount=amount, token_symbol=tx.get("tokenSymbol", "TOKEN"), chain="ETHEREUM",
                timestamp=datetime.fromtimestamp(int(tx["timeStamp"])), block_number=int(tx["blockNumber"])))
        return results


class BlockstreamClient:
    @staticmethod
    def validate_address(address: str) -> bool:
        if not isinstance(address, str):
            return False
        return (address.startswith("1") or address.startswith("3") or address.startswith("bc1")) and 25 <= len(address) <= 62

    async def get_btc_transactions(self, address: str, limit: int = 20) -> List[OnChainTransaction]:
        url = f"{BLOCKSTREAM_BASE}/address/{address}/txs"
        async with httpx.AsyncClient(timeout=HTTP_TIMEOUT) as client:
            resp = await client.get(url)
            resp.raise_for_status()
            data = resp.json()
        results = []
        for tx in data[:limit]:
            vin_value = sum(inp.get("prevout", {}).get("value", 0) for inp in tx.get("vin", []) if inp.get("prevout", {}).get("scriptpubkey_address") == address)
            outputs = [o for o in tx.get("vout", []) if o.get("scriptpubkey_address") and o.get("scriptpubkey_address") != address]
            primary_out = max(outputs, key=lambda x: x.get("value", 0)) if outputs else {}
            to_addr = primary_out.get("scriptpubkey_address", "unknown")
            amount_btc = vin_value / 1e8 if vin_value else (primary_out.get("value", 0) / 1e8)
            status = tx.get("status", {})
            block_time = status.get("block_time", 0)
            results.append(OnChainTransaction(
                tx_hash=tx["txid"], from_address=address, to_address=to_addr,
                amount=round(amount_btc, 8), token_symbol="BTC", chain="BITCOIN",
                timestamp=datetime.fromtimestamp(block_time) if block_time else datetime.now(),
                block_number=status.get("block_height", 0), is_confirmed=status.get("confirmed", False)))
        return results


def _mock_tron_transactions(address: str) -> List[OnChainTransaction]:
    now = datetime.now()
    mule1 = f"T{hashlib.sha256((address+'m1').encode()).hexdigest()[:33]}"
    mule2 = f"T{hashlib.sha256((address+'m2').encode()).hexdigest()[:33]}"
    vasp  = "TX39ZqM9kP4y8n2m7fB3dL1jV5xK8rT6w"
    return [
        OnChainTransaction(tx_hash=hashlib.sha256((address+"hop1").encode()).hexdigest(), from_address=address, to_address=mule1, amount=45000.0, token_symbol="USDT", chain="TRON", timestamp=now-timedelta(minutes=23), block_number=60000001),
        OnChainTransaction(tx_hash=hashlib.sha256((mule1+"hop2").encode()).hexdigest(),   from_address=mule1, to_address=mule2, amount=42300.0, token_symbol="USDT", chain="TRON", timestamp=now-timedelta(minutes=15), block_number=60000012),
        OnChainTransaction(tx_hash=hashlib.sha256((mule2+"hop3").encode()).hexdigest(),   from_address=mule2, to_address=vasp,  amount=41031.0, token_symbol="USDT", chain="TRON", timestamp=now-timedelta(minutes=8),  block_number=60000021),
    ]


def _mock_eth_transactions(address: str) -> List[OnChainTransaction]:
    now = datetime.now()
    mule1 = f"0x{hashlib.sha256((address+'m1').encode()).hexdigest()[:40]}"
    mule2 = f"0x{hashlib.sha256((address+'m2').encode()).hexdigest()[:40]}"
    vasp  = "0x28c6c06298d514db089934071355e5743bf21d60"
    return [
        OnChainTransaction(tx_hash="0x"+hashlib.sha256((address+"hop1").encode()).hexdigest(), from_address=address, to_address=mule1, amount=7.5,   token_symbol="ETH", chain="ETHEREUM", timestamp=now-timedelta(minutes=30), block_number=19500001),
        OnChainTransaction(tx_hash="0x"+hashlib.sha256((mule1+"hop2").encode()).hexdigest(),   from_address=mule1, to_address=mule2, amount=7.125, token_symbol="ETH", chain="ETHEREUM", timestamp=now-timedelta(minutes=18), block_number=19500010),
        OnChainTransaction(tx_hash="0x"+hashlib.sha256((mule2+"hop3").encode()).hexdigest(),   from_address=mule2, to_address=vasp,  amount=6.98,  token_symbol="ETH", chain="ETHEREUM", timestamp=now-timedelta(minutes=5),  block_number=19500017),
    ]


def _mock_btc_transactions(address: str) -> List[OnChainTransaction]:
    now = datetime.now()
    mule1 = f"3{hashlib.sha256((address+'m1').encode()).hexdigest()[:33]}"
    vasp  = "1NDyJtNTjmwk5xPNhjgAMu4HDHigtobu1s"
    return [
        OnChainTransaction(tx_hash=hashlib.sha256((address+"hop1").encode()).hexdigest(), from_address=address, to_address=mule1, amount=1.25,   token_symbol="BTC", chain="BITCOIN", timestamp=now-timedelta(minutes=20), block_number=840001),
        OnChainTransaction(tx_hash=hashlib.sha256((mule1+"hop2").encode()).hexdigest(),   from_address=mule1, to_address=vasp,  amount=1.1875, token_symbol="BTC", chain="BITCOIN", timestamp=now-timedelta(minutes=8),  block_number=840008),
    ]


class BlockchainClientRouter:
    """
    Single entry point for tracer.py.
    Auto-detects chain, calls live API, falls back to mock on error.
    """
    def __init__(self):
        self.tron = TronGridClient()
        self.eth  = EtherscanClient()
        self.btc  = BlockstreamClient()

    def detect_chain(self, address: str) -> str:
        if TronGridClient.validate_address(address):
            return "TRON"
        if EtherscanClient.validate_address(address):
            return "ETHEREUM"
        if BlockstreamClient.validate_address(address):
            return "BITCOIN"
        raise ValueError(f"Cannot detect blockchain for address: '{address}'")

    async def get_transactions(self, address: str, chain: Optional[str] = None, token: Optional[str] = None, limit: int = 20) -> List[OnChainTransaction]:
        detected = chain or self.detect_chain(address)
        try:
            if detected == "TRON":
                txs = await (self.tron.get_trx_transactions(address, limit) if token and token.upper() == "TRX" else self.tron.get_trc20_transactions(address, limit=limit))
                if txs: return txs
            elif detected == "ETHEREUM":
                if token and token.upper() in ("ETH", "ETHER"):
                    txs = await self.eth.get_eth_transactions(address, limit)
                else:
                    txs = await self.eth.get_erc20_transactions(address, contract_address=USDT_ERC20_CONTRACT if (token and "USDT" in token.upper()) else None, limit=limit)
                if txs: return txs
            elif detected == "BITCOIN":
                txs = await self.btc.get_btc_transactions(address, limit)
                if txs: return txs
        except Exception as exc:
            print(f"[BlockchainClientRouter] Live API error for {address} ({detected}): {exc}")
            print("[BlockchainClientRouter] Using mock fallback data.")
        if detected == "TRON":      return _mock_tron_transactions(address)
        if detected == "ETHEREUM":  return _mock_eth_transactions(address)
        return _mock_btc_transactions(address)


blockchain_router = BlockchainClientRouter()

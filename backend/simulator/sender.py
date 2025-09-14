import os
import subprocess
from typing import Tuple, Union

import redis
import requests
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from loguru import logger
from pydantic import BaseModel

load_dotenv()
SLACK_WEBHOOK_URL = os.environ.get("SLACK_WEBHOOK_URL", "unknown")
logger.add("sender.log", rotation="500 MB")
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class Account(BaseModel):
    address: str


class Result(BaseModel):
    status: str
    message: Union[str, None] = None


def send_slack_message(message: str):
    payload = {"text": message}
    requests.post(SLACK_WEBHOOK_URL, json=payload)


def run(cmd: str) -> Tuple[bool, str]:
    ans = subprocess.run(cmd, shell=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
    try:
        ans.check_returncode()
        result = ans.stdout.decode("utf-8")
        logger.info(result)
        return True, result
    except Exception as e:
        result = ans.stdout.decode("utf-8")
        logger.error(e)
        logger.error(result)
        send_slack_message(f"<!channel> Error!\n```{result}```")
        return False, result


def send_money(address: str) -> Tuple[bool, str]:
    logger.info(f"Start >>>>>>>>>> send money to {address}")

    # check ttl first
    r = redis.Redis(host="localhost", port=6379, db=0)
    claim_key = f"claim:{address}"
    faucet_key = f"faucet:{address}"

    if r.get(claim_key) is not None:
        return False, "Already claimed money within 10 mins"

    r.set(claim_key, "claimed", ex=600)

    if r.get(faucet_key) is not None:
        send_slack_message(f"```=== faucet ===\nAddress: {address}\nFailed: Already sent money within 24 hours```")
        return False, "Already sent money within 24 hours"

    flag, result = run(f"TARGET_ACCOUNT={address} npx hardhat run --network sepolia scripts/send.ts")
    if flag:
        r.set(faucet_key, "sent", ex=86400)
        messages = "\n".join(result.splitlines()[-5:])
        send_slack_message(f"```{messages}```")
        return True, "Successfully sent money"

    return False, "Internal error"


@app.get("/")
def root():
    return {"message": "send money!"}


@app.post("/send")
def send(account: Account):
    flag, message = send_money(account.address)
    return Result(status="success" if flag else "failed", message=message)

import os
import random
import re
import subprocess
import time
from argparse import ArgumentParser
from pprint import pprint
from typing import List, Tuple

import requests
import schedule
from dotenv import load_dotenv
from loguru import logger

load_dotenv()
SLACK_WEBHOOK_URL = os.environ.get("SLACK_WEBHOOK_URL", "unknown")
logger.add("simulator.log", rotation="500 MB")
private_keys: List[str] = []


def send_slack_message(message: str):
    payload = {"text": message}
    requests.post(SLACK_WEBHOOK_URL, json=payload)


def run(cmd: str) -> Tuple[bool, str]:
    result = ""
    for i in range(3):
        logger.info(f"Try: {i}; Run: {cmd}")
        ans = subprocess.run(cmd, shell=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
        if ans.returncode == 0:
            result = ans.stdout.decode("utf-8")
            logger.info(result)
            return True, result
        else:
            result = ans.stdout.decode("utf-8")
            logger.error(result)
            time.sleep(10)

    send_slack_message(f"<!channel> Error!\n```{result}```")
    return False, result


def info():
    logger.info("Start >>>>>>>>>> info")
    run("npx hardhat run --network sepolia scripts/info.ts")


def play():
    logger.info("Start >>>>>>>>>> play")
    pk = random.choice(private_keys)
    quantity = random.choice([1, 10])
    flag, result = run(f"PRIVATE_KEY={pk} QUANTITY={quantity} npx hardhat run --network sepolia scripts/play.ts")
    if flag:
        player = re.findall("^  player: '0x.*$", result, re.MULTILINE)[0]
        requestId = re.findall("^  requestId: BigNumber.*$", result, re.MULTILINE)[0]
        quantity = re.findall("^  quantity: BigNumber.*$", result, re.MULTILINE)[0]
        wbtcOut = re.findall("^  wbtcOut: BigNumber.*$", result, re.MULTILINE)[0]
        send_slack_message(f"```=== play ===\n{player}\n{requestId}\n{quantity}\n{wbtcOut}```")


def transfer():
    pk = private_keys[0]
    logger.info("Start >>>>>>>>>> transfer")
    flag, result = run(f"PRIVATE_KEY={pk} npx hardhat run --network sepolia scripts/transfer.ts")
    if flag:
        amount_usdt = re.findall("^  amount_usdt: BigNumber.*$", result, re.MULTILINE)[0]
        amount_wbtc = re.findall("^  amount_wbtc: BigNumber.*$", result, re.MULTILINE)[0]
        send_slack_message(f"```=== transfer ===\n{amount_usdt}\n{amount_wbtc}```")


def deposit():
    logger.info("Start >>>>>>>>>> deposit")
    pk = private_keys[0]
    value = random.uniform(0.05, 0.2)
    flag, result = run(f"PRIVATE_KEY={pk} VALUE={value:.4f} npx hardhat run --network sepolia scripts/deposit.ts")
    if flag:
        amount_wbtc = re.findall("^  amount_wbtc: BigNumber.*$", result, re.MULTILINE)[0]
        amount_xbit = re.findall("^  amount_xbit: BigNumber.*$", result, re.MULTILINE)[0]
        send_slack_message(f"```=== deposit ===\n{amount_wbtc}\n{amount_xbit}```")


def main():
    logger.info("Start Simulator...")

    parser = ArgumentParser()
    parser.add_argument("--private-keys", nargs="+", required=True)
    private_keys.extend(parser.parse_args().private_keys)
    logger.info(f"private_keys:\n{private_keys}")

    # schedule.every().minute.do(info)
    schedule.every(10).to(20).minutes.do(play)
    schedule.every(10).to(15).hours.do(deposit)
    schedule.every(20).to(30).hours.do(transfer)

    while True:
        idle_seconds = schedule.idle_seconds()
        pprint(schedule.jobs)
        if idle_seconds is None:
            break
        elif idle_seconds > 0:
            time.sleep(idle_seconds)

        schedule.run_pending()


if __name__ == "__main__":
    main()

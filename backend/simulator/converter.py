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
    flag, result = run("npx hardhat run --network arbitrum scripts/info.ts")
    if flag:
        ans = result.splitlines()[-2] + "\n" + result.splitlines()[-1]
        send_slack_message(f"```=== info ===\n{ans}```")


def convert():
    logger.info("Start >>>>>>>>>> convert")
    flag, result = run("npx hardhat run --network arbitrum scripts/convert.ts")
    if flag:
        ans = result.splitlines()[-1]
        if ans != "usdt pool is not full, no need to convert":
            send_slack_message(f"```=== convert ===\n{ans}```")


def main():
    logger.info("Start Converter...")
    info()

    parser = ArgumentParser()
    parser.add_argument("--now", action="store_true", help="Run now")
    arguments = parser.parse_args()

    if arguments.now:
        convert()
        return

    schedule.every(5).minutes.do(convert)
    schedule.every(60).minutes.do(info)

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

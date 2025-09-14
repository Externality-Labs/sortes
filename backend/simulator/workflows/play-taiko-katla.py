#!/usr/bin/env python
import os
import subprocess
import time
from argparse import ArgumentParser
from pprint import pprint
from threading import Thread
from typing import List, Tuple

import requests
import schedule
from dotenv import load_dotenv
from loguru import logger

load_dotenv()
SLACK_WEBHOOK_URL = os.environ.get("SLACK_WEBHOOK_URL", "unknown")
logger.add("play-taiko-katla.log", rotation="500 MB")
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


def info(network: str):
    logger.info("Start >>>>>>>>>> info")
    flag, result = run(f"npx hardhat run --network {network} scripts/info.ts")
    if flag:
        ans = result.splitlines()[-2] + "\n" + result.splitlines()[-1]
        send_slack_message(f"```=== info ===\nnetwork: {network}\n{ans}```")


def play(network: str, private_key: str, swap: str, dollar: str):
    def _play(network: str, private_key: str, swap: str, dollar: str):
        logger.info("Start >>>>>>>>>> play")
        logger.info(f"{network}, {private_key}, {swap}, {dollar}")
        time.sleep(10)

    # non-blocking thread
    t = Thread(target=_play, args=[network, private_key, swap, dollar])
    t.start()


def convert(network: str, dollar: str):
    def _convert(network: str, dollar: str):
        logger.info("Start >>>>>>>>>> convert")
        logger.info(f"{network} {dollar}")
        flag, result = run(f"npx hardhat convert --network {network} --dollar {dollar}")
        if flag:
            ans = result.splitlines()[-1]
            if not ans.endswith("no need to convert"):
                send_slack_message(f"```=== convert ===\n{ans}```")

    # non-blocking thread
    t = Thread(target=_convert, args=[network, dollar])
    t.start()


def main():
    logger.info("Start Player...")
    parser = ArgumentParser()
    parser.add_argument("--network", required=True)
    parser.add_argument("--private-keys", nargs="+", required=True)
    parser.add_argument("--now", action="store_true", help="Run now")

    arguments = parser.parse_args()
    logger.info(f"args: {arguments}")

    info(arguments.network)

    if arguments.now:
        for private_key in arguments.private_keys:
            play(arguments.network, private_key, "2", "100")
        convert(arguments.network, "1000")
        return

    schedule.every(60).minutes.do(info, arguments.network)
    schedule.every(10).to(30).minutes.do(convert, arguments.network, "1000")

    for private_key in arguments.private_keys:
        schedule.every(5).to(10).minutes.do(play, arguments.network, private_key, "2", "100")

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

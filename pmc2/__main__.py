"""Run a controlled F.2 scenario: python -m pmc2 --scenario no_news."""
import argparse
import json
from pmc2.demo import SCENARIOS, run_demo
parser = argparse.ArgumentParser()
parser.add_argument('--scenario', choices=SCENARIOS, default='valid')
parser.add_argument('--stock-a', default='AAPL')
parser.add_argument('--stock-b', default='MSFT')
args = parser.parse_args()
print(json.dumps(run_demo(args.scenario, args.stock_a, args.stock_b), indent=2))

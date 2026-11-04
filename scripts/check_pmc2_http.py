"""Exercise actual local HTTP transport and F.2 internal handoff without live services."""
import json
import socket
import subprocess
import sys
import time
from urllib.request import Request, urlopen
from urllib.error import HTTPError
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
from pmc2.demo import demo_configuration, synthetic_responses


def main():
    with socket.socket() as sock:
        sock.bind(('127.0.0.1', 0))
        port = sock.getsockname()[1]
    process = subprocess.Popen([sys.executable, '-m', 'uvicorn', 'walking_skeleton.backend.main:app',
                                '--host', '127.0.0.1', '--port', str(port), '--no-access-log'], cwd=ROOT,
                               stdout=subprocess.DEVNULL, stderr=subprocess.PIPE)
    base = f'http://127.0.0.1:{port}'
    def post(path, data):
        request = Request(base + path, data=json.dumps(data).encode(), headers={'Content-Type': 'application/json'})
        with urlopen(request, timeout=5) as response:
            return json.load(response)
    try:
        for _ in range(100):
            if process.poll() is not None:
                raise RuntimeError(process.stderr.read().decode())
            try:
                with urlopen(base + '/pmc2', timeout=.2) as response:
                    assert b'Evidence before ranking' in response.read()
                break
            except OSError:
                time.sleep(.05)
        else:
            raise RuntimeError('local server did not start')
        pair = post('/internal/f1/validate-pair', {'stock_a': ' aapl ', 'stock_b': 'MSFT'})
        assert pair['valid'] and pair['stock_pair'] == ['AAPL', 'MSFT']
        context = post('/internal/f1/preserve-context', {'pair_result': pair, 'analysis_date': '2026-09-21', 'request_id': 'http-f1', 'configuration': demo_configuration()})
        assert context['accepted'] and context['request']['request_id'] == 'http-f1'
        duplicate = post('/internal/f1/validate-pair', {'stock_a': 'AAPL', 'stock_b': 'AAPL'})
        assert not duplicate['valid'] and duplicate['reason'] == 'duplicate_symbols'
        valid = post('/api/pmc2/demo', {'scenario': 'valid'})
        assert valid['evidence']['score_ready'] and len(valid['evidence']['market_records']) == 210
        assert not post('/api/pmc2/demo', {'scenario': 'missing_unselected_stock'})['evidence']['score_ready']
        assert post('/api/pmc2/demo', {'scenario': 'no_news'})['evidence']['score_ready']
        config = demo_configuration()
        q = post('/internal/f2/acquire', {'request': {'request_id': 'http-test', 'stock_pair': ['AAPL', 'MSFT'], 'analysis_date': '2026-09-21'}, 'configuration': config})
        market, news = synthetic_responses(q)
        result = post('/internal/f2/validate', {'context': q['context'], 'market_records': market, 'news_records': news, 'configuration': config})
        assert result['score_ready'] and result['request_id'] == 'http-test'
        try:
            post('/api/pmc2/demo', {'stock_a': 'AAPL', 'stock_b': 'AAPL'})
            raise AssertionError('duplicate pair accepted')
        except HTTPError as error:
            assert error.code == 422
        print('PASS: F.1 pair/context HTTP handoff, evidence page, valid/blocked/limited cases, internal LF.02 HTTP handoff, invalid-pair 422')
    finally:
        process.terminate()
        process.wait(timeout=5)


if __name__ == '__main__':
    main()

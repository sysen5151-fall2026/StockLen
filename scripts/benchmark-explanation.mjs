import assert from 'node:assert/strict';
import { fork } from 'node:child_process';
import { once } from 'node:events';
import { createServer } from 'node:http';
import { arch, cpus, platform } from 'node:os';
import { compareWithExplanationModel, inferLocalExplanation } from '../pmc2/browser/local-explanation.mjs';

if (process.argv[2] === 'provider-fixture') {
  const server = createServer(async (request, response) => {
    if (request.method !== 'POST' || request.url !== '/explain') {
      response.writeHead(404).end();
      return;
    }
    try {
      let body = '';
      for await (const chunk of request) {
        body += chunk;
        if (body.length > 65536) {
          response.writeHead(413).end();
          return;
        }
      }
      const candidate = inferLocalExplanation(JSON.parse(body));
      response.writeHead(200, { 'content-type': 'application/json' }).end(JSON.stringify(candidate));
    } catch {
      response.writeHead(400).end();
    }
  });
  server.listen(0, '127.0.0.1', () => process.send(server.address().port));
  process.on('disconnect', () => server.close());
} else {
  const child = fork(new URL(import.meta.url), ['provider-fixture']);
  try {
    const [port] = await once(child, 'message');
    const httpFixture = async payload => {
      const response = await fetch(`http://127.0.0.1:${port}/explain`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(1000),
      });
      if (!response.ok) throw new Error(`Model request failed: ${response.status}`);
      return response.json();
    };
    const observations = { sameHost: [], providerFixture: [] };
    const options = { stockA: 'AAPL', stockB: 'MSFT', requestId: 'task6-replay' };
    for (let index = 0; index < 22; index++) {
      for (const [name, adapter] of Object.entries({ sameHost: inferLocalExplanation, providerFixture: httpFixture })) {
        const start = performance.now();
        const result = await compareWithExplanationModel(options, adapter);
        const elapsed = performance.now() - start;
        assert.equal(result.explanation.available, true);
        if (index >= 2) observations[name].push(elapsed);
      }
    }
    const summarize = series => ({
      valid: series.length,
      p50_ms: [...series].sort((a, b) => a - b)[9],
      p95_ms: [...series].sort((a, b) => a - b)[18],
      max_ms: Math.max(...series),
    });
    console.log(JSON.stringify({
      environment: { node: process.version, platform: platform(), arch: arch(), cpu: cpus()[0].model },
      warmups_per_option: 2,
      boundary: 'comparison call to checked IO.02 result object',
      observations_ms: observations,
      summary: Object.fromEntries(Object.entries(observations).map(([name, series]) => [name, summarize(series)])),
    }, null, 2));
  } finally {
    child.disconnect();
    await once(child, 'exit');
  }
}

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

class Element {
  dataset = {};
  children = [];
  value = '';
  textContent = '';
  append(...children) { this.children.push(...children); }
  replaceChildren(...children) { this.children = children; }
}

test('the comparison form defaults to local inference and preserves scores on fallback', async t => {
  const page = new URL('../pmc2/browser/compare.html', import.meta.url);
  const html = await readFile(page, 'utf8');
  const nodes = new Map(Array.from(html.matchAll(/id="([^"]+)"/g), ([, id]) => [id, new Element()]));
  for (const [, id, value] of html.matchAll(/<input id="([^"]+)"[^>]* value="([^"]+)"/g)) nodes.get(id).value = value;
  for (const [, id, value] of html.matchAll(/<select id="([^"]+)"><option value="([^"]+)"/g)) nodes.get(id).value = value;
  const get = id => nodes.get(id);
  const oldDocument = globalThis.document;
  const oldFrame = globalThis.requestAnimationFrame;
  globalThis.document = { getElementById: get, createElement: () => new Element() };
  globalThis.requestAnimationFrame = fn => queueMicrotask(fn);
  t.after(() => {
    if (oldDocument === undefined) delete globalThis.document;
    else globalThis.document = oldDocument;
    if (oldFrame === undefined) delete globalThis.requestAnimationFrame;
    else globalThis.requestAnimationFrame = oldFrame;
  });

  const script = html.match(/<script type="module">([\s\S]*?)<\/script>/)[1]
    .replace(/from '\.\/([^']+)'/g, (_, relative) => `from '${new URL(relative, page)}'`);
  await import(`data:text/javascript;base64,${Buffer.from(script).toString('base64')}`);
  const submit = () => get('form').onsubmit({ preventDefault() {} });
  assert.equal(get('explanation').value, 'local');
  await submit();
  assert.equal(get('status').dataset.state, 'completed');
  assert.equal(JSON.parse(get('aiOutput').textContent).result.mode, 'local_checked_model');
  const scores = JSON.parse(get('scoreOutput').textContent).stocks;
  for (const mode of ['invalid', 'unavailable']) {
    get('explanation').value = mode;
    await submit();
    assert.equal(get('status').dataset.state, 'completed_with_limitations');
    assert.deepEqual(JSON.parse(get('scoreOutput').textContent).stocks.map(({ score }) => score), scores.map(({ score }) => score));
    assert.match(get('explanationText').textContent, /Explanation unavailable/);
    assert.equal(get('result').hidden, false);
  }
});

import test from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {validatePair,preserveRequest,computeScores,identifyDrivers,packageExplanation,syntheticExplanation,checkExplanation,renderComparison,reportStatus,compareStocks} from '../pmc2/browser/system.mjs';
import {runEvidence} from '../pmc2/browser/evidence.mjs';
const requestId='system-test';
const run=options=>compareStocks({requestId,...options});
test('DR-01/02: valid, normalized, duplicate and outside-universe pairs preserve correct context',()=>{
 assert.deepEqual(validatePair(' aapl ','msft').stock_pair,['AAPL','MSFT']);
 for(const [a,b,reason] of [['AAPL','AAPL','duplicate_symbols'],['OUTSIDE','MSFT','ineligible_symbol']]){
  const r=run({stockA:a,stockB:b});assert.equal(r.history.at(-1).reason,reason);assert.equal(r.evidence,null);assert.equal(r.record,null);
 }
 const r=run();assert.equal(r.request.request.request_id,requestId);assert.equal(r.request.request.analysis_date,'2026-09-21');assert.equal(r.request.request.configuration_id,r.record.configuration_id);
 assert.equal(run({analysisDate:'2026-09-20'}).history.at(-1).reason,'unsupported_snapshot_date');
 assert.equal(preserveRequest(validatePair('AAPL','MSFT'),'2026-09-21','',{configuration_id:'bad'}).accepted,false);
});
test('DR-05: scoring matches independent Python statistics and average-rank reference',()=>{
 const py=JSON.parse(execFileSync(process.env.PYTHON||(process.platform==='win32'?'python':'python3'),['-c',`import json,statistics
from pmc2.demo import run_demo
r=run_demo()['evidence']['market_records']
rows=[]
for symbol in ['AAPL','MSFT','AMZN','GOOGL','META','NVDA','TSLA','JPM','JNJ','XOM']:
 p=[x['adjusted_close'] for x in sorted(r,key=lambda x:x['observation_date']) if x['symbol']==symbol]
 returns=[p[i]/p[i-1]-1 for i in range(1,21)]
 rows.append(dict(symbol=symbol,momentum=p[-1]/p[0]-1,volatility=statistics.stdev(returns)))
for row in rows:
 mr=1+sum(x['momentum']<row['momentum'] for x in rows)+(sum(x['momentum']==row['momentum'] for x in rows)-1)/2
 vr=1+sum(x['volatility']<row['volatility'] for x in rows)+(sum(x['volatility']==row['volatility'] for x in rows)-1)/2
 row['score']=50*(mr-1)/9+50*(10-vr)/9
print(json.dumps(rows))`],{encoding:'utf8'}));
 const js=computeScores(runEvidence('valid','AAPL','MSFT',requestId).evidence);
 for(let i=0;i<10;i++){assert.equal(js[i].symbol,py[i].symbol);for(const field of ['momentum','volatility','score'])assert.ok(Math.abs(js[i][field]-py[i][field])<1e-10,field);}
});
test('DR-05/06: all-factor ties are 50, both drivers and exact references retained',()=>{
 const e=runEvidence('valid','AAPL','MSFT',requestId).evidence;
 e.market_records.forEach(r=>r.adjusted_close=100);
 const scores=computeScores(e);assert.ok(scores.every(r=>r.score===50));
 const record=identifyDrivers(scores,e);assert.equal(record.tied,true);assert.equal(record.winner,null);assert.equal(record.drivers.length,2);assert.equal(record.stocks[0].market_source_ids.length,21);
 assert.equal(computeScores({...e,score_ready:false}),null);
 assert.throws(()=>computeScores({...e,market_records:e.market_records.slice(1)}));
});
test('DR-07/08: outgoing allowlist and returned context, scores, drivers, sources checked',()=>{
 const r=run(),original=structuredClone(r.record),payload=packageExplanation({...r.record,password:'secret',personal_data:'hidden'});
 assert.equal(payload.password,undefined);assert.equal(payload.personal_data,undefined);
 const candidate=syntheticExplanation(payload);assert.equal(checkExplanation(candidate,payload).available,true);
 for(const mutate of [c=>c.request_id='other',c=>c.configuration_id='other',c=>c.stock_pair.reverse(),c=>c.scores[0].score+=1,c=>c.drivers[0].first_value+=1,c=>c.source_ids.push('unsupported')]){
  const c=structuredClone(candidate);mutate(c);assert.equal(checkExplanation(c,payload).available,false);
 }
 assert.deepEqual(r.record,original);
});
test('SWR-04 / DR-08/09: absent or invalid explanation never changes authoritative scores',()=>{
 const normal=run();
 for(const explanationMode of ['unavailable','invalid']){
  const r=run({explanationMode});assert.equal(r.history.at(-1).state,'completed_with_limitations');assert.deepEqual(r.record,normal.record);assert.deepEqual(r.display.stocks,normal.display.stocks);assert.equal(r.explanation.available,false);
 }
 assert.equal(renderComparison(null,{available:false}),null);
});
test('DR-09/10: display precision, service states, no score on invalid core and news degradation',()=>{
 const valid=run();assert.equal(valid.history.at(-1).state,'completed');assert.deepEqual(valid.history.map(x=>x.state),['ready','processing','completed']);assert.ok(valid.display.stocks.every(s=>/^\d+\.\d{2}$/.test(s.display_score)));
 const failed=run({scenario:'missing_unselected_stock'});assert.equal(failed.history.at(-1).state,'failed');assert.equal(failed.display,null);
 const limited=run({scenario:'no_news'});assert.equal(limited.history.at(-1).state,'completed_with_limitations');assert.deepEqual(limited.display.stocks,valid.display.stocks);
 assert.throws(()=>reportStatus('invented',requestId));
});

test('Pages assembly resolves comparison module imports under the repository subpath',async()=>{
 const {readFileSync,existsSync}=await import('node:fs');
 execFileSync(process.env.PYTHON||(process.platform==='win32'?'python':'python3'),['scripts/build_site.py'],{encoding:'utf8'});
 const html=readFileSync('.site/compare.html','utf8');
 for(const match of html.matchAll(/from ['"](\.\/[^'"]+)['"]/g)) assert.ok(existsSync('.site/'+match[1].slice(2)),match[1]);
 assert.ok(html.includes("from './js/system.mjs'"));
 assert.ok(existsSync('.site/js/evidence.mjs'));
});

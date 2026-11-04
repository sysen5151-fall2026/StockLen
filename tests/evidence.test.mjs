import test from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {runEvidence,syntheticConfiguration,requestDatedRecords,syntheticResponses,validateEvidence,SCENARIOS} from '../pmc2/browser/evidence.mjs';
const python=process.env.PYTHON||(process.platform==='win32'?'python':'python3');
test('F.2 browser/Python parity for every scenario across three stock pairs',()=>{
 const py=JSON.parse(execFileSync(python,['-c',`import json
from unittest.mock import patch
from pmc2.demo import run_demo, SCENARIOS
with patch('pmc2.demo.uuid4', return_value='parity-test'):
 print(json.dumps([run_demo(s,a,b) for a,b in [('AAPL','MSFT'),('NVDA','XOM'),('JNJ','JPM')] for s in SCENARIOS]))`],{encoding:'utf8',maxBuffer:8*1024*1024}));
 const js=[['AAPL','MSFT'],['NVDA','XOM'],['JNJ','JPM']].flatMap(([a,b])=>SCENARIOS.map(s=>runEvidence(s,a,b,'parity-test')));
 assert.deepEqual(js,py);
});
test('DR-03, CR-10/17 browser query scope and independent frozen context',()=>{
 const c=syntheticConfiguration(),q=requestDatedRecords({request_id:'one',stock_pair:['AAPL','MSFT'],analysis_date:'2026-09-21'},c);
 c.configuration_id='new';
 assert.equal(q.market_query.symbols.length,10);assert.equal(q.news_query.symbols.length,2);
 assert.equal(q.news_query.start_date,'2026-09-15');
 assert.equal(q.context.configuration_id,'v0.1-pmc2-synthetic-1');
 const [m,n]=syntheticResponses(q);n[0].publication_date='2026-09-15';
 const r=validateEvidence(q.context,m,n,q.context.configuration);
 assert.equal(r.analysis_date,'2026-09-21');assert.equal(r.market_records[0].observation_date,'2026-09-01');assert.ok(r.news_records.some(x=>x.publication_date==='2026-09-15'));
});
test('DR-04 browser rejects malformed core, duplicate records, context and config drift',()=>{
 const c=syntheticConfiguration(),q=requestDatedRecords({request_id:'one',stock_pair:['AAPL','MSFT'],analysis_date:'2026-09-21'},c),[m,n]=syntheticResponses(q);
 for(const value of [0,-1,NaN,Infinity,true,'100']){const bad=structuredClone(m);bad[0].adjusted_close=value;assert.equal(validateEvidence(q.context,bad,n,c).score_ready,false);}
 assert.equal(validateEvidence(q.context,[...m,m[0]],n,c).score_ready,false);
 assert.equal(validateEvidence(q.context,m,n,{...c,configuration_id:'other'}).reason,'configuration_mismatch');
 const tampered=structuredClone(q.context);tampered.market_query.symbols=['AAPL'];assert.equal(validateEvidence(tampered,m,n,c).reason,'invalid_acquisition_context');
 assert.throws(()=>runEvidence('valid','AAPL','AAPL','bad'));
});
test('CR-03/06/09 browser drops invalid news and caps qualifying news without blocking core',()=>{
 const c=syntheticConfiguration(),q=requestDatedRecords({request_id:'one',stock_pair:['AAPL','MSFT'],analysis_date:'2026-09-21'},c),[m,n]=syntheticResponses(q);
 for(const change of [{publication_date:'2026-09-14'},{publication_date:'2026-09-22'},{publication_date:'2026-02-31'},{source_id:''},{query_id:'wrong'},{permitted:false}]){
  const news=structuredClone(n);Object.assign(news[0],change);const r=validateEvidence(q.context,m,news,c);assert.equal(r.score_ready,true);assert.equal(r.news_records.length,1);
 }
 const news=Array.from({length:4},(_,i)=>({...n[0],source_id:'ITEM-'+i}));
 assert.equal(validateEvidence(q.context,m,news,c).news_records.length,2);
});

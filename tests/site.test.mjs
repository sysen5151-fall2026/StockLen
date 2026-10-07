import test from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {readFileSync} from 'node:fs';
import {rankStocks} from '../website/js/scoring.js';
import {transmitEvaluationRequest,renderComparisonDashboard} from '../walking_skeleton/browser/skeleton.js';
const data=JSON.parse(readFileSync(new URL('../website/data/historical.json',import.meta.url)));
test('browser stub result matches Python participant path',()=>{
 const js=renderComparisonDashboard(transmitEvaluationRequest('DEMO_A','DEMO_B','2026-09-18'));
 const py=JSON.parse(execFileSync(process.env.PYTHON||(process.platform==='win32'?'python':'python3'),['-c',"import json; from walking_skeleton import dashboard_ui; print(json.dumps(dashboard_ui.render_comparison_dashboard(dashboard_ui.transmit_evaluation_request('DEMO_A','DEMO_B','2026-09-18'))))"],{encoding:'utf8'}));
 assert.deepEqual(js,py);
});
test('later outcomes do not affect illustrative ranking',()=>{
 const stocks=data.snapshots[0].stocks,w={momentum:.4,volatility:.3,sentiment:.3};
 const shape=x=>x.map(s=>[s.ticker,s.score,s.components]);
 assert.deepEqual(shape(rankStocks(stocks,w)),shape(rankStocks(stocks.map(s=>({...s,futureReturn:999,path:[999,999]})),w)));
});
test('score is exactly sum of normalized weighted contributions',()=>{
 for(const snapshot of data.snapshots){
  for(const s of rankStocks(snapshot.stocks,{momentum:.4,volatility:.3,sentiment:.3})){
   assert.ok(s.score>=0&&s.score<=100);
   assert.equal(s.score,100*Object.values(s.components).reduce((a,b)=>a+b,0));
   assert.ok(s.news.date<=snapshot.date);
  }
 }
});

/** StockLens v0.1 controlled browser system, F.1–F.5 / DR-01–DR-10.
 * No live market/news/AI calls. Existing F.2 supplies checked synthetic evidence.
 */
import {UNIVERSE,runEvidence,syntheticConfiguration} from './evidence.mjs';
const copy=v=>structuredClone(v);
export const CONFIG_ID='v0.1-pmc2-synthetic-1';
export const CUTOFF='2026-09-21';

/** F.1.1 / P.1.1 / DR-01: IO.01 + IO.10 -> eligible distinct pair. */
export function validatePair(stockA,stockB) {
  const pair=[stockA,stockB].map(s=>typeof s==='string'?s.trim().toUpperCase():'');
  if(pair.some(s=>!UNIVERSE.includes(s))) return {valid:false,reason:'ineligible_symbol',stock_pair:pair};
  if(pair[0]===pair[1]) return {valid:false,reason:'duplicate_symbols',stock_pair:pair};
  return {valid:true,reason:null,stock_pair:pair};
}
/** F.1.2 / P.1.2 / DR-02: preserve accepted pair/date/identity in IF.01. */
export function preserveRequest(pairResult,analysisDate,requestId,configuration=syntheticConfiguration()) {
  if(!pairResult.valid) return {accepted:false,reason:pairResult.reason,request:null};
  const checked=validatePair(...pairResult.stock_pair);
  if(!checked.valid || checked.reason!==pairResult.reason || JSON.stringify(checked.stock_pair)!==JSON.stringify(pairResult.stock_pair)) return {accepted:false,reason:'invalid_pair_result',request:null};
  // The controlled data package supplies one snapshot; other dates have no coverage.
  if(analysisDate!==CUTOFF) return {accepted:false,reason:'unsupported_snapshot_date',request:null};
  if(!requestId || configuration.configuration_id!==CONFIG_ID) return {accepted:false,reason:'invalid_request_or_configuration',request:null};
  return {accepted:true,reason:null,request:{request_id:requestId,stock_pair:[...pairResult.stock_pair],analysis_date:analysisDate,configuration_id:configuration.configuration_id}};
}
function averageRanks(values) {
  return values.map(value=>1+values.filter(x=>x<value).length+(values.filter(x=>x===value).length-1)/2);
}
/** F.3.1 / P.3.1 / DR-05: IF.02 + IO.10 -> unrounded authoritative scores. */
export function computeScores(evidence) {
  if(!evidence.score_ready) return null;
  const config=syntheticConfiguration();
  if(evidence.configuration_id!==config.configuration_id || evidence.analysis_date!==CUTOFF) throw new Error('Evidence/configuration mismatch');
  const rows=config.universe.map(symbol=>{
    const records=evidence.market_records.filter(r=>r.symbol===symbol).sort((a,b)=>a.observation_date.localeCompare(b.observation_date));
    if(records.length!==21 || records.some((r,i)=>r.observation_date!==config.observation_dates[i] || !Number.isFinite(r.adjusted_close) || r.adjusted_close<=0)) throw new Error('Incomplete aligned price window');
    const prices=records.map(r=>r.adjusted_close),returns=prices.slice(1).map((p,i)=>p/prices[i]-1),mean=returns.reduce((a,b)=>a+b,0)/20;
    return {symbol,momentum:prices[20]/prices[0]-1,volatility:Math.sqrt(returns.reduce((s,r)=>s+(r-mean)**2,0)/19),market_source_ids:records.map(r=>r.source_id)};
  });
  if(evidence.market_records.length!==210) throw new Error('Unexpected universe records');
  const mr=averageRanks(rows.map(r=>r.momentum)),vr=averageRanks(rows.map(r=>r.volatility));
  return rows.map((r,i)=>({...r,momentum_rank:mr[i],volatility_rank:vr[i],contributions:{momentum:50*(mr[i]-1)/9,volatility:50*(10-vr[i])/9},score:50*(mr[i]-1)/9+50*(10-vr[i])/9}));
}
/** F.3.2 / P.3.2 / DR-06: retain exact values and references in IF.03. */
export function identifyDrivers(scores,evidence) {
  if(!scores) return null;
  const pair=evidence.stock_pair.map(s=>scores.find(r=>r.symbol===s));
  if(pair.some(r=>!r)) throw new Error('Pair missing from scoring universe');
  const [a,b]=pair;
  const drivers=['momentum','volatility'].map(factor=>({factor,first_value:a[factor],second_value:b[factor],contribution_difference:a.contributions[factor]-b.contributions[factor]})).sort((x,y)=>Math.abs(y.contribution_difference)-Math.abs(x.contribution_difference));
  const difference=a.score-b.score,tied=Math.abs(difference)<=1e-6;
  return {request_id:evidence.request_id,configuration_id:evidence.configuration_id,analysis_date:evidence.analysis_date,stock_pair:[...evidence.stock_pair],stocks:copy(pair),drivers,winner:tied?null:(difference>0?a.symbol:b.symbol),tied,score_difference:difference,news:copy(evidence.news_records)};
}
/** F.4.1 / P.4.1 / DR-07: IF.03 -> allowlisted IO.05. */
export function packageExplanation(record) {
  if(!record) return null;
  return {request_id:record.request_id,configuration_id:record.configuration_id,analysis_date:record.analysis_date,stock_pair:[...record.stock_pair],stocks:record.stocks.map(({symbol,score,momentum,volatility,contributions})=>({symbol,score,momentum,volatility,contributions:copy(contributions)})),drivers:copy(record.drivers),news:record.news.map(({symbol,source_id,publication_date,title})=>({symbol,source_id,publication_date,title}))};
}
/** Controlled external-service substitute, never presented as generated AI. */
export function syntheticExplanation(payload) {
  return {request_id:payload.request_id,configuration_id:payload.configuration_id,analysis_date:payload.analysis_date,stock_pair:[...payload.stock_pair],scores:payload.stocks.map(s=>({symbol:s.symbol,score:s.score})),drivers:copy(payload.drivers),source_ids:payload.news.map(n=>n.source_id),mode:'synthetic_checked_template'};
}
/** F.4.2 / P.4.2 / DR-08: IO.09 + IF.03 -> checked IF.04 or unavailable. */
export function checkExplanation(candidate,payload) {
  const unavailable=reason=>({available:false,reason,text:null,mode:'unavailable'});
  if(!candidate || !payload) return unavailable('explanation_unavailable');
  const equal=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
  if(candidate.request_id!==payload.request_id || candidate.configuration_id!==payload.configuration_id || candidate.analysis_date!==payload.analysis_date || !equal(candidate.stock_pair,payload.stock_pair)) return unavailable('explanation_context_mismatch');
  if(!equal(candidate.scores,payload.stocks.map(s=>({symbol:s.symbol,score:s.score}))) || !equal(candidate.drivers,payload.drivers) || !equal(candidate.source_ids,payload.news.map(n=>n.source_id)) || candidate.mode!=='synthetic_checked_template') return unavailable('unsupported_explanation_content');
  const [a,b]=payload.stocks, gap=a.score-b.score;
  const lead=Math.abs(gap)<=1e-6?'The two stocks are tied.':`${gap>0?a.symbol:b.symbol} has the higher calculated score.`;
  const strongest=payload.drivers[0];
  return {available:true,reason:null,mode:'synthetic_checked_template',text:`${lead} ${strongest.factor} has the largest absolute difference in weighted contributions (${Math.abs(strongest.contribution_difference).toFixed(2)} points). Both factors are shown below. This is a checked synthetic template, not an external AI response.`};
}
/** F.5.1 / P.5.1 / DR-09: IF.03 + IF.04 -> coherent IO.02 view. */
export function renderComparison(record,explanation) {
  if(!record) return null;
  return {...copy(record),stocks:record.stocks.map(s=>({...copy(s),display_score:s.score.toFixed(2)})),explanation:copy(explanation)};
}
/** F.5.2 / P.5.2 / DR-10: workflow state -> observed IO.06. */
export function reportStatus(state,requestId,reason=null) {
  if(!['ready','processing','completed','completed_with_limitations','failed'].includes(state)) throw new Error('Unknown service state');
  return {state,request_id:requestId,configuration_id:CONFIG_ID,reason};
}
/** F.0: controlled F.1 -> F.2 -> F.3 -> F.4 -> F.5 orchestration. */
export function compareStocks({stockA='AAPL',stockB='MSFT',analysisDate=CUTOFF,scenario='valid',explanationMode='synthetic',requestId=crypto.randomUUID()}={}) {
  const history=[reportStatus('ready',null),reportStatus('processing',requestId)];
  const eligibility=validatePair(stockA,stockB),request=preserveRequest(eligibility,analysisDate,requestId);
  const failure=(reason,evidence=null)=>({mode:'controlled-synthetic-comparison',eligibility,request,evidence,record:null,explanation:{available:false,reason:'comparison_failed',text:null},display:null,history:[...history,reportStatus('failed',requestId,reason)]});
  if(!request.accepted) return failure(request.reason);
  const evidenceRun=runEvidence(scenario,...request.request.stock_pair,requestId),evidence=evidenceRun.evidence;
  if(!evidence.score_ready) return failure(evidence.reason,evidenceRun);
  const scores=computeScores(evidence),record=identifyDrivers(scores,evidence),payload=packageExplanation(record);
  let candidate=explanationMode==='unavailable'?null:syntheticExplanation(payload);
  if(explanationMode==='invalid') candidate.scores[0].score+=1;
  const explanation=checkExplanation(candidate,payload),display=renderComparison(record,explanation);
  const limited=evidence.limitations.length>0||!explanation.available;
  return {mode:'controlled-synthetic-comparison',eligibility,request,evidence:evidenceRun,record,payload,explanation,display,history:[...history,reportStatus(limited?'completed_with_limitations':'completed',requestId)]};
}

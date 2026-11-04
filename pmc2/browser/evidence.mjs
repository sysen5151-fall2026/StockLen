/** F.2 browser implementation. Synthetic adapters only; no provider or AI calls.
 * F.2.1: IF.01 + IO.10 -> IO.03, IO.04, LF.02; mechanism P.2.1.
 * F.2.2: LF.02 + IO.07 + IO.08 + IO.10 -> IF.02; mechanism P.2.2.
 */
export const UNIVERSE = Object.freeze(['AAPL','MSFT','AMZN','GOOGL','META','NVDA','TSLA','JPM','JNJ','XOM']);
export const SCENARIOS = Object.freeze(['valid','missing_unselected_stock','missing_observation','post_cutoff','missing_source','mixed_request','no_news','bad_news']);
const clone = value => structuredClone(value);
const fields = ['request_id','configuration_id','query_id','provider_id','conditions_id'];
const identity = query => Object.fromEntries(fields.map(k => [k,query[k]]));
const canonical = value => JSON.stringify(value && typeof value === 'object' ? (Array.isArray(value) ? value.map(v=>JSON.parse(canonical(v))) : Object.fromEntries(Object.keys(value).sort().map(k=>[k,JSON.parse(canonical(value[k]))]))) : value);
const equal = (a,b) => canonical(a) === canonical(b);
function isoDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new Error('Expected an ISO date');
  const date = new Date(value+'T00:00:00Z');
  if (!Number.isFinite(date.valueOf()) || date.toISOString().slice(0,10) !== value) throw new Error('Invalid ISO date');
  return date;
}
const shifted = (day, offset) => { const date=isoDate(day); date.setUTCDate(date.getUTCDate()+offset); return date.toISOString().slice(0,10); };

export function syntheticConfiguration() {
  return {configuration_id:'v0.1-pmc2-synthetic-1',universe:[...UNIVERSE],
    observation_dates:Array.from({length:21},(_,i)=>shifted('2026-09-01',i)),
    news_days:7,max_news_per_stock:2,
    providers:Object.fromEntries(['market','news'].map(kind=>[kind,{provider_id:'synthetic-'+kind,conditions_id:'local-synthetic-v1',allowed_operations:['acquire','retain','display']}]))};
}

export function requestDatedRecords(request, configuration) {
  const config=clone(configuration), pair=request.stock_pair, dates=config.observation_dates;
  isoDate(request.analysis_date);
  if (!request.request_id || !Array.isArray(pair) || pair.length!==2 || new Set(pair).size!==2 || !pair.every(s=>UNIVERSE.includes(s))) throw new Error('IF.01 must contain an identified eligible distinct pair');
  if (!equal(config.universe,UNIVERSE) || !config.configuration_id || !Array.isArray(dates) || dates.length!==21 || new Set(dates).size!==21 || !equal(dates,[...dates].sort()) || dates.some(d=>{isoDate(d);return d>request.analysis_date;})) throw new Error('IO.10 requires a version and 21 explicit aligned dates for the frozen ten-stock universe');
  if (config.news_days!==7 || config.max_news_per_stock!==2) throw new Error('IO.10 differs from the v0.1 news bounds');
  for (const kind of ['market','news']) {
    const policy=config.providers[kind];
    if (policy.provider_id!=='synthetic-'+kind || policy.conditions_id!=='local-synthetic-v1' || !equal(policy.allowed_operations,['acquire','retain','display'])) throw new Error('Only the reviewed local synthetic adapters are enabled');
  }
  const context={...clone(request),configuration_id:config.configuration_id};
  const market={...context,query_id:request.request_id+':market',symbols:[...UNIVERSE],observation_dates:dates,field:'adjusted_close',currency:'USD',...config.providers.market};
  const news={...context,query_id:request.request_id+':news',symbols:[...pair],start_date:shifted(request.analysis_date,-6),end_date:request.analysis_date,max_per_stock:2,...config.providers.news};
  return clone({market_query:market,news_query:news,context:{...context,market_query:market,news_query:news,configuration:config}});
}

export function validateEvidence(context, marketRecords, newsRecords, configuration) {
  const result={...Object.fromEntries(['request_id','stock_pair','analysis_date','configuration_id'].map(k=>[k,clone(context[k])])),score_ready:false,status:'failed',reason:null,market_records:[],news_records:[],rejected_news:[],limitations:[]};
  const fail=reason=>({...result,reason});
  if (!equal(configuration,context.configuration)) return fail('configuration_mismatch');
  try {
    const request=Object.fromEntries(['request_id','stock_pair','analysis_date'].map(k=>[k,context[k]]));
    if (!equal(context,requestDatedRecords(request,configuration).context)) return fail('invalid_acquisition_context');
  } catch {return fail('invalid_acquisition_context');}
  const key=(s,d)=>s+'|'+d, expected=new Set(configuration.universe.flatMap(s=>configuration.observation_dates.map(d=>key(s,d)))),seen=new Set();
  const mq=context.market_query,nq=context.news_query, associated=(item,q)=>fields.every(k=>item[k]===q[k]);
  for (const record of marketRecords) {
    if (!associated(record,mq)) return fail('market_association_mismatch');
    const k=key(record.symbol,record.observation_date);
    if (!expected.has(k) || seen.has(k)) return fail('market_date_symbol_or_duplicate');
    if (typeof record.adjusted_close!=='number' || !Number.isFinite(record.adjusted_close) || record.adjusted_close<=0 || record.currency!=='USD' || typeof record.source_id!=='string' || !record.source_id.trim()) return fail('invalid_price_units_or_source');
    seen.add(k);
  }
  if (seen.size!==expected.size) return fail('incomplete_frozen_universe_window');
  const accepted=[],rejected=[],ids=new Set(),counts=new Map();
  const text=v=>v===undefined?'':String(v);
  const ordered=[...newsRecords].sort((a,b)=>{
    const a1=text(a.publication_date),b1=text(b.publication_date),a2=text(a.source_id),b2=text(b.source_id);
    return a1===b1?(a2===b2?0:(a2>b2?-1:1)):(a1>b1?-1:1);
  });
  for (const item of ordered) {
    let validDate=false;
    try {isoDate(item.publication_date);validDate=item.publication_date>=nq.start_date&&item.publication_date<=nq.end_date;} catch {}
    const symbol=item.symbol,source=item.source_id;
    const valid=associated(item,nq)&&nq.symbols.includes(symbol)&&validDate&&typeof source==='string'&&source.trim()&&typeof item.title==='string'&&item.title.trim()&&item.permitted===true&&!ids.has(source);
    if (!valid) rejected.push({source_id:source??null,reason:'unsupported_or_mismatched_news'});
    else if ((counts.get(symbol)||0)>=nq.max_per_stock) rejected.push({source_id:source,reason:'news_limit'});
    else {accepted.push(clone(item));ids.add(source);counts.set(symbol,(counts.get(symbol)||0)+1);}
  }
  const limitations=context.stock_pair.some(s=>!counts.get(s))?['qualifying_news_unavailable_for_one_or_both_stocks']:[];
  return {...result,score_ready:true,status:limitations.length?'accepted_with_limitations':'accepted',market_records:clone(marketRecords),news_records:accepted,rejected_news:rejected,limitations};
}

export function syntheticResponses(queries) {
  const mq=queries.market_query,nq=queries.news_query;
  const market=mq.symbols.flatMap((s,i)=>mq.observation_dates.map((d,j)=>({...identity(mq),symbol:s,observation_date:d,adjusted_close:Math.round((80+i*9+j*(i+1)/10)*100)/100,currency:'USD',source_id:`SYNTHETIC-PRICE-${s}-${d}`})));
  const news=nq.symbols.map(s=>({...identity(nq),symbol:s,publication_date:nq.end_date,source_id:`SYNTHETIC-NEWS-${s}`,title:`Fictional ${s} synthetic record`,permitted:true}));
  return [market,news];
}

export function runEvidence(scenario='valid',stockA='AAPL',stockB='MSFT',requestId=crypto.randomUUID()) {
  if (!SCENARIOS.includes(scenario)) throw new Error('unknown scenario');
  const config=syntheticConfiguration(),request={request_id:requestId,stock_pair:[stockA,stockB],analysis_date:'2026-09-21'};
  const queries=requestDatedRecords(request,config);
  let [market,news]=syntheticResponses(queries);
  if (scenario==='missing_unselected_stock') {const missing=UNIVERSE.find(s=>!request.stock_pair.includes(s));market=market.filter(r=>r.symbol!==missing);}
  else if (scenario==='missing_observation') market.pop();
  else if (scenario==='post_cutoff') market[0].observation_date='2026-09-22';
  else if (scenario==='missing_source') market[0].source_id='';
  else if (scenario==='mixed_request') market[0].request_id='another-comparison';
  else if (scenario==='no_news') news=[];
  else if (scenario==='bad_news') news[0].publication_date='2026-09-22';
  return {mode:'controlled-synthetic-F2',scenario,queries,received_market_count:market.length,received_news_count:news.length,evidence:validateEvidence(queries.context,market,news,config)};
}

export function returnMarketData(query) { return {fixture:true,stock_pair:["DEMO_A","DEMO_B"],analysis_date:"2026-09-18",observation_date:"2026-09-18",market_bars:[{symbol:"DEMO_A",close:100},{symbol:"DEMO_B",close:80}]}; }
export function returnNewsEvidence(query) { return [{id:"FIXTURE-01",published_at:"2026-09-18",title:"Fictional classroom evidence",excerpt:"Demonstration evidence only; not real company news."}]; }
export function queryExternalDataFeeds(query) { return {...returnMarketData(query),sources:returnNewsEvidence(query)}; }
export function calculateAndNormalizeRanking(evidence) {return {fixture:true,stock_pair:evidence.stock_pair,analysis_date:evidence.analysis_date,observation_date:evidence.observation_date,scores:[{symbol:"DEMO_A",score:60,driver:"Fixed demonstration factor"},{symbol:"DEMO_B",score:40,driver:"Fixed demonstration factor"}],sources:evidence.sources};}
export function synthesizeGroundedAIExplanation(scoreEvidence) {return {fixture:true,text:"DEMO_A is shown first in this fixed fixture. No ranking algorithm or AI model was run.",source_ids:["FIXTURE-01"]};}
// Internal AI Explanation Module coordinates; external X.04 synthesizes.
export function coordinateExplanation(scoreEvidence) {return synthesizeGroundedAIExplanation(scoreEvidence);}
export function evaluateComparison(query) {const ranking=calculateAndNormalizeRanking(queryExternalDataFeeds(query));const explanation=coordinateExplanation(ranking);return {requested_query:query,ranking,explanation};}
export function transmitEvaluationRequest(stockA,stockB,date) {return evaluateComparison({stock_pair:[stockA,stockB],analysis_date:date});}
export function renderComparisonDashboard(result) {return {mode:"walking-skeleton-fixed-fixture",...result};}

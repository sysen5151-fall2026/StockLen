# SR-05 / SR-06 Walking skeleton folder consolidation

## Locate and extract
N-05/SR-05 require a traceable need/model/code record; N-06/SR-06 require usable operating instructions. UC.1 remains the existing fixed-fixture path. Inputs are stock_a, stock_b and analysis_date; output and model participant allocations remain unchanged.

## Constrain
Python 3.12, FastAPI and existing dependencies only. No new functions, scoring, live data, AI, model edits or acceptance claims. Keep submitted SPEC and baseline wording unchanged. Preserve historical prompt logs. User requested one walking_skeleton folder, with separate participant files retained.

## Prompt
Move backend, frontend, six participant packages and browser mirror into walking_skeleton/. Update imports, current path references, tests and Pages packaging. Add a short README and a module startup entry. Keep deployed skeleton.html URL through site assembly. Verify Python/JS fixture parity, HTTP path, baseline and packaged browser rendering. Permitted changes: moved code, dependent tests/scripts/workflow, current docs and this record.

## Review and reconcile
Four Python tests and three Node tests passed. Exact baseline checks passed for all eight needs/requirements/criteria/methods and OpsCon. HTTP smoke check passed GET / and two different POST /compare requests. Edge browser checks passed both source and assembled Pages demo: fixed scores, changed query and research navigation. No independent team review or stakeholder acceptance is claimed.

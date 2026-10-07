# Milestone 1 status

## Implemented and checked

- One fixed UC.1 path, including distinct market, news and AI participants, runs through the local HTTP API.
- The internal AI Explanation Module coordinates external X.04; ranking ownership stays with StockLens.
- README OpsCon is transcribed from the supplied BMA. SPEC retains all eight needs, shall statements and proposed criteria from the user-identified submitted requirements PDF.
- Traceability records all eight requirements, report model IDs, implementation/record locations, methods and open evidence.
- Wiring tests, browser/Python fixture parity, a real HTTP smoke check and a source-transcription check run locally. CI definitions include these checks.
- Five preliminary system-function candidates are recorded in requirements/FUNCTIONAL-CANDIDATES.md for team/model review. scripts/verify.py runs all development checks with the selected Python environment.

## Still needs team or model evidence

| Item | Required closure evidence |
|---|---|
| AI boundary feedback | Reconcile the internal module with X.04 in native Context/Hierarchy/Action/Activity/Sequence/Spider views; export the corrected model. Code changes do not edit Innoslate. |
| A-08 request gate | Submitted report explicitly leaves pass/fail and rejection behavior open. Approve schema and update the native model before implementing a content gate. |
| Requirements baseline parameters | Confirm universe, scoring/driver rules, time/resource limits, user-task rubric/targets, transition path and selected-service conditions. Preserve the submitted statements. |
| System functional requirements | The report supplies UC.1 and A-04–A-08 actions, not a separate approved system-functional requirement register. Team/model derivation is still needed; action IDs are not silently renamed to requirement IDs. |
| Human review | A teammate records actual review and assumptions/disposition for the increment in the prompt log. |
| Acceptance evidence | Execute the report's assessment methods. No user pilot, independent handover, live-provider review or schema-conformance result is claimed. |
| Repository administration | Confirm instructor/team access, actual member commits and reviewed-merge protection; these settings have not been inspected or changed. |
| Live demonstration | Run the demo and trace one need through its requirement and model action to the matching stub. Human source/driver inspection remains a human action. |

The exploratory historical website remains separate from the fixed skeleton. It is not evidence of real provider integration or satisfaction of all submitted requirements. This increment does not alter the team's submitted PDFs.

## Demo trace

In Innoslate, locate N-02 → SR-02 → UC.1.6 (186309) and UC.1.7 (186503). Show the same original statement in SPEC. Run **Compare fixture** and point to the explanation stub and dashboard. In code, follow `stocklens_system.evaluate_comparison` → `ai_explanation_module.coordinate_explanation` → `ai_model_service.synthesize_grounded_ai_explanation` → dashboard response. Explain that this proves wiring; real computed-driver explanation and user comprehension remain unvalidated.

Use the six Milestone areas to reassess after the native-model review and demonstration. No overall clearance is claimed here.

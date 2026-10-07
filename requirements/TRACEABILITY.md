# Requirements traceability

Source: submitted report Tables 7–8, 11–12 and 14–16. All eight shall statements and acceptance criteria are retained in [SPEC](../SPEC.md). The model IDs below are reported in the submitted PDF; no live-model reinspection is claimed.

| Need → requirement | Model allocation | Code / record | Verification / validation evidence | Status |
|---|---|---|---|---|
| N-01 → SR-01 | UC.1 (185145) | stocklens_system/; market_data_provider/; news_provider/; frontend/index.html | tests/test_uc1.py; scripts/check_http.py; MOE-01 method below | Fixed fixture only; no eligible-universe/scoring or user-task acceptance. |
| N-02 → SR-02 | UC.1.6 (186309); UC.1.7 (186503) | ai_explanation_module/; ai_model_service/; frontend/index.html | tests/test_ai_boundary.py; tests/test_uc1.py; MOE-02 method below | Fixed explanation only; computed driver values and comprehension evidence pending. |
| N-03 → SR-03 | UC.1.7 (186503) | frontend/index.html; news_provider/ | scripts/check_http.py; human source inspection pending; MOE-03 method below | Fictional source displayed; real claim support and user-task evidence pending. |
| N-04 → SR-04 | UC.1 (185145); A-04 (219105) | docs/walking-skeleton.md; backend/main.py | scripts/check_http.py; limits review pending; MOE-04 method below | HTTP skeleton runs; approved time/service-resource limits pending. |
| N-05 → SR-05 | A-05 (216873) | model-artifacts/submitted-baseline.json; requirements/TRACEABILITY.md | scripts/check_baseline.py; native-model review pending; MOE-05 method below | All eight records mapped here; live model and independent inspection pending. |
| N-06 → SR-06 | A-06 (217607) | docs/operations.md | independent operator/transition record pending; MOE-06 method below | Operating instructions available; independent transition exercise pending. |
| N-07 → SR-07 | A-07 (217608) | docs/service-use.md | selected-provider actual-use review pending; MOE-07 method below | Only fictional stubs; no selected-provider actual-use assessment. |
| N-08 → SR-08 | A-08 (217609) | ai_explanation_module/ (coordination only); docs/contracts.md | approved schema and content-control check pending; MOE-08 method below | No approved schema or executable content gate; request assessment pending. |

## Submitted assessment methods

**SR-01:** User task + inspection. Ask each participant to compare two stocks using two agreed indicators and the displayed ranking. Score against a prepared answer rubric. Inspect the dated inputs and configuration. Retain answers, assistance records, stock eligibility, dates and configuration version.

**SR-02:** User task + calculation review. Ask why Stock A ranks above Stock B. Use a case with two identifiable drivers selected by the frozen rule. Compare answers and explanation content with the checked factor values, weights and score breakdown. Retain the rubric, outputs, input values and discrepancy log.

**SR-03:** User task + source review. Ask participants to open a displayed claim’s source and identify all three dates. Independently inspect each claim and its cited material. Retain answers, source identifiers, dates, the supporting passage or reference, and any inaccessible or unsupported items.

**SR-04:** Demonstration + review. Freeze scope and limits before the run. Record the outcome, environment/version, elapsed time and relevant service-resource use against that baseline. Retain the run record and deviations.

**SR-05:** Inspection. Follow each link in the register, report and Innoslate model; check entity IDs and consistency. Retain reviewed records and discrepancies. A planned status is valid; an invented or broken model link is not.

**SR-06:** Observed demonstration + review. Use a controlled project environment. Record stages, assistance and missing instructions. Check responsibility, configuration, retained records and applicable access-transfer or revocation steps. Retain the guide version and executed transition record; a checklist alone is insufficient.

**SR-07:** Conditions and actual-use inspection. Compare dated provider references with request records, retained data and displayed content. Retain the condition-to-use checklist and decisions for each provider. Missing conditions or unobserved use remain unresolved; planned use is not actual-use evidence.

**SR-08:** Payload inspection. Compare captured requests with the versioned schema and task purpose. Record the assessment set and deviations. Retain redacted examples and access/configuration evidence without exposing secrets. Review authentication separately from analysis content.

## Interpretation

A-04–A-08 are Action identifiers, not system requirement identifiers, and are separate from BMA assumption IDs. Lifecycle obligations SR-04–SR-07 are not assigned to external services or claimed complete by a unit test. The BMA participant mapping is in [walking-skeleton.md](../docs/walking-skeleton.md). Independent review and runtime-to-native-model reconciliation remain open.

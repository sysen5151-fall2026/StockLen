# Service and AI access evidence

| Boundary | Current implementation | Acceptance status |
|---|---|---|
| X.02 market data | Synthetic sample or user-imported Yahoo Finance daily CSV in browser memory | User supplies authorized files. Public redistribution and automated service use are unassessed. |
| X.03 news | Synthetic sample or user-imported dated titles and links | User supplies permitted evidence. Provider access and article support are unassessed. |
| X.04 AI | Same-host checked model for dashboard; fixed stub for the transport demo | Dashboard makes no external model request. Hosted access is unassessed. |

SR-07 requires actual use to conform to dated access, retention and display conditions. Before integrating a real provider, the team records the provider, dated conditions, intended use, applicable access arrangement and actual-use evidence. No selected service means not assessed, not 100% success.

N-08 includes approved AI access; SR-08 covers request content. The submitted report keeps their coverage distinction open. Record the access arrangement separately from the permitted analysis-content schema. Do not store credentials in either evidence or prompts. Existing historical research-site data remain illustrative and unverified; they do not close either requirement.

## Public event dashboard

The public event workflow uses the same-origin data routes with a deployment-level `MASSIVE_API_KEY`. The key must be associated with terms permitting the intended audience to view news, prices and derived results. The website returns an explicit service status if no account is configured. Automated tests use local provider responses and do not establish live authorization, coverage or actual-use conformance.

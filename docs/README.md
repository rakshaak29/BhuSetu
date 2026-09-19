# BhuSetu Product Documentation

This documentation describes a pilot for **Blockchain-Based Land Ownership Verification** in India. The product verifies the integrity and provenance of official land-record evidence; it does not itself create, transfer, or legally guarantee title.

| Document | Purpose |
| --- | --- |
| [PRD](PRD.md) | Product goals, scope, users, requirements, and acceptance criteria. |
| [TRD](TRD.md) | AWS architecture, data, APIs, security, operations, and testing requirements. |
| [Agent Rules](AGENT_RULES.md) | Non-negotiable operating rules for AI, automation, and engineering agents. |
| [UI Rules](UI_RULES.md) | Interaction, accessibility, content, privacy, and visual-system rules. |
| [Most Important Features Page](MOST_IMPORTANT_FEATURES_PAGE.md) | Prioritized feature backlog and detailed verification-page specification. |

## Authoritative-source principle

State/UT Revenue, Registration, Survey/Settlement, and Court systems are the sources of legal authority. BhuSetu may display a record as **verified**, **mismatched**, **disputed**, **superseded**, or **unavailable** based on the evidence it can validate. It must never infer or declare legal ownership on its own.

## Pilot assumptions

- One State/UT and one district/tehsil pilot.
- Synthetic or explicitly authorized data until a government data-sharing agreement, security review, and legal approval are complete.
- A permissioned Hyperledger Fabric network is developed locally for the proof of concept; production consortium hosting happens only after participating authorities commit to governance and operating costs.
- AWS Mumbai hosts the application and off-chain data. PII and documents are never stored on a public blockchain.

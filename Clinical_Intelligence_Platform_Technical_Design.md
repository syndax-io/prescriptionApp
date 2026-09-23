Clinical Intelligence & Decision Support Platform — Technical Design Document

Version 1.0 — September 2026
Working product name: TBD

# 1. Architecture Goal


The hospital ERP/EHR remains the clinical system of record. The product is a clinical workspace and intelligence layer, not a replacement or shadow EHR.

# 2. Do We Need a Real Patient Database?


No—not a full duplicate patient database for the MVP. The recommended model is: ERP/EHR remains the system of record; the platform retrieves authorized data for the current encounter and stores only what is needed for workflow, audit, configuration and approved caching.

# 3. Data Ownership & Persistence


# 4. Why Some Storage Is Still Required


AI auditability: recommendation, user action and model/rules/evidence versions.

Evidence index for approved guideline/literature retrieval.

Hospital protocols, rules and configuration.

Short-lived document processing.

Temporary encounter caching to reduce repeated EHR calls where permitted.

Operational telemetry and integration errors.

Governed evaluation/feedback data where permitted.

# 5. Recommended Data Stores


# 6. Data Flow


Hospital ERP/EHR → Integration Layer → Patient Context → Document Intelligence → Evidence + Rules → LLM Reasoning → Citation Verification → Safety Gateway → Doctor UI → Physician action → Audit.

# 7. Integration Architecture


FHIR-first where supported.

HL7 v2 via integration engine where required.

Vendor-specific REST/SOAP/API adapters where necessary.

Patient identity and encounter mapping.

Read-only MVP integration.

Controlled write-back only after hospital validation and approval.

API access is subject to hospital/vendor authorization and security requirements.

# 8. Logical Services


# 9. AI Orchestration


Retrieve minimum necessary patient context.

Normalize terminology and units.

Extract and verify document facts.

Retrieve approved evidence.

Run deterministic safety checks.

Call enterprise LLM with structured context and output schema.

Verify every citation.

Run safety/policy validation.

Render only validated suggestions.

# 10. Medication Safety Architecture


Structured medication knowledge.

Deterministic interaction/allergy/contraindication rules where available.

Patient-specific context checks.

LLM for synthesis/explanation rather than sole safety authority.

Safety Gateway before display.

Explicit physician review for consequential action.

# 11. Evidence Engine


Approved-source registry by jurisdiction/hospital.

Metadata: publisher, title, version/date, specialty/topic, review status and licensed identifier/URL.

Chunk and index sources for retrieval.

Return source IDs with retrieved passages.

Verify final citations against retrieved source content.

Version and review/expire sources.

Do not use unlicensed copyrighted clinical content merely because it is discoverable online.

# 12. Security & Privacy


Hospital-approved SSO/identity provider.

OAuth/OIDC/SMART-on-FHIR where supported.

TLS and encryption at rest.

Least privilege and tenant isolation.

Private networking where required.

No production patient data in development environments.

Secure secret management.

Comprehensive access/audit logging.

Security assessment, vulnerability management and incident response.

# 13. Deployment & Reliability


Core EHR access and documentation continue if AI is unavailable.

AI timeouts do not block consultation.

Evidence outage produces an explicit unavailable state rather than unsupported output.

Use retries, circuit breakers and idempotency for integrations.

Do not promise that patient data never leaves the hospital until the complete technical and contractual flow is verified.

# 14. Suggested MVP Stack


# 15. Internationalization


Country-specific evidence repositories.

Country-specific medication/formulary data.

Country-specific regulatory configuration.

Country-specific terminology/coding mappings.

Country-specific data residency/transfer configuration.

Country-specific EHR/HIS adapters.

Hospital-specific protocols.

# 16. First Hospital Decisions


Exact EHR/HIS vendor and version.

FHIR/HL7/API/SMART availability.

Permitted patient resources and documents.

Hosting and data-processing region.

External AI-provider policy.

Approved evidence/drug sources and licenses.

Audit retention.

Security assessment requirements.

Regulatory classification and intended-use statement.

Whether and when write-back is allowed.

# 17. Technical Decision Summary


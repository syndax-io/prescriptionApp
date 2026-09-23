# Clinical Intelligence Platform — Product Requirements Document (PRD)

Clinical Intelligence & Decision Support Platform

Business Requirements Document (BRD) + Product Requirements Document (PRD)

Version 1.0 — September 2026
Draft / Product Definition
Working product name: TBD

Confidential Product Planning Document

# 1. Executive Summary


This document defines a hospital-focused Clinical Intelligence & Decision Support Platform that operates as a layer over existing hospital ERP/EHR/HIS systems. The platform is intended to help physicians review patient information, document encounters, attach and interpret relevant clinical documents, and receive evidence-grounded clinical and medication suggestions within the physician workflow.

The product is explicitly designed as physician-support software: AI assists, while the physician retains the final clinical decision. Recommendations should be traceable to patient-specific inputs and authoritative evidence. The product should not silently diagnose, prescribe, order investigations, or modify the medical record.

The initial target market is UAE hospitals, with an architecture that can later support other jurisdictions by replacing or adding country-specific clinical guidance, medication data, regulatory controls, terminology, and interoperability adapters.

Regulatory note: this BRD/PRD is a product-definition document, not legal or regulatory advice. Because the proposed product provides patient-specific clinical decision support and medication-related recommendations, regulatory classification and approval requirements must be assessed before clinical deployment.

# 3. Product Requirements Document (PRD)


## 3.1 Product Principles


Physician remains the final decision-maker.

Every clinically meaningful suggestion should be evidence-grounded and traceable.

Do not invent citations or clinical facts.

Patient context must be explicit and inspectable.

Deterministic safety rules should handle high-confidence safety checks wherever practical.

AI output must be treated as a recommendation, not a clinical fact.

The system must be conservative when required information is missing.

AI failure must not prevent normal hospital operation.

Hospital-approved protocols can override or constrain general evidence where clinically and legally appropriate.

All high-impact AI behavior must be versioned and auditable.

## 3.2 End-to-End Physician Journey


Doctor authenticates and opens an authorized patient encounter.

Platform retrieves permitted patient information from the hospital system.

Platform presents a concise Patient 360° view.

Doctor records symptoms, history, examination findings, and assessment in a structured/free-text clinical note.

Doctor attaches or selects recent blood tests, diagnostic reports, previous notes, discharge summaries, and other relevant documents.

Document Intelligence extracts clinically relevant information while preserving links to the original documents.

Clinical Context Engine builds a current-encounter context.

Evidence Engine retrieves relevant hospital protocols, UAE/local guidance, approved drug references, and other permitted sources.

Clinical Reasoning Engine generates possible clinical considerations and supporting rationale.

Doctor moves to prescription.

As the doctor types, the Prescription Assistant provides contextual autocomplete and safety suggestions.

Each meaningful clinical suggestion displays evidence, patient-context rationale, and an evidence/confidence indicator.

Doctor accepts, modifies, or rejects suggestions.

Only the physician-approved final information is committed to the hospital workflow.

The platform records the appropriate audit trail.

## 3.3 Feature Requirements


## 3.4 Prescription Assistant — Detailed UX Requirement


The prescription assistant is a key differentiating feature. It should behave like clinical autocomplete, not a generic language-model completion box.

Doctor begins typing a medication or prescription item.

System considers current encounter context, diagnosis/assessment, allergies, existing medications, relevant labs, renal/hepatic indicators where available, and hospital protocol.

System presents one or more candidate completions.

Suggestions are ranked using validated clinical logic and evidence—not merely token probability.

A clinical suggestion shows patient-specific rationale.

Medication safety warnings are visually distinct from ordinary autocomplete.

A recommendation must expose its evidence source when applicable.

Doctor can accept, edit, or dismiss without leaving the prescription workflow.

The final prescription remains explicitly attributable to the physician.

The product must support a conservative 'no suggestion' outcome when evidence/context is insufficient.

## 3.5 Example Prescription Interaction


Example only — not a clinical recommendation. The actual medication, dose, duration, evidence, and UI content must be generated only from validated clinical sources and the patient's authorized data.

## 3.6 Evidence & Citation Requirements


The system must maintain an approved-source registry.

Sources must have metadata: publisher, jurisdiction, title, version/date, specialty/topic, and review status.

Clinical recommendations must cite the evidence used to generate them whenever the recommendation depends on an external clinical source.

Citations must resolve to the exact source document and, where technically possible, the relevant page/section/chunk.

The system must never fabricate a citation.

If no suitable approved evidence is retrieved, the system should say that evidence is unavailable/insufficient rather than inventing support.

Hospital protocols should be separately identified from external guidelines.

Evidence hierarchy must be configurable by hospital/jurisdiction.

Evidence updates must be versioned so an audit can reconstruct which evidence was available when a recommendation was generated.

The UI should distinguish patient-derived evidence from medical-literature/guideline evidence.

## 3.7 Suggested Evidence Hierarchy


Hospital-approved clinical protocols, where applicable.

Applicable UAE/local health-authority guidance.

Applicable national clinical guidelines.

Recognized international clinical guidelines.

Authoritative medication/drug references.

Systematic reviews/meta-analyses.

Peer-reviewed primary literature.

Other sources only if explicitly approved by the hospital.

This hierarchy is a proposed product policy and must be finalized with the hospital's clinical governance team.

## 3.8 AI / Technical Architecture


The recommended initial architecture is not a custom-trained foundation model. Use an enterprise-grade general-purpose LLM for reasoning and language generation, combined with a controlled evidence retrieval system, structured patient context, deterministic safety rules, and validation layers.

Patient Context Service — normalizes data from EHR/HIS and encounter input.

Document Intelligence Service — extracts structured clinical facts from permitted documents.

Clinical Knowledge / Evidence Service — indexes and retrieves approved clinical sources.

Medication Knowledge Service — structured drug information and interaction data.

Rules Engine — deterministic clinical safety rules and hospital constraints.

LLM Reasoning Service — synthesizes patient context + retrieved evidence into a physician-facing response.

Citation Verification Service — ensures every cited source exists and is the source actually used.

Safety/Policy Gateway — validates whether a generated recommendation is allowed to reach the physician.

Audit Service — stores appropriate versions and actions.

Integration Layer — FHIR/HL7/API adapters and hospital-specific mappings.

Identity & Access Service — SSO/OAuth/OIDC/SMART-on-FHIR or hospital-approved mechanism as applicable.

## 3.9 Why Not Train a Medical Foundation Model Initially


The product needs current, jurisdiction-specific and hospital-specific evidence that should be updateable without retraining the foundation model.

Medication safety and contraindications are better represented through validated structured knowledge and deterministic rules.

Citation traceability is easier when evidence is retrieved at inference time.

Initial data availability will be insufficient for safe, broad clinical foundation-model training.

A model-agnostic architecture preserves the ability to change LLM providers or introduce fine-tuned models later.

Real physician interaction data can later be used for evaluation, specialized fine-tuning, and workflow optimization subject to governance, consent/legal basis, de-identification where appropriate, and hospital agreements.

## 3.10 Integration Requirements


FHIR-first design where supported.

HL7 v2 support through an integration engine where required.

REST/API adapters for vendor-specific interfaces.

Support for patient, encounter, condition, allergy, medication, observation, diagnostic report, procedure, and clinical-document concepts as available.

Read-only MVP integration before write-back.

Write-back only after hospital approval, validation, and appropriate controls.

Hospital-specific identity matching and patient identifier cross-reference.

Connection logging and error handling.

No assumption that every hospital exposes the same API capabilities.

Riayati documentation describes FHIR gateway/API interfaces for patient details, encounters, allergies, conditions, procedures, prescriptions, observations, laboratory/radiology results and clinical documents [4]. Riayati currently states that its National Unified Medical Record connects more than 3,000 healthcare facilities and is integrated with NABIDH and Malaffi [3]. Abu Dhabi's 2026 HIE standards also mandate standardized capture/exchange requirements for patient and clinical data across EMRs [2].

## 3.11 Security & Privacy Requirements


Patient data must be processed only under the hospital's authorized data-processing architecture and agreements.

Encryption in transit and at rest.

Strong authentication and role-based/attribute-based authorization as appropriate.

Least-privilege access.

Complete access and administrative audit logging.

Secrets and keys managed through secure mechanisms.

Network segmentation/private connectivity where required.

Configurable retention and deletion policies.

Tenant isolation for multi-hospital deployments.

No use of one hospital's patient data to train a shared model for other hospitals unless explicitly authorized and legally/ethically permitted.

Document all external AI/data processors and subprocessors.

Support hospital security assessment, penetration testing, vulnerability management, incident response, and business continuity requirements.

## 3.12 UAE Regulatory & Governance Requirements


The initial target is UAE hospitals. The platform should be designed to support, rather than claim automatic compliance with, applicable UAE federal and emirate-specific requirements. Exact obligations depend on deployment location, intended use, clinical functionality, hosting/data flows, and the healthcare entity.

Abu Dhabi DoH's Responsible AI Standard V1 (effective October 2025) applies to licensed healthcare entities in Abu Dhabi and covers AI systems used for clinical and other functions, including third-party systems, across the lifecycle [1].

The DoH standard is organized around core foundations, data management, AI risk management, and AI literacy [1].

Abu Dhabi DoH publishes current Health Information Exchange standards and states that healthcare providers must monitor current technical specifications and implementation timelines [2].

Riayati publishes policies, terminology, integration, cybersecurity and privacy resources for healthcare providers and health IT vendors [5].

The product should undergo a formal intended-use and regulatory classification assessment before clinical deployment.

Clinical validation, post-deployment monitoring, incident management, change control, and evidence of performance should be built into the quality system.

The product should not be marketed as 'UAE compliant' merely because it uses UAE guidelines; compliance/approval must be assessed for the actual deployment and intended use.

## 3.13 Internationalization Requirements


Country-specific evidence repositories.

Country-specific medication databases and formularies.

Country-specific regulatory configuration.

Country-specific terminology/coding mappings.

Country-specific data residency and transfer configuration.

Country-specific EHR/HIS adapters.

Hospital-specific protocol repositories.

Jurisdiction-aware evidence ranking.

Separate regulatory intended-use profiles.

International expansion is feasible if these jurisdictional concerns remain modular. For example, UK regulators note that many software/AI products with a medical purpose may be regulated as medical devices, with qualification/classification dependent on the product's intended purpose and functionality [6]. Therefore the product should maintain a jurisdiction-specific regulatory workstream rather than assuming one approval covers all markets.

## 3.14 Non-Functional Requirements


## 3.15 AI Safety & Guardrails


Do not provide a recommendation when required clinical context is missing beyond a defined safety threshold.

Do not fabricate patient data.

Do not fabricate evidence or citations.

Do not silently alter a prescription or patient record.

Do not silently order investigations.

Do not suppress known critical safety warnings.

Use deterministic checks for high-confidence safety rules where possible.

Require explicit physician action for clinically consequential changes.

Maintain model, prompt, evidence and rule versions.

Provide rollback and feature-disable controls.

Monitor adverse/unsafe recommendation reports.

Support post-deployment clinical performance monitoring.

## 3.16 Quality & Validation Strategy


Offline evaluation using curated clinical cases reviewed by qualified clinicians.

Specialty-specific test sets.

Medication safety test suites.

Citation correctness tests.

Adversarial/hallucination testing.

Missing-data and contradictory-data testing.

Document extraction accuracy testing.

Human factors/usability testing with physicians.

Silent-mode pilot before exposing recommendations to clinical users where appropriate.

Prospective pilot with predefined safety and performance thresholds.

Continuous post-deployment monitoring and incident review.

## 3.17 Release Phases


## 3.18 MVP Acceptance Criteria


Doctor can open an authorized patient and see relevant clinical context.

Doctor can enter free-text symptoms and examination findings.

Doctor can attach supported clinical documents.

System extracts relevant facts and links them to source documents where possible.

System can retrieve approved evidence relevant to the clinical context.

Every applicable clinical suggestion displays valid supporting evidence.

The system never generates a fake citation in acceptance testing.

Medication safety checks run against configured authoritative data/rules.

Prescription autocomplete can be accepted, modified, or dismissed.

No suggestion automatically becomes a prescription.

AI outage does not prevent normal core clinical workflow.

All required high-impact events are auditable.

Hospital IT can revoke/limit access by role.

Clinical administrators can version or disable an evidence source/rule.

## 3.19 Open Decisions


Final product name.

First UAE hospital/customer.

First specialty and clinical workflow.

Exact EHR/HIS to integrate first.

Hosting model: hospital on-premise, private cloud, or approved hybrid.

LLM provider and deployment model.

Approved drug information provider.

Initial evidence sources and licensing.

Clinical governance partner/advisory board.

Regulatory classification and intended-use statement.

Whether initial prescription suggestions are limited to autocomplete/safety or include treatment recommendations.

Exact definition of evidence strength vs patient-context match vs model confidence.

Languages required for MVP.

Write-back scope and timeline.

## Recommended Initial Product Strategy

# 4. Recommended Initial Product Strategy


The strongest first version is not an autonomous diagnostic system. It is a physician-facing clinical workspace with a tight, evidence-grounded loop:

Document → Understand → Retrieve Evidence → Suggest → Explain → Physician Decides

Start with one specialty and one hospital workflow.

Use a strong enterprise LLM rather than training a medical foundation model.

Build the evidence/citation engine as a first-class product component.

Build medication safety as a deterministic/structured subsystem rather than relying solely on the LLM.

Integrate read-only first; add controlled write-back after validation.

Capture physician feedback and clinical evaluation data under proper governance.

Keep country-specific evidence, regulation and integration adapters modular from day one.

# 5. Source Notes


The following official sources informed the regulatory/interoperability sections. These are reference materials, not a claim that the product is approved or compliant.

[1] Abu Dhabi Department of Health — Responsible Artificial Intelligence (AI) Standard, V1, 2025.
https://www.doh.gov.ae/-/media/Feature/Resources/Standards/2025/Responsible-AI-Standard-V1.ashx

[2] Abu Dhabi Department of Health — Health Information Exchange Standards 2026.
https://www.doh.gov.ae/en/resources/HIE

[3] UAE Ministry of Health and Prevention — Riayati / National Unified Medical Record.
https://mohap.gov.ae/en/riayati/about-numr

[4] UAE Ministry of Health and Prevention — Riayati Integration, Terminology and Coding Standards v2.1 (FHIR interfaces).
https://mohap.gov.ae/documents/20117/674129/Riayati_Integration_Terminology_and_Coding_Standards_v2.1.pdf/14228d81-1e58-8ffc-91d1-a675bf240e6f

[5] UAE Ministry of Health and Prevention — Riayati Resources (policies, standards, cybersecurity and privacy resources).
https://mohap.gov.ae/en/riayati/resources

[6] UK MHRA — Software and artificial intelligence (AI) as a medical device.
https://www.gov.uk/government/publications/software-and-artificial-intelligence-ai-as-a-medical-device/software-and-artificial-intelligence-ai-as-a-medical-device

[7] UK MHRA — National Commission into the Regulation of AI in Healthcare: Recommendations for a future regulatory framework, September 2026.
https://www.gov.uk/government/publications/national-commission-into-the-regulation-of-ai-in-healthcare-recommendations-for-a-future-regulatory-framework

[8] Abu Dhabi Department of Health — Standards and guidelines portal.
https://www.doh.gov.ae/en/resources/standards

Important: Clinical recommendations in the eventual product must use licensed/approved evidence and drug-information sources appropriate to the deployment jurisdiction. This document defines product requirements; it does not itself constitute medical guidance.

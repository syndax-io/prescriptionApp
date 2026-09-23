# Clinical Intelligence Platform — Business Requirements Document (BRD)

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

# 2. Business Requirements Document (BRD)


## 2.1 Business Problem


Doctors spend significant time navigating fragmented patient information across ERP/EHR screens.

Clinical history, laboratory results, medications, allergies, and documents may be difficult to synthesize quickly.

Clinical documentation creates substantial repetitive work during consultations.

Decision support is often separated from the physician's normal workflow.

Generic AI assistants are not sufficient for clinical use because recommendations need patient context, evidence traceability, safety controls, and hospital governance.

Hospitals need to preserve their existing core systems rather than replace the ERP/EHR simply to adopt clinical AI.

## 2.2 Product Vision


Create an intelligent clinical workspace that understands the current patient encounter in real time and supports physicians throughout documentation, clinical reasoning, investigation consideration, and prescribing—while keeping the hospital's existing systems, clinical governance, and physician authority at the center.

## 2.3 Business Objectives


Reduce time physicians spend searching for and synthesizing patient information.

Reduce repetitive clinical documentation effort.

Provide evidence-grounded clinical decision support at the point of care.

Improve visibility of relevant patient history, abnormal results, allergies, and medication risks.

Improve prescription workflow with context-aware inline suggestions and safety checks.

Create an auditable record of AI-assisted clinical interactions.

Integrate with existing hospital systems without requiring ERP/EHR replacement.

Establish a reusable platform architecture that can be localized for additional UAE facilities and later international markets.

## 2.4 Business Outcomes / KPIs


## 2.5 Target Customers


Private and public hospitals

Hospital groups and integrated provider networks

Specialty hospitals and clinics with enterprise EHR/HIS infrastructure

Healthcare organizations seeking AI-enabled clinical workflow improvements without replacing their existing core systems

## 2.6 Primary Users


## 2.7 Product Positioning


The product should be positioned as a Clinical Intelligence & Decision Support Platform—not as an autonomous AI doctor, consumer chatbot, or replacement for the hospital ERP/EHR.

No ERP/EHR replacement.

AI assists; physician decides.

Patient-specific suggestions are grounded in available patient data and approved evidence sources.

Recommendations are explainable and traceable.

Hospital protocols can be incorporated into the evidence hierarchy.

The platform is designed to keep patient data under hospital-controlled governance and deployment requirements.

## 2.8 Strategic Differentiators


Evidence-backed recommendations with clickable source citations.

Context-aware prescription autocomplete rather than generic text autocomplete.

Patient 360° context assembled from ERP/EHR, notes, labs, and documents.

Hospital-specific clinical protocol layer.

Deterministic medication safety rules alongside generative AI.

Audit trail for AI suggestions and physician actions.

FHIR/HL7-first integration architecture.

Jurisdiction-aware evidence and regulatory configuration.

Graceful degradation: the underlying hospital workflow must remain usable if AI services are unavailable.

## 2.9 Business Scope — MVP


One hospital deployment

One clinical specialty or narrowly defined workflow

Read-only integration with the hospital EHR/HIS initially

Patient 360° summary

Doctor clinical notes

Attachment of selected lab reports and clinical documents

AI extraction and summarization of relevant clinical information

Evidence-grounded differential diagnosis support

Investigation suggestions

Medication safety checks

Context-aware prescription autocomplete

Evidence citations and source viewer

Physician accept/modify/reject workflow

Audit logging

Role-based access

Hospital-configurable evidence sources and protocols

## 2.10 Out of Scope for MVP


Autonomous diagnosis

Autonomous prescribing

Automatic medication orders without explicit physician authorization

Automatic modification of patient records

Autonomous clinical actions

General consumer health chatbot

Training a foundation medical LLM from scratch

Multi-country regulatory certification at initial launch

Broad autonomous medical imaging diagnosis unless separately scoped and validated

Replacing the hospital's ERP/EHR

## 2.11 Business Risks

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

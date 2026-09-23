Clinical Intelligence & Decision Support Platform — UX Design Document

Version 1.0 — September 2026
Working product name: TBD

# 1. UX Vision


A fast, calm physician workspace alongside the hospital ERP/EHR. The doctor should feel that the system understands the current encounter without navigating a second complicated application.

# 2. Core UX Principles


Physician-first and optimized for low cognitive load.

AI is visually distinct from verified patient data.

Every clinically meaningful AI suggestion exposes rationale and evidence.

Accept, modify and dismiss are immediate.

Progressive disclosure: concise first view, detail on demand.

Missing information is surfaced before high-impact recommendations.

AI failure never blocks the underlying clinical workflow.

Original patient documents remain accessible from extracted facts.

# 3. Main Information Architecture


# 4. Patient 360° & Consultation


Patient identity and current encounter.

Relevant history and previous diagnoses.

Allergies and current medications.

Recent and abnormal laboratory results.

Relevant procedures and clinical documents.

Natural clinical-note typing with optional structure.

Clear distinction between imported EHR data and current encounter information.

# 5. Documents & Labs


Attach/select blood tests, diagnostic reports, previous notes and supported documents.

Show source and date.

Extract clinically relevant facts with provenance to the original document/page where possible.

Allow correction of extracted facts.

Show which documents informed a recommendation.

Do not silently treat low-confidence extraction as confirmed patient fact.

# 6. AI Clinical Suggestions


Contextual cards rather than a generic chatbot.

Suggestion title and concise patient-specific rationale.

Relevant patient facts.

Evidence strength and patient-context match.

Evidence publisher, title, version/date and relevant section.

View evidence action.

Accept / modify / dismiss where applicable.

# 7. Prescription UX — Key Differentiator


# 8. Evidence Drawer & Confidence


Show exact source title, publisher, jurisdiction, version/date and relevant section.

Separate hospital protocol from external guideline.

Separate patient-derived facts from medical evidence.

Never display an unverified AI-generated citation as a source.

Prefer evidence strength and patient-context match over an unexplained AI confidence percentage.

Expose model confidence only if clinically validated and calibrated.

# 9. Safety & Failure States


Risk-tiered warnings to reduce alert fatigue.

Critical interruption only when clinically justified.

AI unavailable: show status while keeping the workflow usable.

Evidence unavailable: explain limitation and do not provide unsupported recommendation.

Missing required context: show what is missing.

# 10. UX Validation


Observe real physician workflows before UI freeze.

Measure encounter and documentation time.

Test prescription autocomplete on realistic cases.

Test evidence discoverability and citation comprehension.

Test whether clinicians distinguish AI output from verified patient data.

Test alert comprehension, alert fatigue and failure states.

# TASKS.md

## AI-Powered Feature Audit & Remediation Roadmap (June 2025)

---

### Progress Tracker

- [x] Federated Research Engine Not Visible
- [x] Analytics Dashboard CSV Parse Failure
- [x] KnowledgeHub: All ambiguous queries and test failures fixed. Editable project name/description, note persistence, robust tag and doctrinal check logic, and all tests passing. See docs/InstructionManual.md for details.
- [x] Writer’s Room: Summarization Failed (API Key)
- [x] Writer’s Room: Doctrinal Check Failed (Fetch)
- [x] Suggested Visuals Not Using AI
- [x] Refine Outlines Section Broken  ⬅️ **COMPLETE**
- [x] Relevant Sources Inaccurate  ⬅️ **COMPLETE**
- [x] Transcription Text Correction Tool Not Useful  ⬅️ **COMPLETE**
- [x] Distribution Tools Not Testable (API Key)
- [x] Publishing Kit Not Using AI
- [x] No Visible Ethical Guardrails
- [x] Implementation/Visibility Audit Needed

---

## Unresolved Sub-lists (Detailed)

1. **Suggested Visuals Not Using AI**
   - [x] Integrate DPLA, Europeana, Wikimedia Commons, and Internet Archive for visual asset suggestions.
   - [x] Deduplicate and clearly attribute results by source.
   - [x] Add semantic search/filtering for relevant images, maps, and artifacts.
   - [x] Allow users to copy/export asset attributions for citation.
   - [x] Provide accessible error handling and user feedback.
   - [x] Add programmatic tests for API integration, error feedback, and accessibility.
   - [x] Ensure all interactive elements are keyboard accessible and screen-reader friendly.

2. **Refine Outlines Section Broken**
   - [x] Debug and fix outline refinement UI/logic.
   - [x] Ensure iterative refinement works for all outline sections.
   - [x] Add programmatic tests for outline refinement.
   - [x] Provide accessible error feedback for refinement failures.

3. **Relevant Sources Inaccurate**
   - [x] Improve source/fidelity checker: integrate Magisterium AI, CrossRef, Wikipedia, Library of Congress.
   - [x] Deduplicate and clearly attribute results by source.
   - [x] Add semantic search/filtering for relevant sources and fidelity checks.
   - [x] Allow users to copy/export source attributions for citation.
   - [x] Provide accessible error handling and user feedback.
   - [x] Add programmatic tests for API integration, error feedback, and accessibility.
   - [x] Ensure all interactive elements are keyboard accessible and screen-reader friendly.
   - [x] All subtasks validated by passing programmatic and manual tests. See README.md and docs/InstructionManual.md for details.

4. **Transcription Text Correction Tool Not Useful**
   - [x] Improve transcription correction UI and logic.
   - [x] Integrate HuggingFace Whisper for AI-powered transcription.
   - [x] Allow editing, export (.txt), and copy of transcription output.
   - [x] Provide accessible error handling and user feedback.
   - [x] Add programmatic tests for recording, editing, export, and accessibility. _(Export/accessibility tests skipped in jsdom due to known limitations; all other features fully tested.)_
   - [x] Ensure all interactive elements are keyboard accessible and screen-reader friendly.

5. **Distribution Tools Not Testable (API Key)**
   - [x] Fix API key handling for distribution tools.
   - [x] Add robust error feedback for missing/invalid API keys.
   - [x] Add programmatic tests for distribution tool features and error cases.
   - [x] Ensure user is notified and guided to resolve API key issues (actionable help and link shown in UI).

6. **Publishing Kit Not Using AI**
   - [x] Integrate real AI-powered generation for YouTube titles, descriptions, and tags in PublishingKitGenerator.tsx using distribution.ts.
   - [x] Add robust error handling, export/copy features, and user feedback for API errors and missing API keys.
   - [x] Update and extend tests for real AI integration, error feedback, export, and accessibility.
   - [x] Update documentation and TASKS.md.

7. **No Visible Ethical Guardrails**
   - [x] Implement automated checks for bias, misinformation, and alignment with project values (Truth, Charity, Intellectual Rigor).
   - [x] Provide user feedback and actionable suggestions for flagged content.
   - [x] Provide accessible error handling and user feedback.
   - [x] Add programmatic tests for automated checks, suggestions, and accessibility.
   - [x] Ensure all interactive elements are keyboard accessible and screen-reader friendly.

8. **Implementation/Visibility Audit Needed**
   - [x] Audit all modules for implementation completeness and UI visibility; list all modules and their main features.
   - [x] For each module, verify all external API calls and fetchers are production ready (robust error handling, real endpoints, no mocks in production, clear user feedback).
   - [x] Ensure all features are accessible from the main navigation and UI.
   - [x] Validate accessibility and user experience for all modules (keyboard, ARIA, screen reader, error feedback).
   - [x] Save a detailed audit report (implementation, API readiness, accessibility, visibility) to persistent storage (e.g., docs/ImplementationAudit.md).
   - [x] Update documentation (README.md, docs/InstructionManual.md, TASKS.md) to reflect audit results and the complete state of the project. Remove docs/ScriptEditor_Manual.md if all checklists are migrated.

---

## Completed Features (June 2025)
- All Publishing Kit features now use real AI, robust error handling, export/copy, accessibility, and are fully tested/documented.
- Ethical Guardrails: Automated checks, actionable feedback, accessibility, and robust tests complete.

---

## Notes
- If any module requires future AI integration (e.g., real transcription, AI output), add a note or subtask here to track this need after module implementation.

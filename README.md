# Novel Writer

Novel Writer is a local Codex plugin for serialized fiction and long-form novel work. It provides one skill, `novel-writing`, that helps with update cadence, season arcs, chapter directions, drafting, prose polishing, revision, reader recaps, payoff tracking, and continuity checks.

## What It Can Do

- Turn a rough idea into a logline, premise, and plot direction.
- Shape the idea into a serial format with update cadence, season arcs, and backlog goals.
- Build a story bible for characters, world rules, timeline, clues, and payoffs.
- Create chapter outlines with POV, reader reward, emotional turns, hook type, and payoff debt.
- Maintain compact project state across long drafting sessions.
- Track cliffhangers, reader-facing promises, recaps, and planned payoffs.
- Manage the production loop from brief to draft, release checklist, queue, and recap.
- Recover a paused serial with restart hooks and next-update plans.
- Interpret reader feedback without letting comments hijack the story.
- Draft scenes in the requested language, tense, and point of view.
- Revise prose for structure, pacing, dialogue, character motivation, and continuity.
- Check long manuscripts for contradictions and unresolved promises.
- Run long-form quality audits for reader pull, plot progression, character motivation, setting continuity, AI-like language traces, and 30k/50k maintenance checkpoints.

## Suggested Prompts

- `Turn this serial novel idea into a season plan and first five update hooks.`
- `Create a story bible for this project and ask the most important setup questions first.`
- `Draft chapter one from this outline with a strong reader reward and ending hook.`
- `Check these three chapters for timeline, motivation, payoff debt, and recap gaps.`
- `Create a release checklist for this chapter and tell me if it is ready to publish.`
- `Help me restart this serial after a long pause with a recap and next three updates.`

## Files

- `.codex-plugin/plugin.json`: plugin manifest.
- `skills/novel-writing/SKILL.md`: the core writing workflow.
- `assets/story-bible-template.md`: reusable story bible template.
- `skills/novel-writing/assets/chapter-brief-template.md`: per-chapter continuity template.
- `skills/novel-writing/assets/serial-plan-template.md`: update cadence and season planning template.
- `skills/novel-writing/assets/payoff-ledger-template.md`: reader promise and payoff tracking template.
- `skills/novel-writing/assets/reader-recap-template.md`: returning-reader recap template.
- `skills/novel-writing/assets/update-pipeline-template.md`: draft, revise, queue, and publish tracking.
- `skills/novel-writing/assets/release-checklist-template.md`: pre-publish quality gate.
- `skills/novel-writing/assets/reader-feedback-template.md`: comment and reaction signal tracking.
- `skills/novel-writing/assets/hiatus-recovery-template.md`: restart plan after a pause.
- `skills/novel-writing/assets/title-hook-bank-template.md`: title and hook option bank.
- `apps/serial-control/index.html`: local web control panel.
- `scripts/start_serial_novel_app.cmd`: one-click Windows launcher for the app.
- `scripts/install_or_update_plugin.cmd`: one-click install/update helper for this computer or a new computer.
- `scripts/package_plugin.cmd`: creates both a portable plugin zip and a one-click installer zip for another computer.
- `scripts/unpack_and_install.py`: unpack-and-install helper used by the one-click installer package.
- `SYNC.md`: beginner-friendly cross-computer update guide.

Current app features:

- Project library with local JSON storage.
- Chapter manuscript library.
- Chapter cards use a fixed internal layout so titles, status, and word counts stay inside the card.
- Chapter list search, status filtering, and latest-drafted-chapter badges.
- Current chapter editor with a sticky writing toolbar, fixed word/line stats, save action, and compact TXT export menu.
- AI output can be written into the current chapter.
- Chapter Markdown export.
- Chapter TXT export menu with current-chapter, selected-chapter, and all-chapter export.
- Top navigation now keeps only the core pages: writing home, chapter library, and AI interface.
- Advanced tools are grouped into a card panel for prose polishing, release checks, reader feedback, hiatus recovery, and season/volume planning.
- Long-form quality audit is available in Advanced Tools to check reader pull, chapter movement, character motivation, dialogue voice, setting continuity, AI-like prose traces, and 30k/50k maintenance needs.
- Long-form quality audit reports can be sent directly into intensive prose polishing as revision context for the current chapter.
- Revision task reviews can be applied back into the task list, marking reviewed items as resolved, still pending, or no longer applicable.
- Revision tasks can now be selected and processed by AI to classify issues, generate a concrete edit plan, rewrite the current chapter without auto-overwriting it, and review whether selected tasks were fixed.
- Long-form quality audits include first-three-chapter excerpts for opening hook and early reader-contract checks.
- 50k maintenance separates structural audit from structural refresh; audits no longer mark the refresh complete until outline, evidence, or planning work is updated.
- Switching back to the writing home page no longer rebuilds full AI prompts synchronously; prompt text is generated only when needed, while usage estimates use a lighter calculation.
- Conservative and intensive prose polishing modes that preserve plot, structure, point of view, character voice, and style.
- Simplified outline-first writing home page with a 5-step workflow: outline, memory card, two-chapter direction, draft, and save.
- Writing home page now shows the exact AI reading order and the latest drafted chapter ending from the chapter library.
- Writing home page uses three compact summary cards for project outline, novel memory card, and two-chapter direction; full editing opens in a drawer.
- Generation settings now contains economy mode, author confirmations, and optional chapter requirements.
- Writing home page shows visible progress data for manuscript progress, memory-card coverage chapter, and the exact target chapters for the two-chapter direction.
- Chapter-direction cards now show lifecycle states such as ready, still usable, exhausted, or needs reprediction, and saving chapters refreshes the writing-home recommendation.
- Outline modes for initial outline, outline update, and outline conflict checking without directly overwriting manual edits.
- Outline check can now feed into outline update through an author-confirmation area, so unresolved settings are decided by the writer before the outline is optimized.
- Drafting and two-chapter planning now read the latest drafted chapter directly from the chapter library, so the writing home page no longer needs a manual previous-chapter ending field.
- Drafting and two-chapter planning now include story-momentum rules so rule systems, archives, reviews, and permissions still resolve into visible action, cost, reward, or character choice.
- The pre-save quality gate warns about dense rule/process terminology, system-prompt-like chapter endings, and consecutive repeated sentences before a draft is saved.
- Quality-gate warnings now become more actionable revision tasks, such as deleting repeated passages, converting process-heavy rules into visible cost/action, or replacing system-prompt endings with real danger.
- Long-form quality audits and release checks now ask for structured `problem / impact / fix / priority / verification` tasks, and the app can parse that format into fuller revision todos.
- Open revision todos are fed back into drafting, polishing, long-form audits, and release checks so the next AI step actively avoids repeating known problems.
- Long-form audits and release checks now include a review loop for open revision todos, asking whether each item is solved, still present, partially solved, or not applicable.
- The pre-save quality gate now warns when unresolved high-priority revision todos still apply to the generated chapter range, requiring the existing second confirmation before saving.
- Chapter fulfillment records now separately preserve unresolved high-priority revision todos, so later AI knowledge refreshes can see which saved chapters still need compensation or review.
- The AI knowledge panel now surfaces saved-chapter records that still contain high-priority revision todos, making review debt visible in the fulfillment summary and risk area.
- The AI knowledge panel also includes a quality-debt card that summarizes open revision todos and saved-chapter review debt before drafting.
- AI knowledge quick updates now run in smaller resumable batches, preserve completed batches after a Codex disconnect, and warn clearly when the current page has not opened the selected project.
- AI knowledge scan prompts are now more compact, and Codex HTTP fallback output is accepted when usable content was produced after a websocket reconnect failure.
- The writing home page now shows the same quality-debt status in the main workbench, and the draft button hint changes when generation will carry unresolved risks.
- Project summaries prefer the latest drafted chapter in the manuscript library and warn when legacy `currentChapter` data disagrees with the actual manuscript progress.
- Drafting and saving now prefer the earliest empty planned chapter, so ending plans and chapter briefs are filled in-place instead of being skipped by `max chapter + 1`.
- Saving generated drafts appends a local fulfillment record to chapter notes, including intended direction, required reward, quality-gate state, and future AI-library checks.
- AI knowledge updates now read those fulfillment records and ask the model to produce chapter-direction fulfillment checks, so outline, memory-card, and drafting context can see what was fulfilled or needs compensation.
- The AI knowledge panel shows a chapter-direction fulfillment summary, making fulfilled plans, drift, and compensation needs visible without opening raw evidence cards.
- AI calls are guarded by a single active-task lock, so long outline, evidence, audit, polish, and draft jobs cannot overwrite each other's UI state by running at the same time.
- Long AI tasks now save a browser snapshot and silently write the project library before sending the request, reducing data loss after refreshes, browser crashes, or power loss.
- The pre-save draft quality gate now includes local semantic-risk checks for chapter movement, reader reward, ending pressure, repeated sentences, exposition-heavy prose, and common AI-like phrasing.
- The pre-save draft quality gate also checks for missing character interaction and weak scene/sensory detail, helping catch explanation-heavy drafts before they enter the manuscript library.
- Scene/sensory checks use concrete terms such as doors, footsteps, light, dust, smell, and pain instead of single-character matches, reducing false passes from ordinary words such as "means".
- The pre-save draft quality gate also checks whether required beats, reader rewards, and chapter-direction keywords are visibly fulfilled before saving.
- Revision tasks can be created from the pre-save quality gate, long-form audit text, and release-check text, then tracked as todo, done, or ignored inside the writing home page.
- Structural refresh progress is marked complete only after an outline result is applied to the project outline, not merely after an outline draft is generated.
- Writing AI output into the current chapter reuses draft-output validation, preventing audit reports, check text, or failure logs from polluting the manuscript library.
- Draft generation validates returned content before marking the AI call successful, so skill-unavailable text, error logs, and truncation messages are counted as failed tasks while still preserving consumed output estimates.
- The pre-save draft quality gate warns when a draft begins with assistant-style wrapper text such as "Here is the chapter" or report-like headings, so those lines can be removed before saving.
- The AI knowledge library now tracks chapter-content hashes and dirty chapter ids, so revised older chapters are queued for evidence refresh instead of being skipped by the highest scanned chapter number.
- AI knowledge updates also rescan drafted chapters that are missing hash records, so older upgraded projects do not falsely appear fully covered.
- Long chapter excerpts for the AI knowledge library and recent-chapter references now include beginning, middle samples, and ending, reducing the chance of missing mid-chapter clues, item sources, or character-state changes.
- Project-library saves use atomic JSON replacement and keep a `.bak` backup; if the main project file is damaged after a power loss, the web server tries to open the backup and exposes the recovery status in the project list.
- Opening or importing another project now checks for running AI tasks, unsaved chapter edits, unsaved generated drafts, and browser-state recovery warnings before replacing the current workspace.
- A browser-side behavior self-test verifies draft-output rejection, two-chapter splitting, planned-chapter continuation, and AI-knowledge pending-scan rules in the real control-panel runtime.
- The browser-side self-test is exposed through a hidden DOM hook, so verification can trigger it inside the actual page runtime and read a structured result.
- The self-test hook is a 1px in-page button so browser automation can trigger it with a real click path instead of relying on page globals.
- Draft generation follows a fixed context order: project outline, novel memory/analysis, latest chapter-library ending, two-chapter direction, then manuscript only.
- Unfinished-novel intake, analysis, and two-chapter inference on the writing home page.
- Two-chapter draft generation with automatic chapter splitting when saving.
- Standalone prose polishing as an advanced tool for pasted chapters or generated drafts.
- Editable project outline on the writing home page, with one-click outline generation from existing manuscript.
- Separate outline and understanding roles: outline holds story structure, understanding handles next step, serial risk, four-chapter suggestions in standard mode, and memory card.
- Collapsible story memory, optional requirements, and economy settings to reduce homepage clutter.
- Economy mode with reusable story memory and estimated prompt size.
- Theme switcher with deep and bright categories, including the new blue, red, green, gold, gray, coral, and lime palettes.
- Theme contrast guard with shared semantic color variables for buttons, labels, inputs, status text, and alerts.
- Grouped advanced tools for creation management, text processing, reader operations, and system settings.
- Beginner-first AI interface with Codex controls visible and other model settings collapsed.
- Smart per-module AI parameters so outline, analysis, planning, drafting, polishing, and checks use different temperature and output limits by default; Codex calls also receive the current task profile in the prompt.
- Upgraded manuscript library with card-style chapter navigation, a larger writing editor, and compact TXT export controls.
- Improved manuscript chapter cards with stronger title contrast, two-line titles, and automatic scrolling to the active chapter.
- Inline operation instructions beside each advanced tool.
- Threaded local web server so the control panel can answer API checks while the browser keeps a page connection open.
- Draft generation now blocks duplicate clicks and prevents status text, check reports, or failure logs from being saved as manuscript chapters.
- Draft generation now rejects AI responses that are clearly skill-unavailable messages, debug wrappers, or Codex error logs before they can be treated as usable prose.
- The local server also rejects legacy `$novel-writing` skill-unavailable output from Codex, so stale skill failures cannot be passed back as a successful draft.
- AI calls now reject truncated model responses, content-filter blocks, empty Codex outputs, and context-window failure traces before they can be treated as usable manuscript text.
- OpenAI-compatible AI calls now use per-task long-running timeouts instead of a fixed 90-second backend timeout, matching outline, draft, polish, and audit workloads more closely.
- Draft preflight now estimates output-budget risk, warning or pausing before two-chapter or high-target drafts that are likely to be truncated by the configured max output.
- Draft preflight now warns when a long project has many saved chapters but no AI knowledge library, so outline, memory, planning, and draft steps do not silently ignore mid-book facts.
- Draft preflight now pauses long projects with six or more drafted chapters when the AI knowledge library is empty, and blocks generation when too many saved chapters have not been scanned.
- Draft generation now includes the character-state index from the AI knowledge library, so returning characters, relationships, injuries, secrets, and voice constraints are less likely to drift.
- Draft failures now show a recovery panel with economy retry, single-chapter retry, latest Codex log viewing, and error-copy actions.
- AI requests now keep a small local task history, so after refresh or interruption the writing home page shows whether the last task completed, failed, or was likely interrupted.
- Server-side AI task history records recent AI request metadata, token usage, and errors in `.runtime/ai-tasks.json` without storing API keys, full prompts, or generated manuscript content; real provider `usage` is preferred when available, otherwise local estimates are used.
- The writing home page now shows the last pre-AI snapshot status, including whether it reached the project library, so power-loss recovery is easier to verify.
- Draft generation now falls back to chapter-direction anchors when "must appear / reader reward" is empty, and memory-card prompts separate future suggestions from already-established facts.
- Data recovery is more explicit: corrupt browser state shows a recovery warning, invalid imports do not replace the current project, and generated-draft saves wait for project-library sync feedback.
- Generated drafts now pass through a local save-before-quality gate that flags incomplete output, chapter-count mismatches, missing headings, weak endings, and common AI-like phrases before saving.
- The save-before-quality gate can send the current draft plus local findings directly to prose polishing, release checking, or long-form quality audit entry points.
- The save-before-quality gate now requires a second explicit confirmation before saving drafts with warnings.
- Saving generated drafts into the manuscript library now also syncs the project library automatically, reducing data-loss risk after power loss or browser storage issues.
- Validation now fails on duplicate HTML ids and duplicate top-level frontend function names, preventing regressions like workflow handlers being silently overwritten.
- Draft generation now uses the same layered evidence path as planning and analysis, including newly scanned AI knowledge that has not yet been deeply compressed.
- Draft generation, long-form audits, and project-library saves flush the active chapter editor first, so unsaved manuscript edits are included in AI context.
- Saving generated prose is idempotent for the same output, which prevents accidental duplicate chapters from repeated clicks.
- The manuscript editor auto-saves local chapter edits after typing pauses, while keeping the existing manual save button.
- Legacy project text that still says "future five chapter suggestions" is marked as historical context before AI calls on both the frontend and local server, so the current standard strategy remains four-chapter focused.

## Web Control API

Run the local control panel:

```powershell
python C:\Users\Administrator\plugins\novel-writer\scripts\serve_web_control.py --port 8787
```

Open `http://127.0.0.1:8787/`, then use the `AI 接口` tab.

You can also double-click:

```text
C:\Users\Administrator\plugins\novel-writer\scripts\start_serial_novel_app.cmd
```

Codex one-click setup:

1. Keep provider as `Codex 本机一键，推荐`.
2. Keep `Codex 命令/路径` as `auto`.
3. Click `检测 Codex`.
4. Click `直接生成`.

If Codex is installed somewhere else later, change only `Codex 命令/路径` to the new `codex.exe` path and click `检测 Codex` again.

Other model setup:

1. Choose a provider.
2. Paste the API key.
3. Click `测试接口`.
4. Click `直接生成`.

For local models such as LM Studio or Ollama, leave the API key empty and make sure the local model server is already running.

## Cross-Computer Updates

Use `scripts\package_plugin.cmd` to create a one-click installer zip under `dist\`.
On another computer, unzip `novel-writer-installer-<version>.zip` and double-click `一键解包安装.cmd`.

If you only have the plain plugin zip, unzip it and double-click `scripts\install_or_update_plugin.cmd`.

The installer preserves `projects/` and `.runtime/`, so local novel projects are not overwritten by app updates.
For a long-term multi-computer workflow, put this plugin folder in a private GitHub repository and run the same installer after each pull.
See `SYNC.md` for the step-by-step version.

from __future__ import annotations

import json
import re
import subprocess
import sys
from pathlib import Path

try:
    import yaml
except ImportError as exc:
    raise SystemExit("Missing dependency: PyYAML. Install with `python -m pip install PyYAML`.") from exc


ROOT = Path(__file__).resolve().parents[1]
PLUGIN_JSON = ROOT / ".codex-plugin" / "plugin.json"
SKILL_DIR = ROOT / "skills" / "novel-writing"
SKILL_MD = SKILL_DIR / "SKILL.md"
OPENAI_YAML = SKILL_DIR / "agents" / "openai.yaml"
APP_DIR = ROOT / "apps" / "serial-control"
APP_INDEX = APP_DIR / "index.html"
APP_SCRIPT = APP_DIR / "app.js"
APP_STYLE = APP_DIR / "styles.css"
APP_ICON = APP_DIR / "assets" / "icon.svg"
SERVE_SCRIPT = ROOT / "scripts" / "serve_web_control.py"
TEST_SCRIPT = ROOT / "scripts" / "test_web_control.py"
THEME_CHECK_SCRIPT = ROOT / "scripts" / "check_theme_contrast.py"
INSTALL_SCRIPT = ROOT / "scripts" / "install_or_update_plugin.py"
PACKAGE_SCRIPT = ROOT / "scripts" / "package_plugin.py"
UNPACK_SCRIPT = ROOT / "scripts" / "unpack_and_install.py"
SYNC_GUIDE = ROOT / "SYNC.md"


REQUIRED_PLUGIN_FIELDS = {
    "name",
    "version",
    "description",
    "author",
    "license",
    "keywords",
    "skills",
    "interface",
}

REQUIRED_INTERFACE_FIELDS = {
    "displayName",
    "shortDescription",
    "longDescription",
    "category",
    "capabilities",
    "defaultPrompt",
    "brandColor",
    "composerIcon",
    "logo",
}

REQUIRED_TEMPLATES = [
    "chapter-brief-template.md",
    "serial-plan-template.md",
    "payoff-ledger-template.md",
    "reader-recap-template.md",
    "update-pipeline-template.md",
    "release-checklist-template.md",
    "reader-feedback-template.md",
    "hiatus-recovery-template.md",
    "title-hook-bank-template.md",
]

REQUIRED_SKILL_TERMS = [
    "serialized fiction",
    "web novels",
    "update cadence",
    "chapter hooks",
    "reader recaps",
    "Release Readiness Gate",
    "Reader Feedback Pass",
    "Hiatus Recovery",
    "Serial Production Pipeline",
]

REQUIRED_APP_MARKERS = [
    "Serial Novel",
    "grouped-tabs",
    "tab-group-label",
    "data-tab=\"quick\"",
    "data-tab=\"manuscript\"",
    "data-tab=\"api\"",
    "advancedTools",
    "advanced-tool-card",
    "data-open-tool=\"polish\"",
    "data-open-tool=\"release\"",
    "data-open-tool=\"feedback\"",
    "data-open-tool=\"recovery\"",
    "data-open-tool=\"arc\"",
    "data-open-tool=\"ending\"",
    "data-open-tool=\"quality\"",
    "promptOutput",
    "copyPromptBtn",
    "saveProjectBtn",
    "projectMode",
    "短篇故事",
    "theme",
    "深色主题",
    "明亮主题",
    "candy-pop",
    "teal-magenta",
    "lanshan-light",
    "ink-lime-deep",
    "projectLibrary",
    "appStatus",
    "chapterLibrary",
    "chapterCardList",
    "chapterLibrarySummary",
    "chapterEditorDraft",
    "chapterEditorHeading",
    "chapterSaveState",
    "chapter-editor-meta",
    "chapter-draft-field",
    "endingStage",
    "endingLibraryScanBtn",
    "endingDiagnosisBtn",
    "endingApplyPlanBtn",
    "endingLibraryScanResult",
    "endingReverseOutline",
    "aiToChapterBtn",
    "chapter-export-menu",
    "compact-export",
    "txtExportChapterSelect",
    "exportCurrentTxtBtn",
    "exportSelectedTxtBtn",
    "exportAllTxtBtn",
    "Codex 本机一键",
    "api-status-grid",
    "api-advanced-settings",
    "apiModeName",
    "apiAvailabilityStatus",
    "apiSmartHint",
    "apiCurrentStrategy",
    "aiCallMeta",
    "modelProfileSelect",
    "modelBindingGrid",
    "data-model-strategy",
    "smartAiSettings",
    "ai-preset-grid",
    "codexCommand",
    "detectCodexBtn",
    "generateWithAiBtn",
    "quickGenerateBtn",
    "quickSaveChapterBtn",
    "polishSource",
    "polishOutput",
    "polishChapterBtn",
    "analyzeNovelBtn",
    "inferNextBtn",
    "quickSourceText",
    "quickAnalysis",
    "projectOutline",
    "generateOutlineBtn",
    "writing-workbench",
    "workbench-focus",
    "workbench-readiness-grid",
    "focusPrimaryBtn",
    "focusTitle",
    "AI 当前读取依据",
    "evidenceFulfillmentCard",
    "evidenceDebtCard",
    "质量债务",
    "focusDebtState",
    "quality-debt-focus-card",
    "quickLatestChapterTitle",
    "generation-settings",
    "memory-summary-grid",
    "memory-drawer",
    "outlineSummaryPreview",
    "quick-command-strip",
    "quick-status-grid",
    "aiTaskStatus",
    "quickOutputStats",
    "draftQualityPanel",
    "draftQualityToPolishBtn",
    "draftQualityToReleaseBtn",
    "draftQualityOpenAuditBtn",
    "draftQualityForceSaveBtn",
    "revisionTaskPanel",
    "revisionTaskList",
    "revisionFromQualityBtn",
    "revisionFromAuditBtn",
    "revisionFromReleaseBtn",
    "revisionApplyReviewBtn",
    "revisionAiPanel",
    "revisionAiClassifyBtn",
    "revisionAiPlanBtn",
    "revisionAiRewriteBtn",
    "revisionAiReviewBtn",
    "revisionAiApplyDraftBtn",
    "shortSaveStoryBtn",
    "shortReviewPanel",
    "shortReviewResult",
    "shortReviewStatus",
    "qualityAuditBtn",
    "qualityToPolishBtn",
    "qualityAuditResult",
    "qualityAuditWords",
    "polishReviewContextHint",
    "检查短篇",
    "推断章节方向",
    "章节方向",
    "正文库最新章节",
    "quick-accordion",
    "advancedToggleBtn",
    "economyMode",
    "recentContextChars",
    "usageEstimate",
    "help-card",
    "操作说明",
]


def ok(message: str) -> None:
    print(f"OK  {message}")


def fail(message: str) -> None:
    print(f"FAIL {message}")
    raise SystemExit(1)


def load_json(path: Path) -> dict:
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except Exception as exc:
        fail(f"{path} is not valid JSON: {exc}")


def parse_frontmatter(text: str) -> dict:
    match = re.match(r"^---\n(.*?)\n---\n", text, flags=re.S)
    if not match:
        fail("SKILL.md is missing YAML frontmatter")
    try:
        data = yaml.safe_load(match.group(1))
    except Exception as exc:
        fail(f"SKILL.md frontmatter is invalid YAML: {exc}")
    if not isinstance(data, dict):
        fail("SKILL.md frontmatter must parse to a mapping")
    return data


def validate_plugin_json() -> dict:
    if not PLUGIN_JSON.exists():
        fail("plugin.json is missing")
    payload = load_json(PLUGIN_JSON)
    missing = sorted(REQUIRED_PLUGIN_FIELDS - payload.keys())
    if missing:
        fail(f"plugin.json missing fields: {', '.join(missing)}")
    interface = payload.get("interface")
    if not isinstance(interface, dict):
        fail("plugin.json interface must be an object")
    missing_interface = sorted(REQUIRED_INTERFACE_FIELDS - interface.keys())
    if missing_interface:
        fail(f"plugin.json interface missing fields: {', '.join(missing_interface)}")
    if payload["name"] != ROOT.name:
        fail(f"plugin name {payload['name']!r} does not match folder {ROOT.name!r}")
    for field in ("composerIcon", "logo"):
        asset = ROOT / interface[field]
        if not asset.exists():
            fail(f"interface.{field} points to missing file: {interface[field]}")
    ok("plugin.json is valid and asset paths resolve")
    return payload


def validate_skill() -> dict:
    if not SKILL_MD.exists():
        fail("novel-writing/SKILL.md is missing")
    text = SKILL_MD.read_text(encoding="utf-8")
    meta = parse_frontmatter(text)
    if meta.get("name") != "novel-writing":
        fail("SKILL.md frontmatter name must be novel-writing")
    if not meta.get("description"):
        fail("SKILL.md frontmatter description is required")
    for term in REQUIRED_SKILL_TERMS:
        if term not in text:
            fail(f"SKILL.md missing expected serial-writing term: {term}")
    ok("SKILL.md frontmatter and serial workflow coverage look good")
    return meta


def validate_openai_yaml() -> None:
    if not OPENAI_YAML.exists():
        fail("agents/openai.yaml is missing")
    try:
        payload = yaml.safe_load(OPENAI_YAML.read_text(encoding="utf-8"))
    except Exception as exc:
        fail(f"agents/openai.yaml is invalid YAML: {exc}")
    interface = (payload or {}).get("interface", {})
    prompt = interface.get("default_prompt", "")
    if "$novel-writing" not in prompt:
        fail("agents/openai.yaml default_prompt must mention $novel-writing")
    if not interface.get("display_name"):
        fail("agents/openai.yaml missing interface.display_name")
    ok("agents/openai.yaml is valid")


def validate_templates() -> None:
    assets_dir = SKILL_DIR / "assets"
    missing = [name for name in REQUIRED_TEMPLATES if not (assets_dir / name).exists()]
    if missing:
        fail(f"missing required templates: {', '.join(missing)}")
    for name in REQUIRED_TEMPLATES:
        text = (assets_dir / name).read_text(encoding="utf-8")
        if not text.lstrip().startswith("# "):
            fail(f"{name} should start with a top-level heading")
    ok("all serialized-fiction templates exist and have headings")


def assert_unique_matches(path: Path, pattern: str, label: str) -> None:
    text = path.read_text(encoding="utf-8")
    seen: dict[str, int] = {}
    for match in re.findall(pattern, text, flags=re.MULTILINE):
        seen[match] = seen.get(match, 0) + 1
    duplicates = [f"{name}({count})" for name, count in seen.items() if count > 1]
    if duplicates:
        fail(f"{path.relative_to(ROOT)} duplicate {label}: {', '.join(duplicates)}")


def validate_web_app() -> None:
    for path in (APP_INDEX, APP_SCRIPT, APP_STYLE, APP_ICON):
        if not path.exists():
            fail(f"web control file is missing: {path.relative_to(ROOT)}")
    assert_unique_matches(APP_INDEX, r'id="([^"]+)"', "HTML ids")
    assert_unique_matches(APP_SCRIPT, r"^function\s+([A-Za-z_$][\w$]*)\s*\(", "top-level function declarations")
    html = APP_INDEX.read_text(encoding="utf-8")
    for marker in REQUIRED_APP_MARKERS:
        if marker not in html:
            fail(f"web control index missing marker: {marker}")
    script = APP_SCRIPT.read_text(encoding="utf-8")
    for marker in ("normalizeState", "buildPrompt", "$novel-writing", "localStorage", "exportState", "fallbackCopy", "codex://exec", "codexCommand", "checkCodexStatus", "renderChapterLibrary", "renderChapterCards", "updateChapterLibrarySummary", "updateWritingContextBoard", "updateMemorySummaryCards", "openMemoryDrawer", "chapterWordCount", "selectChapterById", "renderTxtExportOptions", "writeAiOutputToChapter", "applyTheme", "themeIds", "projectMode", "isShortStory", "buildShortStoryDraftPrompt", "buildShortStoryPlanPrompt", "buildShortStoryReviewPrompt", "reviewShortStoryDraft", "useShortStoryForIntensivePolish", "generateQuickDraft", "saveQuickDraftAsChapter", "autoSaveProjectLibraryAfterChapterSave", "showLoadStateWarning", "parseImportedStateText", "importStateFromFile", "unsavedReplacementReasons", "hasUnsavedGeneratedOutput", "confirmProjectReplacement", "浏览器缓存损坏会进入恢复提示", "导入坏备份不会覆盖当前项目", "打开项目会拦截未保存生成正文", "未入库生成正文会阻止替换项目", "失败日志不会被当作未入库正文", "analyzeNovelSource", "buildOutlinePrompt", "generateProjectOutline", "inferNextChapter", "setAdvancedVisible", "createUsageEstimateCache", "markUsageEstimateDirty", "USAGE_ESTIMATE_DELAY_MS", "chapterSourceChangeMode", "updateUsageEstimate", "sourceForDraft", "evidenceContextForTask", "layeredEvidenceWithDelta", "openDetails", "applyQuickDisclosureDefaults", "buildPolishPrompt", "polishChapter", "polishMaxTokens", "persistBeforeAiTask", "syncFieldsForAiSnapshot", "lastPreAiSaveAt", "project-library", "preAiSaveStatusText", "AI调用前快照会跳过临时输出框", "AI任务状态会显示发送前快照", "directionAnchorTextFromBrief", "directionAnchorTextForChapter", "draftRequiredAnchorText", "必写质量锚点可从章节方向兜底", "续写记忆卡硬规则", "buildEndingPrompt", "endingContextBlock", "endingLibraryContextBlock", "nextPlannedChapterContext", "parseEndingReversePlans", "applyEndingReverseOutlineToChapterPlans", "aiTaskPreset", "aiSettingsFor", "smartAiSettings", "modelTaskOptions", "renderModelControls", "selectedModelProfileForTask", "recordAiCall", "exportCurrentChapterTxt", "exportSelectedChaptersTxt", "exportAllChaptersTxt", "quickDraftScope", "splitGeneratedChapters", "draftOutputBudgetRisk", "briefLifecycleInfo", "briefIsOutdatedForNextChapter", "draftQualityWarnConfirmHash", "确认仍保存", "仍可用", "已用完", "中段采样", "refreshDiagnostics", "formatDiagnostics", "copyDiagnostics", "buildQualityAuditPrompt", "runQualityAudit", "useQualityAuditForPolish", "currentChapterDraftForPolish", "updateQualityAuditUi", "antiAiTextureRules", "serialQualityGateRules", "draftSemanticSignals", "draftSemanticQualityItems", "draftPlanFulfillmentItems", "fulfillmentTermHit", "质量门会确认必须出现项已兑现", "质量门会提示必须出现项未兑现", "质量门会提示章节方向未兑现", "repeatedSentenceRisk", "normalizeRevisionTask", "renderRevisionTasks", "revisionTasksFromQualityGate", "revisionTasksFromText", "修改任务清单", "runFrontendBehaviorSelfTest", "SerialNovelControlSelfTest", "installFrontendBehaviorSelfTestHook", "frontendSelfTestBtn", "frontendSelfTestResult", "错误输出会被正文校验拦截", "校验失败会按失败统计并保留输出消耗", "两章正文会按章节标题拆分", "读者奖励不够明显", "章末压力不明显", "解释性连接词较多", "isDraftStatusText", "isDraftOutputReady", "isInvalidDraftGenerationOutput", "draftOutputValidationMessage", "aiContentValidationMessage", "validateContent", "flushCurrentChapterEditor", "quickOutputSavedHash", "scheduleChapterEditorAutosave", "旧版未来5章建议", "===下一章==="):
        if marker not in script:
            fail(f"web control script missing marker: {marker}")
    for marker in ("draftWrapperQualityItems", "AI 说明/前言", "质量门会提示AI前言包装", "对话/人物交锋信号偏少", "场景物件/感官细节偏少", "质量门会提示人物交锋不足", "质量门会提示小说现场感不足", "storyMomentumRules", "流程循环防护", "规则术语密度偏高", "章末钩子偏系统提示/待确认", "质量门会提示规则术语过密", "质量门会提示系统式章末钩子", "质量门会提示连续重复句", "qualityGateRevisionAction", "qualityGateRevisionTaskFromItem", "把流程规则落成可见行动和代价", "重写章末钩子为真实危险或人物选择", "删除连续重复段落", "质量门待办会给出流程循环改写动作", "质量门待办会给出章末钩子改写动作", "质量门待办会给出重复段落处理动作", "revisionTasksFromStructuredText", "structuredRevisionBlocksFromText", "结构化体检任务会按优先级生成待办", "结构化体检任务会保留修改动作和验证方式", "问题、影响、怎么改、优先级、验证", "revisionTasksContextForPrompt", "todoRevisionTasks", "revisionTasksReviewInstructionForPrompt", "revisionReviewStatusFromText", "applyRevisionTaskReviewResult", "revisionApplyReviewBtn", "revisionAiPanel", "revisionAiClassifyBtn", "revisionAiPlanBtn", "revisionAiRewriteBtn", "revisionAiReviewBtn", "revisionAiApplyDraftBtn", "selectedRevisionTasks", "buildRevisionTaskPlanPrompt", "buildRevisionTaskRewritePrompt", "reviewRevisionTasksWithAi", "applyRevisionAiDraftToCurrentChapter", "未处理修改任务会生成AI避坑上下文", "未处理修改任务会生成复查要求", "修改任务复查会回填已解决、仍存在和不适用", "修改任务复查会更新任务状态", "修改任务清单支持勾选任务给AI处理", "AI处理任务可以生成修改方案提示词", "AI修正文提示词会保护原剧情", "AI复查任务会输出可回填的复查板块", "应用复查结论会读取AI处理任务输出", "draftRevisionTaskQualityItems", "revisionTaskGate", "保存前质量门会提示高优先级修改任务未处理", "本章兑现记录会写入未处理高优先级修改任务", "chapterFulfillmentRevisionTaskRisks", "revisionDebtMetrics", "revisionDebtDisplay", "renderEvidenceDebtSummary", "AI资料库会提取本章兑现记录里的高优先级任务", "章节兑现卡会显示保存记录待复查", "质量债务卡会汇总待办和保存记录待复查", "首页会显示质量债务", "生成正文按钮会提示质量债务", "已处理修改任务不会触发保存前质量门", "生成正文会带入未处理修改任务", "正文润色会带入未处理修改任务", "发布检查会带入未处理修改任务", "长篇体检会复查未处理修改任务", "发布检查会复查未处理修改任务", "旧进度字段与正文库最新章节不一致", "项目摘要会以正文库最新章节作为续写锚点"):
        if marker not in script:
            fail(f"web control script missing marker: {marker}")
    for marker in ("AI_TASK_STORAGE_KEY", "loadAiTaskRecords", "startAiTaskRecord", "finishAiTaskRecord", "renderAiTaskStatus", "AI 长任务"):
        if marker not in script:
            fail(f"web control script missing marker: {marker}")
    for marker in ('draft: ["global", "characters", "foreshadow"]', "人物状态 + 小摘要", "AI资料库尚未建立", "超过 ${MEMORY_CARD_REFRESH_GAP} 章缓冲"):
        if marker not in script:
            fail(f"web control script missing marker: {marker}")
    for marker in (
        "nextWritablePlannedChapter",
        "writablePlannedChapterByNumber",
        "mergeGeneratedChapterNotes",
        "chapterFulfillmentRecord",
        "chapterFulfillmentRecordFromNotes",
        "【本章兑现记录】",
        "后续检查：下次更新 AI资料库",
        "章节方向兑现核对",
        "章节兑现核对：",
        "outlineFulfillmentCheckSummary",
        "renderEvidenceFulfillmentSummary",
        "activeAiCall",
        "beginAiCallGuard",
        "finishAiCallGuard",
        "避免多个结果互相覆盖",
        "计划目标是否兑现",
        "draftedChapterExists",
        "outlineEvidenceChapterHashes",
        "outlineEvidenceDirtyChapterIds",
        "OUTLINE_EVIDENCE_BATCH_SIZE = 2",
        "OUTLINE_EVIDENCE_CHAPTER_LIMIT = 1800",
        "outlineEvidenceProjectSnapshot",
        "maybeAutoLoadSingleProject",
        "showOpenProjectBeforeEvidenceMessage",
        "silentSaveProjectSnapshotToLibrary",
        "AI资料库更新中断，已保留完成批次",
        "chapterEvidenceHash",
        "pendingOutlineEvidenceScanChapters",
        "markChaptersEvidenceScanned",
        "markChapterEvidenceDirty",
        "firstThreeChaptersReference",
        "lastStructuralAuditWords",
        "markStructuralRefreshComplete",
        "structuralAuditDue",
        "structuralRefreshDue",
        "开头前三章参考",
        "serverAiTaskSnapshot",
        "refreshServerAiTasks",
        "serverTaskId",
        "服务端最近",
    ):
        if marker not in script:
            fail(f"web control script missing marker: {marker}")
    for marker in ("aiTaskLabel", "taskLabel"):
        if marker not in script:
            fail(f"web control script missing marker: {marker}")
    for path in (SERVE_SCRIPT, TEST_SCRIPT):
        if not path.exists():
            fail(f"web control support script is missing: {path.relative_to(ROOT)}")
    serve_text = SERVE_SCRIPT.read_text(encoding="utf-8")
    for marker in ("CODEX_TASK_PROFILES", "codex_task_context", "taskLabel", "smartAiSettings", "profileName", "infer_provider", "system_diagnostics", "launcher_status", "read_last_codex_error", "/api/codex/last-error", "/api/ai/tasks", "AI_TASKS_PATH", "record_ai_task_result", "safe_ai_task_meta", "extract_actual_usage_tokens", "estimate_text_tokens", "atomic_write_json", "load_project_payload", "project_backup_path", "model_finish_reason", "codex_success_blocker", "http_timeout_for_task", "longform-quality-audit", "旧版未来5章建议", "\"quality\": 720"):
        if marker not in serve_text:
            fail(f"web control server missing marker: {marker}")
    ok("web control panel files and core controls exist")


def validate_theme_contrast() -> None:
    if not THEME_CHECK_SCRIPT.exists():
        fail(f"theme contrast script is missing: {THEME_CHECK_SCRIPT.relative_to(ROOT)}")
    result = subprocess.run(
        [sys.executable, str(THEME_CHECK_SCRIPT)],
        cwd=str(ROOT),
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
    )
    if result.returncode != 0:
        fail((result.stdout or result.stderr or "theme contrast check failed").strip())
    ok("theme variables and contrast are valid")


def validate_sync_support() -> None:
    for path in (INSTALL_SCRIPT, PACKAGE_SCRIPT, UNPACK_SCRIPT, SYNC_GUIDE, ROOT / ".gitignore", ROOT / "scripts" / "SerialNovelControlLauncher.cs"):
        if not path.exists():
            fail(f"sync/update support file is missing: {path.relative_to(ROOT)}")
    guide = SYNC_GUIDE.read_text(encoding="utf-8")
    for marker in ("ZIP", "GitHub", "projects/", "install_or_update_plugin.cmd"):
        if marker not in guide:
            fail(f"SYNC.md missing marker: {marker}")
    install_text = INSTALL_SCRIPT.read_text(encoding="utf-8")
    for marker in ("projects", "update_marketplace", "validate_plugin.py", "build_launcher"):
        if marker not in install_text:
            fail(f"install/update script missing marker: {marker}")
    package_text = PACKAGE_SCRIPT.read_text(encoding="utf-8")
    for marker in ("zipfile", "projects", "novel-writer", "一键解包安装.cmd", "create_installer_bundle"):
        if marker not in package_text:
            fail(f"package script missing marker: {marker}")
    unpack_text = UNPACK_SCRIPT.read_text(encoding="utf-8")
    for marker in ("extractall", "install_or_update_plugin.py", "start_serial_novel_app.cmd"):
        if marker not in unpack_text:
            fail(f"unpack/install script missing marker: {marker}")
    ok("cross-computer package/install support exists")


def main() -> int:
    validate_plugin_json()
    validate_skill()
    validate_openai_yaml()
    validate_templates()
    validate_web_app()
    validate_theme_contrast()
    validate_sync_support()
    ok("novel-writer plugin passed local validation")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

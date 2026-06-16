from __future__ import annotations

import http.client
import importlib.util
import json
import re
import subprocess
import sys
import time
import urllib.parse
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
APP_DIR = ROOT / "apps" / "serial-control"
SERVER = ROOT / "scripts" / "serve_web_control.py"
THEME_CHECK = ROOT / "scripts" / "check_theme_contrast.py"
AI_TASKS_PATH = ROOT / ".runtime" / "ai-tasks.json"
SMOKE_PROJECT = ROOT / "projects" / "smoke-test-project.json"
SMOKE_PROJECT_BACKUP = Path(f"{SMOKE_PROJECT}.bak")
CHINESE_SMOKE_PROJECT = ROOT / "projects" / "测试项目.json"
CHINESE_SMOKE_PROJECT_BACKUP = Path(f"{CHINESE_SMOKE_PROJECT}.bak")


def load_server_module():
    spec = importlib.util.spec_from_file_location("serial_control_server_for_test", SERVER)
    if spec is None or spec.loader is None:
        raise AssertionError("could not load server module")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module

REQUIRED_HTML = [
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
    "data-open-tool=\"quality\"",
    "promptOutput",
    "apiProvider",
    "generateWithAiBtn",
    "draftRecoveryPanel",
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
    "retryEconomyDraftBtn",
    "viewCodexLogBtn",
    "saveProjectBtn",
    "projectMode",
    "短篇故事",
    "projectLibrary",
    "深色主题",
    "明亮主题",
    "candy-pop",
    "teal-magenta",
    "lanshan-light",
    "ink-lime-deep",
    "appStatus",
    "chapterLibrary",
    "chapterCardList",
    "chapterLibrarySummary",
    "aiToChapterBtn",
    "chapterEditorDraft",
    "chapterEditorHeading",
    "chapter-export-menu",
    "compact-export",
    "txtExportChapterSelect",
    "exportCurrentTxtBtn",
    "exportSelectedTxtBtn",
    "exportAllTxtBtn",
    "projectOutline",
    "generateOutlineBtn",
    "writing-workbench",
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
    "shortSaveStoryBtn",
    "shortReviewPanel",
    "shortReviewResult",
    "qualityAuditBtn",
    "qualityToPolishBtn",
    "qualityAuditResult",
    "检查短篇",
    "polishSource",
    "polishOutput",
    "polishChapterBtn",
    "推断章节方向",
    "章节方向",
    "生成正文范围",
    "一次写两章",
    "正文库最新章节",
    "quick-accordion",
    "Codex 本机一键",
    "api-status-grid",
    "api-advanced-settings",
    "apiModeName",
    "apiAvailabilityStatus",
    "apiSmartHint",
    "smartAiSettings",
    "ai-preset-grid",
    "codexCommand",
    "detectCodexBtn",
    "通义千问 DashScope",
    "Kimi / Moonshot",
    "xAI Grok",
]

REQUIRED_JS = [
    "normalizeState",
    "buildPrompt",
    "$novel-writing",
    "localStorage",
    "exportState",
    "fallbackCopy",
    "providerPresets",
    "callAi",
    "codex://exec",
    "codexCommand",
    "checkCodexStatus",
    "projectMode",
    "isShortStory",
    "buildShortStoryDraftPrompt",
    "buildShortStoryPlanPrompt",
    "buildShortStoryReviewPrompt",
    "reviewShortStoryDraft",
    "useShortStoryForIntensivePolish",
    "renderChapterLibrary",
    "renderChapterCards",
    "updateChapterLibrarySummary",
    "updateWritingContextBoard",
    "updateMemorySummaryCards",
    "openMemoryDrawer",
    "chapterWordCount",
    "selectChapterById",
    "renderTxtExportOptions",
    "writeAiOutputToChapter",
    "buildOutlinePrompt",
    "generateProjectOutline",
    "openDetails",
    "applyQuickDisclosureDefaults",
    "exportCurrentChapterTxt",
    "exportSelectedChaptersTxt",
    "exportAllChaptersTxt",
    "quickDraftScope",
    "evidenceContextForTask",
    "layeredEvidenceWithDelta",
    'draft: ["global", "characters", "foreshadow"]',
    "人物状态 + 小摘要",
    "splitGeneratedChapters",
    "draftOutputBudgetRisk",
    "briefLifecycleInfo",
    "briefIsOutdatedForNextChapter",
    "仍可用",
    "已用完",
    "中段采样",
    "===下一章===",
    "buildPolishPrompt",
    "polishChapter",
    "serverAiTaskSnapshot",
    "refreshServerAiTasks",
    "/api/ai/tasks",
    "serverTaskId",
    "服务端最近",
    "serverTaskToUsageRecord",
    "mergeServerAiTasksIntoUsage",
    "服务端估算",
    "polishMaxTokens",
    "persistBeforeAiTask",
    "syncFieldsForAiSnapshot",
    "lastPreAiSaveAt",
    "project-library",
    "preAiSaveStatusText",
    "AI 任务状态栏会显示上次发送前快照是否写入项目库",
    "AI 长任务发送前会先保存浏览器状态并静默写入项目库",
    "AI调用前快照会跳过临时输出框",
    "AI任务状态会显示发送前快照",
    "directionAnchorTextFromBrief",
    "directionAnchorTextForChapter",
    "draftRequiredAnchorText",
    "正文生成会在“必须出现/读者奖励”未填写时",
    "必写质量锚点可从章节方向兜底",
    "续写记忆卡硬规则",
    "showLoadStateWarning",
    "parseImportedStateText",
    "importStateFromFile",
    "浏览器缓存损坏会进入恢复提示",
    "导入坏备份不会覆盖当前项目",
    "章节已保存到浏览器，正在同步项目库",
    "数据安全增强：浏览器缓存损坏会提示从项目库恢复",
    "unsavedReplacementReasons",
    "hasUnsavedGeneratedOutput",
    "confirmProjectReplacement",
    "打开项目会拦截未保存生成正文",
    "未入库生成正文会阻止替换项目",
    "失败日志不会被当作未入库正文",
    "打开项目和导入项目会先检查未保存章节",
    "buildQualityAuditPrompt",
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
    "chapterEvidenceHash",
    "pendingOutlineEvidenceScanChapters",
    "markChaptersEvidenceScanned",
    "markChapterEvidenceDirty",
    "AI资料库尚未建立",
    "超过 ${MEMORY_CARD_REFRESH_GAP} 章缓冲",
    "firstThreeChaptersReference",
    "lastStructuralAuditWords",
    "markStructuralRefreshComplete",
    "structuralAuditDue",
    "structuralRefreshDue",
    "开头前三章参考",
    "runQualityAudit",
    "useQualityAuditForPolish",
    "isDraftStatusText",
    "isDraftOutputReady",
    "isInvalidDraftGenerationOutput",
    "draftOutputValidationMessage",
    "aiContentValidationMessage",
    "validateContent",
    "校验失败会按失败统计并保留输出消耗",
    "draftQualityReport",
    "draftWrapperQualityItems",
    "draftPlanFulfillmentItems",
    "draftRevisionTaskQualityItems",
    "revisionTaskGate",
    "未处理高优先级修改任务",
    "chapterFulfillmentRevisionTaskRisks",
    "revisionDebtMetrics",
    "revisionDebtDisplay",
    "renderEvidenceDebtSummary",
    "保存记录待复查",
    "fulfillmentTermHit",
    "质量门会确认必须出现项已兑现",
    "质量门会提示必须出现项未兑现",
    "质量门会提示章节方向未兑现",
    "draftSemanticSignals",
    "draftSemanticQualityItems",
    "对话/人物交锋信号偏少",
    "场景物件/感官细节偏少",
    "质量门会提示人物交锋不足",
    "质量门会提示小说现场感不足",
    "质量门会提示AI前言包装",
    "storyMomentumRules",
    "流程循环防护",
    "规则术语密度偏高",
    "章末钩子偏系统提示/待确认",
    "质量门会提示规则术语过密",
    "质量门会提示系统式章末钩子",
    "质量门会提示连续重复句",
    "qualityGateRevisionAction",
    "qualityGateRevisionTaskFromItem",
    "把流程规则落成可见行动和代价",
    "重写章末钩子为真实危险或人物选择",
    "删除连续重复段落",
    "质量门待办会给出流程循环改写动作",
    "质量门待办会给出章末钩子改写动作",
    "质量门待办会给出重复段落处理动作",
    "revisionTasksFromStructuredText",
    "structuredRevisionBlocksFromText",
    "结构化体检任务会按优先级生成待办",
    "结构化体检任务会保留修改动作和验证方式",
    "问题、影响、怎么改、优先级、验证",
    "revisionTasksContextForPrompt",
    "todoRevisionTasks",
    "未处理修改任务会生成AI避坑上下文",
    "revisionTasksReviewInstructionForPrompt",
    "revisionReviewStatusFromText",
    "applyRevisionTaskReviewResult",
    "revisionApplyReviewBtn",
    "selectedRevisionTasks",
    "buildRevisionTaskPlanPrompt",
    "buildRevisionTaskRewritePrompt",
    "reviewRevisionTasksWithAi",
    "applyRevisionAiDraftToCurrentChapter",
    "修改任务清单支持勾选任务给AI处理",
    "AI处理任务可以生成修改方案提示词",
    "AI修正文提示词会保护原剧情",
    "AI复查任务会输出可回填的复查板块",
    "应用复查结论会读取AI处理任务输出",
    "修改任务复查会回填已解决、仍存在和不适用",
    "修改任务复查会更新任务状态",
    "保存前质量门会提示高优先级修改任务未处理",
    "本章兑现记录会写入未处理高优先级修改任务",
    "AI资料库会提取本章兑现记录里的高优先级任务",
    "章节兑现卡会显示保存记录待复查",
    "质量债务卡会汇总待办和保存记录待复查",
    "首页会显示质量债务",
    "生成正文按钮会提示质量债务",
    "已处理修改任务不会触发保存前质量门",
    "未处理修改任务会生成复查要求",
    "长篇体检会复查未处理修改任务",
    "发布检查会复查未处理修改任务",
    "生成正文会带入未处理修改任务",
    "正文润色会带入未处理修改任务",
    "发布检查会带入未处理修改任务",
    "项目摘要会以正文库最新章节作为续写锚点",
    "repeatedSentenceRisk",
    "读者奖励不够明显",
    "章末压力不明显",
    "解释性连接词较多",
    "renderDraftQualityGate",
    "normalizeRevisionTask",
    "renderRevisionTasks",
    "revisionTasksFromQualityGate",
    "revisionTasksFromText",
    "修改任务清单",
    "runFrontendBehaviorSelfTest",
    "SerialNovelControlSelfTest",
    "installFrontendBehaviorSelfTestHook",
    "frontendSelfTestBtn",
    "frontendSelfTestResult",
    "错误输出会被正文校验拦截",
    "两章正文会按章节标题拆分",
    "缺少 hash 的已写章节会进入 AI资料库待扫描队列",
    "AI资料库快速更新每批最多2章",
    "AI资料库单章摘录已压缩",
    "空项目保护和打开项目提示已就绪",
    "outlineEvidenceProjectSnapshot",
    "maybeAutoLoadSingleProject",
    "showOpenProjectBeforeEvidenceMessage",
    "silentSaveProjectSnapshotToLibrary",
    "AI资料库更新中断，已保留完成批次",
    "draftQualityActionText",
    "useDraftQualityForPolish",
    "useDraftQualityForRelease",
    "openQualityAuditFromDraftGate",
    "draftQualityWarnConfirmHash",
    "确认仍保存",
    "AI_TASK_STORAGE_KEY",
    "loadAiTaskRecords",
    "startAiTaskRecord",
    "finishAiTaskRecord",
    "renderAiTaskStatus",
    "autoSaveProjectLibraryAfterChapterSave",
    "showDraftRecoveryPanel",
    "retryDraftWithEconomy",
    "viewLastCodexLog",
    "模型输出被截断",
    "flushCurrentChapterEditor",
    "quickOutputSavedHash",
    "旧版未来5章建议",
    "aiTaskPreset",
    "aiTaskLabel",
    "aiSettingsFor",
    "smartAiSettings",
    "taskLabel",
]


def assert_contains(path: Path, needles: list[str]) -> None:
    text = path.read_text(encoding="utf-8")
    missing = [needle for needle in needles if needle not in text]
    if missing:
        raise AssertionError(f"{path.name} missing: {', '.join(missing)}")


def assert_unique_matches(path: Path, pattern: str, label: str) -> None:
    text = path.read_text(encoding="utf-8")
    seen: dict[str, int] = {}
    for match in re.findall(pattern, text, flags=re.MULTILINE):
        seen[match] = seen.get(match, 0) + 1
    duplicates = [f"{name}({count})" for name, count in seen.items() if count > 1]
    if duplicates:
        raise AssertionError(f"{path.name} duplicate {label}: {', '.join(duplicates)}")


def assert_structural_refresh_timing(path: Path) -> None:
    text = path.read_text(encoding="utf-8")
    try:
        apply_outline = text[text.index("function applyOutlineResult"):text.index("function extractOutlineConfirmations")]
        generate_outline = text[text.index("async function generateProjectOutline"):text.index("async function inferNextChapter")]
    except ValueError as exc:
        raise AssertionError("outline flow functions could not be located") from exc
    if "markStructuralRefreshComplete();" not in apply_outline:
        raise AssertionError("applying outline results must mark structural refresh complete")
    if "markStructuralRefreshComplete();" in generate_outline:
        raise AssertionError("generating outline results must not mark structural refresh complete before apply")


def assert_evidence_hash_scan_policy(path: Path) -> None:
    text = path.read_text(encoding="utf-8")
    try:
        pending_scan = text[text.index("function pendingOutlineEvidenceScanChapters"):text.index("function outlineCheckEvidencePromptLengthEstimate")]
    except ValueError as exc:
        raise AssertionError("AI evidence pending-scan function could not be located") from exc
    required = ["number > covered", "dirty.has(key)", "!hashes[key]", "hashes[key] !== hash"]
    missing = [item for item in required if item not in pending_scan]
    if missing:
        raise AssertionError(f"AI evidence scan policy missing: {', '.join(missing)}")


def fetch(port: int, path: str) -> tuple[int, str]:
    conn = http.client.HTTPConnection("127.0.0.1", port, timeout=5)
    try:
        conn.request("GET", path)
        response = conn.getresponse()
        body = response.read().decode("utf-8", errors="replace")
        return response.status, body
    finally:
        conn.close()


def main() -> int:
    for path in (SMOKE_PROJECT, SMOKE_PROJECT_BACKUP, CHINESE_SMOKE_PROJECT, CHINESE_SMOKE_PROJECT_BACKUP):
        if path.exists():
            path.unlink()
    original_ai_tasks = AI_TASKS_PATH.read_text(encoding="utf-8") if AI_TASKS_PATH.exists() else None
    server_module = load_server_module()
    try:
        server_module.extract_chat_content({
            "choices": [{
                "message": {"content": "partial draft"},
                "finish_reason": "length",
            }]
        })
        raise AssertionError("truncated model output was not rejected")
    except ValueError as exc:
        if "输出被截断" not in str(exc):
            raise AssertionError(f"unexpected truncation error: {exc}") from exc
    if not server_module.codex_success_blocker("", "Codex ran out of room in the model's context window", ""):
        raise AssertionError("codex context-window blocker was not detected")
    if not server_module.codex_success_blocker("", "", "Sorry, current session has no available $novel-writing skill, cannot generate."):
        raise AssertionError("legacy skill-unavailable output was not rejected")
    if server_module.http_timeout_for_task("quick", 7250) < 900:
        raise AssertionError("quick long-task http timeout is shorter than expected")
    if server_module.http_timeout_for_task("release", 1600) != 420:
        raise AssertionError("release http timeout did not follow task profile")
    actual_usage = server_module.extract_actual_usage_tokens({
        "usage": {
            "prompt_tokens": 111,
            "completion_tokens": 22,
            "total_tokens": 133,
            "prompt_tokens_details": {"cached_tokens": 9},
        }
    })
    if actual_usage != {"input": 111, "output": 22, "cached": 9, "total": 133}:
        raise AssertionError(f"server actual usage extraction failed: {actual_usage}")
    assert_contains(APP_DIR / "index.html", REQUIRED_HTML)
    assert_contains(APP_DIR / "app.js", REQUIRED_JS)
    assert_unique_matches(APP_DIR / "index.html", r'id="([^"]+)"', "HTML ids")
    assert_unique_matches(APP_DIR / "app.js", r"^function\s+([A-Za-z_$][\w$]*)\s*\(", "top-level function declarations")
    assert_structural_refresh_timing(APP_DIR / "app.js")
    assert_evidence_hash_scan_policy(APP_DIR / "app.js")
    contrast = subprocess.run(
        [sys.executable, str(THEME_CHECK)],
        cwd=str(ROOT),
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
    )
    if contrast.returncode != 0:
        raise AssertionError(contrast.stdout or contrast.stderr or "theme contrast check failed")

    port = 8799
    process = subprocess.Popen(
        [sys.executable, str(SERVER), "--port", str(port)],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
    )
    try:
        ready = False
        for _ in range(30):
            line = process.stdout.readline() if process.stdout else ""
            if "running at" in line:
                ready = True
                break
            time.sleep(0.1)
        if not ready:
            raise AssertionError("server did not report readiness")
        status, html = fetch(port, "/")
        if status != 200 or "Serial Novel" not in html:
            raise AssertionError(f"unexpected index response: {status}")
        status, script = fetch(port, "/app.js")
        if status != 200 or "buildPrompt" not in script:
            raise AssertionError(f"unexpected app.js response: {status}")
        status, icon = fetch(port, "/assets/icon.svg")
        if status != 200 or "<svg" not in icon:
            raise AssertionError(f"unexpected icon response: {status}")
        status, health = fetch(port, "/api/health")
        if status != 200 or '"ok"' not in health:
            raise AssertionError(f"unexpected health response: {status}")
        status, app_status = fetch(port, "/api/app/status")
        if status != 200 or "projectCount" not in app_status:
            raise AssertionError(f"unexpected app status response: {status}")
        status, codex = fetch(port, "/api/codex/status")
        if status != 200 or "available" not in codex:
            raise AssertionError(f"unexpected codex status response: {status}")
        status, codex_error = fetch(port, "/api/codex/last-error")
        if status != 200 or "exists" not in codex_error:
            raise AssertionError(f"unexpected codex last-error response: {status}")
        status, task_history = fetch(port, "/api/ai/tasks")
        if status != 200 or "records" not in task_history:
            raise AssertionError(f"unexpected AI task history response: {status}")
        conn = http.client.HTTPConnection("127.0.0.1", port, timeout=5)
        try:
            body = json.dumps({
                "projectTitle": "Smoke Test Project",
                "projectId": "smoke-test-project",
                "updatedAt": "test",
            }).encode("utf-8")
            conn.request("POST", "/api/projects/save", body=body, headers={"Content-Type": "application/json"})
            response = conn.getresponse()
            content = response.read().decode("utf-8", errors="replace")
            if response.status != 200 or "smoke-test-project" not in content:
                raise AssertionError(f"unexpected project save response: {response.status} {content}")
        finally:
            conn.close()
        status, projects = fetch(port, "/api/projects")
        if status != 200 or "Smoke Test Project" not in projects:
            raise AssertionError(f"unexpected project list response: {status}")
        status, project = fetch(port, "/api/projects/smoke-test-project")
        if status != 200 or "Smoke Test Project" not in project:
            raise AssertionError(f"unexpected project load response: {status}")
        conn = http.client.HTTPConnection("127.0.0.1", port, timeout=5)
        try:
            body = json.dumps({
                "projectTitle": "Smoke Test Project Updated",
                "projectId": "smoke-test-project",
                "updatedAt": "test-2",
            }).encode("utf-8")
            conn.request("POST", "/api/projects/save", body=body, headers={"Content-Type": "application/json"})
            response = conn.getresponse()
            content = response.read().decode("utf-8", errors="replace")
            if response.status != 200 or "smoke-test-project" not in content:
                raise AssertionError(f"unexpected project resave response: {response.status} {content}")
        finally:
            conn.close()
        if not SMOKE_PROJECT_BACKUP.exists():
            raise AssertionError("project backup was not created on second save")
        backup_payload = json.loads(SMOKE_PROJECT_BACKUP.read_text(encoding="utf-8-sig"))
        if backup_payload.get("projectTitle") != "Smoke Test Project":
            raise AssertionError("project backup did not preserve previous version")
        SMOKE_PROJECT.write_text("{ broken", encoding="utf-8")
        status, recovered = fetch(port, "/api/projects/smoke-test-project")
        if status != 200 or "_projectRecovery" not in recovered or "Smoke Test Project" not in recovered:
            raise AssertionError(f"backup recovery failed: {status} {recovered}")
        status, projects_after_corrupt = fetch(port, "/api/projects")
        if status != 200 or "recoveredFromBackup" not in projects_after_corrupt:
            raise AssertionError(f"project list did not expose backup status: {status}")
        conn = http.client.HTTPConnection("127.0.0.1", port, timeout=5)
        try:
            body = json.dumps({
                "projectTitle": "测试项目",
                "projectId": "测试项目",
                "updatedAt": "test",
            }, ensure_ascii=False).encode("utf-8")
            conn.request("POST", "/api/projects/save", body=body, headers={"Content-Type": "application/json"})
            response = conn.getresponse()
            content = response.read().decode("utf-8", errors="replace")
            if response.status != 200 or "测试项目" not in content:
                raise AssertionError(f"unexpected chinese project save response: {response.status} {content}")
        finally:
            conn.close()
        status, project = fetch(port, f"/api/projects/{urllib.parse.quote('测试项目')}")
        if status != 200 or "测试项目" not in project:
            raise AssertionError(f"unexpected chinese project load response: {status}")
        conn = http.client.HTTPConnection("127.0.0.1", port, timeout=5)
        try:
            body = json.dumps({"codexCommand": "auto"}).encode("utf-8")
            conn.request("POST", "/api/codex/status", body=body, headers={"Content-Type": "application/json"})
            response = conn.getresponse()
            content = response.read().decode("utf-8", errors="replace")
            if response.status != 200 or "available" not in content:
                raise AssertionError(f"unexpected codex post status response: {response.status} {content}")
        finally:
            conn.close()
        conn = http.client.HTTPConnection("127.0.0.1", port, timeout=5)
        try:
            body = json.dumps({
                "endpoint": "mock://echo",
                "model": "mock-model",
                "prompt": "ping，未来5章建议",
                "systemPrompt": "未来五章建议",
            }).encode("utf-8")
            conn.request("POST", "/api/generate", body=body, headers={"Content-Type": "application/json"})
            response = conn.getresponse()
            content = response.read().decode("utf-8", errors="replace")
            if response.status != 200 or "接口连接成功" not in content:
                raise AssertionError(f"unexpected generate response: {response.status} {content}")
            if "旧版未来5章建议" not in content or "未来五章建议" in content:
                raise AssertionError(f"legacy future-five text was not sanitized: {content}")
            generate_payload = json.loads(content)
            server_task = generate_payload.get("serverTask")
            if not server_task or server_task.get("status") != "success":
                raise AssertionError(f"generate response did not include a successful server task: {content}")
            if not server_task.get("inputTokens") or not server_task.get("outputTokens") or not server_task.get("totalTokens"):
                raise AssertionError(f"server task did not include token estimates: {server_task}")
            if "prompt" in server_task or "apiKey" in server_task:
                raise AssertionError(f"server task leaked request secrets: {server_task}")
        finally:
            conn.close()
        status, task_history = fetch(port, "/api/ai/tasks")
        if status != 200:
            raise AssertionError(f"unexpected AI task history response after generate: {status}")
        task_payload = json.loads(task_history)
        first_task = task_payload.get("records", [{}])[0]
        if first_task.get("model") != "mock-model" or first_task.get("status") != "success":
            raise AssertionError(f"latest AI task record is wrong: {task_history}")
        if first_task.get("usageSource") != "server-estimated" or not first_task.get("totalTokens"):
            raise AssertionError(f"latest AI task record has no server token estimate: {task_history}")
        if "prompt" in first_task or "apiKey" in first_task:
            raise AssertionError(f"AI task history leaked request secrets: {first_task}")
        if "ping" in task_history or "未来五章建议" in task_history:
            raise AssertionError(f"AI task history leaked prompt text: {task_history}")
    finally:
        process.terminate()
        try:
            process.wait(timeout=5)
        except subprocess.TimeoutExpired:
            process.kill()
        if SMOKE_PROJECT.exists():
            SMOKE_PROJECT.unlink()
        if SMOKE_PROJECT_BACKUP.exists():
            SMOKE_PROJECT_BACKUP.unlink()
        if CHINESE_SMOKE_PROJECT.exists():
            CHINESE_SMOKE_PROJECT.unlink()
        if CHINESE_SMOKE_PROJECT_BACKUP.exists():
            CHINESE_SMOKE_PROJECT_BACKUP.unlink()
        if original_ai_tasks is None:
            if AI_TASKS_PATH.exists():
                AI_TASKS_PATH.unlink()
        else:
            AI_TASKS_PATH.parent.mkdir(exist_ok=True)
            AI_TASKS_PATH.write_text(original_ai_tasks, encoding="utf-8")

    print(json.dumps({"status": "ok", "app": str(APP_DIR)}, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

from __future__ import annotations

import argparse
import functools
import http.server
import json
import os
import re
import shutil
import socket
import socketserver
import subprocess
import sys
import tempfile
import time
import urllib.error
import urllib.parse
import urllib.request
import webbrowser
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
APP_DIR = ROOT / "apps" / "serial-control"
PLUGIN_JSON = ROOT / ".codex-plugin" / "plugin.json"
PROJECTS_DIR = ROOT / "projects"
RUNTIME_DIR = ROOT / ".runtime"
AI_TASKS_PATH = RUNTIME_DIR / "ai-tasks.json"
CODEX_PROBE_PATH = RUNTIME_DIR / "codex-probe.json"
AI_TASK_RECORD_LIMIT = 30
SERVER_STARTED_AT = time.strftime("%Y-%m-%d %H:%M:%S")
SERVER_PORT = 0
DEFAULT_ENDPOINT = "https://api.openai.com/v1/chat/completions"
DEFAULT_CODEX_MODEL = "gpt-5.5"
DEFAULT_CODEX_REASONING_EFFORT = "high"
CODEX_REASONING_EFFORTS = {"low", "medium", "high", "xhigh"}
CODEX_TASK_PROFILES = {
    "outline": "Use book-bible mode. Respect existing author-written outline, preserve confirmed settings, use outline-check reports and author confirmations as high-priority inputs, and output outline updates, change notes, conflicts, and author-confirmation items. Do not add near-future chapter advice.",
    "analysis": "Use continuity-analysis mode. Focus on the next necessary move, serial risk, the next four chapter suggestions in standard mode, and a concise continuation memory card.",
    "planning": "Use chapter-planning mode. Infer connected chapter directions from the project outline, novel analysis, and the latest two chapter references from the chapter library.",
    "quick": "Use publishable-draft mode. Write the requested chapter text from the next chapter number, prioritize the project outline, memory card, planned directions, latest chapter continuity, and reader hook, and avoid analysis outside the manuscript.",
    "manuscript": "Use manuscript-library mode. Keep output clean and directly usable for chapter storage.",
    "polish": "Use prose-polish mode. Improve imagery, diction, rhythm, and detail while preserving plot facts, point of view, and chapter structure.",
    "release": "Use release-check mode. Return concise publication risks and fixes only.",
    "feedback": "Use reader-feedback mode. Extract actionable reader signals and priority fixes.",
    "recovery": "Use hiatus-recovery mode. Build a practical restart bridge without overexplaining.",
    "ending": "Use ending-planning mode. Reduce new plot debt, prioritize old payoff recovery, final conflict alignment, and chapter-library continuity.",
    "quality": "Use longform-quality-audit mode. Audit reader pull, plot progression, character motivation, dialogue voice, setting continuity, AI-like language traces, and 30k/50k maintenance tasks. Return concrete fixes only.",
    "test": "Use connection-test mode. Reply briefly.",
    "api": "Use general serial-novel assistant mode.",
}


def sanitize_legacy_skill_references(value: object) -> str:
    text = str(value or "")
    replacements = {
        "使用 $novel-writing 处理我的连载小说完结规划。": "请按内置连载小说写作流程处理我的完结规划。",
        "使用 $novel-writing 处理我的短篇故事项目。": "请按内置短篇故事写作流程处理我的项目。",
        "使用 $novel-writing 处理我的连载小说项目。": "请按内置连载小说写作流程处理我的项目。",
        "未来5章建议": "旧版未来5章建议（仅作历史参考，按当前创作策略执行）",
        "未来五章建议": "旧版未来5章建议（仅作历史参考，按当前创作策略执行）",
        "$novel-writing": "内置小说写作流程",
    }
    for old, new in replacements.items():
        text = text.replace(old, new)
    return text


def normalize_codex_model(model: object) -> str:
    text = str(model or "").strip()
    if not text or text in {"default", "codex-default"}:
        return DEFAULT_CODEX_MODEL
    return text


def normalize_codex_reasoning_effort(value: object) -> str:
    text = str(value or "").strip().lower()
    return text if text in CODEX_REASONING_EFFORTS else DEFAULT_CODEX_REASONING_EFFORT


class ReusableThreadingTCPServer(socketserver.ThreadingMixIn, socketserver.TCPServer):
    allow_reuse_address = True
    daemon_threads = True


class SerialControlHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, format: str, *args: object) -> None:
        return

    def end_headers(self) -> None:
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def do_POST(self) -> None:
        if self.path == "/api/codex/status":
            try:
                payload = self.read_json()
                self.write_json(200, codex_status(
                    payload.get("codexCommand"),
                    payload.get("model"),
                    payload.get("reasoningEffort"),
                    payload.get("codexProfile"),
                ))
            except ValueError as exc:
                self.write_json(400, {"error": str(exc)})
            return
        if self.path == "/api/codex/probe":
            try:
                payload = self.read_json()
                self.write_json(200, codex_probe_status(payload))
            except ValueError as exc:
                self.write_json(400, {"error": str(exc)})
            return
        if self.path == "/api/projects/bible":
            try:
                payload = self.read_json()
                self.write_json(200, write_project_bible(payload))
            except ValueError as exc:
                self.write_json(400, {"error": str(exc)})
            return
        if self.path == "/api/projects/save":
            try:
                payload = self.read_json()
                self.write_json(200, save_project(payload))
            except ValueError as exc:
                self.write_json(400, {"error": str(exc)})
            return
        if self.path != "/api/generate":
            self.send_error(404, "Not found")
            return
        payload: dict = {}
        started_at = time.time()
        try:
            payload = self.read_json()
            response = call_openai_compatible(payload)
            server_task = record_ai_task_result(payload, "success", response=response, started_at=started_at)
            response["serverTask"] = server_task
            self.write_json(200, response)
        except ValueError as exc:
            if payload:
                record_ai_task_result(payload, "failed", error=str(exc), started_at=started_at)
            self.write_json(400, ai_error_payload(exc, payload))
        except urllib.error.HTTPError as exc:
            body = exc.read().decode("utf-8", errors="replace")
            if payload:
                record_ai_task_result(payload, "failed", error=body or exc.reason, started_at=started_at)
            self.write_json(exc.code, {"error": body or exc.reason})
        except Exception as exc:
            if payload:
                record_ai_task_result(payload, "failed", error=str(exc), started_at=started_at)
            self.write_json(500, ai_error_payload(exc, payload))

    def do_GET(self) -> None:
        if self.path == "/api/health":
            self.write_json(200, {"status": "ok"})
            return
        if self.path == "/api/codex/status":
            self.write_json(200, codex_status(model=DEFAULT_CODEX_MODEL, reasoning_effort=DEFAULT_CODEX_REASONING_EFFORT))
            return
        if self.path == "/api/codex/last-error":
            self.write_json(200, read_last_codex_error())
            return
        if self.path == "/api/ai/tasks":
            self.write_json(200, read_ai_task_records())
            return
        if self.path == "/api/app/status":
            self.write_json(200, app_status())
            return
        if self.path == "/api/system/diagnostics":
            self.write_json(200, system_diagnostics())
            return
        if self.path == "/api/projects":
            self.write_json(200, list_projects())
            return
        if self.path.startswith("/api/projects/"):
            try:
                project_id = urllib.parse.unquote(self.path.rsplit("/", 1)[-1])
                self.write_json(200, load_project(project_id))
            except ValueError as exc:
                self.write_json(404, {"error": str(exc)})
            return
        super().do_GET()

    def read_json(self) -> dict:
        length = int(self.headers.get("Content-Length", "0"))
        if length <= 0:
            raise ValueError("Request body is required.")
        try:
            return json.loads(self.rfile.read(length).decode("utf-8"))
        except json.JSONDecodeError as exc:
            raise ValueError(f"Invalid JSON: {exc}") from exc

    def write_json(self, status: int, payload: dict) -> None:
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)


def runtime_atomic_write_json(path: Path, payload: object) -> None:
    RUNTIME_DIR.mkdir(exist_ok=True)
    temp_path = path.with_name(f".{path.name}.{os.getpid()}.tmp")
    data = json.dumps(payload, ensure_ascii=False, indent=2)
    try:
        with temp_path.open("w", encoding="utf-8") as handle:
            handle.write(data)
            handle.flush()
            os.fsync(handle.fileno())
        temp_path.replace(path)
    finally:
        if temp_path.exists():
            try:
                temp_path.unlink()
            except OSError:
                pass


def safe_task_error(value: object, max_length: int = 600) -> str:
    text = str(value or "").strip()
    return text if len(text) <= max_length else f"{text[:max_length]}..."


def estimate_text_tokens(value: object) -> int:
    text = str(value or "")
    if not text:
        return 0
    cjk = 0
    ascii_chars = 0
    whitespace = 0
    other = 0
    for char in text:
        code = ord(char)
        if 0x3400 <= code <= 0x9FFF or 0xF900 <= code <= 0xFAFF:
            cjk += 1
        elif char.isspace():
            whitespace += 1
        elif char.isascii() and (char.isalnum() or char == "_"):
            ascii_chars += 1
        else:
            other += 1
    return max(1, int((cjk + ascii_chars / 4 + whitespace / 6 + other / 2) + 0.9999))


def first_usage_number(*values: object) -> int:
    for value in values:
        try:
            number = float(value)
        except (TypeError, ValueError):
            continue
        if number > 0:
            return int(round(number))
    return 0


def extract_actual_usage_tokens(*sources: object) -> dict | None:
    candidates: list[dict] = []
    for source in sources:
        if not isinstance(source, dict):
            continue
        for candidate in (
            source.get("usage"),
            source.get("usageMetadata"),
            (source.get("response") or {}).get("usage") if isinstance(source.get("response"), dict) else None,
            (source.get("data") or {}).get("usage") if isinstance(source.get("data"), dict) else None,
        ):
            if isinstance(candidate, dict):
                candidates.append(candidate)
    for usage in candidates:
        input_tokens = first_usage_number(
            usage.get("input_tokens"),
            usage.get("prompt_tokens"),
            usage.get("promptTokenCount"),
            usage.get("inputTokens"),
            usage.get("cache_read_input_tokens"),
            usage.get("input_token_count"),
        )
        output_tokens = first_usage_number(
            usage.get("output_tokens"),
            usage.get("completion_tokens"),
            usage.get("candidatesTokenCount"),
            usage.get("outputTokens"),
            usage.get("output_token_count"),
        )
        cached_tokens = first_usage_number(
            usage.get("cached_tokens"),
            usage.get("cachedTokens"),
            usage.get("cachedContentTokenCount"),
            usage.get("cache_read_input_tokens"),
            (usage.get("prompt_tokens_details") or {}).get("cached_tokens") if isinstance(usage.get("prompt_tokens_details"), dict) else None,
            (usage.get("input_tokens_details") or {}).get("cached_tokens") if isinstance(usage.get("input_tokens_details"), dict) else None,
            (usage.get("input_token_details") or {}).get("cached_tokens") if isinstance(usage.get("input_token_details"), dict) else None,
        )
        total_tokens = first_usage_number(
            usage.get("total_tokens"),
            usage.get("totalTokenCount"),
            usage.get("totalTokens"),
            usage.get("total_token_count"),
        )
        if input_tokens or output_tokens or cached_tokens or total_tokens:
            return {
                "input": max(0, input_tokens or max(0, total_tokens - output_tokens)),
                "output": max(0, output_tokens or max(0, total_tokens - input_tokens)),
                "cached": max(0, cached_tokens),
                "total": max(0, total_tokens or input_tokens + output_tokens),
            }
    return None


def safe_ai_task_meta(payload: dict) -> dict:
    endpoint = str(payload.get("endpoint") or "").strip()
    prompt = str(payload.get("prompt") or "")
    system_prompt = str(payload.get("systemPrompt") or "")
    input_text = "\n\n".join(part for part in (system_prompt, prompt) if part)
    model = str(payload.get("model") or "").strip()
    if endpoint == "codex://exec":
        model = normalize_codex_model(model)
    reasoning_effort = normalize_codex_reasoning_effort(payload.get("reasoningEffort")) if endpoint == "codex://exec" else ""
    return {
        "provider": str(payload.get("provider") or "").strip() or "custom",
        "profileName": str(payload.get("profileName") or "").strip(),
        "model": model,
        "reasoningEffort": reasoning_effort,
        "task": str(payload.get("task") or "api").strip() or "api",
        "taskLabel": str(payload.get("taskLabel") or "").strip(),
        "maxTokens": payload.get("maxTokens"),
        "temperature": payload.get("temperature"),
        "endpointKind": "codex" if endpoint == "codex://exec" else ("remote" if endpoint.startswith(("http://", "https://")) else "custom"),
        "promptChars": len(prompt),
        "systemPromptChars": len(system_prompt),
        "inputTokens": estimate_text_tokens(input_text),
        "smartAiSettings": bool(payload.get("smartAiSettings")),
    }


def ai_error_payload(error: object, payload: dict | None = None) -> dict:
    message = str(error or "")
    response = {"error": message}
    endpoint = str((payload or {}).get("endpoint") or "").strip()
    provider = str((payload or {}).get("provider") or "").strip()
    if endpoint == "codex://exec" or provider == "codex" or "Codex" in message:
        details = codex_failure_details(message)
        response.update({
            "actualModel": details.get("actualModel") or "",
            "failureType": details.get("failureType") or "",
            "failureTitle": details.get("failureTitle") or "",
            "failureAdvice": details.get("failureAdvice") or "",
            "lastProbeLogPath": codex_log_path_from_text(message),
        })
        if endpoint == "codex://exec" or provider == "codex":
            try:
                status = codex_status(
                    (payload or {}).get("codexCommand"),
                    (payload or {}).get("model"),
                    (payload or {}).get("reasoningEffort"),
                    (payload or {}).get("codexProfile"),
                )
                response.update({
                    "actualModel": status.get("actualModel") or response.get("actualModel") or "",
                    "failureType": status.get("failureType") or response.get("failureType") or "",
                    "failureTitle": status.get("failureTitle") or response.get("failureTitle") or "",
                    "failureAdvice": status.get("failureAdvice") or response.get("failureAdvice") or "",
                    "lastProbeLogPath": status.get("lastProbeLogPath") or response.get("lastProbeLogPath") or "",
                })
            except Exception:
                pass
    return response


def read_ai_task_records() -> dict:
    try:
        payload = json.loads(AI_TASKS_PATH.read_text(encoding="utf-8"))
    except FileNotFoundError:
        payload = []
    except Exception as exc:
        return {
            "records": [],
            "error": f"AI task history could not be read: {exc}",
            "path": str(AI_TASKS_PATH),
        }
    if not isinstance(payload, list):
        payload = []
    return {
        "records": payload[:AI_TASK_RECORD_LIMIT],
        "path": str(AI_TASKS_PATH),
    }


def record_ai_task_result(
    payload: dict,
    status: str,
    response: dict | None = None,
    error: object = None,
    started_at: float | None = None,
) -> dict:
    started = started_at or time.time()
    finished = time.time()
    content = str((response or {}).get("content") or "")
    raw = (response or {}).get("raw") if isinstance(response, dict) else None
    meta = safe_ai_task_meta(payload)
    actual_usage = extract_actual_usage_tokens(response or {}, raw or {})
    input_tokens = int(actual_usage["input"]) if actual_usage else int(meta.get("inputTokens") or 0)
    output_tokens = int(actual_usage["output"]) if actual_usage else estimate_text_tokens(content)
    total_tokens = int(actual_usage["total"]) if actual_usage else input_tokens + output_tokens
    record = {
        "id": f"server-ai-task-{int(started * 1000)}-{os.getpid()}",
        "status": status,
        "startedAt": time.strftime("%Y-%m-%d %H:%M:%S", time.localtime(started)),
        "finishedAt": time.strftime("%Y-%m-%d %H:%M:%S", time.localtime(finished)),
        "durationMs": int(max(0, finished - started) * 1000),
        "outputChars": len(content),
        **meta,
        "inputTokens": input_tokens,
        "outputTokens": output_tokens,
        "totalTokens": total_tokens,
        "cachedTokens": int(actual_usage["cached"]) if actual_usage else 0,
        "usageSource": "actual" if actual_usage else "server-estimated",
    }
    if error:
        record["error"] = safe_task_error(error)
        if meta.get("endpointKind") == "codex" or str(meta.get("provider") or "") == "codex":
            details = codex_failure_details(str(error))
            record["actualModel"] = details.get("actualModel") or ""
            record["failureType"] = details.get("failureType") or ""
            record["failureTitle"] = details.get("failureTitle") or ""
            record["failureAdvice"] = details.get("failureAdvice") or ""
    if isinstance(raw, dict):
        record["rawProvider"] = raw.get("provider") or record.get("provider")
        if raw.get("version"):
            record["rawVersion"] = raw.get("version")
        if raw.get("actualModel"):
            record["actualModel"] = raw.get("actualModel")
        if raw.get("reasoningEffort"):
            record["reasoningEffort"] = raw.get("reasoningEffort")
    existing = read_ai_task_records().get("records", [])
    records = [record] + [item for item in existing if isinstance(item, dict) and item.get("id") != record["id"]]
    runtime_atomic_write_json(AI_TASKS_PATH, records[:AI_TASK_RECORD_LIMIT])
    return record


def ensure_codex_generation_ready(payload: dict, endpoint: str, task: str) -> None:
    if endpoint != "codex://exec" or task == "test":
        return
    status = codex_status(
        payload.get("codexCommand"),
        payload.get("model"),
        payload.get("reasoningEffort"),
        payload.get("codexProfile"),
    )
    if status.get("generationReady"):
        return
    if not status.get("installed") or not status.get("versionOk"):
        raise ValueError(f"Codex 安装或版本检测未通过：{status.get('error') or status.get('version') or '请先检查 Codex 路径。'}")
    actual_model = str(status.get("actualModel") or "").strip()
    configured_model = str(status.get("lastProbeModel") or normalize_codex_model(payload.get("model"))).strip()
    title = str(status.get("failureTitle") or "Codex 尚未通过真实连通测试").strip()
    advice = str(status.get("failureAdvice") or "请先到 AI 接口点击“真实连通测试”，确认通过后再生成。").strip()
    lines = [title]
    if actual_model:
        lines.append(f"model: {actual_model}")
        lines.append(f"实际模型：{actual_model}")
    elif configured_model:
        lines.append(f"当前模型：{configured_model}")
    lines.append(f"建议：{advice}")
    if status.get("lastProbeLogPath"):
        lines.append(f"完整日志：{status.get('lastProbeLogPath')}")
    raise ValueError("\n".join(lines))


def call_openai_compatible(payload: dict) -> dict:
    endpoint = str(payload.get("endpoint") or DEFAULT_ENDPOINT).strip()
    api_key = str(payload.get("apiKey") or "").strip()
    provider = str(payload.get("provider") or infer_provider(endpoint)).strip() or "custom"
    profile_name = str(payload.get("profileName") or "").strip()
    model = str(payload.get("model") or "").strip()
    if endpoint == "codex://exec":
        model = normalize_codex_model(model)
    reasoning_effort = normalize_codex_reasoning_effort(payload.get("reasoningEffort")) if endpoint == "codex://exec" else ""
    prompt = sanitize_legacy_skill_references(payload.get("prompt")).strip()
    system_prompt = sanitize_legacy_skill_references(payload.get("systemPrompt")).strip()
    temperature = payload.get("temperature", 0.7)
    max_tokens = payload.get("maxTokens", 1600)
    task = str(payload.get("task") or "api").strip() or "api"
    task_label = str(payload.get("taskLabel") or task).strip() or task
    smart_settings = bool(payload.get("smartAiSettings"))
    meta = {
        "provider": provider,
        "profileName": profile_name,
        "model": model,
        "reasoningEffort": reasoning_effort,
        "task": task,
        "taskLabel": task_label,
        "temperature": temperature,
        "maxTokens": max_tokens,
        "smartAiSettings": smart_settings,
        "codexDefault": False,
    }
    ensure_codex_generation_ready(payload, endpoint, task)

    if endpoint == "codex://exec":
        codex_prompt = sanitize_legacy_skill_references(codex_task_context(
            task=task,
            task_label=task_label,
            smart_settings=smart_settings,
            temperature=temperature,
            max_tokens=max_tokens,
        ) + prompt)
        if system_prompt:
            codex_prompt = f"{system_prompt}\n\n{codex_prompt}"
        result = call_codex(
            prompt=codex_prompt,
            model=model,
            command=payload.get("codexCommand"),
            profile=payload.get("codexProfile"),
            reasoning_effort=reasoning_effort,
            task=task,
            task_label=task_label,
            smart_settings=smart_settings,
            max_tokens=max_tokens,
        )
        result["meta"] = meta
        return result
    if endpoint == "mock://echo":
        return {"content": f"接口连接成功。\n\n收到提示词：{prompt[:200]}", "raw": {"mock": True}, "meta": meta}
    if not endpoint.startswith(("http://", "https://")):
        raise ValueError("Endpoint must start with http:// or https://.")
    if not model:
        raise ValueError("Model is required.")
    if not prompt:
        raise ValueError("Prompt is required.")

    messages = []
    if system_prompt:
        messages.append({"role": "system", "content": system_prompt})
    messages.append({"role": "user", "content": prompt})

    request_payload = {
        "model": model,
        "messages": messages,
        "temperature": float(temperature),
        "max_tokens": int(max_tokens),
    }
    headers = {
        "Content-Type": "application/json",
        "Accept": "application/json",
    }
    if api_key:
        headers["Authorization"] = f"Bearer {api_key}"

    request = urllib.request.Request(
        endpoint,
        data=json.dumps(request_payload).encode("utf-8"),
        headers=headers,
        method="POST",
    )
    with urllib.request.urlopen(request, timeout=http_timeout_for_task(task, max_tokens)) as response:
        raw = response.read().decode("utf-8")
    data = json.loads(raw)
    content = extract_chat_content(data)
    return {"content": content, "raw": data, "meta": meta}


def infer_provider(endpoint: str) -> str:
    if endpoint == "codex://exec":
        return "codex"
    if endpoint == "mock://echo":
        return "mock"
    host = urllib.parse.urlparse(endpoint).netloc.lower()
    if "openai.com" in host:
        return "openai"
    if "deepseek.com" in host:
        return "deepseek"
    if "siliconflow" in host:
        return "siliconflow"
    if "dashscope" in host:
        return "dashscope"
    if "moonshot" in host:
        return "moonshot"
    if "bigmodel" in host:
        return "zhipu"
    if "groq" in host:
        return "groq"
    if "together" in host:
        return "together"
    if "mistral" in host:
        return "mistral"
    if "x.ai" in host:
        return "xai"
    if "fireworks" in host:
        return "fireworks"
    if "perplexity" in host:
        return "perplexity"
    if "openrouter" in host:
        return "openrouter"
    if host.startswith("127.0.0.1:1234") or host.startswith("localhost:1234"):
        return "lmstudio"
    if host.startswith("127.0.0.1:11434") or host.startswith("localhost:11434"):
        return "ollama"
    return "custom"


def model_finish_reason(choice: dict) -> str:
    reason = (
        choice.get("finish_reason")
        or choice.get("stop_reason")
        or choice.get("finishReason")
        or choice.get("stopReason")
        or ""
    )
    return str(reason or "").strip()


def extract_chat_content(data: dict) -> str:
    try:
        choice = data["choices"][0]
        finish_reason = model_finish_reason(choice).lower()
        if finish_reason in {"length", "max_tokens", "max_output_tokens", "token_limit"}:
            raise ValueError(
                "模型输出被截断：已达到最大输出限制。请调高当前功能的最大输出，或改成一次只生成一章/缩短上下文后重试。"
            )
        if finish_reason in {"content_filter", "safety", "blocked"}:
            raise ValueError("模型输出被安全策略拦截，没有返回可用正文。请调整提示词或换模型后重试。")
        message = choice.get("message") or {}
        if isinstance(message.get("content"), str):
            content = message["content"].strip()
            if content:
                return content
        if isinstance(choice.get("text"), str):
            content = choice["text"].strip()
            if content:
                return content
    except (KeyError, IndexError, TypeError):
        pass
    raise ValueError("模型没有返回可用内容：响应里缺少 choices[0].message.content。")


def app_status() -> dict:
    try:
        plugin = json.loads(PLUGIN_JSON.read_text(encoding="utf-8"))
    except Exception:
        plugin = {}
    projects = list_projects()["projects"]
    return {
        "name": plugin.get("name", "novel-writer"),
        "version": plugin.get("version", "unknown"),
        "app": "serial-control",
        "url": f"http://127.0.0.1:{SERVER_PORT or 8787}/",
        "port": SERVER_PORT or 8787,
        "pid": os.getpid(),
        "root": str(ROOT),
        "projectsDir": str(PROJECTS_DIR),
        "projectCount": len(projects),
        "codex": codex_status(model=DEFAULT_CODEX_MODEL, reasoning_effort=DEFAULT_CODEX_REASONING_EFFORT),
    }


def read_last_codex_error(limit: int = 12000) -> dict:
    debug_path = ROOT / ".runtime" / "last-codex-error.txt"
    if not debug_path.exists():
        return {
            "exists": False,
            "path": str(debug_path),
            "content": "",
            "size": 0,
            "updatedAt": "",
        }
    content = debug_path.read_text(encoding="utf-8", errors="replace")
    stat = debug_path.stat()
    return {
        "exists": True,
        "path": str(debug_path),
        "content": content[-limit:],
        "size": stat.st_size,
        "updatedAt": time.strftime("%Y-%m-%d %H:%M:%S", time.localtime(stat.st_mtime)),
        "truncated": len(content) > limit,
    }


def path_writable(path: Path) -> bool:
    try:
        path.mkdir(parents=True, exist_ok=True)
        probe = path / ".write-test.tmp"
        probe.write_text("ok", encoding="utf-8")
        probe.unlink(missing_ok=True)
        return True
    except Exception:
        return False


def detect_python() -> dict:
    return {
        "available": True,
        "executable": sys.executable,
        "version": sys.version.split()[0],
    }


def launcher_status() -> dict:
    exe = ROOT / "scripts" / "启动小说控制台.exe"
    cmd = ROOT / "scripts" / "start_serial_novel_app.cmd"
    desktop = Path.home() / "Desktop" / "启动小说控制台.exe"
    desktop_cn = Path.home() / "桌面" / "启动小说控制台.exe"
    return {
        "exe": str(exe),
        "exeExists": exe.exists(),
        "cmd": str(cmd),
        "cmdExists": cmd.exists(),
        "desktopShortcutExists": desktop.exists() or desktop_cn.exists(),
    }


def system_diagnostics() -> dict:
    status = app_status()
    codex = status.get("codex") or {}
    projects_ok = path_writable(PROJECTS_DIR)
    launcher = launcher_status()
    recommendations: list[str] = []
    if not codex.get("installed"):
        recommendations.append("Codex 未安装或未找到：请在 AI 接口里填写 codex.exe 路径，或重新安装 Codex。")
    elif not codex.get("versionOk"):
        recommendations.append(f"Codex 已找到，但版本检测失败：{codex.get('error') or '请重新检查安装。'}")
    elif codex.get("generationReady"):
        recommendations.append("Codex 已安装，且真实连通测试通过，可以生成。")
    elif codex.get("lastProbeAt"):
        model = codex.get("actualModel") or "未知模型"
        title = codex.get("failureTitle") or "真实连通测试失败"
        advice = codex.get("failureAdvice") or "请重新测试，或在 AI 接口里调整模型方案。"
        recommendations.append(f"Codex 已安装，但最近真实连通测试失败：{title}；实际模型：{model}；建议：{advice}")
    else:
        recommendations.append("Codex 已安装，但尚未做真实连通测试。请在 AI 接口里点击“真实连通测试”。")
    if not projects_ok:
        recommendations.append("项目库不可写：请检查 projects 文件夹权限。")
    if not launcher.get("exeExists"):
        recommendations.append("桌面启动器未生成：可以重新运行安装脚本生成启动 EXE。")
    if not recommendations:
        recommendations.append("系统状态正常，可以直接使用。")
    return {
        "ok": True,
        "app": status,
        "server": {
            "pid": os.getpid(),
            "port": SERVER_PORT or 8787,
            "url": status.get("url"),
            "startedAt": SERVER_STARTED_AT,
            "root": str(ROOT),
            "script": str(Path(__file__).resolve()),
        },
        "python": detect_python(),
        "codex": codex,
        "projects": {
            "dir": str(PROJECTS_DIR),
            "count": status.get("projectCount", 0),
            "writable": projects_ok,
        },
        "launcher": launcher,
        "recommendations": recommendations,
    }


def safe_project_id(value: str) -> str:
    cleaned = "".join(ch if ch.isalnum() or ch in {"-", "_"} else "-" for ch in value.strip())
    cleaned = "-".join(part for part in cleaned.split("-") if part)
    return cleaned[:80] or "untitled"


def project_path(project_id: str) -> Path:
    safe_id = safe_project_id(project_id)
    return PROJECTS_DIR / f"{safe_id}.json"


def project_bible_path(project_id: str) -> Path:
    safe_id = safe_project_id(project_id)
    return PROJECTS_DIR / f"{safe_id}.project-bible.md"


def project_backup_path(path: Path) -> Path:
    return path.with_name(f"{path.name}.bak")


def read_project_payload(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8-sig"))


def load_project_payload(path: Path) -> tuple[dict, dict | None]:
    try:
        return read_project_payload(path), None
    except Exception as primary_error:
        backup_path = project_backup_path(path)
        if backup_path.exists():
            try:
                recovery = {
                    "source": "backup",
                    "path": str(path),
                    "backupPath": str(backup_path),
                    "error": str(primary_error),
                }
                return read_project_payload(backup_path), recovery
            except Exception as backup_error:
                raise ValueError(
                    f"Project file is damaged and backup could not be read. "
                    f"main={primary_error}; backup={backup_error}"
                ) from primary_error
        raise ValueError(f"Project file is damaged: {primary_error}") from primary_error


def atomic_write_json(path: Path, payload: dict) -> None:
    PROJECTS_DIR.mkdir(exist_ok=True)
    temp_path = path.with_name(f".{path.name}.{os.getpid()}.tmp")
    backup_path = project_backup_path(path)
    data = json.dumps(payload, ensure_ascii=False, indent=2)
    try:
        with temp_path.open("w", encoding="utf-8") as handle:
            handle.write(data)
            handle.flush()
            os.fsync(handle.fileno())
        if path.exists():
            shutil.copy2(path, backup_path)
        temp_path.replace(path)
    finally:
        if temp_path.exists():
            try:
                temp_path.unlink()
            except OSError:
                pass


def atomic_write_text(path: Path, data: str) -> None:
    PROJECTS_DIR.mkdir(exist_ok=True)
    temp_path = path.with_name(f".{path.name}.{os.getpid()}.tmp")
    try:
        with temp_path.open("w", encoding="utf-8", newline="\n") as handle:
            handle.write(data)
            handle.flush()
            os.fsync(handle.fileno())
        os.replace(temp_path, path)
    finally:
        if temp_path.exists():
            try:
                temp_path.unlink()
            except OSError:
                pass


def compact_project_text(value: object, limit: int = 5000) -> str:
    text = str(value or "").strip()
    if len(text) <= limit:
        return text or "未填写"
    head = max(0, limit // 2)
    tail = max(0, limit - head)
    return f"{text[:head].rstrip()}\n\n...[中间已省略，项目文件保留完整内容]...\n\n{text[-tail:].lstrip()}"


def chapter_status_label(status: object) -> str:
    labels = {
        "planned": "计划",
        "brief": "大纲",
        "drafted": "已入库",
        "needs-review": "待质检",
        "reviewed": "已质检",
        "needs-fix": "需修复",
        "revised": "已修",
        "queued": "待发",
        "published": "已发",
        "final": "已完成",
    }
    text = str(status or "planned")
    return labels.get(text, text)


def chapter_word_count(chapter: dict) -> int:
    return len("".join(str(chapter.get("draft") or "").split()))


def project_chapter_rows(payload: dict, limit: int = 180) -> list[str]:
    chapters = payload.get("chapters")
    if not isinstance(chapters, list):
        return ["- 暂无正文库章节。"]
    rows: list[str] = []
    for chapter in sorted((item for item in chapters if isinstance(item, dict)), key=lambda item: int(item.get("number") or 0)):
        words = chapter_word_count(chapter)
        status = chapter_status_label(chapter.get("status"))
        title = str(chapter.get("title") or "未命名").strip()
        notes = str(chapter.get("notes") or "").replace("\n", " ").strip()
        note_text = f"；备注：{notes[:90]}" if notes else ""
        source = "；AI资料库来源" if words else ""
        rows.append(f"- 第{chapter.get('number') or '?'}章《{title}》：{status}；{words}字{source}{note_text}")
    if not rows:
        return ["- 暂无正文库章节。"]
    if len(rows) <= limit:
        return rows
    omitted = len(rows) - limit
    return rows[:80] + [f"- ...中间省略 {omitted} 章，完整数据保留在项目 JSON。"] + rows[-100:]


def outline_confirmation_rows(payload: dict) -> list[str]:
    confirmations = payload.get("outlineConfirmations")
    if not isinstance(confirmations, list) or not confirmations:
        return ["- 暂无待作者确认项。"]
    rows: list[str] = []
    for index, item in enumerate(confirmations, start=1):
        if not isinstance(item, dict):
            continue
        text = str(item.get("text") or item.get("title") or "").strip()
        choice = str(item.get("choice") or "未选择").strip()
        note = str(item.get("note") or "").strip()
        rows.append(f"- 确认{index}：{text or '未命名确认项'}；处理：{choice}；说明：{note or '无'}")
    return rows or ["- 暂无待作者确认项。"]


def build_project_bible_markdown(payload: dict) -> str:
    title = str(payload.get("projectTitle") or "未命名作品").strip()
    updated_at = time.strftime("%Y-%m-%d %H:%M:%S")
    chapters = [item for item in payload.get("chapters", []) if isinstance(item, dict)] if isinstance(payload.get("chapters"), list) else []
    written = [chapter for chapter in chapters if chapter_word_count(chapter) > 0]
    latest = max((int(chapter.get("number") or 0) for chapter in written), default=0)
    evidence_to = int(payload.get("outlineEvidenceUpdatedToChapter") or 0)
    evidence_compressed_to = int(payload.get("outlineEvidenceCompressedToChapter") or 0)
    analysis_to = int(payload.get("quickAnalysisChapter") or 0)
    brief_start = int(payload.get("quickBriefStartChapter") or 0)
    brief_end = int(payload.get("quickBriefEndChapter") or 0)
    brief_range = f"第{brief_start}-{brief_end}章" if brief_start and brief_end else "未记录"
    arc_summary = payload.get("outlineEvidenceArcSummaries") or payload.get("outlineEvidenceCards")
    global_summary = payload.get("outlineEvidenceGlobalSummary") or payload.get("aiKnowledgeOutput")
    character_index = payload.get("outlineEvidenceCharacterIndex")
    foreshadow_index = payload.get("outlineEvidenceForeshadowIndex")
    sections = [
        f"# {title} 项目圣经（AI资料库总览）",
        "",
        f"> 自动生成时间：{updated_at}",
        "> 用途：给作者、Codex 和其他工具快速理解项目现状。它由项目大纲、作者确认区和 AI资料库四库汇总生成，不是独立事实源。",
        "> 边界：完整正文仍以项目 JSON 和正文库为准；如果本文件与正文事实冲突，以正文库已入库章节和四库事实为准。",
        "",
        "## 1. 项目元信息",
        "",
        f"- 作品名：{title}",
        f"- 类型：{payload.get('genre') or '未填写'}",
        f"- 平台：{payload.get('platform') or '未填写'}",
        f"- 更新频率：{payload.get('cadence') or '未填写'}",
        f"- 每章字数：{payload.get('targetWords') or '未填写'}",
        f"- 正文库：共 {len(chapters)} 章，已入库 {len(written)} 章，最新第 {latest or 0} 章",
        f"- AI资料库：覆盖到第 {evidence_to} 章",
        f"- AI资料库深度整理：到第 {evidence_compressed_to} 章",
        f"- 小说记忆卡：覆盖到第 {analysis_to} 章",
        f"- 章节方向：{brief_range}",
        "",
        "## 2. 作者确认结论",
        "",
        *outline_confirmation_rows(payload),
        "",
        "## 3. 项目战略与大纲摘要",
        "",
        "### 核心卖点",
        "",
        compact_project_text(payload.get("corePromise"), 1800),
        "",
        "### 项目大纲",
        "",
        compact_project_text(payload.get("projectOutline"), 7000),
        "",
        "### 大纲整理结果",
        "",
        compact_project_text(payload.get("outlineResult"), 5000),
        "",
        "## 4. 剧情事实库",
        "",
        compact_project_text(arc_summary, 9000),
        "",
        "## 5. 世界观设定库",
        "",
        compact_project_text(global_summary, 7000),
        "",
        "## 6. 人物状态库",
        "",
        compact_project_text(character_index, 7000),
        "",
        "## 7. 伏笔线索库",
        "",
        compact_project_text(foreshadow_index, 9000),
        "",
        "## 8. 小说记忆卡与章节方向",
        "",
        "### 小说记忆卡",
        "",
        compact_project_text(payload.get("quickAnalysis"), 6000),
        "",
        "### 章节方向",
        "",
        compact_project_text(payload.get("quickBrief"), 6000),
        "",
        "## 9. 正文库章节索引",
        "",
        *project_chapter_rows(payload),
        "",
        "## 10. 使用边界",
        "",
        "- 生成正文区里的内容在保存前只是草稿，不属于正史。",
        "- AI资料库只读取正文库已入库章节，不读取生成正文草稿。",
        "- 这个项目圣经是索引和摘要文件，不替代项目 JSON，也不保存 API Key。",
        "",
    ]
    return "\n".join(sections).replace("\r\n", "\n")


def write_project_bible(payload: dict) -> dict:
    if not isinstance(payload, dict):
        raise ValueError("Invalid project payload.")
    title = str(payload.get("projectTitle") or "untitled")
    project_id = safe_project_id(str(payload.get("projectId") or title))
    payload = dict(payload)
    payload["projectId"] = project_id
    path = project_bible_path(project_id)
    content = build_project_bible_markdown(payload)
    atomic_write_text(path, content)
    return {
        "ok": True,
        "id": project_id,
        "path": str(path),
        "updatedAt": time.strftime("%Y-%m-%d %H:%M:%S"),
        "size": path.stat().st_size if path.exists() else 0,
    }


def list_projects() -> dict:
    PROJECTS_DIR.mkdir(exist_ok=True)
    projects = []
    for path in sorted(PROJECTS_DIR.glob("*.json"), key=lambda item: item.stat().st_mtime, reverse=True):
        try:
            payload, recovery = load_project_payload(path)
        except Exception as exc:
            backup_path = project_backup_path(path)
            projects.append({
                "id": path.stem,
                "title": path.stem,
                "updatedAt": "",
                "path": str(path),
                "status": "damaged",
                "loadError": str(exc),
                "backupAvailable": backup_path.exists(),
                "backupPath": str(backup_path) if backup_path.exists() else "",
            })
            continue
        projects.append({
            "id": path.stem,
            "title": payload.get("projectTitle") or path.stem,
            "updatedAt": payload.get("updatedAt") or "",
            "path": str(path),
            "status": "backup" if recovery else "ok",
            "recoveredFromBackup": bool(recovery),
            "backupAvailable": project_backup_path(path).exists(),
            "backupPath": recovery.get("backupPath") if recovery else "",
            "loadError": recovery.get("error") if recovery else "",
        })
    return {"projects": projects}


def codex_task_context(
    task: str,
    task_label: str,
    smart_settings: bool,
    temperature: object,
    max_tokens: object,
) -> str:
    profile = CODEX_TASK_PROFILES.get(task, CODEX_TASK_PROFILES["api"])
    if str(task_label or "").startswith("short-story"):
        profile = (
            "Use short-story mode. Build a complete standalone story with a closed arc, "
            "respect any existing draft facts and point of view, avoid serial chapter planning, "
            "and keep the output directly usable as short fiction."
        )
    settings_mode = "smart per-module settings" if smart_settings else "manual shared settings"
    return (
        "Serial Novel UI task profile:\n"
        f"- task: {task_label} ({task})\n"
        f"- settings mode: {settings_mode}\n"
        f"- suggested temperature: {temperature}\n"
        f"- suggested max output: {max_tokens}\n"
        f"- module instruction: {profile}\n\n"
    )


def load_project(project_id: str) -> dict:
    path = project_path(project_id)
    if not path.exists():
        raise ValueError("Project not found.")
    payload, recovery = load_project_payload(path)
    if recovery:
        payload = dict(payload)
        payload["_projectRecovery"] = recovery
    return payload


def save_project(payload: dict) -> dict:
    PROJECTS_DIR.mkdir(exist_ok=True)
    title = str(payload.get("projectTitle") or "untitled")
    project_id = safe_project_id(str(payload.get("projectId") or title))
    payload = dict(payload)
    payload["projectId"] = project_id
    payload["updatedAt"] = payload.get("updatedAt") or ""
    path = project_path(project_id)
    atomic_write_json(path, payload)
    backup_path = project_backup_path(path)
    bible: dict = {}
    try:
        bible = write_project_bible(payload)
    except Exception as exc:
        bible = {"error": str(exc)}
    return {
        "ok": True,
        "id": project_id,
        "path": str(path),
        "backupPath": str(backup_path) if backup_path.exists() else "",
        "biblePath": bible.get("path", ""),
        "bibleError": bible.get("error", ""),
    }


def local_codex_candidates() -> list[str]:
    candidates: list[str] = []
    local_app_data = os.environ.get("LOCALAPPDATA")
    if local_app_data:
        candidates.append(str(Path(local_app_data) / "OpenAI" / "Codex" / "bin" / "codex.EXE"))
    user_profile = os.environ.get("USERPROFILE")
    if user_profile:
        candidates.append(str(Path(user_profile) / "AppData" / "Local" / "OpenAI" / "Codex" / "bin" / "codex.EXE"))
    path_codex = shutil.which("codex")
    if path_codex:
        candidates.append(path_codex)
    path_codex_exe = shutil.which("codex.exe")
    if path_codex_exe:
        candidates.append(path_codex_exe)

    unique: list[str] = []
    seen: set[str] = set()
    for candidate in candidates:
        key = str(candidate).lower()
        if key in seen:
            continue
        seen.add(key)
        unique.append(candidate)
    return unique


def codex_path_usable(path: str) -> bool:
    try:
        candidate = Path(path).expanduser()
        if not candidate.exists():
            return False
        result = subprocess.run(
            [str(candidate), "--version"],
            capture_output=True,
            text=True,
            encoding="utf-8",
            errors="replace",
            timeout=8,
        )
        return result.returncode == 0
    except Exception:
        return False


def resolve_codex(command: object = None) -> str | None:
    raw = str(command or "").strip().strip('"')
    if not raw or raw.lower() == "auto":
        for candidate in local_codex_candidates():
            if codex_path_usable(candidate):
                return str(Path(candidate).resolve())
        return shutil.which("codex")
    candidate = Path(raw).expanduser()
    if candidate.exists():
        return str(candidate.resolve())
    resolved = shutil.which(raw)
    if resolved:
        return resolved
    if raw.lower() in {"codex", "codex.exe"}:
        for candidate in local_codex_candidates():
            if codex_path_usable(candidate):
                return str(Path(candidate).resolve())
    return None


def read_codex_probe_result() -> dict:
    try:
        data = json.loads(CODEX_PROBE_PATH.read_text(encoding="utf-8"))
        return data if isinstance(data, dict) else {}
    except Exception:
        return {}


def write_codex_probe_result(result: dict) -> None:
    runtime_atomic_write_json(CODEX_PROBE_PATH, result)


def codex_model_label(model: object) -> str:
    return normalize_codex_model(model)


def codex_actual_model_from_text(text: object) -> str:
    source = str(text or "")
    match = re.search(r"(?im)^\s*model:\s*([^\r\n]+)\s*$", source)
    return match.group(1).strip() if match else ""


def codex_log_path_from_text(text: object) -> str:
    source = str(text or "")
    match = re.search(r"完整日志：\s*([^\r\n]+)", source)
    return match.group(1).strip() if match else str(RUNTIME_DIR / "last-codex-error.txt")


def codex_failure_details(summary: str, timed_out: bool = False, exit_code: object = None) -> dict:
    lower = str(summary or "").lower()
    actual_model = codex_actual_model_from_text(summary)
    if timed_out:
        return {
            "failureType": "timeout",
            "failureTitle": "Codex 生成超时",
            "failureAdvice": "长正文或长上下文容易超时。建议先压缩上下文，或改成一次只写一章再重试。",
            "actualModel": actual_model,
        }
    if str(exit_code) in {"3221225786", "-1073741510"}:
        return {
            "failureType": "process_interrupted",
            "failureTitle": "Codex 子进程被中断",
            "failureAdvice": "常见原因是长任务流式连接断开或上下文过重。建议压缩上下文后重试。",
            "actualModel": actual_model,
        }
    if "not supported" in lower and "model" in lower:
        model_text = actual_model or "当前 Codex 默认模型"
        return {
            "failureType": "model_not_supported",
            "failureTitle": "当前账号不支持该 Codex 模型",
            "failureAdvice": f"{model_text} 对当前账号不可用。请改用指定模型，或在 Codex Profile 里配置一个可用模型后再做真实连通测试。",
            "actualModel": actual_model,
        }
    if "model" in lower and ("not found" in lower or "unavailable" in lower or "unsupported" in lower):
        return {
            "failureType": "model_unavailable",
            "failureTitle": "当前 Codex 模型不可用",
            "failureAdvice": "请在 AI 接口里改用指定模型，或使用一个已配置好的 Codex Profile。",
            "actualModel": actual_model,
        }
    if "stream disconnected" in lower or "reconnecting" in lower:
        return {
            "failureType": "stream_disconnected",
            "failureTitle": "Codex 流式连接反复断开",
            "failureAdvice": "可以直接重试；如果连续失败，建议先压缩上下文或改成一次只写一章。",
            "actualModel": actual_model,
        }
    if "context" in lower or "too large" in lower or "token" in lower:
        return {
            "failureType": "context_too_large",
            "failureTitle": "发送上下文可能过大",
            "failureAdvice": "建议压缩项目大纲、小说记忆卡、AI资料库或章节方向，再重新生成。",
            "actualModel": actual_model,
        }
    if "rate limit" in lower:
        return {
            "failureType": "rate_limited",
            "failureTitle": "当前模型或账号触发限流",
            "failureAdvice": "请稍后重试，或切换到其他可用模型方案。",
            "actualModel": actual_model,
        }
    return {
        "failureType": "codex_failed",
        "failureTitle": "Codex 子进程返回失败",
        "failureAdvice": "请查看完整日志；如果是连续失败，建议先做真实连通测试并确认模型可用。",
        "actualModel": actual_model,
    }


def codex_failure_summary_message(details: dict) -> str:
    title = str(details.get("failureTitle") or "Codex 生成失败")
    advice = str(details.get("failureAdvice") or "").strip()
    model = str(details.get("actualModel") or "").strip()
    parts = [title]
    if model:
        parts.append(f"实际模型：{model}")
    if advice:
        parts.append(f"建议：{advice}")
    return "；".join(parts)


def codex_install_status(command: object = None) -> dict:
    codex = resolve_codex(command)
    if not codex:
        return {
            "available": False,
            "installed": False,
            "versionOk": False,
            "generationReady": False,
            "statusLevel": "missing",
            "error": "没有找到 Codex。请在“Codex 命令/路径”里填 codex.exe 的完整路径，或重新安装 Codex。",
        }
    try:
        result = subprocess.run(
            [codex, "--version"],
            capture_output=True,
            text=True,
            encoding="utf-8",
            errors="replace",
            timeout=10,
        )
    except Exception as exc:
        return {
            "available": False,
            "installed": True,
            "versionOk": False,
            "generationReady": False,
            "statusLevel": "version-failed",
            "path": codex,
            "error": str(exc),
        }
    version_text = (result.stdout or result.stderr).strip()
    return {
        "available": result.returncode == 0,
        "installed": True,
        "versionOk": result.returncode == 0,
        "generationReady": False,
        "statusLevel": "installed" if result.returncode == 0 else "version-failed",
        "path": codex,
        "version": version_text,
        "error": "" if result.returncode == 0 else version_text,
    }


def codex_status(command: object = None, model: object = None, reasoning_effort: object = None, profile: object = None) -> dict:
    status = codex_install_status(command)
    probe = read_codex_probe_result()
    expected_model = normalize_codex_model(model) if model is not None else ""
    expected_reasoning = normalize_codex_reasoning_effort(reasoning_effort) if reasoning_effort is not None else ""
    expected_profile = str(profile or "").strip() if profile is not None else ""
    probe_path = str(probe.get("path") or "")
    status_path = str(status.get("path") or "")
    same_codex = bool(probe_path and status_path and probe_path.lower() == status_path.lower())
    probe_model = str(probe.get("lastProbeModel") or "").strip()
    probe_actual_model = str(probe.get("actualModel") or "").strip()
    probe_reasoning = str(probe.get("lastProbeReasoningEffort") or "").strip()
    probe_profile = str(probe.get("lastProbeProfile") or "").strip()
    same_model = (
        not expected_model
        or probe_model == expected_model
        or probe_actual_model == expected_model
    )
    same_reasoning = not expected_reasoning or probe_reasoning == expected_reasoning
    same_profile = not expected_profile or probe_profile == expected_profile
    if probe and same_codex and same_model and same_reasoning and same_profile:
        status.update({
            "generationReady": bool(probe.get("generationReady")),
            "execReady": bool(probe.get("execReady")),
            "lastProbeAt": probe.get("lastProbeAt") or "",
            "lastProbeModel": probe.get("lastProbeModel") or "",
            "lastProbeReasoningEffort": probe.get("lastProbeReasoningEffort") or "",
            "lastProbeProfile": probe.get("lastProbeProfile") or "",
            "lastProbeError": probe.get("lastProbeError") or "",
            "lastProbeContent": probe.get("lastProbeContent") or "",
            "actualModel": probe.get("actualModel") or "",
            "failureType": probe.get("failureType") or "",
            "failureTitle": probe.get("failureTitle") or "",
            "failureAdvice": probe.get("failureAdvice") or "",
            "lastProbeLogPath": probe.get("lastProbeLogPath") or "",
        })
        if probe.get("generationReady"):
            status["statusLevel"] = "generation-ready"
        elif probe.get("lastProbeAt"):
            status["statusLevel"] = "generation-failed"
            if not (status.get("actualModel") and status.get("failureType") and status.get("failureAdvice")):
                failure_text = str(status.get("lastProbeError") or "")
                log_path = str(status.get("lastProbeLogPath") or codex_log_path_from_text(failure_text))
                if log_path:
                    try:
                        log_file = Path(log_path)
                        if log_file.exists():
                            failure_text = f"{failure_text}\n{log_file.read_text(encoding='utf-8', errors='replace')[-8000:]}"
                    except Exception:
                        pass
                details = codex_failure_details(failure_text)
                status["actualModel"] = status.get("actualModel") or details.get("actualModel") or ""
                status["failureType"] = status.get("failureType") or details.get("failureType") or ""
                status["failureTitle"] = status.get("failureTitle") or details.get("failureTitle") or ""
                status["failureAdvice"] = status.get("failureAdvice") or details.get("failureAdvice") or ""
                status["lastProbeLogPath"] = status.get("lastProbeLogPath") or log_path
    elif probe and same_codex and (expected_model or expected_reasoning or expected_profile):
        status.update({
            "generationReady": False,
            "execReady": False,
            "lastProbeAt": "",
            "lastProbeModel": expected_model,
            "lastProbeReasoningEffort": expected_reasoning,
            "lastProbeProfile": expected_profile,
            "lastProbeError": "",
            "lastProbeContent": "",
            "actualModel": "",
            "failureType": "",
            "failureTitle": "",
            "failureAdvice": "",
            "lastProbeLogPath": "",
        })
    return status


def codex_probe_status(payload: dict) -> dict:
    command = payload.get("codexCommand")
    model = normalize_codex_model(payload.get("model"))
    reasoning_effort = normalize_codex_reasoning_effort(payload.get("reasoningEffort"))
    profile = payload.get("codexProfile")
    install = codex_install_status(command)
    now_text = time.strftime("%Y-%m-%d %H:%M:%S")
    base = {
        **install,
        "execReady": False,
        "generationReady": False,
        "lastProbeAt": now_text,
        "lastProbeModel": codex_model_label(model),
        "lastProbeReasoningEffort": reasoning_effort,
        "lastProbeProfile": str(profile or "").strip(),
        "lastProbeError": "",
        "lastProbeContent": "",
        "actualModel": "",
        "failureType": "",
        "failureTitle": "",
        "failureAdvice": "",
        "lastProbeLogPath": str(RUNTIME_DIR / "last-codex-error.txt"),
    }
    if not install.get("available"):
        base["lastProbeError"] = install.get("error") or "Codex 安装检测未通过。"
        write_codex_probe_result(base)
        return base
    try:
        result = call_codex(
            prompt="这是一次来自小说控制台的真实连通测试。请只回复：接口连接成功",
            model=model,
            command=command,
            profile=profile,
            reasoning_effort=reasoning_effort,
            task="test",
            task_label="codex-probe",
            smart_settings=False,
            max_tokens=128,
        )
        content = str(result.get("content") or "").strip()
        raw = result.get("raw") if isinstance(result, dict) else {}
        raw_text = ""
        if isinstance(raw, dict):
            raw_text = f"{raw.get('stderr') or ''}\n{raw.get('stdout') or ''}"
        actual_model = codex_actual_model_from_text(raw_text) or model
        base.update({
            "execReady": True,
            "generationReady": bool(content),
            "statusLevel": "generation-ready" if content else "generation-failed",
            "lastProbeContent": content[:500],
            "lastProbeError": "" if content else "Codex 执行成功，但没有返回可用内容。",
            "actualModel": actual_model,
            "failureType": "" if content else "empty_response",
            "failureTitle": "" if content else "Codex 没有返回可用内容",
            "failureAdvice": "" if content else "请直接重试；如果连续出现，请检查 Codex 登录状态和模型方案。",
        })
    except Exception as exc:
        details = codex_failure_details(str(exc))
        base.update({
            "execReady": True,
            "generationReady": False,
            "statusLevel": "generation-failed",
            "lastProbeError": str(exc),
            "actualModel": details.get("actualModel") or "",
            "failureType": details.get("failureType") or "codex_failed",
            "failureTitle": details.get("failureTitle") or "Codex 真实连通测试失败",
            "failureAdvice": details.get("failureAdvice") or "请查看完整日志后调整模型方案。",
            "lastProbeLogPath": codex_log_path_from_text(str(exc)),
        })
    write_codex_probe_result(base)
    return base


CODEX_TASK_TIMEOUT_SECONDS = {
    "test": 180,
    "outline": 600,
    "analysis": 600,
    "planning": 600,
    "quick": 900,
    "polish": 600,
    "manuscript": 600,
    "release": 420,
    "feedback": 420,
    "recovery": 600,
    "ending": 720,
    "quality": 720,
}

def intish(value: object, fallback: int = 0) -> int:
    try:
        return int(float(str(value)))
    except Exception:
        return fallback


def codex_timeout_for_task(task: str, max_tokens: object) -> int:
    timeout = CODEX_TASK_TIMEOUT_SECONDS.get(task, 600)
    if intish(max_tokens) >= 6500:
        timeout = max(timeout, 900)
    return timeout


def http_timeout_for_task(task: str, max_tokens: object) -> int:
    return codex_timeout_for_task(task, max_tokens)


def clip_log_line(line: str, limit: int = 280) -> str:
    text = line.strip()
    if len(text) <= limit:
        return text
    return text[:limit].rstrip() + " ..."


def compact_codex_log(stdout: str, stderr: str, limit: int = 2400) -> str:
    combined = f"{stderr or ''}\n{stdout or ''}".replace("\r\n", "\n")
    if not combined.strip():
        return ""
    markers = (
        "error",
        "failed",
        "timed out",
        "timeout",
        "forbidden",
        "refused",
        "rate limit",
        "too large",
        "context",
        "token",
        "stream disconnected",
        "reconnecting",
        "falling back",
        "model:",
        "provider:",
        "reasoning effort:",
    )
    lines = []
    skip_user_prompt = False
    for raw_line in combined.split("\n"):
        line = raw_line.strip()
        if not line:
            continue
        lower = line.lower()
        if (
            "codex_core_plugins" in lower
            or "codex_core_skills" in lower
            or "codex_analytics" in lower
            or "shell_snapshot" in lower
            or "openai-developers" in lower
            or "backend-api/plugins" in lower
            or "cloudflare" in lower
            or "challenge-error-text" in lower
        ):
            continue
        if line == "user":
            skip_user_prompt = True
            continue
        if line in {"codex", "tokens used"} or line.startswith("ERROR:"):
            skip_user_prompt = False
        if skip_user_prompt:
            continue
        if any(marker in lower for marker in markers):
            lines.append(clip_log_line(line))
    if not lines:
        lines = [clip_log_line(line) for line in combined.split("\n")[-20:] if line.strip()]
    return "\n".join(lines[-40:])[-limit:]


def codex_failure_hint(summary: str, timed_out: bool = False, exit_code: object = None) -> str:
    details = codex_failure_details(summary, timed_out=timed_out, exit_code=exit_code)
    lower = summary.lower()
    if timed_out:
        return codex_failure_summary_message(details)
    if str(exit_code) in {"3221225786", "-1073741510"}:
        return codex_failure_summary_message(details)
    if "model" in lower and ("not found" in lower or "unavailable" in lower or "not supported" in lower):
        return codex_failure_summary_message(details)
    if "stream disconnected" in lower or "reconnecting" in lower:
        return codex_failure_summary_message(details)
    if "context" in lower or "too large" in lower or "token" in lower:
        return codex_failure_summary_message(details)
    if "rate limit" in lower:
        return codex_failure_summary_message(details)
    return codex_failure_summary_message(details)


def codex_success_blocker(stdout: str, stderr: str, content: str) -> str:
    combined = f"{stdout or ''}\n{stderr or ''}\n{content or ''}".lower()
    text = str(content or "").strip()
    if not text:
        return "Codex 没有返回正文内容。请直接重试；如果连续出现，请先压缩上下文或检查 Codex 登录状态。"
    legacy_skill_patterns = (
        "$novel-writing",
        "novel-writing",
        "没有可用",
        "无法按该技能流程",
        "技能流程生成正文",
        "no available",
        "not available",
        "skill",
    )
    if (
        ("$novel-writing" in text or "novel-writing" in text.lower())
        and any(pattern in text or pattern in text.lower() for pattern in legacy_skill_patterns[2:])
    ):
        return "Codex 返回的是旧版 $novel-writing 技能不可用提示，不是正文。网页端已改为内置写作流程；请刷新页面后重新生成。"
    if "codex ran out of room" in combined or "context window" in combined:
        return "Codex 上下文窗口已满，本次没有得到可靠正文。请先压缩项目大纲、小说记忆卡、AI资料库或改成一次只写一章。"
    if "you are being called from the serial novel control web ui" in text.lower():
        return "Codex 返回了调试包装文本，不是正文。请重新生成；软件已阻止把这类内容保存进正文库。"
    return ""


def write_codex_debug_log(
    prompt: str,
    stdout: str,
    stderr: str,
    args: list[str],
    exit_code: object,
    timeout_seconds: int,
) -> Path:
    runtime_root = ROOT / ".runtime"
    runtime_root.mkdir(exist_ok=True)
    debug_path = runtime_root / "last-codex-error.txt"
    safe_args = ["<codex>" if index == 0 else item for index, item in enumerate(args)]
    debug_path.write_text(
        "\n".join(
            [
                f"time: {time.strftime('%Y-%m-%d %H:%M:%S')}",
                f"exit_code: {exit_code}",
                f"timeout_seconds: {timeout_seconds}",
                f"prompt_chars: {len(prompt)}",
                f"args: {json.dumps(safe_args, ensure_ascii=False)}",
                "",
                "----- stderr -----",
                stderr or "",
                "",
                "----- stdout -----",
                stdout or "",
            ]
        ),
        encoding="utf-8",
        errors="replace",
    )
    return debug_path


def call_codex(
    prompt: str,
    model: str,
    command: object = None,
    profile: object = None,
    reasoning_effort: object = None,
    task: str = "api",
    task_label: str = "api",
    smart_settings: bool = False,
    max_tokens: object = 1600,
) -> dict:
    model = normalize_codex_model(model)
    reasoning_effort = normalize_codex_reasoning_effort(reasoning_effort)
    status = codex_status(command)
    if not status.get("available"):
        raise ValueError(status.get("error") or "Codex is not available.")
    codex = status["path"]
    runtime_root = ROOT / ".runtime"
    runtime_root.mkdir(exist_ok=True)
    with tempfile.TemporaryDirectory(prefix="serial-codex-", dir=runtime_root) as tmp:
        tmp_path = Path(tmp)
        output_path = tmp_path / "last-message.txt"
        escaped_prompt = json.dumps({"prompt": prompt}, ensure_ascii=False)
        ascii_instruction = (
            "You are being called from the Serial Novel Control web UI.\n"
            "The real user request is stored in the JSON object below. Read the prompt field, "
            "follow it exactly, preserve Chinese in the final answer, and return only the useful final answer.\n\n"
            f"{escaped_prompt}\n"
        )
        args = [
            codex,
            "exec",
            "--skip-git-repo-check",
            "--ephemeral",
            "--color",
            "never",
            "--sandbox",
            "read-only",
            "-C",
            str(ROOT),
            "-o",
            str(output_path),
        ]
        args.extend(["-m", model])
        args.extend(["-c", f'model_reasoning_effort="{reasoning_effort}"'])
        profile_name = str(profile or "").strip()
        if profile_name:
            args.extend(["-p", profile_name])
        args.append("-")
        env = os.environ.copy()
        env["PYTHONIOENCODING"] = "utf-8"
        timeout_seconds = codex_timeout_for_task(task, max_tokens)
        try:
            result = subprocess.run(
                args,
                input=ascii_instruction,
                capture_output=True,
                text=True,
                encoding="utf-8",
                errors="replace",
                timeout=timeout_seconds,
                env=env,
            )
        except subprocess.TimeoutExpired as exc:
            stdout = (exc.stdout or "").decode("utf-8", errors="replace") if isinstance(exc.stdout, bytes) else (exc.stdout or "")
            stderr = (exc.stderr or "").decode("utf-8", errors="replace") if isinstance(exc.stderr, bytes) else (exc.stderr or "")
            debug_path = write_codex_debug_log(ascii_instruction, stdout, stderr, args, "timeout", timeout_seconds)
            summary = compact_codex_log(stdout, stderr)
            raise ValueError(
                f"Codex 生成失败：{codex_failure_hint(summary, timed_out=True)}\n\n"
                f"已等待：{timeout_seconds} 秒\n"
                f"完整日志：{debug_path}\n\n"
                f"日志摘要：\n{summary or '无可用摘要'}"
            ) from exc
        content = output_path.read_text(encoding="utf-8", errors="replace") if output_path.exists() else ""
        if result.returncode != 0:
            debug_path = write_codex_debug_log(
                ascii_instruction,
                result.stdout or "",
                result.stderr or "",
                args,
                result.returncode,
                timeout_seconds,
            )
            summary = compact_codex_log(result.stdout or "", result.stderr or "")
            raise ValueError(
                f"Codex 生成失败：{codex_failure_hint(summary, exit_code=result.returncode)}\n\n"
                f"退出码：{result.returncode}\n"
                f"任务：{task_label} ({task})\n"
                f"完整日志：{debug_path}\n\n"
                f"日志摘要：\n{summary or '无可用摘要'}"
            )
        blocker = codex_success_blocker(result.stdout or "", result.stderr or "", content)
        if blocker:
            debug_path = write_codex_debug_log(
                ascii_instruction,
                result.stdout or "",
                result.stderr or "",
                args,
                "blocked-output",
                timeout_seconds,
            )
            summary = compact_codex_log(result.stdout or "", result.stderr or "")
            raise ValueError(
                f"Codex 生成失败：{blocker}\n\n"
                f"任务：{task_label} ({task})\n"
                f"完整日志：{debug_path}\n\n"
                f"日志摘要：\n{summary or '无可用摘要'}"
            )
        return {
            "content": content.strip() or result.stdout.strip(),
            "raw": {
                "provider": "codex",
                "version": status.get("version"),
                "actualModel": codex_actual_model_from_text(f"{result.stderr or ''}\n{result.stdout or ''}") or model,
                "reasoningEffort": reasoning_effort,
                "stdout": result.stdout[-4000:],
                "stderr": result.stderr[-4000:],
            },
        }


def find_port(preferred: int) -> int:
    for port in range(preferred, preferred + 50):
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
            try:
                sock.bind(("127.0.0.1", port))
            except OSError:
                continue
            return port
    raise SystemExit(f"No free port found starting at {preferred}.")


def main() -> int:
    global SERVER_PORT
    parser = argparse.ArgumentParser(description="Serve the Serial Novel web control panel.")
    parser.add_argument("--port", type=int, default=8787)
    parser.add_argument("--open", action="store_true", help="Open the control panel in the default browser.")
    args = parser.parse_args()

    if not (APP_DIR / "index.html").exists():
        raise SystemExit(f"Missing app entry: {APP_DIR / 'index.html'}")

    port = find_port(args.port)
    SERVER_PORT = port
    handler = functools.partial(SerialControlHandler, directory=str(APP_DIR))
    url = f"http://127.0.0.1:{port}/"
    print(f"Serial Novel Control running at {url}", flush=True)
    if args.open:
        webbrowser.open(url)
    with ReusableThreadingTCPServer(("127.0.0.1", port), handler) as httpd:
        httpd.serve_forever()


if __name__ == "__main__":
    raise SystemExit(main())

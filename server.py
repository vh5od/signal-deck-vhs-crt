import argparse
import json
import mimetypes
import pathlib
import re
import shutil
import subprocess
import sys
import threading
import time
import webbrowser
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import parse_qs, unquote, urlparse


ROOT = pathlib.Path(__file__).resolve().parent
STATIC = ROOT / "static"
SETTINGS = ROOT / "settings.json"
DEFAULT_SOURCE = ROOT.parent / "old-digital-camera.mp4"
SOURCE_POINTER = ROOT / "source.json"
UPLOADS = ROOT / "uploads"
OUTPUT = ROOT.parent / "old-digital-camera-vhs-crt-ui.mp4"
PORT = 8765
ALLOWED_VIDEO_SUFFIXES = {".mp4", ".mov", ".m4v", ".webm", ".mkv"}
MAX_UPLOAD_BYTES = 8 * 1024 * 1024 * 1024

state_lock = threading.Lock()
state = {
    "status": "idle",
    "progress": 0,
    "message": "Ready",
    "output": OUTPUT.name if OUTPUT.exists() else None,
}


def update_state(**changes):
    with state_lock:
        state.update(changes)


def ffmpeg_path():
    bundled = ROOT / "bin" / "ffmpeg"
    if bundled.exists():
        return str(bundled)
    system = shutil.which("ffmpeg")
    if system:
        return system
    try:
        import imageio_ffmpeg

        return imageio_ffmpeg.get_ffmpeg_exe()
    except ImportError:
        return "ffmpeg"


def current_source():
    if SOURCE_POINTER.exists():
        try:
            payload = json.loads(SOURCE_POINTER.read_text())
            path = ROOT / payload["path"]
            if path.exists():
                return path, payload.get("name", path.name)
        except (KeyError, ValueError, OSError):
            pass
    return DEFAULT_SOURCE, DEFAULT_SOURCE.name


def probe_duration(path):
    try:
        result = subprocess.run(
            [ffmpeg_path(), "-hide_banner", "-i", str(path)],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.PIPE,
            text=True,
            timeout=20,
        )
        match = re.search(r"Duration: (\d+):(\d+):(\d+(?:\.\d+)?)", result.stderr)
        if match:
            hours, minutes, seconds = match.groups()
            return int(hours) * 3600 + int(minutes) * 60 + float(seconds)
    except (OSError, subprocess.SubprocessError):
        pass
    return 0


def source_payload():
    path, name = current_source()
    return {
        "name": name,
        "size": path.stat().st_size,
        "duration": probe_duration(path),
    }


def render_job(settings, source, duration):
    SETTINGS.write_text(json.dumps(settings, ensure_ascii=False, indent=2) + "\n")
    update_state(status="rendering", progress=0, message="Preparing signal chain")
    command = [
        sys.executable,
        str(ROOT / "render_engine.py"),
        "--config",
        str(SETTINGS),
        "--output",
        str(OUTPUT),
        "--source",
        str(source),
    ]
    try:
        process = subprocess.Popen(
            command,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            bufsize=1,
        )
        assert process.stdout is not None
        for line in process.stdout:
            key, _, value = line.strip().partition("=")
            if key in {"out_time_us", "out_time_ms"} and value.isdigit():
                raw = float(value)
                seconds = raw / 1_000_000
                progress = min(99, round(seconds / duration * 100)) if duration else 0
                update_state(progress=progress, message=f"Rendering frame signal · {progress}%")
        stderr = process.stderr.read() if process.stderr else ""
        code = process.wait()
        if code:
            detail = stderr.strip().splitlines()[-1] if stderr.strip() else "Render failed"
            update_state(status="error", message=detail, progress=0)
            return
        update_state(
            status="complete",
            progress=100,
            message="Render complete",
            output=OUTPUT.name,
            cache_bust=int(time.time()),
        )
    except Exception as exc:
        update_state(status="error", message=str(exc), progress=0)


class Handler(BaseHTTPRequestHandler):
    server_version = "SignalDeck/1.0"

    def log_message(self, format, *args):
        return

    def send_json(self, payload, status=200):
        data = json.dumps(payload, ensure_ascii=False).encode()
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def read_json(self):
        length = int(self.headers.get("Content-Length", "0"))
        return json.loads(self.rfile.read(length) or b"{}")

    def serve_file(self, path, content_type=None):
        if not path.exists() or not path.is_file():
            self.send_error(404)
            return
        size = path.stat().st_size
        start, end = 0, size - 1
        range_header = self.headers.get("Range")
        if range_header:
            match = re.match(r"bytes=(\d*)-(\d*)", range_header)
            if match:
                if match.group(1):
                    start = int(match.group(1))
                if match.group(2):
                    end = int(match.group(2))
                end = min(end, size - 1)
        length = max(0, end - start + 1)
        self.send_response(206 if range_header else 200)
        self.send_header(
            "Content-Type", content_type or mimetypes.guess_type(path.name)[0] or "application/octet-stream"
        )
        self.send_header("Accept-Ranges", "bytes")
        if path.suffix.lower() in {".html", ".css", ".js", ".json"}:
            self.send_header("Cache-Control", "no-store")
        self.send_header("Content-Length", str(length))
        if range_header:
            self.send_header("Content-Range", f"bytes {start}-{end}/{size}")
        self.end_headers()
        with path.open("rb") as handle:
            handle.seek(start)
            remaining = length
            while remaining:
                chunk = handle.read(min(1024 * 256, remaining))
                if not chunk:
                    break
                try:
                    self.wfile.write(chunk)
                except (BrokenPipeError, ConnectionResetError):
                    break
                remaining -= len(chunk)

    def do_GET(self):
        route = urlparse(self.path).path
        if route == "/api/config":
            self.send_json(json.loads(SETTINGS.read_text()))
            return
        if route == "/api/status":
            with state_lock:
                payload = dict(state)
            self.send_json(payload)
            return
        if route == "/api/source":
            self.send_json(source_payload())
            return
        if route == "/media/source":
            self.serve_file(current_source()[0])
            return
        if route == "/media/output":
            self.serve_file(OUTPUT, "video/mp4")
            return
        if route == "/":
            route = "/index.html"
        candidate = (STATIC / route.lstrip("/")).resolve()
        if STATIC.resolve() not in candidate.parents and candidate != STATIC.resolve():
            self.send_error(403)
            return
        self.serve_file(candidate)

    def do_POST(self):
        parsed = urlparse(self.path)
        route = parsed.path
        if route == "/api/save":
            payload = self.read_json()
            SETTINGS.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n")
            self.send_json({"ok": True})
            return
        if route == "/api/render":
            with state_lock:
                if state["status"] == "rendering":
                    self.send_json({"ok": False, "message": "A render is already running"}, 409)
                    return
            payload = self.read_json()
            source, _ = current_source()
            duration = probe_duration(source)
            threading.Thread(
                target=render_job,
                args=(payload, source, duration),
                daemon=True,
            ).start()
            self.send_json({"ok": True})
            return
        if route == "/api/source":
            with state_lock:
                if state["status"] == "rendering":
                    self.send_json({"ok": False, "message": "请等待当前渲染完成"}, 409)
                    return
            length = int(self.headers.get("Content-Length", "0"))
            if length <= 0 or length > MAX_UPLOAD_BYTES:
                self.send_json({"ok": False, "message": "视频为空或超过 8 GB"}, 413)
                return
            requested_name = unquote(parse_qs(parsed.query).get("filename", ["video.mp4"])[0])
            display_name = pathlib.Path(requested_name).name
            suffix = pathlib.Path(display_name).suffix.lower()
            if suffix not in ALLOWED_VIDEO_SUFFIXES:
                self.send_json({"ok": False, "message": "请选择 MP4、MOV、M4V、WebM 或 MKV 视频"}, 415)
                return
            UPLOADS.mkdir(exist_ok=True)
            target = UPLOADS / f"source{suffix}"
            temporary = UPLOADS / f".uploading{suffix}"
            try:
                remaining = length
                with temporary.open("wb") as handle:
                    while remaining:
                        chunk = self.rfile.read(min(1024 * 1024, remaining))
                        if not chunk:
                            raise OSError("上传中断")
                        handle.write(chunk)
                        remaining -= len(chunk)
                temporary.replace(target)
                SOURCE_POINTER.write_text(json.dumps({
                    "path": str(target.relative_to(ROOT)),
                    "name": display_name,
                }, ensure_ascii=False, indent=2) + "\n")
                info = source_payload()
                update_state(status="idle", progress=0, message="Source video replaced", output=None)
                self.send_json({"ok": True, **info})
            except Exception as exc:
                temporary.unlink(missing_ok=True)
                self.send_json({"ok": False, "message": str(exc)}, 500)
            return
        self.send_error(404)


def main():
    parser = argparse.ArgumentParser(description="Signal Deck local UI")
    parser.add_argument("--no-open", action="store_true")
    parser.add_argument("--port", type=int, default=PORT)
    args = parser.parse_args()
    server = ThreadingHTTPServer(("127.0.0.1", args.port), Handler)
    url = f"http://127.0.0.1:{args.port}"
    print(f"Signal Deck running at {url}")
    if not args.no_open:
        threading.Timer(0.5, lambda: webbrowser.open(url)).start()
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass


if __name__ == "__main__":
    main()

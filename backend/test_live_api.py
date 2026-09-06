import sys
import urllib.request
import json
import time

if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

payload = {
    "transcript": "మూడు రోజుల నుండి తీవ్రమైన జ్వరం మరియు చలి ఉంది",
    "language_code": "te",
    "synthesize_audio": False
}

t0 = time.perf_counter()
req = urllib.request.Request(
    "http://127.0.0.1:8000/api/v1/ai/chat-intake",
    data=json.dumps(payload).encode("utf-8"),
    headers={"Content-Type": "application/json"}
)

with urllib.request.urlopen(req) as resp:
    data = json.loads(resp.read().decode("utf-8"))
    elapsed_ms = (time.perf_counter() - t0) * 1000

print(f"Status Code: {resp.status} (Completed in {elapsed_ms:.1f}ms)")
print(f"Spoken Response: {data.get('spoken_response')}")
print(f"Red Flag Triggered: {data.get('red_flag_triggered')}")
print(f"Quick Replies: {data.get('quick_replies')}")
print(f"Clinical State SOCRATES:\n{json.dumps(data.get('clinical_state', {}).get('socrates', {}), indent=2, ensure_ascii=False)}")

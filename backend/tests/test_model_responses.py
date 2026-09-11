import asyncio
import os
import sys
import json
import pytest
from dotenv import load_dotenv

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

load_dotenv()

from groq import AsyncGroq

@pytest.mark.asyncio
async def test_prompts():
    client = AsyncGroq(api_key=os.getenv("GROQ_API_KEY"), max_retries=0)
    models = ["groq/compound-mini", "qwen/qwen3.6-27b", "openai/gpt-oss-20b"]
    
    test_queries = [
        "क्या मैं इसके लिए पैराासिटमॉल मेडिसन खा सकता हूँ दर्द कम करने के लिए",
        "तुम्हारा नाम क्या है",
        "मुझे 3 दिन से पेट में जलन हो रही है"
    ]
    
    for q in test_queries:
        print(f"\n====================\nPATIENT QUERY: {q}\n====================")
        for m in models:
            try:
                resp = await client.chat.completions.create(
                    model=m,
                    messages=[
                        {
                            "role": "system",
                            "content": (
                                'You are "Aarogya Mitra", a compassionate, highly skilled AI Clinical Intake Assistant at an Indian hospital smart kiosk. '
                                'Always conversational, empathetic, and direct. If the patient asks ANY question (e.g. about medications, who you are, what to do), '
                                'FIRST directly answer their question warmly in their language with proper clinical safety guidance, then ask the next relevant symptom question. '
                                'Output strictly valid JSON: {"extraction": {"chief_complaint": "..."}, "spoken_response": "...", "quick_replies": ["..."]}'
                            )
                        },
                        {"role": "user", "content": f'Patient said: "{q}"'}
                    ],
                    max_tokens=300
                )
                print(f"[{m}] Response:\n{resp.choices[0].message.content}\n")
                break
            except Exception as e:
                print(f"[{m}] Failed: {e}")

if __name__ == "__main__":
    asyncio.run(test_prompts())

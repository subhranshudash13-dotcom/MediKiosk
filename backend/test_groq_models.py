from groq import Groq

client = Groq(api_key="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", max_retries=0)
for m in ["qwen/qwen3.8-27b", "openai/gpt-oss-20b", "qwen/qwen3.6-27b", "openai/gpt-oss-120b"]:
    try:
        r = client.chat.completions.create(
            model=m,
            messages=[{"role": "user", "content": 'Return JSON: {"message": "hello"}'}],
            max_tokens=30,
            response_format={"type": "json_object"}
        )
        print(f"{m} SUCCESS: {r.choices[0].message.content}")
    except Exception as e:
        print(f"{m} ERROR: {e}")

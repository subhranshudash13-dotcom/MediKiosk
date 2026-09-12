import os
import time
import httpx
import base64
import json
from dotenv import load_dotenv

load_dotenv('.env')
groq_key = os.getenv('GROQ_API_KEY', '')

img_path = r'C:/Users/Hp/.gemini/antigravity-ide/brain/03bb6c1b-96d1-4135-880a-853f0c4eee4d/.user_uploaded/media_1789163080883.png'
with open(img_path, 'rb') as f:
    b64 = base64.b64encode(f.read()).decode('utf-8')

prompt = (
    "Extract all details from this doctor prescription image. "
    "Return valid JSON with keys: "
    "facility_name, doctor_name, date, patient_name, age, sex, "
    "complaints (list of strings), "
    "vitals (object with bp, hr, spo2, temp, dehydration), "
    "medications (list of objects with name, dosage, frequency, quantity, instructions), "
    "diagnoses (list of strings)."
)

r = httpx.post(
    'https://api.groq.com/openai/v1/chat/completions',
    headers={'Authorization': f'Bearer {groq_key}'},
    json={
        'model': 'qwen/qwen3.8-27b',
        'messages': [
            {
                'role': 'user',
                'content': [
                    {'type': 'text', 'text': prompt},
                    {'type': 'image_url', 'image_url': {'url': f'data:image/png;base64,{b64}'}}
                ]
            }
        ],
        'max_tokens': 550,
        'temperature': 0.1
    },
    timeout=30.0
)

print('status:', r.status_code)
if r.status_code == 200:
    content = r.json()['choices'][0]['message']['content']
    print('OUTPUT:\n', content)
else:
    print('err:', r.text)

import asyncio
import sys
import os

# Set UTF-8 encoding for stdout on Windows
if sys.platform == "win32":
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

sys.path.append(os.path.join(os.path.dirname(__file__)))

from app.services.ai.orchestrator import ai_orchestrator

async def run_scenario():
    session_id = "test-scenario-session-1"
    ai_orchestrator.reset_session(session_id)

    turns = [
        ("Hey, what's your name?", "en"),
        ("Tumára nám kjá er?", "bn"),
        ("How can you help me out today?", "en"),
        ("I am having stomach pain since the last two days.", "en"),
        ("I would give it a five.", "en"),
        ("You didn't even take all the details. Please ask more questions and be more specific.", "en"),
        ("The pain is in my upper abdomen and feels like burning especially after eating spicy food.", "en"),
        ("I don't have any fever or vomiting, but I feel mild nausea.", "en"),
        ("No past medical illness, and I am not taking any regular tablets.", "en")
    ]

    print("================ STARTING FULL DIALOGUE SCENARIO TEST ================\n")

    for i, (user_text, lang) in enumerate(turns, 1):
        print(f"\n--- Turn {i} ({lang}) ---")
        print(f"🗣️ Patient: \"{user_text}\"")
        resp = await ai_orchestrator.process_text_turn(
            transcript=user_text,
            session_id=session_id,
            language_code=lang,
            synthesize_audio=False
        )
        print(f"🤖 Aarogya Mitra: \"{resp.spoken_response}\"")
        print(f"   Quick Replies: {resp.quick_replies}")
        print(f"   Intake Complete: {resp.is_intake_complete}")
        print(f"   SOCRATES: {resp.clinical_state.socrates.model_dump(exclude_none=True)}")
        print(f"   Associated Symptoms: {resp.clinical_state.associated_symptoms}")

    print("\n================ SCENARIO TEST FINISHED SUCCESSFULLY ================")

if __name__ == "__main__":
    asyncio.run(run_scenario())

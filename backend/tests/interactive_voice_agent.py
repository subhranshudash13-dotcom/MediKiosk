"""
Interactive CLI Runner for MediKiosk Clinical Voice Agent
Run: python -m tests.interactive_voice_agent (from backend/ directory)
"""

import asyncio
import sys
import os

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.services.ai.orchestrator import ai_orchestrator
from app.services.ai.safety_guardrails import safety_guardrails


async def main():
    print("=" * 70)
    print("🏥 MediKiosk AI Clinical Voice Agent — Interactive Evaluation CLI")
    print("Zero-Cost · Zero-Hallucination · Dynamic SOCRATES Triage")
    print("=" * 70)
    print("Languages supported: Hindi (hi), Telugu (te), Indian English (en), Hinglish")
    print("Type your complaint in any language. Type 'exit' or 'quit' to end.")
    print("Type 'reset' to start a new patient session.")
    print("-" * 70)

    lang_choice = input("Select Language [hi/te/en/hinglish] (Default: hi): ").strip() or "hi"
    session_id = "interactive_cli_patient"

    while True:
        print("\n" + "-" * 70)
        user_speech = input("🗣️  Patient Speaks: ").strip()

        if not user_speech:
            continue
        if user_speech.lower() in ["exit", "quit"]:
            print("👋 Exiting voice agent evaluation.")
            break
        if user_speech.lower() == "reset":
            ai_orchestrator.reset_session(session_id)
            print("🔄 Session reset for new patient.")
            continue

        print("🤖 Processing voice intake turn...")
        result = await ai_orchestrator.process_text_turn(
            transcript=user_speech,
            session_id=session_id,
            language_code=lang_choice,
            synthesize_audio=True
        )

        state = result.clinical_state
        completeness = safety_guardrails.calculate_socrates_completeness(state.socrates)

        print("\n📢 Agent Spoken Response:")
        print(f"   \"{result.spoken_response}\"")

        if result.quick_replies:
            print(f"💡 Suggested Quick Options: {result.quick_replies}")

        if result.red_flag_triggered:
            print("🚨 [CRITICAL ALERT] Emergency Red Flag Triggered!")
            for rf in state.red_flags:
                print(f"   - Type: {rf.flag_type} | Action: {rf.recommended_action}")

        print("\n📋 Live Structured Clinical State:")
        print(f"   • Chief Complaints : {state.chief_complaints}")
        print(f"   • Site             : {state.socrates.site or 'null (not stated)'}")
        print(f"   • Onset            : {state.socrates.onset or 'null (not stated)'}")
        print(f"   • Character        : {state.socrates.character or 'null (not stated)'}")
        print(f"   • Radiation        : {state.socrates.radiation or 'null (not stated)'}")
        print(f"   • Duration (Days)  : {state.socrates.duration_days if state.socrates.duration_days is not None else 'null'}")
        print(f"   • Associated Syms  : {state.associated_symptoms or '[]'}")
        print(f"   • Severity (1-10)  : {state.socrates.severity_score if state.socrates.severity_score is not None else 'null'}")
        print(f"   • SOCRATES Progress: {int(completeness * 100)}% Complete")
        print(f"   • Audio Generated  : {'✅ Base64 MP3 Ready' if result.audio_base64 else '❌ None'}")


if __name__ == "__main__":
    asyncio.run(main())

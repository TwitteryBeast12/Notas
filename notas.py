import argparse
import subprocess
import sys
import os
from interpret import ConfigManager


def main():
    parser = argparse.ArgumentParser(description="Notas: Capture & Doc Tool")
    parser.add_argument("action", choices=["rec", "stop", "review", "config"], help="Action to perform")
    parser.add_argument("args", nargs="*", help="Additional arguments")

    args = parser.parse_args()

    config_mgr = ConfigManager()
    config = config_mgr.load()

    if args.action == "rec":
        session_name = args.args[0] if args.args else "session"
        print(f"🎬 Starting capture for session: {session_name}")
        # Export session name so capture_bash.sh can use it
        os.environ["NOTAS_SESSION_NAME"] = session_name
        cmd = (
            "powershell.exe -File capture.ps1 -Start"
            if os.name == "nt"
            else "source ~/.notas/capture_bash.sh"
        )
        subprocess.run(cmd, shell=True, executable="/bin/bash" if os.name != "nt" else None)

    elif args.action == "stop":
        session_name = args.args[0] if args.args else "session"

        # 1. Stop the capture
        print(f"⏹️  Stopping capture for session: {session_name}")
        cmd = (
            "powershell.exe -File capture.ps1 -Stop"
            if os.name == "nt"
            else "source ~/.notas/capture_bash.sh && stop_notas_capture"
        )
        subprocess.run(cmd, shell=True, executable="/bin/bash" if os.name != "nt" else None)

        # 2. Feed the recording into the AI provider for analysis
        from interpret import NotasInterpreter, OllamaProvider, OpenAIProvider

        provider_type = config.get("provider", "ollama")
        if provider_type == "ollama":
            provider = OllamaProvider(config.get("ollama", {}))
            print(f"🧠 Analyzing session with Ollama (model: {provider.model})...")
        else:
            provider = OpenAIProvider(config.get("openai", {}))
            print(f"🧠 Analyzing session with OpenAI (model: {provider.model})...")

        interpreter = NotasInterpreter(session_id=session_name)

        # Verify session log exists before calling the LLM
        if not os.path.exists(interpreter.txt_path):
            print(f"❌ No session log found at: {interpreter.txt_path}")
            print("   Make sure you ran 'notas rec' first and commands were captured.")
            sys.exit(1)

        try:
            draft_path = interpreter.generate_draft(provider, template_type="runbook")
            print(f"✅ Draft generated and saved to: {draft_path}")
            print(f"   Run 'notas review' to inspect and edit the draft.")
        except Exception as e:
            print(f"❌ AI analysis failed: {e}")
            print("   Is your provider running? Check 'notas config' for details.")
            sys.exit(1)

    elif args.action == "review":
        ui = config.get("default_ui", "tui")
        if ui == "tui":
            subprocess.run(["python3", "tui.py"])
        else:
            print("Launching Web UI at http://127.0.0.1:8000...")
            subprocess.run(["python3", "app.py"])

    elif args.action == "config":
        print(f"📋 Config located at: {config_mgr.path}")
        print()
        # Pretty-print current config
        import json
        current = config_mgr.load()
        print(json.dumps(current, indent=2))
        print()
        print("Edit this file directly, or use the Web UI to configure.")


if __name__ == "__main__":
    main()

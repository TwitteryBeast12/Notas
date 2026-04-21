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
        # Call capture logic (usually via ps1 or bash script)
        cmd = "powershell.exe -File capture.ps1 -Start" if os.name == 'nt' else "./capture_bash.sh start"
        subprocess.run(cmd, shell=True)

    elif args.action == "stop":
        cmd = "powershell.exe -File capture.ps1 -Stop" if os.name == 'nt' else "./capture_bash.sh stop"
        subprocess.run(cmd, shell=True)

    elif args.action == "review":
        ui = config.get("default_ui", "tui")
        if ui == "tui":
            subprocess.run(["python3", "tui.py"])
        else:
            print("Launching Web UI at http://127.0.0.1:8000...")
            subprocess.run(["python3", "app.py"])

    elif args.action == "config":
        print(f"Config located at: {config_mgr.path}")
        # Could add simple key-value editing here


if __name__ == "__main__":
    main()

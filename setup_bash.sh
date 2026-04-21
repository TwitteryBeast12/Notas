#!/bin/bash
## Notas Quick-Capture Setup
## Run this once to add the 'notas' command to your bash profile.

BASHRC="$HOME/.bashrc"

## The capture function
CAPTURE_FUNC='
notas() {
  case "$1" in
    "rec")
      echo "Notas: Starting recording session..."
      # Start capture in a subshell to handle the "script" command wrapper
      export NOTAS_SESSION_NAME="${2:-session}"
      /bin/bash -c "source ~/.notas/capture_bash.sh"
      ;;
    "tui")
      echo "Notas: Opening Review TUI..."
      # Assumes tui.py is in the path or absolute
      python3 ~/.notas/tui.py
      ;;
    *)
      echo "Usage: notas {rec [name] | tui}"
      ;;
  esac
}
'

## Add to bashrc if not already present
if ! grep -q "notas()" "$BASHRC"; then
  echo "$CAPTURE_FUNC" >> "$BASHRC"
  echo "Notas aliases added to $BASHRC. Please run 'source ~/.bashrc' or restart shell."
else
  echo "Notas aliases already exist in $BASHRC."
fi

#!/bin/bash
## Notas Quick-Capture Setup
## Adds 'notas rec' / 'notas review' shell helpers to your bash profile.

BASHRC="$HOME/.bashrc"

CAPTURE_FUNC='
notas() {
  case "$1" in
    "rec")
      echo "Notas: Starting recording session..."
      notas rec "${2:-session}"
      ;;
    "tui"|"review")
      echo "Notas: Opening Review TUI..."
      notas review
      ;;
    *)
      echo "Usage: notas {rec [name] | review|tui}"
      ;;
  esac
}
'

if ! grep -q "notas()" "$BASHRC"; then
  echo "$CAPTURE_FUNC" >> "$BASHRC"
  echo "Notas aliases added to $BASHRC. Please run 'source ~/.bashrc' or restart shell."
else
  echo "Notas aliases already exist in $BASHRC."
fi

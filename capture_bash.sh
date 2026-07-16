#!/bin/bash
# Notas Bash Capture — fixed
# Purpose: capture bash session activity for AI documentation.
# Loaded by `notas rec` via `source ~/.notas/capture_bash.sh` in the USER's
# current shell (NOT a child subshell). Designed to survive `cd`, interactive
# commands, and TTY changes.

NOTAS_LOG_DIR="${NOTAS_LOG_DIR:-$HOME/.notas/sessions}"
NOTAS_LOCK_FILE="$HOME/.notas/active_session.json"
mkdir -p "$NOTAS_LOG_DIR"

# --- logging function (defined FIRST so it always exists when PROMPT_COMMAND fires) ---
log_last_command() {
    if [ "$NOTAS_SESSION_ACTIVE" != "true" ]; then
        return
    fi
    # Last command from history (strip leading index). Falls back to the
    # just-run command captured via the DEBUG trap if history is unavailable.
    local last_cmd
    last_cmd=$(history 1 2>/dev/null | sed 's/^[ ]*[0-9]*[ ]*//')
    [ -z "$last_cmd" ] && last_cmd="$NOTAS_LAST_CMD"

    # Redact obvious secrets.
    local scrubbed
    scrubbed=$(printf '%s' "$last_cmd" | sed -E 's/(password|secret|key|token|auth)=[^ ]+/\1=[REDACTED]/gI')

    local ts
    ts=$(date +"%Y-%m-%d %H:%M:%S")
    local json_log="$NOTAS_LOG_DIR/session_${NOTAS_CURRENT_SESSION}.json"
    printf '{"timestamp": "%s", "command": "%s"}\n' "$ts" "$scrubbed" >> "$json_log"
}

# DEBUG trap captures the command BEFORE it runs (more reliable than history 1).
notas_debug_trap() {
    [ "$NOTAS_SESSION_ACTIVE" = "true" ] && NOTAS_LAST_CMD="$BASH_COMMAND"
}
trap 'notas_debug_trap' DEBUG

start_notas_capture() {
    if [ -f "$NOTAS_LOCK_FILE" ]; then
        echo "Notas is already capturing a session (see $NOTAS_LOCK_FILE). Run 'notas stop' first." >&2
        return 1
    fi
    export NOTAS_SESSION_ACTIVE=true
    export NOTAS_CURRENT_SESSION="${1:-$(date +%Y%m%d_%H%M%S)}"
    export NOTAS_LAST_CMD=""

    # Persist a lock file so `notas stop` can find this session.
    cat > "$NOTAS_LOCK_FILE" <<EOF
{"session_id": "$NOTAS_CURRENT_SESSION", "started_at": "$(date '+%Y-%m-%d %H:%M:%S')", "log_file": "$NOTAS_LOG_DIR/session_${NOTAS_CURRENT_SESSION}.json"}
EOF

    # Prepend our logger to any existing PROMPT_COMMAND (do not clobber user's).
    case ";${PROMPT_COMMAND};" in
        *";log_last_command;"*) ;;
        *) PROMPT_COMMAND="log_last_command${PROMPT_COMMAND:+; $PROMPT_COMMAND}" ;;
    esac

    echo "Notas: Capture started."
    echo "  Session : $NOTAS_CURRENT_SESSION"
    echo "  Log     : $NOTAS_LOG_DIR/session_${NOTAS_CURRENT_SESSION}.json"
    echo "  Run 'notas stop' when finished."
}

stop_notas_capture() {
    if [ "$NOTAS_SESSION_ACTIVE" = "true" ]; then
        # Remove our logger from PROMPT_COMMAND.
        PROMPT_COMMAND="${PROMPT_COMMAND//log_last_command; /}"
        PROMPT_COMMAND="${PROMPT_COMMAND//log_last_command/}"
        unset NOTAS_SESSION_ACTIVE NOTAS_CURRENT_SESSION NOTAS_LAST_CMD
        trap - DEBUG
        [ -f "$NOTAS_LOCK_FILE" ] && rm -f "$NOTAS_LOCK_FILE"
        echo "Notas: Capture stopped."
    else
        echo "Notas: Nothing is recording."
    fi
}

# --- Activation ---
# Only auto-start when explicitly invoked with NOTAS_REC_CALLED=1 (set by
# `notas start`). Plain `source` (e.g. from ~/.bashrc) defines the functions
# but does NOT begin capturing — the user starts a session explicitly.
if [ "${NOTAS_REC_CALLED}" = "1" ]; then
    start_notas_capture "$NOTAS_REC_SESSION"
fi

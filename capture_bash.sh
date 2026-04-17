#!/bin/bash
# Notas Bash Capture Prototype
# Purpose: Securely capture bash session activity for AI documentation.

NOTAS_LOG_DIR="$HOME/.notas/sessions"
mkdir -p "$NOTAS_LOG_DIR"

start_notas_capture() {
    export NOTAS_SESSION_ACTIVE=true
    SESSION_ID=$(date +%Y%m%d_%H%M%S)
    export NOTAS_CURRENT_SESSION="$SESSION_ID"
    
    # Output capture: Use 'script' command to record everything
    # Starts script in background, logs to a file
    SCRIPT_LOG="$NOTAS_LOG_DIR/session_$SESSION_ID.txt"
    script -q $SCRIPT_LOG
}

# To capture commands specifically (since 'script' captures output), 
# we use a custom PROMPT_COMMAND that logs the last executed command.
log_last_command() {
    if [ "$NOTAS_SESSION_ACTIVE" = "true" ]; then
        # Get the last command from history
        LAST_CMD=$(history 1 | sed 's/^[ ]*[0-9]*[ ]*//')
        
        # Security Scrubbing: Redact keys, tokens, etc.
        SCRUBBED_CMD=$(echo "$LAST_CMD" | sed -E 's/(password|secret|key|token|auth)=[^ ]+/\1=[REDACTED]/gI')
        
        TIMESTAMP=$(date +"%Y-%m-%d %H:%M:%S")
        JSON_LOG="$NOTAS_LOG_DIR/session_$NOTAS_CURRENT_SESSION.json"
        
        # Append as JSON line
        echo "{\"timestamp\": \"$TIMESTAMP\", \"command\": \"$SCRUBBED_CMD\"}" >> "$JSON_LOG"
    fi
}

# Set the PROMPT_COMMAND to run our logger after every command
export PROMPT_COMMAND="log_last_command; $PROMPT_COMMAND"

# Provide a way to stop (since 'script' starts a new shell, 
# the user just needs to 'exit' or we can provide a stop function)
stop_notas_capture() {
    unset NOTAS_SESSION_ACTIVE
    unset NOTAS_CURRENT_SESSION
    echo "Notas capture stopped."
}

# If script is run directly, start capture
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    start_notas_capture
fi

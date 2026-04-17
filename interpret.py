import json
import os
import re
from typing import List, Dict

# Noise filters: remove redundant commands that don't change state much
NOISE_COMMANDS = {'ls', 'pwd', 'dir', 'clear', 'cls'}

class NotasInterpreter:
    def __init__(self, session_id: str, base_dir: str = os.path.expanduser("~/.notas/sessions")):
        self.session_id = session_id
        self.base_dir = base_dir
        self.json_path = os.path.join(base_dir, f"session_{session_id}.json")
        self.txt_path = os.path.join(base_dir, f"session_{session_id}.txt")

    def load_session(self) -> List[Dict]:
        commands = []
        if not os.path.exists(self.json_path):
            return []
        
        with open(self.json_path, 'r') as f:
            for line in f:
                try:
                    commands.append(json.loads(line))
                except json.JSONDecodeError:
                    continue
        return commands

    def load_output(self) -> str:
        if not os.path.exists(self.txt_path):
            return ""
        with open(self.txt_path, 'r') as f:
            return f.read()

    def clean_noise(self, commands: List[Dict]) -> List[Dict]:
        """Removes repetitive or useless commands to reduce token burn."""
        cleaned = []
        last_cmd = None
        
        for cmd in commands:
            c = cmd['command'].strip().split(' ')[0].lower()
            if c in NOISE_COMMANDS and c == last_cmd:
                continue
            cleaned.append(cmd)
            last_cmd = c
        return cleaned

    def prepare_prompt(self) -> str:
        cmds = self.clean_noise(self.load_session())
        output = self.load_output()
        
        cmd_sequence = "\n".join([f"[{c['timestamp']}] {c['command']}" for c in cmds])
        
        prompt = f"""
# ROLE: Expert Technical Writer & SRE
# TASK: Transform raw terminal logs into a professional runbook.

## INPUT DATA
### Command Sequence:
{cmd_sequence}

### Raw Output Log:
{output}

## REQUIREMENTS
1. Identify the overarching goal of the session.
2. Group related commands into logical "Steps".
3. For each step:
   - List the command(s) used.
   - Explain the intent (WHY this was done).
   - Describe the expected result based on the raw output.
4. Highlight any errors encountered and how they were resolved.
5. Format as a clean Markdown runbook.

## OUTPUT FORMAT
# [Goal Title]
**Objective:** [Brief description]
**Prerequisites:** [Any tools/env needed]

### Step 1: [Title]
- **Command:** `command`
- **Why:** [Explanation]
- **Result:** [Expected Outcome]

...
"""
        return prompt

    def generate_draft(self, llm_client):
        """
        llm_client should be an object with a .complete(prompt) method.
        """
        prompt = self.prepare_prompt()
        return llm_client.complete(prompt)

# Dummy LLM Client for testing the pipeline
class MockLLM:
    def complete(self, prompt):
        return "### Mock Runbook\n\n**Objective**: Test interpreted logs.\n\n### Step 1: Init\n- **Command**: `ls`\n- **Why**: Check dir\n- **Result**: Success."

if __name__ == "__main__":
    # Example usage
    # interpreter = NotasInterpreter("20260416_201300")
    # print(interpreter.prepare_prompt())
    print("Interpreter logic loaded. Ready for LLM integration.")

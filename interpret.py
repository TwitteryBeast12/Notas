import json
import os
import re
from typing import List, Dict

# Noise filters: remove redundant commands
NOISE_COMMANDS = {'ls', 'pwd', 'dir', 'clear', 'cls'}

class NotasInterpreter:
    def __init__(self, session_id: str, base_dir: str = os.path.expanduser("~/.notas/sessions")):
        self.session_id = session_id
        self.base_dir = base_dir
        self.json_path = os.path.join(base_dir, f"session_{session_id}.json")
        self.txt_path = os.path.join(base_dir, f"session_{session_id}.txt")
        self.drafts_dir = os.path.expanduser("~/.notas/drafts")

    def load_session(self) -> List[Dict]:
        commands = []
        if not os.path.exists(self.json_path): return []
        with open(self.json_path, 'r') as f:
            for line in f:
                try: commands.append(json.loads(line))
                except: continue
        return commands

    def load_output(self) -> str:
        if not os.path.exists(self.txt_path): return ""
        with open(self.txt_path, 'r') as f: return f.read()

    def get_relevant_context(self) -> str:
        """Knowledge Graph: Scan previous drafts for similar keywords."""
        if not os.path.exists(self.drafts_dir): return ""
        
        current_cmds = " ".join([c['command'] for c in self.load_session()]).lower()
        relevant_docs = []
        
        for f in os.listdir(self.drafts_dir):
            if f.endswith(".md"):
                with open(os.path.join(self.drafts_dir, f), 'r') as doc:
                    content = doc.read().lower()
                    # Simple keyword overlap as a proxy for 'relevance'
                    words = set(current_cmds.split())
                    if any(word in content for word in words if len(word) > 4):
                        relevant_docs.append(f"\n--- Past Document ({f}) ---\n{doc.read()}")
        
        return "\n".join(relevant_docs[:2]) # Top 2 relevant docs

    def clean_noise(self, commands: List[Dict]) -> List[Dict]:
        cleaned = []
        last_cmd = None
        for cmd in commands:
            c = cmd['command'].strip().split(' ')[0].lower()
            if c in NOISE_COMMANDS and c == last_cmd: continue
            cleaned.append(cmd)
            last_cmd = c
        return cleaned

    def prepare_prompt(self, template_type="runbook") -> str:
        cmds = self.clean_noise(self.load_session())
        output = self.load_output()
        context = self.get_relevant_context()
        
        # Load template
        template_path = os.path.join(os.path.expanduser("~/.notas/templates"), f"{template_type}.md")
        template_content = ""
        if os.path.exists(template_path):
            with open(template_path, 'r') as f: template_content = f.read()

        cmd_sequence = "\n".join([f"[{c['timestamp']}] {c['command']}" for c in cmds])
        
        prompt = f"""
# ROLE: Expert Technical Writer & SRE
# TASK: Transform raw terminal logs into a professional document.

## CONTEXT (Knowledge Graph)
Use these past documents for style and technical consistency:
{context}

## TEMPLATE TO FOLLOW
{template_content}

## INPUT DATA
### Command Sequence:
{cmd_sequence}

### Raw Output Log:
{output}

## REQUIREMENTS
1. Identify the overarching goal.
2. Group related commands into logical "Steps".
3. Maintain consistency with provided Past Context.
4. Format exactly as per the template.
"""
        return prompt

    def generate_draft(self, llm_client, template_type="runbook"):
        prompt = self.prepare_prompt(template_type)
        return llm_client.complete(prompt)

class MockLLM:
    def complete(self, prompt):
        return "### Knowledge-Aware Draft\n\nBased on past sessions, this follows our standard naming convention...\n\n**Objective**: Verified Task."

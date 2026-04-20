import json
import os
import requests
from typing import List, Dict, Optional
from abc import ABC, abstractmethod

# Noise filters: remove redundant commands
NOISE_COMMANDS = {'ls', 'pwd', 'dir', 'clear', 'cls'}

class LLMProvider(ABC):
    """Base class for all AI providers."""
    @abstractmethod
    def complete(self, prompt: str) -> str:
        pass

class OllamaProvider(LLMProvider):
    def __init__(self, config: Dict):
        self.model = config.get("model", "llama3")
        self.url = config.get("url", "http://localhost:11434").rstrip('/')

    def complete(self, prompt: str) -> str:
        try:
            response = requests.post(
                f"{self.url}/api/generate",
                json={"model": self.model, "prompt": prompt, "stream": False},
                timeout=60
            )
            response.raise_for_status()
            return response.json().get("response", "AI failed to generate content.")
        except Exception as e:
            return f"Ollama Error: {str(e)}"

class OpenAIProvider(LLMProvider):
    def __init__(self, config: Dict):
        self.api_key = config.get("api_key")
        self.model = config.get("model", "gpt-4")

    def complete(self, prompt: str) -> str:
        try:
            headers = {"Authorization": f"Bearer {self.api_key}", "Content-Type": "application/json"}
            data = {
                "model": self.model,
                "messages": [{"role": "user", "content": prompt}]
            }
            response = requests.post("https://api.openai.com/v1/chat/completions", headers=headers, json=data, timeout=60)
            response.raise_for_status()
            return response.json()['choices'][0]['message']['content']
        except Exception as e:
            return f"OpenAI Error: {str(e)}"

class ConfigManager:
    """Securely manages Notas configuration."""
    def __init__(self, config_path: str = os.path.expanduser("~/.notas/config.json")):
        self.path = config_path

    def load(self) -> Dict:
        if not os.path.exists(self.path):
            return self.get_defaults()
        try:
            with open(self.path, 'r') as f:
                return json.load(f)
        except:
            return self.get_defaults()

    def get_defaults(self) -> Dict:
        return {
            "provider": "ollama",
            "default_ui": "tui",
            "ollama": {"url": "http://localhost:11434", "model": "llama3"},
            "openai": {"api_key": "", "model": "gpt-4"},
            "anthropic": {"api_key": "", "model": "claude-3-opus"},
            "github": {"repo": "", "token": ""},
            "notion": {"page_id": "", "token": ""},
        }

    def save(self, config: Dict):
        # Set strict permissions (Read/Write for user only)
        os.makedirs(os.path.dirname(self.path), exist_ok=True)
        with open(self.path, 'w') as f:
            json.dump(config, f, indent=4)
        os.chmod(self.path, 0o600)

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
        if not os.path.exists(self.drafts_dir): return ""
        current_cmds = " ".join([c['command'] for c in self.load_session()]).lower()
        relevant_docs = []
        for f in os.listdir(self.drafts_dir):
            if f.endswith(".md"):
                with open(os.path.join(self.drafts_dir, f), 'r') as doc:
                    content = doc.read().lower()
                    words = set(current_cmds.split())
                    if any(word in content for word in words if len(word) > 4):
                        relevant_docs.append(f"\n--- Past Document ({f}) ---\n{doc.read()}")
        return "\n".join(relevant_docs[:2])

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

    def generate_draft(self, provider: LLMProvider, template_type="runbook"):
        prompt = self.prepare_prompt(template_type)
        draft_content = provider.complete(prompt)
        
        # Auto-save draft to disk for persistence
        os.makedirs(self.drafts_dir, exist_ok=True)
        draft_path = os.path.join(self.drafts_dir, f"session_{self.session_id}_{template_type}.md")
        with open(draft_path, 'w', encoding='utf-8') as f:
            f.write(draft_content)
            
        return draft_content

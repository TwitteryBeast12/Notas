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
        """Send a prompt to the Ollama API and return the response."""
        response = requests.post(
            f"{self.url}/api/generate",
            json={"model": self.model, "prompt": prompt, "stream": False}
        )
        response.raise_for_status()
        return response.json().get("response", "")


class OpenAIProvider(LLMProvider):
    def __init__(self, config: Dict):
        self.api_key = config.get("api_key")
        self.model = config.get("model", "gpt-4")

    def complete(self, prompt: str) -> str:
        """Send a prompt to the OpenAI Chat Completions API."""
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        data = {
            "model": self.model,
            "messages": [{"role": "user", "content": prompt}]
        }
        response = requests.post(
            "https://api.openai.com/v1/chat/completions",
            headers=headers,
            json=data
        )
        response.raise_for_status()
        return response.json()["choices"][0]["message"]["content"]


class ConfigManager:
    """Securely manages Notas configuration."""

    def __init__(self, config_path: str = os.path.expanduser("~/.notas/config.json")):
        self.path = config_path

    def load(self) -> Dict:
        """Load config from disk, returning defaults if missing."""
        if not os.path.exists(self.path):
            return {
                "provider": "ollama",
                "ollama": {"model": "llama3", "url": "http://localhost:11434"},
                "openai": {"api_key": "", "model": "gpt-4"},
                "default_ui": "tui"
            }
        with open(self.path, 'r', encoding='utf-8') as f:
            return json.load(f)

    def save(self, config: Dict):
        """Persist config to disk."""
        os.makedirs(os.path.dirname(self.path), exist_ok=True)
        with open(self.path, 'w', encoding='utf-8') as f:
            json.dump(config, f, indent=2)


class NotasInterpreter:
    def __init__(self, session_id: str, base_dir: str = os.path.expanduser("~/.notas/sessions")):
        self.session_id = session_id
        self.base_dir = base_dir
        self.json_path = os.path.join(base_dir, f"session_{session_id}.json")
        self.txt_path = os.path.join(base_dir, f"session_{session_id}.txt")
        self.drafts_dir = os.path.expanduser("~/.notas/drafts")

    def _load_session_data(self) -> str:
        """Load raw session data from the text log."""
        if os.path.exists(self.txt_path):
            with open(self.txt_path, 'r', encoding='utf-8') as f:
                return f.read()
        return ""

    def _load_past_context(self) -> str:
        """Load previous drafts for style consistency."""
        if not os.path.exists(self.drafts_dir):
            return "No previous documents found."
        drafts = [f for f in os.listdir(self.drafts_dir) if f.endswith(".md")]
        if not drafts:
            return "No previous documents found."
        # Use the most recent draft as context
        latest = sorted(drafts)[-1]
        path = os.path.join(self.drafts_dir, latest)
        with open(path, 'r', encoding='utf-8') as f:
            content = f.read()
        return content[:2000]  # Limit context size

    def _filter_noise(self, commands: List[str]) -> List[str]:
        """Remove noisy/redundant commands."""
        return [cmd for cmd in commands if cmd.strip().split()[0] not in NOISE_COMMANDS]

    def prepare_prompt(self, template_type: str = "runbook") -> str:
        """Build the full LLM prompt from session data and context."""
        raw_log = self._load_session_data()
        past_context = self._load_past_context()

        # Parse commands from the log (lines starting with timestamp)
        lines = raw_log.strip().split("\n")
        commands = [l for l in lines if l.startswith("[")]
        commands = self._filter_noise(commands)
        command_text = "\n".join(commands) if commands else "(no commands captured)"

        prompt = f"""## ROLE: Expert Technical Writer & SRE
## TASK: Transform raw terminal logs into a professional document.

### CONTEXT (Knowledge Graph)
Use these past documents for style and technical consistency:
{past_context}

### TEMPLATE TO FOLLOW
Type: {template_type}

### INPUT DATA
#### Command Sequence:
{command_text}

#### Raw Output Log:
{raw_log[:3000]}

### REQUIREMENTS
- Identify the overarching goal.
- Group related commands into logical "Steps".
- Maintain consistency with provided Past Context.
- Format exactly as per the template.
"""
        return prompt

    def generate_draft(self, provider: LLMProvider, template_type: str = "runbook") -> str:
        """Generate an AI draft and save it to the drafts directory."""
        prompt = self.prepare_prompt(template_type)
        draft_content = provider.complete(prompt)

        # Save draft to disk
        os.makedirs(self.drafts_dir, exist_ok=True)
        draft_filename = f"draft_{self.session_id}.md"
        draft_path = os.path.join(self.drafts_dir, draft_filename)
        with open(draft_path, 'w', encoding='utf-8') as f:
            f.write(draft_content)

        return draft_path

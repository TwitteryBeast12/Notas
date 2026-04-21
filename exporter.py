import os
import base64
import requests
from typing import Optional


class NotasExporter:
    """Handles pushing final runbooks to various documentation platforms."""

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key

    def export_to_github(self, repo: str, path: str, content: str, token: str):
        """Pushes a file to a GitHub repository via the Content API."""
        url = f"https://api.github.com/repos/{repo}/contents/{path}"
        headers = {"Authorization": f"token {token}", "Accept": "application/vnd.github.v3+json"}

        # Check if file exists to get SHA for update
        res = requests.get(url, headers=headers)
        sha = None
        if res.status_code == 200:
            sha = res.json().get("sha")

        # Base64 encoding is required for content in GitHub API
        data = {
            "message": "Upload runbook via Notas",
            "content": base64.b64encode(content.encode('utf-8')).decode('utf-8'),
        }
        if sha:
            data["sha"] = sha

        response = requests.put(url, headers=headers, json=data)
        return response.json()

    def export_to_notion(self, page_id: str, title: str, content: str, token: str):
        """Creates a new page in Notion."""
        url = "https://api.notion.com/v1/pages"
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
            "Notion-Version": "2022-06-28"
        }

        # Simplified Notion API structure: content as a single block for POC
        data = {
            "parent": {"page_id": page_id},
            "properties": {
                "title": {"title": [{"text": {"content": title}}]}
            },
            "children": [
                {
                    "object": "block",
                    "type": "paragraph",
                    "paragraph": {"rich_text": [{"type": "text", "text": {"content": content[:2000]}}]}
                }
            ]
        }
        response = requests.post(url, headers=headers, json=data)
        return response.json()

    def export_local(self, filepath: str, content: str):
        """Saves the runbook to a local file."""
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        with open(filepath, "w") as f:
            f.write(content)
        return {"status": "success", "path": filepath}


if __name__ == "__main__":
    # Simple test script
    exporter = NotasExporter()
    print("Exporter logic loaded. Ready for integration into TUI/WebUI.")

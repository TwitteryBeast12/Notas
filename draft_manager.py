import os
import json
from typing import List, Dict, Optional
from exporter import NotasExporter


class DraftManager:
    """Manages the lifecycle of AI-generated drafts before final export."""

    def __init__(self, drafts_dir: str = os.path.expanduser("~/.notas/drafts")):
        self.drafts_dir = drafts_dir
        self.exporter = NotasExporter()

    def list_drafts(self) -> List[Dict]:
        """Lists all current drafts and their metadata."""
        if not os.path.exists(self.drafts_dir):
            return []
        drafts = []
        for f in os.listdir(self.drafts_dir):
            if f.endswith(".md"):
                drafts.append({
                    "filename": f,
                    "path": os.path.join(self.drafts_dir, f),
                    "size": os.path.getsize(os.path.join(self.drafts_dir, f))
                })
        return drafts

    def read_draft(self, filename: str) -> str:
        """Reads the content of a specific draft."""
        path = os.path.join(self.drafts_dir, filename)
        if not os.path.exists(path):
            return ""
        with open(path, 'r', encoding='utf-8') as f:
            return f.read()

    def update_draft(self, filename: str, content: str):
        """Updates a draft (used after human review/editing)."""
        path = os.path.join(self.drafts_dir, filename)
        with open(path, 'w', encoding='utf-8') as f:
            f.write(content)
        return {"status": "updated", "path": path}

    def promote_to_final(self, filename: str, target: str, config: Dict):
        """Promotes a draft to a final destination (GitHub, Notion, Local)."""
        content = self.read_draft(filename)
        if not content:
            return {"status": "error", "message": "Draft not found"}

        if target == "github":
            return self.exporter.export_to_github(
                repo=config['github_repo'],
                path=f"runbooks/{filename}",
                content=content,
                token=config['github_token']
            )
        elif target == "notion":
            return self.exporter.export_to_notion(
                page_id=config['notion_page_id'],
                title=filename.replace(".md", ""),
                content=content,
                token=config['notion_token']
            )
        elif target == "local":
            final_path = os.path.expanduser(f"~/.notas/final/{filename}")
            return self.exporter.export_local(final_path, content)

        return {"status": "error", "message": "Invalid target"}


if __name__ == "__main__":
    # Quick smoke test
    dm = DraftManager()
    print(f"Drafts found: {len(dm.list_drafts())}")

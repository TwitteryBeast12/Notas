from textual.app import App, ComposeResult
from textual.widgets import Header, Footer, ListView, ListItem, Label, TextArea, Static, Input, Button
from textual.containers import Horizontal, Vertical
from textual.screen import ModalScreen
from draft_manager import DraftManager
import os


class SessionItem(ListItem):
    def __init__(self, filename: str):
        super().__init__()
        self.filename = filename

    def compose(self) -> ComposeResult:
        yield Label(f"Draft: {self.filename}")


class ExportModal(ModalScreen):
    def __init__(self, draft_filename: str, manager: DraftManager):
        super().__init__()
        self.draft_filename = draft_filename
        self.manager = manager

    def compose(self) -> ComposeResult:
        yield Vertical(
            Label("Export To:", id="modal-title"),
            Button("Local Markdown", id="exp-local"),
            Button("GitHub", id="exp-github"),
            Button("Notion", id="exp-notion"),
            Input(placeholder="API Token (if needed)", id="token-input"),
            Button("Cancel", variant="error", id="exp-cancel"),
            id="export-modal"
        )

    def on_button_pressed(self, event: Button.Pressed) -> None:
        btn_id = event.button.id
        token = self.query_one("#token-input", Input).value

        if btn_id == "exp-cancel":
            self.app.pop_screen()
            return

        try:
            # Use DraftManager for promotion
            config = {
                "github_repo": "TwitteryBeast12/Notas",
                "github_token": token,
                "notion_page_id": "parent_page_id",
                "notion_token": token
            }
            target = "local" if btn_id == "exp-local" else ("github" if btn_id == "exp-github" else "notion")
            res = self.manager.promote_to_final(self.draft_filename, target, config)
            if res.get("status") == "error":
                self.app.notify(f"Export failed: {res.get('message')}", severity="error")
            else:
                self.app.notify(f"Successfully exported to {target}")
        except Exception as e:
            self.app.notify(f"Export failed: {str(e)}", severity="error")

        self.app.pop_screen()


class NotasTUI(App):
    TITLE = "Notas - Draft Reviewer"
    BINDINGS = [
        ("q", "quit", "Quit"),
        ("e", "open_export", "Export Draft"),
        ("escape", "show_list", "Back to List"),
    ]

    def compose(self) -> ComposeResult:
        yield Header()
        yield Vertical(
            Vertical(
                Label("Select Draft to Review:", id="list-title"),
                ListView(id="draft-list"),
                id="list-view"
            ),
            Vertical(
                Label("AI Draft (Edit to modify)", id="pane-title"),
                TextArea(id="editor"),
                id="review-view"
            ),
        )
        yield Footer()

    def on_mount(self) -> None:
        self.dm = DraftManager()
        self.current_draft = None

        # Populate draft list
        draft_list = self.query_one("#draft-list", ListView)
        drafts = self.dm.list_drafts()
        for d in drafts:
            draft_list.append(SessionItem(d["filename"]))

        # Hide review view initially
        self.query_one("#review-view").display = False

    def on_list_view_selected(self, event: ListView.Selected) -> None:
        """Handle draft selection from the list."""
        item = event.item
        if isinstance(item, SessionItem):
            filename = item.filename
            self.current_draft = filename
            content = self.dm.read_draft(filename)

            # Show review, hide list
            self.query_one("#list-view").display = False
            self.query_one("#review-view").display = True
            self.query_one("#editor", TextArea).text = content

    def action_show_list(self) -> None:
        """Save current editor content back to draft before leaving."""
        if self.current_draft:
            content = self.query_one("#editor", TextArea).text
            self.dm.update_draft(self.current_draft, content)
            self.current_draft = None

        self.query_one("#review-view").display = False
        self.query_one("#list-view").display = True

    def action_open_export(self) -> None:
        if self.current_draft:
            # Ensure latest edits are saved before promoting
            content = self.query_one("#editor", TextArea).text
            self.dm.update_draft(self.current_draft, content)
            self.push_screen(ExportModal(self.current_draft, self.dm))
        else:
            self.notify("Select a draft first")


if __name__ == "__main__":
    NotasTUI().run()

from textual.app import App, ComposeResult
from textual.widgets import Header, Footer, ListView, ListItem, Label, TextArea, Static, Input, Button
from textual.containers import Horizontal, Vertical, ModalScreen
from interpret import NotasInterpreter, OllamaLLM
from draft_manager import DraftManager
import os

class SessionItem(ListItem):
    def __init__(self, filename: str):
        super().__init__()
        self.filename = filename
        self.label = Label(f"Draft: {filename}")

    def compose(self) -> ComposeResult:
        yield self.label

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

    def on_button_pressed(self, event):
        btn_id = event.button.id
        token = self.query_one("#token-input").value
        
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
        ("esc", "show_list", "Back to List"),
    ]

    def compose(self) -> ComposeResult:
        yield Header()
        self.main_container = Vertical()
        self.main_container.mount(self.create_list_view())
        self.main_container.mount(self.create_review_view(hidden=True))
        self.main_container.mount(Footer())
        yield self.main_container

    def create_list_view(self):
        container = Vertical(id="list-view")
        list_view = ListView()
        
        dm = DraftManager()
        drafts = dm.list_drafts()
        for d in drafts:
            list_view.append(SessionItem(d['filename']))
            
        container.mount(Label("Select Draft to Review:", id="list-title"))
        container.mount(list_view)
        return container

    def create_review_view(self, hidden=True):
        container = Horizontal(id="review-view")
        container.hidden = hidden
        
        edit_pane = Vertical()
        edit_pane.mount(Label("AI Draft (Edit to modify)", id="pane-title"))
        editor = TextArea(id="editor")
        edit_pane.mount(editor)
        
        container.mount(edit_pane)
        return container

    def on_mount(self):
        self.dm = DraftManager()
        self.query_one(ListView).on(self.handle_draft_select)

    def handle_draft_select(self, event):
        filename = event.item.filename
        view = self.query_one("#review-view")
        view.hidden = False
        self.query_one("#list-view").hidden = True
        
        self.current_draft = filename
        content = self.dm.read_draft(filename)
        self.query_one("#editor").load_text(content)

    def action_show_list(self):
        # Save current editor content back to draft before leaving
        if hasattr(self, 'current_draft'):
            content = self.query_one("#editor").text
            self.dm.update_draft(self.current_draft, content)
            
        self.query_one("#review-view").hidden = True
        self.query_one("#list-view").hidden = False

    def action_open_export(self):
        if hasattr(self, 'current_draft'):
            # Ensure latest edits are saved before promoting
            content = self.query_one("#editor").text
            self.dm.update_draft(self.current_draft, content)
            self.push_screen(ExportModal(self.current_draft, self.dm))
        else:
            self.notify("Select a draft first")

if __name__ == "__main__":
    NotasTUI().run()

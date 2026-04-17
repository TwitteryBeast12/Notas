from textual.app import App, ComposeResult
from textual.widgets import Header, Footer, ListView, ListItem, Label, TextArea, Static, Input, Button
from textual.containers import Horizontal, Vertical, ModalScreen
from interpret import NotasInterpreter, OllamaLLM
from exporter import NotasExporter
import os

class SessionItem(ListItem):
    def __init__(self, session_id: str):
        super().__init__()
        self.session_id = session_id
        self.label = Label(f"Session: {session_id}")

    def compose(self) -> ComposeResult:
        yield self.label

class ExportModal(ModalScreen):
    def __init__(self, content: str, session_id: str):
        super().__init__()
        self.content = content
        self.session_id = session_id

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
        exporter = NotasExporter()

        if btn_id == "exp-cancel":
            self.app.pop_screen()
            return

        try:
            if btn_id == "exp-local":
                path = os.path.expanduser(f"~/.notas/drafts/runbook_{self.session_id}.md")
                exporter.export_local(path, self.content)
                self.app.notify(f"Saved to {path}")
            elif btn_id == "exp-github":
                res = exporter.export_to_github("TwitteryBeast12/Notas", f"runbooks/session_{self.session_id}.md", self.content, token)
                self.app.notify("Pushed to GitHub")
            elif btn_id == "exp-notion":
                res = exporter.export_to_notion("parent_page_id", f"Session {self.session_id}", self.content, token)
                self.app.notify("Pushed to Notion")
        except Exception as e:
            self.app.notify(f"Export failed: {str(e)}", severity="error")
        
        self.app.pop_screen()

class NotasTUI(App):
    TITLE = "Notas - TUI Reviewer"
    BINDINGS = [
        ("q", "quit", "Quit"),
        ("e", "open_export", "Export Runbook"),
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
        session_dir = os.path.expanduser("~/.notas/sessions")
        if os.path.exists(session_dir):
            for f in os.listdir(session_dir):
                if f.startswith("session_") and f.endswith(".json"):
                    sid = f.replace("session_", "").replace(".json", "")
                    list_view.append(SessionItem(sid))
        container.mount(Label("Select Session to Review:", id="list-title"))
        container.mount(list_view)
        return container

    def create_review_view(self, hidden=True):
        container = Horizontal(id="review-view")
        container.hidden = hidden
        logs_pane = Vertical()
        logs_pane.mount(Label("Raw Output", id="pane-title"))
        logs_pane.mount(Static("Loading logs...", id="logs-content"))
        edit_pane = Vertical()
        edit_pane.mount(Label("AI Draft", id="pane-title"))
        editor = TextArea(id="editor")
        edit_pane.mount(editor)
        container.mount(logs_pane)
        container.mount(edit_pane)
        return container

    def on_mount(self):
        self.query_one(ListView).on(self.handle_session_select)

    def handle_session_select(self, event):
        session_id = event.item.session_id
        view = self.query_one("#review-view")
        view.hidden = False
        self.query_one("#list-view").hidden = True
        
        interpreter = NotasInterpreter(session_id)
        
        # Ask user if they want AI Interpretation or just raw text
        self.current_session_id = session_id
        view.query_one("#logs-content").update(interpreter.load_output())
        
        # Default: Prompt for AI
        self.notify("Generating AI Draft via Ollama...")
        llm = OllamaLLM() # Defaults to llama3 on localhost:11434
        draft = interpreter.generate_draft(llm)
        self.query_one("#editor").load_text(draft)

    def action_show_list(self):
        self.query_one("#review-view").hidden = True
        self.query_one("#list-view").hidden = False

    def action_open_export(self):
        if hasattr(self, 'current_session_id'):
            content = self.query_one("#editor").text
            self.push_screen(ExportModal(content, self.current_session_id))
        else:
            self.notify("Select a session first")

if __name__ == "__main__":
    NotasTUI().run()

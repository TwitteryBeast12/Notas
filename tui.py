from textual.app import App, ComposeResult
from textual.widgets import Header, Footer, ListView, ListItem, Label, TextArea, Static
from textual.containers import Horizontal, Vertical
from interpret import NotasInterpreter, MockLLM
import os

class SessionItem(ListItem):
    def __init__(self, session_id: str):
        super().__init__()
        self.session_id = session_id
        self.label = Label(f"Session: {session_id}")

    def compose(self) -> ComposeResult:
        yield self.label

class NotasTUI(App):
    TITLE = "Notas - TUI Reviewer"
    BINDINGS = [
        ("q", "quit", "Quit"),
        ("s", "save", "Save Runbook"),
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
        
        # Left side: Raw Logs
        logs_pane = Vertical()
        logs_pane.mount(Label("Raw Output", id="pane-title"))
        logs_pane.mount(Static("Loading logs...", id="logs-content"))
        
        # Right side: AI Editor
        edit_pane = Vertical()
        edit_pane.mount(Label("AI Draft", id="pane-title"))
        editor = TextArea(id="editor")
        edit_pane.mount(editor)
        
        container.mount(logs_pane)
        container.mount(edit_pane)
        return container

    def on_list_view_selected(self, event):
        # Logic to handle selection from the ListView
        # Since Textual handles events differently, we hook into the widget
        pass

    def on_mount(self):
        # Setup the list view selection handler
        self.query_one(ListView).on(self.handle_session_select)

    def handle_session_select(self, event):
        session_id = event.item.session_id
        
        # Update Review View
        view = self.query_one("#review-view")
        view.hidden = False
        self.query_one("#list-view").hidden = True
        
        interpreter = NotasInterpreter(session_id)
        llm = MockLLM()
        
        # Load Logs
        view.query_one("#logs-content").update(interpreter.load_output())
        
        # Generate Draft
        draft = interpreter.generate_draft(llm)
        self.query_one("#editor").load_text(draft)
        self.current_session_id = session_id

    def action_show_list(self):
        self.query_one("#review-view").hidden = True
        self.query_one("#list-view").hidden = False

    def action_save(self):
        if hasattr(self, 'current_session_id'):
            content = self.query_one("#editor").text
            save_path = os.path.expanduser(f"~/.notas/drafts/runbook_{self.current_session_id}.md")
            os.makedirs(os.path.dirname(save_path), exist_ok=True)
            with open(save_path, "w") as f:
                f.write(content)
            self.notify(f"Saved to {save_path}")

if __name__ == "__main__":
    NotasTUI().run()

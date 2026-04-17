from fastapi import FastAPI, Request, Form
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
import os
from interpret import NotasInterpreter, MockLLM

app = FastAPI()
templates = Jinja2Templates(directory="templates")

# Use MockLLM for POC, replace with real Ollama/OpenAI client later
llm = MockLLM()

@app.get("/", response_class=HTMLResponse)
async def index(request: Request):
    # List available sessions
    session_dir = os.path.expanduser("~/.notas/sessions")
    sessions = []
    if os.path.exists(session_dir):
        for f in os.listdir(session_dir):
            if f.startswith("session_") and f.endswith(".json"):
                sessions.append(f.replace("session_", "").replace(".json", ""))
    
    return templates.TemplateResponse("index.html", {"request": request, "sessions": sessions})

@app.get("/review/{session_id}", response_class=HTMLResponse)
async def review(request: Request, session_id: str):
    interpreter = NotasInterpreter(session_id)
    draft = interpreter.generate_draft(llm)
    raw_logs = interpreter.load_output()
    
    return templates.TemplateResponse("review.html", {
        "request": request, 
        "session_id": session_id, 
        "draft": draft, 
        "raw_logs": raw_logs
    })

@app.post("/save")
async def save_draft(request: Request, session_id: str = Form(...), content: str = Form(...)):
    save_path = os.path.expanduser(f"~/.notas/drafts/runbook_{session_id}.md")
    os.makedirs(os.path.dirname(save_path), exist_ok=True)
    
    with open(save_path, "w") as f:
        f.write(content)
    
    return {"status": "success", "path": save_path}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)

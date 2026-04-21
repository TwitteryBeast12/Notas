from fastapi import FastAPI, Request, Form
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
import os
from interpret import NotasInterpreter, OllamaProvider, OpenAIProvider, ConfigManager
from draft_manager import DraftManager

app = FastAPI()
templates = Jinja2Templates(directory="templates")
config_mgr = ConfigManager()
draft_mgr = DraftManager()

# Setup LLM based on config
config = config_mgr.load()
provider_type = config.get("provider", "ollama")
if provider_type == "ollama":
    llm = OllamaProvider(config.get("ollama", {}))
else:
    llm = OpenAIProvider(config.get("openai", {}))


@app.get("/", response_class=HTMLResponse)
async def index(request: Request):
    # Now listing drafts instead of raw sessions for consistency with TUI
    drafts = draft_mgr.list_drafts()
    return templates.TemplateResponse("index.html", {"request": request, "drafts": drafts})


@app.get("/review/", response_class=HTMLResponse)
async def review(request: Request, filename: str):
    draft_content = draft_mgr.read_draft(filename)
    return templates.TemplateResponse("review.html", {
        "request": request,
        "filename": filename,
        "content": draft_content
    })


@app.post("/save")
async def save_draft(filename: str = Form(...), content: str = Form(...)):
    res = draft_mgr.update_draft(filename, content)
    return JSONResponse(content=res)


@app.post("/export")
async def export_draft(filename: str = Form(...), target: str = Form(...), token: str = Form(None)):
    config = config_mgr.load()
    # Merge specific export config
    export_config = {
        "github_repo": config.get("github", {}).get("repo", "TwitteryBeast12/Notas"),
        "github_token": token or config.get("github", {}).get("token", ""),
        "notion_page_id": config.get("notion", {}).get("page_id", "parent_page_id"),
        "notion_token": token or config.get("notion", {}).get("token", ""),
    }
    res = draft_mgr.promote_to_final(filename, target, export_config)
    return JSONResponse(content=res)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)

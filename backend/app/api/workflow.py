from fastapi import APIRouter, UploadFile, Form, File
from app.utils.orchestrator import run_workflow
import json

router = APIRouter()

@router.post("/execute-workflow")
async def execute_workflow(
    stack_id: str = Form(...),
    nodes: str = Form(...),
    edges: str = Form(...),
    file: UploadFile = File(None),
):
    nodes_parsed = json.loads(nodes)
    edges_parsed = json.loads(edges)
    return await run_workflow(stack_id, nodes_parsed, edges_parsed, file)
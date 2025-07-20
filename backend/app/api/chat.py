from fastapi import APIRouter, Request
from app.utils.vectorstore import load_vectorstore
from app.core.embeddings import get_llm_response

router = APIRouter()

@router.post("/chat")
async def chat(request: Request):
    data = await request.json()
    query = data.get("query")
    stack_id = data.get("stack_id")
    vectorstore = load_vectorstore(stack_id)
    context = vectorstore.query(query) if vectorstore else ""
    response = await get_llm_response(query, context)
    return {"response": response}
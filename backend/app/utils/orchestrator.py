from app.utils.parser import extract_text_from_pdf
from app.core.embeddings import embed_text, get_llm_response
from app.utils.vectorstore import store_embeddings

async def run_workflow(stack_id, nodes, edges, file):
    node_map = {node['id']: node for node in nodes}
    result = {}
    query = ""
    context = ""
    llm_node = None

    for node in nodes:
        if node['type'] == 'userQuery':
            query = node['data']['query']

        elif node['type'] == 'knowledgeBase' and file:
            text = await extract_text_from_pdf(file)
            embedding = await embed_text(text)
            await store_embeddings(stack_id, [embedding], [text])
            context = text

        elif node['type'] == 'llm':
            llm_node = node

    if llm_node:
        response = await get_llm_response(query, context, llm_node['data'])
        result['llm_response'] = response

    for node in nodes:
        if node['type'] == 'output':
            result['final_output'] = result.get('llm_response', '')

    return result
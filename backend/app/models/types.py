from enum import Enum

class NodeType(str, Enum):
    user_query = "userQuery"
    knowledge_base = "knowledgeBase"
    llm = "llm"
    output = "output"
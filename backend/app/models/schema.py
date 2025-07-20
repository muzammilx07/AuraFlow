from pydantic import BaseModel
from typing import List, Optional

class NodeData(BaseModel):
    id: str
    type: str
    data: dict

class EdgeData(BaseModel):
    source: str
    target: str
    sourceHandle: Optional[str]
    targetHandle: Optional[str]

class WorkflowRequest(BaseModel):
    stack_id: str
    nodes: List[NodeData]
    edges: List[EdgeData]
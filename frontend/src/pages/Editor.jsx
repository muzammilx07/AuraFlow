import { useCallback, useState, useRef, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Play,
  Settings,
  MessageSquare,
  Book,
  Brain,
  Monitor,
} from "lucide-react";
import ReactFlow, {
  Controls,
  Background,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
} from "reactflow";
import "reactflow/dist/style.css";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  UserQueryNode,
  KnowledgeBaseNode,
  LLMNode,
  OutputNode,
} from "../components/react-flow/nodes";
import { useWorkflowDeploy, loadWorkflowFromLocalStorage } from "@/hooks/useWorkflowDeploy";

import ChatModal from "@/components/ChatModal";

// ✅ FIXED: Memoized outside to avoid React Flow warning
const nodeTypes = {
  userQuery: UserQueryNode,
  knowledgeBase: KnowledgeBaseNode,
  llm: LLMNode,
  output: OutputNode,
};

const sidebarNodeTypes = [
  {
    id: "userQuery",
    label: "User Query",
    type: "userQuery",
    icon: MessageSquare,
    initialData: { query: "", placeholderText: "" },
  },
  {
    id: "knowledgeBase",
    label: "Knowledge Base",
    type: "knowledgeBase",
    icon: Book,
    initialData: { fileName: "", embeddingModel: "text-embedding-3-large", apiKey: "" },
  },
  {
    id: "llm",
    label: "LLM (OpenAI)",
    type: "llm",
    icon: Brain,
    initialData: {
      model: "gpt-4o-mini",
      apiKey: "",
      prompt: "You are a helpful PDF assistant. Use web search if the PDF lacks context",
      temperature: 0.75,
      webSearchTool: false,
      serpApiKey: "",
    },
  },
  {
    id: "output",
    label: "Output",
    type: "output",
    icon: Monitor,
    initialData: { outputFormat: "plain-text" },
  },
];

export default function Editor() {
  const { id: stackId } = useParams();
  const reactFlowWrapper = useRef(null);
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);

  const {
  deploy,
  stopDeploy,
  isDeploying,
  showChat,
  setShowChat,
  saveToLocalStorage,
} = useWorkflowDeploy({ nodes, edges, stackId });


  // 🔁 Load local storage
  useEffect(() => {
    const { nodes: savedNodes, edges: savedEdges } = loadWorkflowFromLocalStorage(stackId);

    const restoredNodes = savedNodes.map((node) => ({
      ...node,
      data: {
        ...node.data,
        onDataChange: handleNodeDataChange,
        onClose: handleNodeClose,
      },
    }));

    setNodes(restoredNodes);
    setEdges(savedEdges);
  }, [stackId]);

  // 🧠 Node + Edge Change Handlers
  const onNodesChange = useCallback((changes) => {
    setNodes((nds) => applyNodeChanges(changes, nds));
  }, []);

  const onEdgesChange = useCallback((changes) => {
    setEdges((eds) => applyEdgeChanges(changes, eds));
  }, []);

  const onConnect = useCallback((connection) => {
    setEdges((eds) => addEdge(connection, eds));
  }, []);

  const handleNodeDataChange = useCallback((nodeId, newData) => {
    setNodes((nds) =>
      nds.map((node) => (node.id === nodeId ? { ...node, data: newData } : node))
    );
  }, []);

  const handleNodeClose = useCallback((nodeId) => {
    setNodes((nds) => nds.filter((node) => node.id !== nodeId));
    setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
  }, []);

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      if (!reactFlowInstance || !reactFlowWrapper.current) return;

      const type = event.dataTransfer.getData("application/reactflow/nodeType");
      const initialData = JSON.parse(
        event.dataTransfer.getData("application/reactflow/initialData") || "{}"
      );

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode = {
        id: `node_${Date.now()}`,
        type,
        position,
        data: {
          ...initialData,
          onDataChange: handleNodeDataChange,
          onClose: handleNodeClose,
        },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, handleNodeClose, handleNodeDataChange]
  );

  const onDragStart = (event, nodeType, initialData) => {
    event.dataTransfer.setData("application/reactflow/nodeType", nodeType);
    event.dataTransfer.setData("application/reactflow/initialData", JSON.stringify(initialData));
    event.dataTransfer.effectAllowed = "move";
  };

  const validateWorkflow = (nds, eds) => {
  console.log("🔎 Validating workflow...");
  if (nds.length === 0) {
    console.warn("⚠️ No nodes present");
    toast.error("Add at least one node to the canvas.");
    return false;
  }

  const llmNode = nds.find((node) => node.type === "llm");
  if (!llmNode) {
    console.warn("⚠️ LLM node missing");
    toast.error("Add an LLM node.");
    return false;
  }
  if (!llmNode.data?.apiKey?.trim()) {
    console.warn("⚠️ LLM API Key missing");
    toast.error("LLM node must have an API Key.");
    return false;
  }
  if (!llmNode.data?.model?.trim()) {
    console.warn("⚠️ LLM model missing");
    toast.error("LLM node must have a model selected.");
    return false;
  }
  if (!llmNode.data?.prompt?.trim()) {
    console.warn("⚠️ LLM prompt missing");
    toast.error("LLM node must have a prompt.");
    return false;
  }

  const userQueryNode = nds.find((node) => node.type === "userQuery");
  if (!userQueryNode || !userQueryNode.data?.query?.trim()) {
    console.warn("⚠️ User query missing");
    toast.error("User Query node must have a query.");
    return false;
  }

  const outputNode = nds.find((node) => node.type === "output");
  if (!outputNode) {
    console.warn("⚠️ Output node missing");
    toast.error("Add at least one Output node.");
    return false;
  }

  if (eds.length === 0) {
    console.warn("⚠️ No edges present");
    toast.error("You must connect the nodes using edges.");
    return false;
  }

  console.log("✅ Workflow passed validation");
  return true;
};


  return (
    <div className="flex min-h-screen w-full flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b bg-background px-4 md:px-6 justify-between">
        <div className="flex gap-2">
          <Button>
            <Link to="/" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
          <Separator orientation="vertical" className="h-6" />
          <h1 className="text-base font-semibold">Stack: {stackId}</h1>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={saveToLocalStorage}>
            💾 Save
          </Button>
          <Button
            className="ml-auto"
            size="sm"
            disabled={isDeploying}
            onClick={() => {
              if (validateWorkflow(nodes, edges)) {
                deploy();
              }
            }}
          >
            <Play className="mr-2 h-4 w-4" />
            {isDeploying ? "Executing..." : "Execute"}
          </Button>
          {isDeploying && (
            <Button size="sm" variant="destructive" onClick={stopDeploy}>
              Stop
            </Button>
          )}
        </div>
      </header>

      {/* Main */}
      <main className="flex flex-1">
        <aside className="w-64 border-r bg-muted/40 p-3 flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-muted-foreground">Components</h2>
          <div className="grid gap-1.5">
            {sidebarNodeTypes.map((node) => (
              <Card
                key={node.id}
                draggable
                onDragStart={(e) => onDragStart(e, node.type, node.initialData || {})}
                className="cursor-grab active:cursor-grabbing px-2 py-1 gap-0"
              >
                <CardHeader className="p-2 flex flex-row items-center justify-between space-y-0">
                  <CardTitle className="text-xs font-medium">{node.label}</CardTitle>
                  <node.icon className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent className="p-2 pt-0 text-[0.65rem] text-muted-foreground">
                  Drag to canvas
                </CardContent>
              </Card>
            ))}
          </div>

          <Separator className="my-2" />

          <h2 className="text-sm font-semibold text-muted-foreground">Settings</h2>
          <Card className="px-2 py-1.5">
            <CardHeader className="p-2 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-xs font-medium">Stack Settings</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-2 pt-0 text-[0.65rem] text-muted-foreground">
              Configure stack options.
            </CardContent>
          </Card>
        </aside>

        <div className="flex-1 h-[calc(100vh-3.5rem)]" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={setReactFlowInstance}
            onDrop={onDrop}
            onDragOver={onDragOver}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{
              padding: 0.2,
              minZoom: 0.75,
              maxZoom: 1.4,
            }}
          >
            <Controls />
            <Background variant="dots" gap={12} size={1} />
          </ReactFlow>
        </div>
      </main>

      <ChatModal open={showChat} onClose={() => setShowChat(false)} stackId={stackId} />
    </div>
  );
}

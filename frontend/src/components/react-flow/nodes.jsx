import React, { useCallback, useState, useRef } from "react";
import { Handle, Position } from "reactflow";
import {
  Book,
  MessageSquare,
  Brain,
  Monitor,
  Upload,
  Eye,
  EyeOff,
  X,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";

// Reusable Card for Nodes
const NodeCard = ({ title, description, icon: Icon, children, onClose }) => (
  <Card className=" shadow-lg border-t-4 border-blue-500 max-w-[180px]">
    <CardHeader className="p-1 flex flex-row items-center justify-between space-y-0">
      <div className="flex items-center gap-0.5">
        {Icon && <Icon className="h-3 w-3 text-blue-500" />}
        <CardTitle className="text-[0.65rem] font-medium">{title}</CardTitle>
      </div>
      {onClose && (
        <Button variant="ghost" size="icon" className="h-4 w-4" onClick={onClose}>
          <X className="h-3 w-3" />
          <span className="sr-only">Close</span>
        </Button>
      )}
    </CardHeader>
    <CardContent className="p-1 pt-0 text-[0.6rem] text-muted-foreground">
      <p className="mb-0.5">{description}</p>
      {children}
    </CardContent>
  </Card>
);

// User Query Node
export const UserQueryNode = ({ id, data }) => {
  const [query, setQuery] = useState(data.query || "");
  const [placeholderText, setPlaceholderText] = useState(data.placeholderText || "");

  const handleDataChange = useCallback((key, value) => {
    data.onDataChange(id, { ...data, [key]: value });
  }, [id, data]);

  return (
    <NodeCard title="User Query" description="Enter point for queries" icon={MessageSquare} onClose={() => data.onClose(id)}>
      <div className="grid gap-0.5">
        <Label htmlFor={`query-${id}`} className="text-[0.6rem]">Query</Label>
        <Input
          id={`query-${id}`}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            handleDataChange("query", e.target.value);
          }}
          placeholder="Write your query here"
          className="h-6 text-[0.6rem]"
        />
        <Label htmlFor={`placeholderText-${id}`} className="text-[0.6rem]">Placeholder Text</Label>
        <Input
          id={`placeholderText-${id}`}
          value={placeholderText}
          onChange={(e) => {
            setPlaceholderText(e.target.value);
            handleDataChange("placeholderText", e.target.value);
          }}
          placeholder="Enter your question..."
          className="h-6 text-[0.6rem]"
        />
      </div>
      <Handle type="source" position={Position.Right} id="query" className="!bg-blue-500" />
    </NodeCard>
  );
};

// Knowledge Base Node
export const KnowledgeBaseNode = ({ id, data }) => {
  const [fileName, setFileName] = useState(data.fileName || "");
  const [embeddingModel, setEmbeddingModel] = useState(data.embeddingModel || "text-embedding-3-large");
  const [apiKey, setApiKey] = useState(data.apiKey || "");
  const [showApiKey, setShowApiKey] = useState(false);
  const fileInputRef = useRef(null);

  const handleDataChange = useCallback((key, value) => {
    data.onDataChange(id, { ...data, [key]: value });
  }, [id, data]);

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileName(file.name);
      handleDataChange("file", file);
      handleDataChange("fileName", file.name);
    }
  };

  return (
    <NodeCard title="Knowledge Base" description="Let LLM search info in your file" icon={Book} onClose={() => data.onClose(id)}>
      <div className="grid gap-0.5">
        <Label className="text-[0.6rem]">Upload File</Label>
        <div className="flex items-center gap-0.5">
          <Input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
          <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} className="flex-1 h-6 text-[0.6rem]">
            <Upload className="h-3 w-3 mr-0.5" /> Upload File
          </Button>
          {fileName && <span className="text-[0.6rem] truncate">{fileName}</span>}
        </div>

        <Label className="text-[0.6rem]">Embedding Model</Label>
        <Select value={embeddingModel} onValueChange={(value) => {
          setEmbeddingModel(value);
          handleDataChange("embeddingModel", value);
        }}>
          <SelectTrigger className="h-6 text-[0.6rem]">
            <SelectValue placeholder="Select model" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="text-embedding-3-large">text-embedding-3-large</SelectItem>
            <SelectItem value="text-embedding-ada-002">text-embedding-ada-002</SelectItem>
          </SelectContent>
        </Select>

        <Label htmlFor={`apiKeyKB-${id}`} className="text-[0.6rem]">API Key</Label>
        <div className="relative">
          <Input
            type={showApiKey ? "text" : "password"}
            value={apiKey}
            onChange={(e) => {
              setApiKey(e.target.value);
              handleDataChange("apiKey", e.target.value);
            }}
            placeholder="Enter your API key"
            className="h-6 text-[0.6rem] pr-6"
          />
          <Button variant="ghost" size="icon" className="absolute right-0.5 top-1/2 -translate-y-1/2 h-4 w-4" onClick={() => setShowApiKey(!showApiKey)}>
            {showApiKey ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
          </Button>
        </div>
      </div>
      <Handle type="target" position={Position.Left} id="query" className="!bg-blue-500" />
      <Handle type="source" position={Position.Right} id="context" className="!bg-blue-500" />
    </NodeCard>
  );
};

// LLM Node
export const LLMNode = ({ id, data }) => {
  const [model, setModel] = useState(data.model || "gpt-4o-mini")
  const [apiKey, setApiKey] = useState(data.apiKey || "")
  const [showApiKey, setShowApiKey] = useState(false)
  const [prompt, setPrompt] = useState(
  data.prompt ||
    [
      "You are a helpful PDF assistant.",
      "Use web search if the PDF lacks context.",
    ].join("\n")
);

  const [temperature, setTemperature] = useState(data.temperature || 0.75)
  const [webSearchTool, setWebSearchTool] = useState(data.webSearchTool || false)
  const [serpApiKey, setSerpApiKey] = useState(data.serpApiKey || "")
  const [showSerpApiKey, setShowSerpApiKey] = useState(false)

  const handleDataChange = useCallback(
    (key, value) => {
      data.onDataChange(id, { ...data, [key]: value })
    },
    [id, data],
  )

  return (
    <NodeCard
      title="LLM (OpenAI)"
      description="Run a query with OpenAI LLM"
      icon={Brain}
      onClose={() => data.onClose(id)}
    >
      <div className="grid gap-0.5">
        <Label htmlFor={`llmModel-${id}`} className="text-[0.55rem]">
          {" "}
          {/* Further reduced label size */}
          Model
        </Label>
        <Select
          value={model}
          onValueChange={(value) => {
            setModel(value)
            handleDataChange("model", value)
          }}
        >
          <SelectTrigger id={`llmModel-${id}`} className="h-6 text-[0.6rem]">
            <SelectValue placeholder="Select model" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="gpt-4o-mini">GPT 4o - Mini</SelectItem>
            <SelectItem value="gpt-4o">GPT 4o</SelectItem>
            <SelectItem value="gpt-3.5-turbo">GPT 3.5 Turbo</SelectItem>
          </SelectContent>
        </Select>
        <Label htmlFor={`llmApiKey-${id}`} className="text-[0.55rem]">
          {" "}
          {/* Further reduced label size */}
          API Key
        </Label>
        <div className="relative">
          <Input
            id={`llmApiKey-${id}`}
            type={showApiKey ? "text" : "password"}
            value={apiKey}
            onChange={(e) => {
              setApiKey(e.target.value)
              handleDataChange("apiKey", e.target.value)
            }}
            placeholder="Enter your API key"
            className="h-6 text-[0.6rem] pr-6"
          />
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-0.5 top-1/2 -translate-y-1/2 h-4 w-4"
            onClick={() => setShowApiKey(!showApiKey)}
          >
            {showApiKey ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
            <span className="sr-only">{showApiKey ? "Hide API Key" : "Show API Key"}</span>
          </Button>
        </div>
        <Label htmlFor={`prompt-${id}`} className="text-[0.55rem]">
          {" "}
          {/* Further reduced label size */}
          Prompt
        </Label>
        <Textarea
  id={`prompt-${id}`}
  value={prompt}
  onChange={(e) => {
    setPrompt(e.target.value);
    handleDataChange("prompt", e.target.value);
  }}
  className="text-[0.6rem]"
  rows={3}
/>

        <p className="text-[0.55rem] text-blue-500 mt-0.5">
          {" "}
          {/* Further reduced text size */}• CONTEXT: {"{context}"} • User Query: {"{query}"}
        </p>
        <Label htmlFor={`temperature-${id}`} className="text-[0.55rem]">
          {" "}
          {/* Further reduced label size */}
          Temperature
        </Label>
        <Input
          id={`temperature-${id}`}
          type="number"
          step="0.01"
          min="0"
          max="1"
          value={temperature}
          onChange={(e) => {
            const val = Number.parseFloat(e.target.value)
            setTemperature(isNaN(val) ? 0 : val)
            handleDataChange("temperature", isNaN(val) ? 0 : val)
          }}
          className="h-6 text-[0.6rem]"
        />
        <div className="flex items-center justify-between mt-0.5">
          <Label htmlFor={`webSearchTool-${id}`} className="text-[0.55rem]">
            {" "}
            {/* Further reduced label size */}
            WebSearch Tool
          </Label>
          <Switch
            id={`webSearchTool-${id}`}
            checked={webSearchTool}
            onCheckedChange={(checked) => {
              setWebSearchTool(checked)
              handleDataChange("webSearchTool", checked)
            }}
            className="scale-50"
          />
        </div>
        {webSearchTool && (
          <>
            <Label htmlFor={`serpApiKey-${id}`} className="text-[0.55rem]">
              {" "}
              {/* Further reduced label size */}
              SERP API
            </Label>
            <div className="relative">
              <Input
                id={`serpApiKey-${id}`}
                type={showSerpApiKey ? "text" : "password"}
                value={serpApiKey}
                onChange={(e) => {
                  setSerpApiKey(e.target.value)
                  handleDataChange("serpApiKey", e.target.value)
                }}
                placeholder="Enter SERP API key"
                className="h-6 text-[0.6rem] pr-6"
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-0.5 top-1/2 -translate-y-1/2 h-4 w-4"
                onClick={() => setShowSerpApiKey(!showSerpApiKey)}
              >
                {showSerpApiKey ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                <span className="sr-only">{showSerpApiKey ? "Hide SERP API Key" : "Show SERP API Key"}</span>
              </Button>
            </div>
          </>
        )}
      </div>
      <Handle type="target" position={Position.Left} id="context" className="!bg-blue-500" />
      <Handle type="target" position={Position.Left} id="query" className="!bg-blue-500" />
      <Handle type="source" position={Position.Right} id="output" className="!bg-blue-500" />
    </NodeCard>
  )
}

// Output Node
export const OutputNode = ({ id, data }) => {
  const [outputFormat, setOutputFormat] = useState(data.outputFormat || "plain-text");

  const handleDataChange = useCallback((key, value) => {
    data.onDataChange(id, { ...data, [key]: value });
  }, [id, data]);

  return (
    <NodeCard title="Output" description="Output of the result nodes as text" icon={Monitor} onClose={() => data.onClose(id)}>
      <div className="grid gap-0.5">
        <Label className="text-[0.6rem]">Output Format</Label>
        <Select value={outputFormat} onValueChange={(value) => {
          setOutputFormat(value);
          handleDataChange("outputFormat", value);
        }}>
          <SelectTrigger className="h-6 text-[0.6rem]">
            <SelectValue placeholder="Select format" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="plain-text">Plain Text</SelectItem>
            <SelectItem value="json">JSON</SelectItem>
            <SelectItem value="markdown">Markdown</SelectItem>
          </SelectContent>
        </Select>
        <Label className="text-[0.6rem] mt-0.5">Output Text</Label>
        <p className="text-[0.6rem] text-muted-foreground">Output will be generated based on query</p>
      </div>
      <Handle type="target" position={Position.Left} id="input" className="!bg-blue-500" />

    </NodeCard>
  );
};

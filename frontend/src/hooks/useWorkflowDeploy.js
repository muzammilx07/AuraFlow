import { useState } from "react";
import { toast } from "sonner"; // ✅ Sonner toast

export function useWorkflowDeploy({ nodes, edges, stackId }) {
  const [isDeploying, setIsDeploying] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [llmOutput, setLlmOutput] = useState(""); // ✅ Needed externally

  const saveToLocalStorage = () => {
    try {
      const data = { nodes, edges };
      localStorage.setItem(`workflow-${stackId}`, JSON.stringify(data));
    } catch (error) {
      console.error("❌ Error saving to local storage:", error);
      toast.error("Unable to save workflow locally.");
    }
  };

  const isKnownLLMError = (text) =>
    typeof text === "string" &&
    (text.includes("Quota exceeded") ||
      text.includes("Invalid API key") ||
      text.includes("billing disabled") ||
      text.includes("Bad input") ||
      text.includes("unsupported model") ||
      text.includes("Model not found") ||
      text.includes("OpenAI Error") ||
      text.includes("Gemini Error"));

  const deploy = async () => {
    try {
      setIsDeploying(true);
      saveToLocalStorage();

      const cleanedNodes = nodes.map((node) => ({
        id: node.id,
        type: node.type,
        data: node.data,
      }));

      const formData = new FormData();
      formData.append("stack_id", stackId);
      formData.append("nodes", JSON.stringify(cleanedNodes));
      formData.append("edges", JSON.stringify(edges));

      console.log("📤 Sending FormData:");
      for (let pair of formData.entries()) {
        console.log(pair[0], ":", pair[1]);
      }

      const response = await fetch(
        "http://localhost:8000/api/execute-workflow",
        {
          method: "POST",
          body: formData,
        }
      );

      const result = await response.json();
      console.log("✅ API Success Response:", result);

      const llmText = result?.llm_response || result?.final_output || "";

      if (isKnownLLMError(llmText)) {
        toast.error(llmText);
        return;
      }

      if (typeof llmText === "string" && llmText.trim() !== "") {
        setLlmOutput(llmText);
        setShowChat(true);
      } else {
        toast.warning("No usable output from the LLM.");
      }
    } catch (error) {
      console.error("❗Deployment Error:", error);
      toast.error("Could not reach the server. Try again later.");
    } finally {
      setIsDeploying(false);
    }
  };

  const stopDeploy = () => {
    console.log("🛑 Deployment stopped by user.");
    setIsDeploying(false);
  };

  return {
    deploy,
    stopDeploy,
    isDeploying,
    showChat,
    setShowChat,
    llmOutput, // ✅ added back for external use
    saveToLocalStorage,
  };
}

// Utility to load saved workflow
export function loadWorkflowFromLocalStorage(stackId) {
  try {
    const saved = localStorage.getItem(`workflow-${stackId}`);
    if (saved) {
      const { nodes, edges } = JSON.parse(saved);
      return { nodes, edges };
    }
  } catch (error) {
    console.error("❌ Error loading workflow:", error);
  }
  return { nodes: [], edges: [] };
}

import { useState } from "react";

// Main deploy hook
export function useWorkflowDeploy({ nodes, edges, stackId }) {
  const [isDeploying, setIsDeploying] = useState(false);
  const [showChat, setShowChat] = useState(false);

  const saveToLocalStorage = () => {
    try {
      const data = { nodes, edges };
      localStorage.setItem(`workflow-${stackId}`, JSON.stringify(data));
    } catch (error) {
      // You might want to add more robust error handling here, e.g., showing a user-friendly message.
      console.error("Error saving to local storage:", error);
    }
  };

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

      // --- Start of added console logging for formData ---
      console.log("--- FormData Content Before API Call ---");
      for (let pair of formData.entries()) {
        console.log(pair[0] + ":", pair[1]);
      }
      console.log("---------------------------------------");
      // --- End of added console logging for formData ---

      const response = await fetch(
        "http://localhost:8000/api/execute-workflow",
        {
          method: "POST",
          body: formData,
        }
      );

      const result = await response.json();
      console.log("✅ API Success Response:", result);
      setShowChat(true);
    } catch (error) {
      console.error("❗Deployment Error:", error);
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
    saveToLocalStorage, // ✅ Expose this
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

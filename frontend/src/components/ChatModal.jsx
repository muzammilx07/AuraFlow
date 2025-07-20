import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ChatModal({ open, onClose, stackId }) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);

  const handleSubmit = async () => {
    if (!input.trim()) return;
    const userMsg = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    try {
      const res = await fetch("http://localhost:8000/api/chat-with-stack", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: input, stackId }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.answer }]);
    } catch (err) {
      setMessages((prev) => [...prev, { role: "assistant", content: "Error: " + err.message }]);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>💬 Chat with Stack {stackId}</DialogTitle>
        </DialogHeader>
        <div className="border rounded p-3 max-h-64 overflow-auto mb-2 text-sm space-y-1 bg-muted/40">
          {messages.map((m, i) => (
            <div key={i}>
              <strong>{m.role === "user" ? "You" : "Bot"}:</strong> {m.content}
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="Type a message"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          />
          <Button onClick={handleSubmit}>Send</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

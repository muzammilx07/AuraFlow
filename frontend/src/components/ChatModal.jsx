"use client";

import { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";

export default function ChatModal({ open, onClose, stackId, initialMessage }) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Load initial message from LLM
  useEffect(() => {
    if (initialMessage && open) {
      setMessages([{ role: "assistant", content: initialMessage }]);
    }
  }, [initialMessage, open]);

  // Scroll to latest message
  useEffect(() => {
    if (open) scrollToBottom();
  }, [messages, open]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSubmit = async () => {
    if (!input.trim()) return;

    const userMsg = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:8000/api/chat-with-stack", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: input, stackId }),
      });

      const data = await res.json();
      const assistantMsg = { role: "assistant", content: data.answer };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Error: " + err.message },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg w-full">
        <DialogHeader>
          <DialogTitle>Workflow Chat</DialogTitle>
        </DialogHeader>

        {/* Chat messages */}
        <div className="h-80 overflow-y-auto border rounded-md px-4 py-3 bg-muted space-y-4 text-sm">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex flex-col max-w-[85%] ${
                msg.role === "user"
                  ? "ml-auto items-end"
                  : "mr-auto items-start"
              }`}
            >
              <span className="text-xs text-muted-foreground mb-1">
                {msg.role === "user" ? "You" : "Assistant"}
              </span>
              <div
                className={`p-3 rounded-xl whitespace-pre-line ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-background border text-foreground"
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="text-sm italic text-muted-foreground">
              Assistant is typing...
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input section */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          className="flex items-center gap-2 mt-4"
        >
          <Input
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 h-10 rounded-full px-4"
          />
          <Button
            type="submit"
            className="rounded-full px-4 h-10"
            disabled={!input.trim() || loading}
          >
            <Send className="w-4 h-4 mr-1" />
            Send
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

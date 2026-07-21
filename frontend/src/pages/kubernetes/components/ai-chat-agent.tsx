import { useState } from "react";
import { IconSparkles, IconSend, IconUser, IconChevronRight } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

interface AiChatAgentProps {
  onClose: () => void;
}

export function AiChatAgent({ onClose }: AiChatAgentProps) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hi! I'm your RhOps AI. I can help you troubleshoot pods, analyze metrics, or generate Kubernetes manifests. How can I help you today?",
    }
  ]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message
    const newMessages = [...messages, { role: "user", content: input }];
    setMessages(newMessages);
    setInput("");

    // Simulate AI typing delay
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "I'm currently running in mock mode for this UI preview, but I'll soon be connected to the RhOps backend to fetch real cluster data for you!",
        }
      ]);
    }, 1000);
  };

  return (
    <div className="flex flex-col h-full bg-card shadow-sm">
      <div className="px-4 py-2.5 border-b border-border bg-muted/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-primary/20 p-1.5 rounded-md text-primary">
            <IconSparkles className="size-4" />
          </div>
          <h2 className="font-semibold text-sm">Cluster Assistant</h2>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          title="Collapse Assistant"
        >
          <IconChevronRight className="size-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {messages.map((msg, i) => (
          <div key={i} className={cn("flex gap-3 text-sm", msg.role === "user" ? "flex-row-reverse" : "")}>
            <div className={cn(
              "size-7 rounded-full flex items-center justify-center shrink-0 border",
              msg.role === "user"
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-muted text-muted-foreground border-border"
            )}>
              {msg.role === "user" ? <IconUser className="size-4" /> : <IconSparkles className="size-4" />}
            </div>
            <div className={cn(
              "px-3 py-2 rounded-2xl max-w-[85%]",
              msg.role === "user"
                ? "bg-primary text-primary-foreground rounded-tr-sm"
                : "bg-muted/50 border border-border/50 rounded-tl-sm text-foreground"
            )}>
              {msg.content}
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-border bg-background">
        <form onSubmit={handleSend} className="relative flex items-end">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend(e as unknown as React.FormEvent);
              }
            }}
            placeholder="Ask RhOps AI..."
            rows={2}
            className="w-full bg-muted/50 border border-border rounded-2xl py-3 pl-4 pr-12 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-muted-foreground resize-none"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="absolute bottom-2 right-2 p-1.5 bg-foreground text-background rounded-full hover:bg-foreground/90 disabled:opacity-30 transition-all"
          >
            <IconSend className="size-4" />
          </button>
        </form>
      </div>
    </div>
  );
}

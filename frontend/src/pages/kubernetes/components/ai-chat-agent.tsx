import { useState } from "react";
import { IconSparkles, IconArrowUp, IconUser, IconChevronRight } from "@tabler/icons-react";
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

      <div className="p-4 bg-transparent">
        <form onSubmit={handleSend} className="relative flex flex-col bg-[#1e1e22] rounded-[24px] border border-border/50 p-2 shadow-sm transition-all focus-within:ring-1 focus-within:ring-primary/50">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend(e as unknown as React.FormEvent);
              }
            }}
            placeholder="Ask anything, @ to mention, / for actions"
            rows={1}
            className="w-full bg-transparent text-white py-2 pl-3 pr-12 text-sm focus:outline-none placeholder:text-muted-foreground resize-none min-h-[44px] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          />
          <div className="flex items-center justify-end px-1 pb-1">
            <button
              type="submit"
              disabled={!input.trim()}
              className="p-1.5 bg-[#2d2d33] text-zinc-400 rounded-full hover:bg-[#3d3d45] hover:text-white disabled:opacity-50 disabled:hover:bg-[#2d2d33] disabled:hover:text-zinc-400 transition-all"
            >
              <IconArrowUp className="size-4" stroke={2.5} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

import { useState, useEffect, useRef } from "react";
import { IconSparkles, IconArrowUp, IconUser, IconChevronRight, IconPlus, IconHistory } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";

interface AiChatAgentProps {
  onClose: () => void;
  clusterId?: string;
}

interface ChatMessage {
  role: string;
  content: string;
}

interface ChatSession {
  id: string;
  title: string;
  createdAt: string;
  messages: { role: string; content: string }[];
}

export function AiChatAgent({ onClose, clusterId }: AiChatAgentProps) {
  const [input, setInput] = useState("");
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const defaultMessage = {
    role: "assistant",
    content: "Hi! I'm your RhOps AI. I can help you troubleshoot pods, analyze metrics, or generate Kubernetes manifests. How can I help you today?",
  };

  const [messages, setMessages] = useState<ChatMessage[]>([defaultMessage]);

  useEffect(() => {
    fetchSessions();
  }, [clusterId]);

  useEffect(() => {
    if (scrollRef.current && !showHistory) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, showHistory]);

  const fetchSessions = async () => {
    try {
      const res = await api.get(`/ai/sessions${clusterId ? `?clusterId=${clusterId}` : ''}`);
      setSessions(res.data.data);
    } catch (e) {
      console.error(e);
    }
  };

  const loadSession = (sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    if (session) {
      setActiveSessionId(session.id);
      setMessages(session.messages.map(m => ({
        role: m.role.toLowerCase() === "user" ? "user" : "assistant",
        content: m.content
      })));
    }
  };

  const startNewChat = () => {
    setActiveSessionId(null);
    setMessages([defaultMessage]);
    setShowHistory(false);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input;
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const res = await api.post("/ai/chat", {
        message: userMessage,
        clusterId,
        sessionId: activeSessionId
      });

      const responseMessage = res.data.message.content;
      setMessages(prev => [...prev, { role: "assistant", content: responseMessage }]);

      if (!activeSessionId && res.data.session?.id) {
        // We just created a new session on the backend, refresh list and set it
        setActiveSessionId(res.data.session.id);
        const sessionsRes = await api.get(`/ai/sessions${clusterId ? `?clusterId=${clusterId}` : ''}`);
        const updatedSessions = sessionsRes.data.data;
        setSessions(updatedSessions);
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: "assistant", content: "Sorry, I encountered an error communicating with the agent. Please make sure OpenAI keys are configured." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const activeTitle = activeSessionId
    ? sessions.find(s => s.id === activeSessionId)?.title
    : "✨ New Chat Session";

  return (
    <div className="flex flex-col h-full bg-card shadow-sm">
      {/* Header Gemini Style */}
      <div className="px-4 py-3 border-b border-border bg-muted/10 flex items-center justify-between">
        <span className="font-semibold text-sm truncate max-w-[180px] text-foreground">
          {activeTitle}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={startNewChat}
            className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            title="New Chat"
          >
            <IconPlus className="size-4" />
          </button>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className={cn("p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors", showHistory && "bg-muted text-foreground")}
            title="Chat History"
          >
            <IconHistory className="size-4" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            title="Collapse Assistant"
          >
            <IconChevronRight className="size-4" />
          </button>
        </div>
      </div>

      {showHistory ? (
        <div className="flex-1 overflow-y-auto p-2 space-y-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <div className="px-3 py-2 text-xs font-bold uppercase text-muted-foreground tracking-wider">Chat History</div>
          {sessions.length === 0 && <p className="p-3 text-xs text-muted-foreground">No previous chats found.</p>}
          {sessions.map(s => (
            <button
              key={s.id}
              onClick={() => { loadSession(s.id); setShowHistory(false); }}
              className={cn(
                "w-full text-left p-3 rounded-lg transition-colors text-sm truncate border",
                s.id === activeSessionId ? "bg-primary/10 border-primary/20 text-primary" : "bg-transparent border-transparent hover:bg-muted text-foreground"
              )}
            >
              {s.title}
            </button>
          ))}
        </div>
      ) : (
        <>
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
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
                  "px-3 py-2 rounded-2xl max-w-[85%] whitespace-pre-wrap",
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground rounded-tr-sm"
                    : "bg-muted/50 border border-border/50 rounded-tl-sm text-foreground"
                )}>
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3 text-sm">
                <div className="size-7 rounded-full flex items-center justify-center shrink-0 border bg-muted text-muted-foreground border-border">
                  <IconSparkles className="size-4 animate-pulse" />
                </div>
                <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-muted/50 border border-border/50 flex items-center gap-1.5">
                  <span className="size-1.5 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "0ms" }}></span>
                  <span className="size-1.5 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "150ms" }}></span>
                  <span className="size-1.5 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "300ms" }}></span>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 bg-transparent border-t border-border/50">
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
                disabled={isLoading}
                className="w-full bg-transparent text-white py-2 pl-3 pr-12 text-sm focus:outline-none placeholder:text-muted-foreground resize-none min-h-[44px] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] disabled:opacity-50"
              />
              <div className="flex items-center justify-end px-1 pb-1">
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="p-1.5 bg-[#2d2d33] text-zinc-400 rounded-full hover:bg-[#3d3d45] hover:text-white disabled:opacity-50 disabled:hover:bg-[#2d2d33] disabled:hover:text-zinc-400 transition-all"
                >
                  <IconArrowUp className="size-4" stroke={2.5} />
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}

import { useState, useRef, useEffect } from "react";
import {
  IconSparkles, IconArrowUp, IconUser, IconPlus, IconTrash,
  IconMessage2, IconCpu, IconAlertCircle, IconFileCode,
  IconCheck, IconCopy, IconRefresh, IconSearch
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth/auth-provider";
import { api } from "@/lib/api";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

interface Conversation {
  id: string;
  title: string;
  timestamp: string;
  messages: Message[];
}

interface AiAssistantTabProps {
  clusterId: string;
  cluster: any;
}

const suggestedPrompts = [
  {
    icon: IconAlertCircle,
    title: "Analyze Cluster Health",
    prompt: "Perform a full health check on all running pods, deployments, and nodes in namespace qrt.",
    color: "text-amber-500 bg-amber-500/10 border-amber-500/20"
  },
  {
    icon: IconCpu,
    title: "Resource Utilization",
    prompt: "Which workloads are consuming the highest CPU and Memory in this cluster?",
    color: "text-blue-500 bg-blue-500/10 border-blue-500/20"
  },
  {
    icon: IconMessage2,
    title: "Troubleshoot Crash Loops",
    prompt: "Check logs for crash-looping or failing pods and suggest root cause fixes.",
    color: "text-red-500 bg-red-500/10 border-red-500/20"
  },
  {
    icon: IconFileCode,
    title: "Generate Manifest",
    prompt: "Generate a production-ready Kubernetes Deployment & Service YAML for a Node.js microservice.",
    color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20"
  }
];

export function AiAssistantTab({ clusterId, cluster }: AiAssistantTabProps) {
  const { user } = useAuth();
  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch sessions on mount
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const res = await api.get(`/ai/sessions${clusterId ? `?clusterId=${clusterId}` : ''}`);
        if (res.data && res.data.data) {
          const formatted = res.data.data.map((s: any) => ({
            id: s.id,
            title: s.title,
            timestamp: new Date(s.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            messages: s.messages.map((m: any) => ({
              id: m.id,
              role: m.role.toLowerCase() === 'user' ? 'user' : 'assistant',
              content: m.content,
              timestamp: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }))
          }));
          setConversations(formatted);
          if (formatted.length > 0) {
            setActiveConvId(formatted[0].id);
          }
        }
      } catch (err) {
        console.error("Failed to fetch AI sessions", err);
      }
    };
    fetchSessions();
  }, [clusterId]);

  // Active messages list
  const activeConv = conversations.find(c => c.id === activeConvId);
  const messages = activeConv ? activeConv.messages : [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isGenerating]);

  const handleStartNewChat = () => {
    setActiveConvId(null);
    setInput("");
  };

  const handleSelectConv = (convId: string) => {
    setActiveConvId(convId);
    setInput("");
  };

  const handleDeleteConv = async (e: React.MouseEvent, convId: string) => {
    e.stopPropagation();
    try {
        await api.delete(`/ai/sessions/${convId}`);
        setConversations(prev => prev.filter(c => c.id !== convId));
        if (activeConvId === convId) {
            setActiveConvId(null);
        }
    } catch (err) {
        console.error("Failed to delete session", err);
    }
  };

  const handleSendPrompt = async (promptText: string) => {
    const text = promptText.trim();
    if (!text || isGenerating) return;

    const userMessage: Message = {
      id: "msg-" + Date.now(),
      role: "user",
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    let targetConvId = activeConvId;

    if (!targetConvId) {
      // Create new conversation
      const newConv: Conversation = {
        id: "conv-" + Date.now(),
        title: text.length > 35 ? text.slice(0, 35) + "..." : text,
        timestamp: "Just now",
        messages: [userMessage]
      };
      setConversations(prev => [newConv, ...prev]);
      targetConvId = newConv.id;
      setActiveConvId(newConv.id);
    } else {
      setConversations(prev => prev.map(c => {
        if (c.id === targetConvId) {
          return { ...c, messages: [...c.messages, userMessage] };
        }
        return c;
      }));
    }

    setInput("");
    setIsGenerating(true);

    try {
        const response = await api.post('/ai/chat', {
            message: text,
            clusterId,
            sessionId: activeConvId
        });

        const { session, message: aiMessage } = response.data;
        
        // If it was a new conversation, update the ID
        if (!activeConvId) {
            setActiveConvId(session.id);
            setConversations(prev => prev.map(c => {
                if (c.id === targetConvId) {
                    return { ...c, id: session.id, title: session.title, messages: [...c.messages, aiMessage] };
                }
                return c;
            }));
        } else {
            setConversations(prev => prev.map(c => {
                if (c.id === targetConvId) {
                    return { ...c, messages: [...c.messages, aiMessage] };
                }
                return c;
            }));
        }

    } catch (err) {
        console.error("Failed to send message", err);
        // Add an error message
        const errorMsg: Message = {
            id: "msg-" + Date.now(),
            role: "assistant",
            content: "Sorry, I encountered an error communicating with the AI service. Please try again.",
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setConversations(prev => prev.map(c => {
            if (c.id === targetConvId) {
                return { ...c, messages: [...c.messages, errorMsg] };
            }
            return c;
        }));
    } finally {
        setIsGenerating(false);
    }
  };

  const handleCopyMessage = (msgId: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedMsgId(msgId);
    setTimeout(() => setCopiedMsgId(null), 2000);
  };

  return (
    <div className="flex h-full w-full overflow-hidden bg-background">

      {/* LEFT / CENTER: Google Gemini AI Main Interface */}
      <div className="flex-1 flex flex-col h-full relative overflow-hidden">

        {/* MESSAGES AREA / HERO VIEW */}
        <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col">
          {messages.length === 0 ? (
            /* CENTER HERO SCREEN (Google AI style) */
            <div className="flex-1 flex flex-col items-center justify-center p-6 max-w-3xl mx-auto w-full my-auto text-center animate-in fade-in zoom-in-95 duration-300">

              {/* CENTER SEARCH / PROMPT INPUT */}
              <div className="w-full max-w-2xl relative group">
                {/* Glowing intelligence aura */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-2xl blur-md opacity-30 group-focus-within:opacity-75 transition duration-500"></div>
                
                <div className="relative w-full bg-card border border-white/10 dark:border-white/5 rounded-2xl p-3 shadow-2xl flex flex-col">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendPrompt(input);
                      }
                    }}
                    placeholder="Ask RhOps AI about your cluster..."
                    rows={2}
                    className="w-full bg-transparent text-foreground p-3 text-sm focus:outline-none placeholder:text-muted-foreground resize-none custom-scrollbar"
                  />
                  <div className="flex items-center justify-between pt-2 border-t border-border/40">
                    <span className="text-[11px] text-muted-foreground px-2 font-medium">Press Enter to send</span>
                    <button
                      onClick={() => handleSendPrompt(input)}
                      disabled={!input.trim() || isGenerating}
                      className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground text-xs font-semibold rounded-xl hover:bg-primary/90 disabled:opacity-50 transition-all shadow-md"
                    >
                      <span>Send</span>
                      <IconArrowUp className="size-4" stroke={2.5} />
                    </button>
                  </div>
                </div>
              </div>

            </div>
          ) : (
            /* ACTIVE CHAT STREAM VIEW */
            <div className="p-6 max-w-4xl mx-auto w-full space-y-6 flex-1">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    "flex gap-4 animate-in fade-in duration-200",
                    msg.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  {msg.role === "assistant" && (
                    <div className="size-8 rounded-lg bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center text-white shrink-0 mt-1 shadow-md">
                      <IconSparkles className="size-4" />
                    </div>
                  )}

                  <div className={cn(
                    "group relative px-4 py-2.5 rounded-2xl max-w-[85%] text-sm leading-relaxed shadow-sm flex flex-col",
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground rounded-tr-sm"
                      : "bg-card border border-border rounded-tl-sm text-foreground overflow-x-auto"
                  )}>
                    {msg.role === "assistant" ? (
                      <div className="prose prose-sm dark:prose-invert max-w-none break-words text-foreground">
                        <ReactMarkdown 
                          remarkPlugins={[remarkGfm]}
                          components={{
                            code({node, inline, className, children, ...props}: any) {
                              const match = /language-(\w+)/.exec(className || '')
                              return !inline && match ? (
                                <div className="relative mt-2 mb-2 rounded-md bg-muted p-3 border border-border overflow-x-auto font-mono text-[13px]">
                                  <code className={className} {...props}>
                                    {children}
                                  </code>
                                </div>
                              ) : (
                                <code className="bg-muted px-1.5 py-0.5 rounded-md font-mono text-[13px]" {...props}>
                                  {children}
                                </code>
                              )
                            }
                          }}
                        >
                          {msg.content}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <div className="whitespace-pre-wrap select-text font-sans">
                        {msg.content}
                      </div>
                    )}

                    {/* Only show the divider and tools for the assistant to keep user bubbles tight */}
                    {msg.role === "assistant" && (
                      <div className="flex items-center justify-between mt-3 pt-2 border-t border-border/20 text-[10px] opacity-70">
                        <span>{msg.timestamp}</span>
                        <button
                          onClick={() => handleCopyMessage(msg.id, msg.content)}
                          className="hover:text-primary transition-colors p-1"
                          title="Copy response"
                        >
                          {copiedMsgId === msg.id ? <IconCheck className="size-3 text-emerald-400" /> : <IconCopy className="size-3" />}
                        </button>
                      </div>
                    )}
                    {msg.role === "user" && (
                      <div className="text-[10px] opacity-60 mt-1 self-end text-primary-foreground">
                        {msg.timestamp}
                      </div>
                    )}
                  </div>

                  {msg.role === "user" && (
                    <div className="size-8 rounded-lg bg-muted border border-border flex items-center justify-center text-foreground shrink-0 mt-1">
                      <IconUser className="size-4" />
                    </div>
                  )}
                </div>
              ))}

              {isGenerating && (
                <div className="flex gap-4 items-center text-sm text-muted-foreground animate-pulse">
                  <div className="size-8 rounded-lg bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center text-white shrink-0">
                    <IconSparkles className="size-4 animate-spin" />
                  </div>
                  <div className="p-3 bg-card border border-border rounded-2xl text-xs">
                    RhOps AI is analyzing cluster telemetry...
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* BOTTOM STICKY INPUT BAR (Active when messages exist) */}
        {messages.length > 0 && (
          <div className="p-4 border-t border-border bg-card/30 shrink-0">
            <div className="max-w-4xl mx-auto w-full relative bg-card border border-border/80 rounded-2xl p-2 shadow-lg focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20 transition-all flex items-center gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendPrompt(input);
                  }
                }}
                placeholder="Ask follow-up question..."
                rows={1}
                className="flex-1 bg-transparent text-foreground px-3 py-2 text-sm focus:outline-none placeholder:text-muted-foreground resize-none min-h-[40px] custom-scrollbar"
              />
              <button
                onClick={() => handleSendPrompt(input)}
                disabled={!input.trim() || isGenerating}
                className="p-2.5 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 disabled:opacity-50 transition-all shadow-sm shrink-0"
              >
                <IconArrowUp className="size-4" stroke={2.5} />
              </button>
            </div>
          </div>
        )}

      </div>

      {/* RIGHT SIDEBAR: Chat Histories */}
      <div className="w-72 lg:w-80 shrink-0 border-l border-border bg-card/40 flex flex-col h-full overflow-hidden">

        {/* History Header */}
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
            <IconMessage2 className="size-4 text-muted-foreground" />
            Chat History
          </h3>
          <button
            onClick={handleStartNewChat}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-primary text-primary-foreground text-xs font-semibold rounded-lg hover:bg-primary/90 transition-all shadow-sm"
          >
            <IconPlus className="size-3.5" />
            <span>New Chat</span>
          </button>
        </div>

        {/* History List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1 custom-scrollbar">
          {conversations.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground text-xs italic">
              No previous chats found
            </div>
          ) : (
            conversations.map((conv) => {
              const isActive = conv.id === activeConvId;
              return (
                <div
                  key={conv.id}
                  onClick={() => handleSelectConv(conv.id)}
                  className={cn(
                    "px-3 py-2.5 rounded-xl border text-xs cursor-pointer transition-all flex items-start justify-between gap-2 group",
                    isActive
                      ? "bg-primary/10 border-primary/30 text-foreground font-medium shadow-sm"
                      : "bg-card/60 hover:bg-card border-border/50 text-muted-foreground hover:text-foreground"
                  )}
                >
                  <div className="flex-1 min-w-0">
                    <p className="truncate font-medium text-foreground">{conv.title}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">{conv.timestamp}</p>
                  </div>

                  <button
                    onClick={(e) => handleDeleteConv(e, conv.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-red-500 rounded transition-all"
                    title="Delete Chat"
                  >
                    <IconTrash className="size-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>

      </div>

    </div>
  );
}

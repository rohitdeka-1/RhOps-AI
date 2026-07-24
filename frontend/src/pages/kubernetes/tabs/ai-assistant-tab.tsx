import { useState, useRef, useEffect } from "react";
import {
  IconSparkles, IconArrowUp, IconUser, IconPlus, IconTrash,
  IconMessage2, IconCpu, IconAlertCircle, IconFileCode,
  IconCheck, IconCopy, IconRefresh, IconSearch
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth/auth-provider";
import { api } from "@/lib/api";

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

  // Initial mock history
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: "conv-1",
      title: "Cluster Health & Crash Loop Check",
      timestamp: "Today, 6:15 PM",
      messages: [
        {
          id: "m1",
          role: "user",
          content: "Check logs for crash-looping or failing pods in namespace qrt.",
          timestamp: "6:15 PM"
        },
        {
          id: "m2",
          role: "assistant",
          content: "### Cluster Diagnostic Summary\n\n- **Cluster Name:** `qrt` (Kind local)\n- **Active Pods:** 8 Running, 0 Failed\n- **Identified Warnings:** 2 pods in `backend` deployment reported Prisma TLS connection retry warnings during startup, but successfully established connection.\n\nAll services (`backend`, `frontend`, `postgres`, `redis`) are currently operating normally on port 8080.",
          timestamp: "6:15 PM"
        }
      ]
    },
    {
      id: "conv-2",
      title: "Prisma & Redis TLS Debugging",
      timestamp: "Yesterday",
      messages: [
        {
          id: "m3",
          role: "user",
          content: "Why did backend report PrismaClientKnownRequestError SSL connection issue?",
          timestamp: "Yesterday"
        },
        {
          id: "m4",
          role: "assistant",
          content: "The Prisma client attempted to establish a TLS/SSL connection with PostgreSQL (`postgres-0`), but `postgres` was configured without SSL. Adding `?sslmode=disable` to `DATABASE_URL` resolved the fallback negotiation.",
          timestamp: "Yesterday"
        }
      ]
    }
  ]);

  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  const handleDeleteConv = (e: React.MouseEvent, convId: string) => {
    e.stopPropagation();
    setConversations(prev => prev.filter(c => c.id !== convId));
    if (activeConvId === convId) {
      setActiveConvId(null);
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

    // Simulate Gemini AI Response
    setTimeout(() => {
      let aiContent = "";

      const lower = text.toLowerCase();
      if (lower.includes("health") || lower.includes("check")) {
        aiContent = `### 🌟 Gemini Cluster Diagnostics\n\nI have scanned cluster **${cluster?.name || "Production"}**:\n\n- **Status:** Healthy (100% workloads ready)\n- **Pods Running:** 8 Pods across namespace \`qrt\`\n- **Memory & CPU:** Utilization is within nominal thresholds (14m CPU / 52Mi RAM average).\n\nNo active crash loops or node starvation detected.`;
      } else if (lower.includes("crash") || lower.includes("log") || lower.includes("debug")) {
        aiContent = `### 🔍 Log Stream Diagnostic\n\nAnalyzed latest logs for **backend-646d8c64b4** & **postgres-0**:\n\n1. **PostgreSQL:** Listening on \`0.0.0.0:5432\` — ready to accept TCP connections.\n2. **Backend:** Database schema synchronized with Prisma v6.19.3.\n\nEverything is operational. No critical exceptions recorded.`;
      } else if (lower.includes("manifest") || lower.includes("yaml")) {
        aiContent = `Here is a production-ready Kubernetes deployment manifest:\n\n\`\`\`yaml\napiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: sample-app\n  namespace: qrt\n  labels:\n    app: sample-app\nspec:\n  replicas: 2\n  selector:\n    matchLabels:\n      app: sample-app\n  template:\n    metadata:\n      labels:\n        app: sample-app\n    spec:\n      containers:\n      - name: web\n        image: nginx:alpine\n        ports:\n        - containerPort: 80\n        resources:\n          requests:\n            cpu: "50m"\n            memory: "64Mi"\n\`\`\``;
      } else {
        aiContent = `I am analyzing your request regarding **${text}** across cluster **${cluster?.name || "Production"}**.\n\nAll node telemetry, pods, and streaming services are active. Let me know if you need specific manifest generations or deep log diagnostics!`;
      }

      const aiMessage: Message = {
        id: "msg-" + (Date.now() + 1),
        role: "assistant",
        content: aiContent,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setConversations(prev => prev.map(c => {
        if (c.id === targetConvId) {
          return { ...c, messages: [...c.messages, aiMessage] };
        }
        return c;
      }));

      setIsGenerating(false);
    }, 1200);
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

        {/* TOP HEADER */}
        <div className="px-6 py-4 border-b border-border bg-card/20 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="size-8 rounded-lg bg-gradient-to-tr from-blue-600 via-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-md">
              <IconSparkles className="size-5" />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight text-foreground flex items-center gap-2">
                RhOps AI Assistant
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                  Gemini 3.5 Pro
                </span>
              </h1>
              <p className="text-xs text-muted-foreground">Connected to cluster: <span className="font-mono text-foreground">{cluster?.name || "Production"}</span></p>
            </div>
          </div>
        </div>

        {/* MESSAGES AREA / HERO VIEW */}
        <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col">
          {messages.length === 0 ? (
            /* CENTER HERO SCREEN (Google AI style) */
            <div className="flex-1 flex flex-col items-center justify-center p-6 max-w-3xl mx-auto w-full my-auto text-center space-y-8 animate-in fade-in zoom-in-95 duration-300">

              {/* Gemini Hero Header */}
              <div className="space-y-3 flex flex-col items-center">
                <div className="size-16 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-xl shadow-primary/20 animate-pulse">
                  <IconSparkles className="size-9" />
                </div>
                <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                  Hello, <span className="bg-gradient-to-r from-blue-500 via-indigo-400 to-purple-500 bg-clip-text text-transparent">{user?.name || user?.username || "Operator"}</span>
                </h2>
                <p className="text-muted-foreground text-sm max-w-lg leading-relaxed">
                  How can I assist your Kubernetes cluster today? Ask anything about logs, pod diagnostics, or manifest generation.
                </p>
              </div>

              {/* CENTER SEARCH / PROMPT INPUT */}
              <div className="w-full max-w-2xl bg-card border border-border/80 rounded-2xl p-3 shadow-xl focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
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
                  className="w-full bg-transparent text-foreground p-2 text-sm focus:outline-none placeholder:text-muted-foreground resize-none"
                />
                <div className="flex items-center justify-between pt-2 border-t border-border/40">
                  <span className="text-[11px] text-muted-foreground px-2">Press Enter to send</span>
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

              {/* SUGGESTED PROMPT CARDS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl text-left">
                {suggestedPrompts.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendPrompt(item.prompt)}
                    className="p-3.5 bg-card/60 hover:bg-card border border-border rounded-xl shadow-sm hover:border-primary/40 transition-all group flex flex-col justify-between gap-2"
                  >
                    <div className="flex items-center gap-2">
                      <div className={cn("p-1.5 rounded-lg border", item.color)}>
                        <item.icon className="size-4" />
                      </div>
                      <span className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">{item.title}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">{item.prompt}</p>
                  </button>
                ))}
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
                    "group relative p-4 rounded-2xl max-w-[85%] text-sm leading-relaxed shadow-sm",
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground rounded-tr-xs"
                      : "bg-card border border-border rounded-tl-xs text-foreground"
                  )}>
                    <div className="whitespace-pre-wrap select-text font-sans">
                      {msg.content}
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-border/20 text-[10px] opacity-70">
                      <span>{msg.timestamp}</span>
                      {msg.role === "assistant" && (
                        <button
                          onClick={() => handleCopyMessage(msg.id, msg.content)}
                          className="hover:text-primary transition-colors p-1"
                          title="Copy response"
                        >
                          {copiedMsgId === msg.id ? <IconCheck className="size-3 text-emerald-400" /> : <IconCopy className="size-3" />}
                        </button>
                      )}
                    </div>
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
        <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
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
                    "p-3 rounded-xl border text-xs cursor-pointer transition-all flex items-start justify-between gap-2 group",
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

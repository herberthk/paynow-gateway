"use client";
import { useState, useRef, useEffect } from "react";
import {
  MessageCircle,
  X,
  Send,
  Sparkles,
  Loader2,
  Bot,
  User,
  Wrench,
  CheckCircle2,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { useChat } from "@ai-sdk/react";
import type { UIMessage } from "ai";

type ConnectionStatus = "connected" | "offline" | "reconnecting";

// --- Helpers to extract content from UIMessage parts ---
const getMessageText = (msg: UIMessage): string => {
  return (
    msg.parts
      ?.filter(
        (
          p,
        ): p is { type: "text"; text: string; state?: "streaming" | "done" } =>
          p.type === "text",
      )
      .map((p) => p.text)
      .join("") || ""
  );
};

const hasTextContent = (msg: UIMessage): boolean => {
  return (
    msg.parts?.some(
      (p) => p.type === "text" && (p as { text: string }).text?.trim(),
    ) ?? false
  );
};

type ToolInvocationPart = {
  type: "tool-invocation";
  toolInvocation: {
    toolCallId: string;
    toolName: string;
    state: string;
  };
};

// Get tool invocations from message parts
const getToolInvocations = (msg: UIMessage): ToolInvocationPart[] => {
  return (msg.parts?.filter((p) => p.type === "tool-invocation") ??
    []) as unknown as ToolInvocationPart[];
};

// Map tool names to human-readable labels
const toolLabel: Record<string, string> = {
  getWalletBalance: "Fetching wallet balance",
  getDashboardStats: "Fetching dashboard stats",
  getRecentTransactions: "Fetching recent transactions",
  getAnalytics: "Fetching analytics",
  getUserProfile: "Fetching profile",
};

// ToolCallBadge — shown inline inside an assistant bubble
const ToolCallBadge = ({
  toolName,
  state,
}: {
  toolName: string;
  state: string;
}) => {
  const label = toolLabel[toolName] ?? toolName;
  const isDone = state === "result";

  return (
    <div
      className={`flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg mb-2 w-fit border
        ${
          isDone
            ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400"
            : "bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-400"
        }`}
    >
      {isDone ? (
        <CheckCircle2 size={12} className="shrink-0" />
      ) : (
        <Wrench size={12} className="shrink-0 animate-pulse" />
      )}
      <span>{isDone ? label.replace("Fetching", "Fetched") : `${label}…`}</span>
    </div>
  );
};

const DashboardAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [text, setText] = useState("");
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("connected");
  const [showOnlineBadge, setShowOnlineBadge] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const retryIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const {
    messages,
    sendMessage,
    status,
    regenerate,
    error: chatError,
  } = useChat({
    messages: [
      {
        id: "welcome",
        role: "assistant",
        parts: [
          {
            type: "text",
            text: "Hello! I am your PayNow Analytics Assistant. I have access to your dashboard data. Ask me about **revenue trends**, **recent transactions**, or **anything about your finances**.",
          },
        ],
      },
    ] as UIMessage[],
    onError: (error) => {
      const msg = error.message?.toLowerCase() || "";
      if (
        msg.includes("fetch failed") ||
        msg.includes("network") ||
        msg.includes("failed to fetch")
      ) {
        setConnectionStatus("offline");
      }
    },
  });

  const isLoading = status === "submitted" || status === "streaming";

  // Determine what the AI is currently doing for the loading indicator
  const getLoadingLabel = (): string => {
    if (status !== "streaming") return "Thinking…";
    // Check the last assistant message for in-progress tool calls
    const lastAssistant = [...messages]
      .reverse()
      .find((m) => m.role === "assistant");
    if (lastAssistant) {
      const activeTools = getToolInvocations(lastAssistant).filter(
        (t) => t.toolInvocation.state !== "result",
      );
      if (activeTools.length > 0) {
        const name = activeTools[0].toolInvocation.toolName;
        return toolLabel[name] ?? "Fetching data…";
      }
    }
    return "Thinking…";
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  // Connectivity listener
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setConnectionStatus(navigator.onLine ? "connected" : "offline");

    const handleOnline = () => {
      setConnectionStatus("reconnecting");
      setTimeout(() => {
        setConnectionStatus("connected");
        setShowOnlineBadge(true);
        setTimeout(() => setShowOnlineBadge(false), 3000);
      }, 1500);
    };

    const handleOffline = () => {
      setConnectionStatus("offline");
      setShowOnlineBadge(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    if (connectionStatus === "offline") {
      retryIntervalRef.current = setInterval(() => {
        if (navigator.onLine) handleOnline();
      }, 5000);
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      if (retryIntervalRef.current) clearInterval(retryIntervalRef.current);
    };
  }, [connectionStatus]);

  const handleSend = async () => {
    if (connectionStatus === "offline" || isLoading || !text.trim()) return;
    sendMessage({ text });
    setText("");
  };

  const handleRetry = () => {
    if (connectionStatus === "offline") return;
    regenerate();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-4 cursor-pointer right-4 z-40 p-3 rounded-full shadow-xl transition-all duration-300 hover:scale-105 ${
          isOpen ? "bg-red-500 rotate-90" : "bg-indigo-600 hover:bg-indigo-700"
        } text-white`}
      >
        {isOpen ? <X size={20} /> : <MessageCircle size={20} />}
      </button>

      {/* Chat Interface */}
      <div
        className={`fixed bottom-18 right-4 w-96 max-w-[calc(100vw-3rem)] bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-slate-700 z-40 flex flex-col transition-all duration-300 origin-bottom-right ${
          isOpen
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-95 translate-y-4 pointer-events-none"
        }`}
        style={{ height: "80vh" }}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-100 dark:border-slate-700 bg-linear-to-r from-indigo-600 to-purple-600 rounded-t-2xl flex items-center gap-3">
          <div className="bg-white/20 p-2 rounded-lg">
            <Sparkles className="text-white" size={20} />
          </div>
          <div>
            <h3 className="font-bold text-white">PayNow AI</h3>
            {connectionStatus === "connected" ? (
              <p className="text-xs text-indigo-100 flex items-center gap-1">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                Online & Connected
              </p>
            ) : (
              <p className="text-xs text-red-100 flex items-center gap-1">
                <span className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
                Offline
              </p>
            )}
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50 dark:bg-slate-900/50">
          {messages.map((msg) => {
            const msgText = getMessageText(msg);
            const toolInvocations = getToolInvocations(msg);
            const hasText = hasTextContent(msg);

            // Skip assistant messages that are purely tool-call intermediaries
            // (no text content at all and no tool results yet — avoids empty bubbles)
            if (
              msg.role === "assistant" &&
              !hasText &&
              toolInvocations.length === 0
            ) {
              return null;
            }

            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${
                  msg.role === "user" ? "flex-row-reverse" : "flex-row"
                }`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    msg.role === "user"
                      ? "bg-gray-200 dark:bg-slate-700 text-gray-600 dark:text-gray-300"
                      : "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
                  }`}
                >
                  {msg.role === "user" ? <User size={16} /> : <Bot size={16} />}
                </div>

                {/* Bubble */}
                {msg.role === "assistant" ? (
                  <div className="max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 text-gray-800 dark:text-gray-200 rounded-tl-none">
                    {/* Tool call badges */}
                    {toolInvocations.map((invocationPart) => {
                      const inv = invocationPart.toolInvocation;
                      return (
                        <ToolCallBadge
                          key={inv.toolCallId}
                          toolName={inv.toolName}
                          state={inv.state}
                        />
                      );
                    })}

                    {/* Text response */}
                    {hasText && (
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          p: ({ node, ...props }) => (
                            <p className="mb-2 last:mb-0" {...props} />
                          ),
                          a: ({ node, ...props }) => (
                            <a
                              className="text-indigo-600 hover:underline"
                              target="_blank"
                              rel="noopener noreferrer"
                              {...props}
                            />
                          ),
                          ul: ({ node, ...props }) => (
                            <ul
                              className="list-disc ml-4 mb-2 space-y-1"
                              {...props}
                            />
                          ),
                          ol: ({ node, ...props }) => (
                            <ol
                              className="list-decimal ml-4 mb-2 space-y-1"
                              {...props}
                            />
                          ),
                          li: ({ node, ...props }) => (
                            <li className="pl-1" {...props} />
                          ),
                          h1: ({ node, ...props }) => (
                            <h1
                              className="text-lg font-bold mb-2 mt-1"
                              {...props}
                            />
                          ),
                          h2: ({ node, ...props }) => (
                            <h2
                              className="text-base font-bold mb-2 mt-1"
                              {...props}
                            />
                          ),
                          h3: ({ node, ...props }) => (
                            <h3
                              className="text-sm font-bold mb-1 mt-1"
                              {...props}
                            />
                          ),
                          blockquote: ({ node, ...props }) => (
                            <blockquote
                              className="border-l-4 border-indigo-300 pl-3 italic text-gray-600 dark:text-gray-400 my-2"
                              {...props}
                            />
                          ),
                          code: ({ node, ...props }) => (
                            <code
                              className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-xs font-mono text-indigo-600 dark:text-indigo-400"
                              {...props}
                            />
                          ),
                          pre: ({ node, ...props }) => (
                            <pre
                              className="bg-gray-900 text-gray-100 p-3 rounded-lg text-xs overflow-x-auto my-2"
                              {...props}
                            />
                          ),
                          table: ({ node, ...props }) => (
                            <div className="overflow-x-auto my-3">
                              <table
                                className="min-w-full divide-y divide-gray-200 dark:divide-slate-600 border border-gray-200 dark:border-slate-600 rounded-lg overflow-hidden"
                                {...props}
                              />
                            </div>
                          ),
                          th: ({ node, ...props }) => (
                            <th
                              className="px-3 py-2 bg-gray-50 dark:bg-slate-800 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-slate-600"
                              {...props}
                            />
                          ),
                          td: ({ node, ...props }) => (
                            <td
                              className="px-3 py-2 whitespace-nowrap text-xs text-gray-600 dark:text-gray-300 border-b border-gray-100 dark:border-slate-700"
                              {...props}
                            />
                          ),
                        }}
                      >
                        {msgText}
                      </ReactMarkdown>
                    )}
                  </div>
                ) : (
                  <div className="max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap bg-gray-800 dark:bg-slate-600 text-white rounded-tr-none">
                    {msgText}
                  </div>
                )}
              </div>
            );
          })}

          {/* Loading / streaming indicator */}
          {isLoading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                <Bot size={16} />
              </div>
              <div className="bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 p-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2">
                <Loader2
                  size={16}
                  className="animate-spin text-indigo-600 dark:text-indigo-400 shrink-0"
                />
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {getLoadingLabel()}
                </span>
              </div>
            </div>
          )}

          {/* Error + retry */}
          {chatError && !isLoading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 text-red-500 flex items-center justify-center shrink-0">
                <Bot size={16} />
              </div>
              <div className="bg-white dark:bg-slate-700 border border-red-200 dark:border-red-800 p-3 rounded-2xl rounded-tl-none shadow-sm space-y-2">
                <p className="text-xs text-red-600 dark:text-red-400">
                  Something went wrong. Please try again.
                </p>
                <button
                  onClick={handleRetry}
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Retry
                </button>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-b-2xl">
          <div className="relative">
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Ask about revenue, disputes..."
              className="w-full pl-4 pr-12 py-3 bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all text-sm"
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !text.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 dark:disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
            >
              <Send size={16} />
            </button>
          </div>
          <div className="mt-2 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {[
              "Revenue summary",
              "Recent transactions",
              "My wallet balance",
            ].map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => sendMessage({ text: suggestion })}
                className="whitespace-nowrap px-3 py-1 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-full text-xs text-gray-600 dark:text-gray-300 transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default DashboardAssistant;

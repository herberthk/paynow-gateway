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
} from "lucide-react";
import { GoogleGenAI } from "@google/genai";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  currentUser,
  transactions,
  revenueData,
  categoryData,
  auditLogs,
  mockWebhookLogs,
  successRateData,
} from "@/services/mockData";

interface Message {
  id: string;
  role: "user" | "model";
  text: string;
  timestamp: Date;
}

const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY as string;

const DashboardAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "model",
      text: "Hello! I am your PayNow Analytics Assistant. I have access to your dashboard data. Ask me about **revenue trends**, **recent transactions**, or **system health**.",
      timestamp: new Date(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      text: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Prepare context data
      const dataContext = JSON.stringify({
        userProfile: currentUser,
        recentTransactions: transactions,
        revenueMetrics: revenueData,
        spendingCategories: categoryData,
        transactionSuccessRates: successRateData,
        auditTrail: auditLogs,
        webhookActivity: mockWebhookLogs,
      });

      const ai = new GoogleGenAI({ apiKey: API_KEY });

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-lite-preview-09-2025",
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `System Context: You are PayNow AI, an embedded analytics assistant. You have access to the following dashboard data: ${dataContext}. 
              
              Instructions:
              1. Answer the user's question based strictly on the provided data.
              2. Be concise, professional, and data-driven.
              3. If the answer requires calculation (e.g., total revenue), perform it.
              4. Format key numbers clearly.
              5. Use Markdown formatting:
                 - Use **bold** for key figures and important terms.
                 - Use lists (bullets) for summarizing multiple items.
                 - Use tables for comparing data if applicable.
              
              User Question: ${userMessage.text}`,
              },
            ],
          },
        ],
      });

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "model",
        text: response.text || "I couldn't process that request.",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("AI Error:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "model",
        text: "I'm having trouble connecting to the intelligence engine. Please ensure the API key is configured.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
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
        style={{ height: "500px", maxHeight: "80vh" }}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-100 dark:border-slate-700 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-t-2xl flex items-center gap-3">
          <div className="bg-white/20 p-2 rounded-lg">
            <Sparkles className="text-white" size={20} />
          </div>
          <div>
            <h3 className="font-bold text-white">PayNow AI</h3>
            <p className="text-xs text-indigo-100 flex items-center gap-1">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              Online & Connected
            </p>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50 dark:bg-slate-900/50">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${
                msg.role === "user" ? "flex-row-reverse" : "flex-row"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  msg.role === "user"
                    ? "bg-gray-200 dark:bg-slate-700 text-gray-600 dark:text-gray-300"
                    : "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
                }`}
              >
                {msg.role === "user" ? <User size={16} /> : <Bot size={16} />}
              </div>

              {msg.role === "model" ? (
                <div
                  className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 text-gray-800 dark:text-gray-200 rounded-tl-none`}
                >
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
                    {msg.text}
                  </ReactMarkdown>
                </div>
              ) : (
                <div className="max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap bg-gray-800 dark:bg-slate-600 text-white rounded-tr-none">
                  {msg.text}
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center flex-shrink-0">
                <Bot size={16} />
              </div>
              <div className="bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 p-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2">
                <Loader2
                  size={16}
                  className="animate-spin text-indigo-600 dark:text-indigo-400"
                />
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Thinking...
                </span>
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
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Ask about revenue, disputes..."
              className="w-full pl-4 pr-12 py-3 bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all text-sm"
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 dark:disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
            >
              <Send size={16} />
            </button>
          </div>
          <div className="mt-2 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {[
              "Revenue summary",
              "Show failed webhooks",
              "My wallet balance",
            ].map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => setInput(suggestion)}
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

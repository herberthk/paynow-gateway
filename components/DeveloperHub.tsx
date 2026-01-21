"use client";
import React, { useState } from "react";

import {
  mockApiKeys,
  mockWebhooks,
  mockWebhookLogs,
} from "@/services/mockData";
import {
  Copy,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  RefreshCw,
  Activity,
  Check,
  AlertTriangle,
  Key,
  X,
  Globe,
  Zap,
  BarChart2,
  Lock,
} from "lucide-react";
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useNotificationStore } from "@/store";

const DeveloperHub: React.FC = () => {
  const notify = useNotificationStore((state) => state.notify);
  const [activeTab, setActiveTab] = useState<"keys" | "webhooks">("keys");
  const [keys, setKeys] = useState(mockApiKeys);
  const [webhooks, setWebhooks] = useState(mockWebhooks);
  const [webhookLogs, setWebhookLogs] = useState(mockWebhookLogs);
  const [showKey, setShowKey] = useState<Record<string, boolean>>({});
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);
  const [retryingLogId, setRetryingLogId] = useState<string | null>(null);
  const [testingWebhookId, setTestingWebhookId] = useState<string | null>(null);

  // Webhook Modal State
  const [isWebhookModalOpen, setIsWebhookModalOpen] = useState(false);
  const [newWebhookUrl, setNewWebhookUrl] = useState("");
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [eventFilter, setEventFilter] = useState("all");

  const availableEvents = [
    "payment.success",
    "payment.failed",
    "payment.captured",
    "payment.refunded",
    "transfer.initiated",
    "transfer.completed",
    "transfer.failed",
    "refund.processed",
    "refund.failed",
    "dispute.created",
    "dispute.resolved",
    "dispute.closed",
    "user.created",
    "user.updated",
    "user.kyc_verified",
  ];

  const eventCategories = [
    "all",
    "payment",
    "transfer",
    "refund",
    "dispute",
    "user",
  ];

  const filteredEvents =
    eventFilter === "all"
      ? availableEvents
      : availableEvents.filter((e) => e.startsWith(eventFilter));

  const toggleKeyVisibility = (id: string) => {
    setShowKey((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const copyToClipboard = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKeyId(id);
    notify("success", "Copied to clipboard!");
    setTimeout(() => setCopiedKeyId(null), 2000);
  };

  const handleCreateKey = () => {
    const newKey: ApiKey = {
      id: `key_${Date.now()}`,
      name: "New API Key",
      key: `sk_live_${Math.random().toString(36).substring(2, 15)}`,
      type: "SECRET",
      created: new Date().toISOString().split("T")[0],
      lastUsed: "Never",
      masked: false,
      usageToday: 0,
      rateLimitRemaining: 100000,
      usageHistory: Array.from({ length: 30 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (29 - i));
        return {
          date: date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          }),
          count: 0,
        };
      }),
    };
    setKeys([newKey, ...keys]);
    notify("success", "New secret key generated. Save it now!");
  };

  const handleDeleteKey = (id: string) => {
    setKeys(keys.filter((k) => k.id !== id));
    notify("info", "API Key revoked successfully.");
  };

  const handleDeleteWebhook = (id: string) => {
    setWebhooks(webhooks.filter((w) => w.id !== id));
    notify("info", "Webhook endpoint removed.");
  };

  const handleAddWebhook = () => {
    setNewWebhookUrl("");
    setSelectedEvents([]);
    setEventFilter("all");
    setIsWebhookModalOpen(true);
  };

  const toggleEvent = (event: string) => {
    if (selectedEvents.includes(event)) {
      setSelectedEvents(selectedEvents.filter((e) => e !== event));
    } else {
      setSelectedEvents([...selectedEvents, event]);
    }
  };

  const handleSaveWebhook = () => {
    if (!newWebhookUrl) {
      notify("error", "Please enter a valid URL");
      return;
    }
    try {
      new URL(newWebhookUrl);
    } catch {
      notify("error", "Invalid URL format");
      return;
    }

    if (selectedEvents.length === 0) {
      notify("error", "Please select at least one event");
      return;
    }

    const newWebhook: WebhookEndpoint = {
      id: `wh_${Date.now()}`,
      url: newWebhookUrl,
      events: selectedEvents,
      status: "ACTIVE",
      secret: `whsec_${Math.random().toString(36).substring(2)}`,
      created: new Date().toISOString().split("T")[0],
    };

    setWebhooks([newWebhook, ...webhooks]);
    notify("success", "Webhook endpoint added successfully");
    setIsWebhookModalOpen(false);
  };

  const handleRetryWebhook = (originalLog: WebhookLog) => {
    setRetryingLogId(originalLog.id);

    // Simulate network delay and retry attempt (create new log entry)
    setTimeout(() => {
      const newLog: WebhookLog = {
        id: `wl_retry_${Date.now()}`,
        endpointId: originalLog.endpointId,
        event: originalLog.event,
        status: 200, // Simulate success on retry
        timestamp: new Date().toISOString().replace("T", " ").split(".")[0],
        duration: Math.floor(Math.random() * 100) + 50,
      };

      setWebhookLogs((prevLogs) => [newLog, ...prevLogs]);
      setRetryingLogId(null);
      notify("success", "Webhook payload resent. New attempt logged.");
    }, 1500);
  };

  const handleTestWebhook = (webhookId: string) => {
    setTestingWebhookId(webhookId);

    // Simulate sending a test ping
    setTimeout(() => {
      const newLog: WebhookLog = {
        id: `wl_test_${Date.now()}`,
        endpointId: webhookId,
        event: "test.ping",
        status: 200,
        timestamp: new Date().toISOString().replace("T", " ").split(".")[0],
        duration: Math.floor(Math.random() * 40) + 20,
      };

      setWebhookLogs((prevLogs) => [newLog, ...prevLogs]);
      setTestingWebhookId(null);
      notify("success", "Test event sent successfully!");
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
          Developer Settings
        </h2>
        <div className="flex bg-white dark:bg-slate-800 rounded-lg p-1 border border-gray-200 dark:border-slate-700 shadow-sm transition-colors">
          <button
            onClick={() => setActiveTab("keys")}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
              activeTab === "keys"
                ? "bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            API Keys
          </button>
          <button
            onClick={() => setActiveTab("webhooks")}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
              activeTab === "webhooks"
                ? "bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            Webhooks
          </button>
        </div>
      </div>

      {activeTab === "keys" ? (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm transition-colors">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  API Keys
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Manage your secret and public keys for API access.
                </p>
              </div>
              <button
                onClick={handleCreateKey}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                <Plus size={16} /> Generate New Key
              </button>
            </div>

            <div className="space-y-4">
              {keys.map((key) => (
                <div
                  key={key.id}
                  className="border border-gray-200 dark:border-slate-700 rounded-lg p-4 hover:border-indigo-100 dark:hover:border-indigo-900/50 transition-colors bg-white dark:bg-slate-800"
                >
                  <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-4">
                    <div className="flex-1 w-full">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div
                            className={`p-2 rounded-lg ${key.type === "SECRET" ? "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400" : "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"}`}
                          >
                            <Key size={18} />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white">
                              {key.name}
                            </h4>
                            <span
                              className={`text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded ${key.type === "SECRET" ? "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300" : "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"}`}
                            >
                              {key.type}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteKey(key.id)}
                          className="md:hidden p-2 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      <div className="bg-gray-50 dark:bg-slate-700/50 rounded border border-gray-200 dark:border-slate-700 p-3 flex items-center justify-between gap-4 font-mono text-sm mb-3">
                        <span className="truncate text-gray-700 dark:text-gray-300 w-full">
                          {key.type === "SECRET" &&
                          !showKey[key.id] &&
                          key.masked
                            ? "sk_live_************************"
                            : key.key}
                        </span>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {key.type === "SECRET" && (
                            <button
                              onClick={() => toggleKeyVisibility(key.id)}
                              className="text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                            >
                              {showKey[key.id] ? (
                                <EyeOff size={16} />
                              ) : (
                                <Eye size={16} />
                              )}
                            </button>
                          )}
                          <button
                            onClick={() => copyToClipboard(key.id, key.key)}
                            className={`transition-colors ${copiedKeyId === key.id ? "text-green-600 dark:text-green-400" : "text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400"}`}
                            title="Copy API Key"
                          >
                            {copiedKeyId === key.id ? (
                              <Check size={16} />
                            ) : (
                              <Copy size={16} />
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          Created: {key.created}
                        </span>
                        <span className="flex items-center gap-1">
                          Last used: {key.lastUsed}
                        </span>
                        <span className="hidden sm:inline text-gray-300 dark:text-gray-600">
                          |
                        </span>
                        <span className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-medium">
                          <BarChart2 size={14} /> Calls Today:{" "}
                          {key.usageToday.toLocaleString()}
                        </span>
                        <span className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300 font-medium">
                          <Activity
                            size={14}
                            className="text-orange-500 dark:text-orange-400"
                          />{" "}
                          Limit Remaining:{" "}
                          {key.rateLimitRemaining.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="w-full md:w-1/3 flex flex-col items-end">
                      <div className="flex justify-end mb-2">
                        <button
                          onClick={() => handleDeleteKey(key.id)}
                          className="hidden md:block p-2 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <div className="h-20 w-full mt-auto">
                        <p className="text-[10px] text-gray-400 dark:text-gray-500 mb-1 text-right">
                          30-Day Usage Trend
                        </p>
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={key.usageHistory}>
                            <defs>
                              <linearGradient
                                id={`colorUsage-${key.id}`}
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                              >
                                <stop
                                  offset="5%"
                                  stopColor="#4f46e5"
                                  stopOpacity={0.2}
                                />
                                <stop
                                  offset="95%"
                                  stopColor="#4f46e5"
                                  stopOpacity={0}
                                />
                              </linearGradient>
                            </defs>
                            <Tooltip
                              contentStyle={{
                                fontSize: "12px",
                                padding: "8px",
                                borderRadius: "4px",
                              }}
                              itemStyle={{ color: "#4f46e5" }}
                            />
                            <Area
                              type="monotone"
                              dataKey="count"
                              stroke="#4f46e5"
                              strokeWidth={2}
                              fillOpacity={1}
                              fill={`url(#colorUsage-${key.id})`}
                            />
                            <XAxis dataKey="date" hide />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm transition-colors">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Endpoints
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  HTTP callbacks for real-time event notifications.
                </p>
              </div>
              <button
                onClick={handleAddWebhook}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                <Plus size={16} /> Add Endpoint
              </button>
            </div>

            <div className="space-y-4 mb-8">
              {webhooks.map((wh) => (
                <div
                  key={wh.id}
                  className="border border-gray-200 dark:border-slate-700 rounded-lg p-4"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`w-2 h-2 rounded-full ${wh.status === "ACTIVE" ? "bg-green-500" : "bg-gray-400"}`}
                        ></span>
                        <h4 className="font-semibold text-gray-900 dark:text-white text-sm font-mono">
                          {wh.url}
                        </h4>
                      </div>
                      <div className="flex gap-2 mt-2 flex-wrap mb-3">
                        {wh.events.map((evt) => (
                          <span
                            key={evt}
                            className="px-2 py-0.5 bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 text-xs rounded border border-gray-200 dark:border-slate-600"
                          >
                            {evt}
                          </span>
                        ))}
                      </div>

                      {/* Secret Field */}
                      <div className="flex items-center gap-3 text-sm">
                        <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                          <Lock size={14} />
                          <span className="font-medium">Secret:</span>
                        </div>
                        <div className="flex items-center gap-2 font-mono bg-gray-50 dark:bg-slate-700/50 px-2 py-1 rounded border border-gray-100 dark:border-slate-700 text-xs text-gray-700 dark:text-gray-300">
                          <span>
                            {showKey[wh.id]
                              ? wh.secret
                              : "whsec_••••••••••••••••"}
                          </span>
                          <div className="flex items-center gap-1 ml-1 border-l border-gray-200 dark:border-slate-600 pl-2">
                            <button
                              onClick={() => toggleKeyVisibility(wh.id)}
                              className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors text-gray-400 dark:text-gray-500"
                            >
                              {showKey[wh.id] ? (
                                <EyeOff size={12} />
                              ) : (
                                <Eye size={12} />
                              )}
                            </button>
                            <button
                              onClick={() => copyToClipboard(wh.id, wh.secret)}
                              className={`transition-colors ${copiedKeyId === wh.id ? "text-green-600 dark:text-green-400" : "text-gray-400 dark:text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400"}`}
                            >
                              {copiedKeyId === wh.id ? (
                                <Check size={12} />
                              ) : (
                                <Copy size={12} />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 items-start">
                      <button
                        onClick={() => handleTestWebhook(wh.id)}
                        disabled={testingWebhookId === wh.id}
                        className="flex items-center gap-1.5 text-xs bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 px-3 py-1.5 rounded hover:bg-gray-50 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      >
                        {testingWebhookId === wh.id ? (
                          <>
                            <RefreshCw size={12} className="animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Zap size={12} className="text-yellow-500" />
                            Test
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => handleDeleteWebhook(wh.id)}
                        className="p-1.5 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {webhooks.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  No webhooks configured. Add one to start receiving events.
                </div>
              )}
            </div>

            <h3 className="text-md font-bold text-gray-900 dark:text-white mb-4">
              Recent Delivery Attempts
            </h3>
            <div className="border border-gray-200 dark:border-slate-700 rounded-lg overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 dark:bg-slate-700/50 text-gray-500 dark:text-gray-400">
                  <tr>
                    <th className="px-4 py-2">Status</th>
                    <th className="px-4 py-2">Event</th>
                    <th className="px-4 py-2">Time</th>
                    <th className="px-4 py-2">Duration</th>
                    <th className="px-4 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                  {webhookLogs.map((log) => (
                    <tr
                      key={log.id}
                      className={
                        log.event === "test.ping"
                          ? "bg-indigo-50/30 dark:bg-indigo-900/10"
                          : ""
                      }
                    >
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                            log.status >= 200 && log.status < 300
                              ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                              : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
                          }`}
                        >
                          {log.status >= 200 && log.status < 300 ? (
                            <Check size={12} />
                          ) : (
                            <AlertTriangle size={12} />
                          )}
                          {log.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-900 dark:text-gray-300">
                        {log.event}
                        {log.event === "test.ping" && (
                          <span className="ml-2 text-[10px] bg-gray-200 dark:bg-slate-600 text-gray-600 dark:text-gray-300 px-1.5 py-0.5 rounded">
                            TEST
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                        {log.timestamp}
                      </td>
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                        {log.duration}ms
                      </td>
                      <td className="px-4 py-3">
                        {log.status !== 200 && (
                          <button
                            onClick={() => handleRetryWebhook(log)}
                            disabled={retryingLogId === log.id}
                            className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded border transition-all ${
                              retryingLogId === log.id
                                ? "bg-gray-100 dark:bg-slate-700 text-gray-400 dark:text-gray-500 border-gray-200 dark:border-slate-600 cursor-not-allowed"
                                : "bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-300 dark:hover:border-indigo-500"
                            }`}
                          >
                            <RefreshCw
                              size={12}
                              className={
                                retryingLogId === log.id ? "animate-spin" : ""
                              }
                            />
                            {retryingLogId === log.id
                              ? "Resending..."
                              : "Retry"}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Webhook Creation Modal */}
      {isWebhookModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-800 rounded-xl w-full max-w-lg shadow-2xl overflow-hidden animate-fade-in-up transition-colors">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center bg-gray-50 dark:bg-slate-700/50">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                Add Webhook Endpoint
              </h3>
              <button
                onClick={() => setIsWebhookModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Endpoint URL
                </label>
                <div className="relative">
                  <Globe
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
                    size={16}
                  />
                  <input
                    type="url"
                    value={newWebhookUrl}
                    onChange={(e) => setNewWebhookUrl(e.target.value)}
                    placeholder="https://api.yoursite.com/webhooks"
                    className="w-full bg-white dark:bg-slate-700 text-gray-900 dark:text-white pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  We&apos;ll send a POST request to this URL for the events you
                  select.
                </p>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Events to send
                  </label>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {selectedEvents.length} selected
                  </span>
                </div>

                {/* Filter Chips */}
                <div className="flex gap-2 mb-3 overflow-x-auto pb-1 no-scrollbar">
                  {eventCategories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setEventFilter(cat)}
                      className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors whitespace-nowrap ${
                        eventFilter === cat
                          ? "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800"
                          : "bg-white dark:bg-slate-700 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-600"
                      }`}
                    >
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </button>
                  ))}
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-200 dark:border-slate-700 rounded-lg p-3 bg-gray-50 dark:bg-slate-700/30">
                  {filteredEvents.map((event) => (
                    <label
                      key={event}
                      className="flex items-center gap-3 p-2 hover:bg-white dark:hover:bg-slate-700 rounded cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={selectedEvents.includes(event)}
                        onChange={() => toggleEvent(event)}
                        className="w-4 h-4 text-indigo-600 dark:text-indigo-400 rounded focus:ring-indigo-500 border-gray-300 dark:border-slate-600"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300 font-mono">
                        {event}
                      </span>
                    </label>
                  ))}
                  {filteredEvents.length === 0 && (
                    <p className="text-xs text-gray-400 dark:text-gray-500 text-center py-2">
                      No events found for this category.
                    </p>
                  )}
                </div>
              </div>

              <div className="pt-4 flex gap-3 justify-end">
                <button
                  onClick={() => setIsWebhookModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 font-medium text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveWebhook}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium text-sm flex items-center gap-2"
                >
                  <Zap size={16} /> Create Endpoint
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeveloperHub;

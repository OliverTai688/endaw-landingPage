"use client";

import { useState, useEffect, useCallback } from "react";
import { Mail, Send, CheckCircle, XCircle, RefreshCw, Save, ChevronLeft, ChevronRight } from "lucide-react";

type TemplateType = "ORDER_CONFIRMATION_ORDERER" | "ORDER_CONFIRMATION_ATTENDEE";

interface EmailTemplate {
  id: string;
  type: TemplateType;
  subject: string;
  body: string;
  updatedAt: string;
}

interface EmailLog {
  id: string;
  orderId?: string | null;
  toEmail: string;
  toName?: string | null;
  subject: string;
  templateType?: string | null;
  status: "SENT" | "FAILED";
  error?: string | null;
  sentAt?: string | null;
  createdAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const TEMPLATE_LABELS: Record<TemplateType, string> = {
  ORDER_CONFIRMATION_ORDERER: "訂購人確認信",
  ORDER_CONFIRMATION_ATTENDEE: "參加人通知信",
};

const VARS_HINT: Record<TemplateType, string[]> = {
  ORDER_CONFIRMATION_ORDERER: [
    "{{ordererName}}", "{{orderNumber}}", "{{title}}", "{{totalAmount}}",
    "{{quantity}}", "{{orderMode}}", "{{companyName}}", "{{attendeeList}}",
  ],
  ORDER_CONFIRMATION_ATTENDEE: [
    "{{attendeeName}}", "{{ordererName}}", "{{ordererEmail}}", "{{orderNumber}}", "{{title}}",
  ],
};

export default function EmailManager() {
  const [activeTab, setActiveTab] = useState<"templates" | "logs">("templates");
  const [selectedType, setSelectedType] = useState<TemplateType>("ORDER_CONFIRMATION_ORDERER");
  const [templates, setTemplates] = useState<Record<TemplateType, EmailTemplate | null>>({
    ORDER_CONFIRMATION_ORDERER: null,
    ORDER_CONFIRMATION_ATTENDEE: null,
  });
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const [logs, setLogs] = useState<EmailLog[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [logsLoading, setLogsLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<"" | "SENT" | "FAILED">("");

  // Load templates
  useEffect(() => {
    fetch("/api/bff/v1/admin/email-templates")
      .then((r) => r.json())
      .then((json) => {
        if (!json.success) return;
        const map: Record<TemplateType, EmailTemplate | null> = {
          ORDER_CONFIRMATION_ORDERER: null,
          ORDER_CONFIRMATION_ATTENDEE: null,
        };
        for (const t of json.data as EmailTemplate[]) {
          if (t.type in map) map[t.type as TemplateType] = t;
        }
        setTemplates(map);
      })
      .catch(console.error);
  }, []);

  // Sync editor when selected type changes
  useEffect(() => {
    const t = templates[selectedType];
    setSubject(t?.subject ?? "");
    setBody(t?.body ?? "");
    setSaveMsg(null);
  }, [selectedType, templates]);

  async function handleSave() {
    setSaving(true);
    setSaveMsg(null);
    try {
      const res = await fetch(`/api/bff/v1/admin/email-templates?type=${selectedType}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, body }),
      });
      const json = await res.json();
      if (json.success) {
        setTemplates((prev) => ({ ...prev, [selectedType]: json.data }));
        setSaveMsg({ ok: true, text: "已儲存" });
      } else {
        setSaveMsg({ ok: false, text: json.error ?? "儲存失敗" });
      }
    } catch {
      setSaveMsg({ ok: false, text: "網路錯誤" });
    } finally {
      setSaving(false);
    }
  }

  const fetchLogs = useCallback(async (page = 1) => {
    setLogsLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: "20" });
    if (statusFilter) params.set("status", statusFilter);
    try {
      const res = await fetch(`/api/bff/v1/admin/email-logs?${params}`);
      const json = await res.json();
      if (json.success) {
        setLogs(json.data);
        setPagination(json.pagination);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLogsLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    if (activeTab === "logs") fetchLogs(1);
  }, [activeTab, fetchLogs]);

  const inputCls = "w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-gold/50 transition-colors";

  return (
    <div className="space-y-6">
      {/* Tab bar */}
      <div className="flex gap-1 border-b border-white/10">
        {(["templates", "logs"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2.5 text-sm rounded-t-lg transition-colors ${
              activeTab === tab
                ? "bg-white/5 text-gold border-b border-gold"
                : "text-gray-400 hover:text-white"
            }`}
          >
            {tab === "templates" ? "信件範本" : "寄送紀錄"}
          </button>
        ))}
      </div>

      {/* ── Templates ── */}
      {activeTab === "templates" && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar: template selector */}
          <div className="lg:col-span-1 space-y-2">
            <p className="text-xs text-gray-500 uppercase tracking-widest mb-3">選擇範本</p>
            {(Object.keys(TEMPLATE_LABELS) as TemplateType[]).map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all ${
                  selectedType === type
                    ? "bg-gold/10 border border-gold/30 text-gold"
                    : "bg-white/3 border border-white/8 text-gray-400 hover:text-white hover:border-white/20"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Mail size={14} />
                  {TEMPLATE_LABELS[type]}
                </div>
              </button>
            ))}

            {/* Variable hints */}
            <div className="mt-4 p-4 bg-white/3 border border-white/8 rounded-xl">
              <p className="text-xs text-gray-500 mb-2">可用變數</p>
              <div className="space-y-1">
                {VARS_HINT[selectedType].map((v) => (
                  <code key={v} className="block text-[10px] text-gold/70 font-mono">{v}</code>
                ))}
              </div>
            </div>
          </div>

          {/* Editor */}
          <div className="lg:col-span-3 space-y-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">主旨</label>
              <input
                className={inputCls}
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Email 主旨"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">內文 (HTML)</label>
              <textarea
                className={`${inputCls} resize-none font-mono text-xs`}
                rows={24}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="<p>Email 內文 HTML...</p>"
              />
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 bg-gold text-black text-sm font-medium rounded-xl hover:bg-gold/90 transition-colors disabled:opacity-50"
              >
                <Save size={15} />
                {saving ? "儲存中..." : "儲存範本"}
              </button>
              {saveMsg && (
                <span className={`flex items-center gap-1.5 text-sm ${saveMsg.ok ? "text-green-400" : "text-red-400"}`}>
                  {saveMsg.ok ? <CheckCircle size={14} /> : <XCircle size={14} />}
                  {saveMsg.text}
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Logs ── */}
      {activeTab === "logs" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <select
                className="bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-gold/50"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as "" | "SENT" | "FAILED")}
              >
                <option value="">全部狀態</option>
                <option value="SENT">已發送</option>
                <option value="FAILED">失敗</option>
              </select>
            </div>
            <button
              onClick={() => fetchLogs(pagination.page)}
              className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors"
            >
              <RefreshCw size={14} className={logsLoading ? "animate-spin" : ""} />
              重新整理
            </button>
          </div>

          {logsLoading ? (
            <div className="flex justify-center py-12">
              <div className="w-7 h-7 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-12 text-gray-600 text-sm">尚無寄送紀錄</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left border-b border-white/8">
                      {["狀態", "收件人", "主旨", "範本類型", "時間", "錯誤"].map((h) => (
                        <th key={h} className="pb-3 pr-4 text-xs text-gray-500 font-normal whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {logs.map((log) => (
                      <tr key={log.id} className="hover:bg-white/2">
                        <td className="py-3 pr-4">
                          {log.status === "SENT" ? (
                            <span className="flex items-center gap-1 text-green-400 text-xs">
                              <Send size={11} /> 已發送
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-red-400 text-xs">
                              <XCircle size={11} /> 失敗
                            </span>
                          )}
                        </td>
                        <td className="py-3 pr-4">
                          <div className="text-white text-xs">{log.toName || "—"}</div>
                          <div className="text-gray-500 text-[11px]">{log.toEmail}</div>
                        </td>
                        <td className="py-3 pr-4 max-w-[200px] truncate text-gray-300 text-xs">{log.subject}</td>
                        <td className="py-3 pr-4">
                          <span className="text-[10px] text-gray-500 bg-white/5 px-2 py-0.5 rounded-full">
                            {log.templateType === "ORDER_CONFIRMATION_ORDERER" ? "訂購人" :
                             log.templateType === "ORDER_CONFIRMATION_ATTENDEE" ? "參加人" :
                             log.templateType ?? "—"}
                          </span>
                        </td>
                        <td className="py-3 pr-4 text-[11px] text-gray-500 whitespace-nowrap">
                          {log.sentAt
                            ? new Date(log.sentAt).toLocaleString("zh-TW", { hour12: false })
                            : new Date(log.createdAt).toLocaleString("zh-TW", { hour12: false })}
                        </td>
                        <td className="py-3 pr-4 max-w-[160px] truncate text-[11px] text-red-400/70">
                          {log.error ?? ""}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-gray-500">
                    第 {pagination.page} / {pagination.totalPages} 頁，共 {pagination.total} 筆
                  </span>
                  <div className="flex gap-2">
                    <button
                      disabled={pagination.page <= 1}
                      onClick={() => fetchLogs(pagination.page - 1)}
                      className="p-2 border border-white/10 rounded-lg text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft size={14} />
                    </button>
                    <button
                      disabled={pagination.page >= pagination.totalPages}
                      onClick={() => fetchLogs(pagination.page + 1)}
                      className="p-2 border border-white/10 rounded-lg text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

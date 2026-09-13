"use client";

import { useState, useEffect, useTransition } from "react";
import {
  RotateCw,
  Send,
  Trash2,
  Sparkles,
  Search,
  CheckSquare,
  Square,
  Clock,
  Building2,
  Mail,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  SlidersHorizontal,
  ChevronRight,
  UserCheck,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader, StatusBadge } from "@/components/dashboard-shell";

interface Candidate {
  id: string;
  email: string;
  name: string | null;
  company: string | null;
  lastContactedAt: string | null;
  followUpCount: number;
}

interface HistoryLog {
  id: string;
  sentAt: string;
  status: string;
  error: string | null;
  subject: string;
  body: string | null;
  fromName: string | null;
  recipient: {
    id: string;
    email: string;
    name: string | null;
    company: string | null;
    lastContactedAt: string | null;
    followUpCount: number;
  };
}

export default function FollowUpPage() {
  const [activeTab, setActiveTab] = useState<"followup" | "history">("followup");

  // Followup state
  const [limit, setLimit] = useState<number>(100);
  const [customLimit, setCustomLimit] = useState<string>("100");
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loadingCandidates, setLoadingCandidates] = useState<boolean>(true);
  const [totalRecipients, setTotalRecipients] = useState<number>(0);
  const [selectedCandidateIds, setSelectedCandidateIds] = useState<string[]>([]);

  const [fromName, setFromName] = useState<string>("");
  const [subject, setSubject] = useState<string>("Re: Following up regarding {brand}");
  const [body, setBody] = useState<string>(
    "Hi {name},\n\nI hope you're having a great week!\n\nJust wanted to quickly check in on my previous email regarding {brand}. I'd love to know if you had a chance to review it or if you have 5 minutes for a quick chat this week?\n\nBest regards,"
  );
  const [useAI, setUseAI] = useState<boolean>(false);
  const [customNotes, setCustomNotes] = useState<string>("");
  const [delaySeconds, setDelaySeconds] = useState<number>(3);
  const [sending, setSending] = useState<boolean>(false);
  const [sendProgress, setSendProgress] = useState<{ current: number; total: number } | null>(null);

  // History state
  const [logs, setLogs] = useState<HistoryLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState<boolean>(true);
  const [historySearch, setHistorySearch] = useState<string>("");
  const [selectedLogIds, setSelectedLogIds] = useState<string[]>([]);
  const [deletingLogs, setDeletingLogs] = useState<boolean>(false);
  const [totalLogCount, setTotalLogCount] = useState<number>(0);

  // Fetch candidates for follow-up
  const fetchCandidates = async (targetLimit: number) => {
    setLoadingCandidates(true);
    try {
      const res = await fetch(`/api/followup/candidates?limit=${targetLimit}`);
      if (res.ok) {
        const data = await res.json();
        setCandidates(data.candidates || []);
        setTotalRecipients(data.totalRecipients || 0);
        // Select all candidates by default
        setSelectedCandidateIds((data.candidates || []).map((c: Candidate) => c.id));
      }
    } catch (e) {
      toast.error("Failed to load follow-up candidates");
    } finally {
      setLoadingCandidates(false);
    }
  };

  // Fetch sent history logs
  const fetchHistoryLogs = async (searchQuery: string = "") => {
    setLoadingLogs(true);
    try {
      const res = await fetch(`/api/followup/history?search=${encodeURIComponent(searchQuery)}&limit=200`);
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
        setTotalLogCount(data.totalCount || 0);
      }
    } catch (e) {
      toast.error("Failed to load sent email history");
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    fetchCandidates(limit);
    fetchHistoryLogs();
  }, []);

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setCustomLimit(String(newLimit));
    fetchCandidates(newLimit);
  };

  const handleCustomLimitApply = () => {
    const val = parseInt(customLimit, 10);
    if (!isNaN(val) && val > 0) {
      setLimit(val);
      fetchCandidates(val);
    }
  };

  const toggleCandidateSelect = (id: string) => {
    setSelectedCandidateIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAllCandidates = () => {
    if (selectedCandidateIds.length === candidates.length) {
      setSelectedCandidateIds([]);
    } else {
      setSelectedCandidateIds(candidates.map((c) => c.id));
    }
  };

  // Execute Follow-Up Send
  const handleSendFollowUps = async () => {
    if (selectedCandidateIds.length === 0) {
      toast.error("Please select at least 1 recipient to follow up");
      return;
    }

    setSending(true);
    setSendProgress({ current: 0, total: selectedCandidateIds.length });
    const toastId = toast.loading(`Sending follow-ups to ${selectedCandidateIds.length} recipient(s)...`);

    try {
      const res = await fetch("/api/followup/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientIds: selectedCandidateIds,
          limit,
          subject,
          body,
          fromName: fromName.trim() || undefined,
          useAI,
          customNotes,
          delaySeconds,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to send follow-up campaign", { id: toastId });
      } else {
        toast.success(
          `Follow-up campaign completed! Sent: ${data.sentCount}, Failed: ${data.failedCount}`,
          { id: toastId, duration: 5000 }
        );
        // Refresh candidates and history
        fetchCandidates(limit);
        fetchHistoryLogs();
      }
    } catch (error) {
      toast.error("Network error while sending follow-ups", { id: toastId });
    } finally {
      setSending(false);
      setSendProgress(null);
    }
  };

  // History Selection & Deletion
  const toggleLogSelect = (id: string) => {
    setSelectedLogIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAllLogs = () => {
    if (selectedLogIds.length === logs.length) {
      setSelectedLogIds([]);
    } else {
      setSelectedLogIds(logs.map((l) => l.id));
    }
  };

  const handleDeleteSelectedLogs = async () => {
    if (selectedLogIds.length === 0) return;

    if (
      !confirm(
        `Are you sure you want to delete ${selectedLogIds.length} selected sent history log(s)?`
      )
    ) {
      return;
    }

    setDeletingLogs(true);
    const toastId = toast.loading("Deleting selected history logs...");

    try {
      const res = await fetch("/api/followup/history", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedLogIds }),
      });

      if (res.ok) {
        toast.success("Sent email logs deleted successfully", { id: toastId });
        setSelectedLogIds([]);
        fetchHistoryLogs(historySearch);
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to delete logs", { id: toastId });
      }
    } catch (e) {
      toast.error("Error deleting logs", { id: toastId });
    } finally {
      setDeletingLogs(false);
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "Never contacted";
    try {
      const d = new Date(dateStr);
      return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }).format(d);
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={
          <span className="flex items-center gap-3">
            <RotateCw className="h-8 w-8 text-primary animate-spin-slow" />
            Follow-Up & Sent History
          </span>
        }
        description="Automatically follow up with your oldest contacted brands & track exact date/time sent history."
        action={
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                fetchCandidates(limit);
                fetchHistoryLogs(historySearch);
                toast.success("Refreshed follow-up & history logs!");
              }}
              className="flex items-center gap-2 rounded-xl border border-border/80 bg-background/60 px-4 py-2 text-sm font-semibold hover:bg-accent transition-colors shadow-sm"
            >
              <RefreshCw className="h-4 w-4 text-muted-foreground" />
              Refresh
            </button>
          </div>
        }
      />

      {/* Main Tabs Navigation */}
      <div className="mb-6 flex border-b border-border/60">
        <button
          onClick={() => setActiveTab("followup")}
          className={`flex items-center gap-2.5 border-b-2 px-5 py-3 text-sm font-bold transition-all ${
            activeTab === "followup"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Zap className="h-4 w-4" />
          Follow-Up Automation
          <span className="ml-1.5 rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary font-extrabold">
            Last {limit} Brands
          </span>
        </button>

        <button
          onClick={() => setActiveTab("history")}
          className={`flex items-center gap-2.5 border-b-2 px-5 py-3 text-sm font-bold transition-all ${
            activeTab === "history"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Clock className="h-4 w-4" />
          Sent Email History & Logs
          {totalLogCount > 0 && (
            <span className="ml-1.5 rounded-full bg-secondary px-2 py-0.5 text-xs text-muted-foreground font-semibold">
              {totalLogCount}
            </span>
          )}
        </button>
      </div>

      {activeTab === "followup" ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Follow-up Configuration Form (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Step 1: Target Selector (Last N Brands) */}
            <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-sm space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold flex items-center gap-2">
                  <UserCheck className="h-5 w-5 text-primary" />
                  1. Target Oldest Contacted Brands
                </h3>
                <span className="text-xs text-muted-foreground font-medium">
                  {totalRecipients} total in database
                </span>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                  Select Quantity (Last N Brands)
                </label>
                <div className="grid grid-cols-4 gap-2 mb-3">
                  {[10, 25, 50, 100].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => handleLimitChange(num)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                        limit === num
                          ? "bg-primary text-primary-foreground border-primary shadow-sm"
                          : "bg-secondary/50 text-foreground border-border hover:bg-secondary"
                      }`}
                    >
                      Last {num}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground whitespace-nowrap">Or Custom N:</span>
                  <input
                    type="number"
                    value={customLimit}
                    onChange={(e) => setCustomLimit(e.target.value)}
                    placeholder="e.g. 75"
                    className="w-24 rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                  <button
                    type="button"
                    onClick={handleCustomLimitApply}
                    className="rounded-xl bg-secondary px-3 py-1.5 text-xs font-semibold hover:bg-accent transition-colors"
                  >
                    Apply
                  </button>
                </div>
              </div>

              {/* Sender Name Customization */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
                  Sender Display Name (From Name)
                </label>
                <input
                  type="text"
                  value={fromName}
                  onChange={(e) => setFromName(e.target.value)}
                  placeholder="e.g. Shorya Gupta (Optional)"
                  className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
            </div>

            {/* Step 2: Content & Mode Configuration */}
            <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-sm space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold flex items-center gap-2">
                  <Mail className="h-5 w-5 text-primary" />
                  2. Follow-Up Message & Mode
                </h3>

                {/* AI Toggle */}
                <button
                  type="button"
                  onClick={() => setUseAI(!useAI)}
                  className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold transition-all border ${
                    useAI
                      ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white border-violet-500 shadow-md shadow-violet-500/20"
                      : "bg-secondary text-muted-foreground border-border hover:text-foreground"
                  }`}
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  {useAI ? "AI Generator Active" : "Use AI Personalization"}
                </button>
              </div>

              {useAI ? (
                <div className="space-y-4 rounded-xl border border-violet-500/30 bg-violet-500/5 p-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-violet-400">
                    <Sparkles className="h-4 w-4" />
                    AI Engine: Unique friendly check-in per brand
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Groq LLaMA 3.3 / Gemini AI will craft a short, polite 2-sentence follow-up tailored to each brand name & contact person.
                  </p>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                      Custom AI Guidance (Optional)
                    </label>
                    <input
                      type="text"
                      value={customNotes}
                      onChange={(e) => setCustomNotes(e.target.value)}
                      placeholder="e.g. Ask if open for sponsored reel or 5-min demo call"
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-violet-500/40"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
                      Subject Line
                    </label>
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 font-medium"
                    />
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      Use <code className="bg-secondary px-1.5 py-0.5 rounded text-foreground font-mono">&#123;brand&#125;</code> or <code className="bg-secondary px-1.5 py-0.5 rounded text-foreground font-mono">&#123;name&#125;</code> for dynamic brand tags.
                    </p>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
                      Email Template Body
                    </label>
                    <textarea
                      rows={6}
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                      className="w-full rounded-xl border border-border bg-background p-3.5 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary/40 font-mono text-xs"
                    />
                  </div>
                </div>
              )}

              {/* Delay Selector */}
              <div className="flex items-center justify-between pt-2 border-t border-border/50">
                <span className="text-xs font-semibold text-muted-foreground">Gap between emails:</span>
                <select
                  value={delaySeconds}
                  onChange={(e) => setDelaySeconds(Number(e.target.value))}
                  className="rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-semibold focus:outline-none"
                >
                  <option value={0}>0s (Instant Send)</option>
                  <option value={3}>3s (Recommended)</option>
                  <option value={5}>5s (Safe)</option>
                  <option value={10}>10s (High Safety)</option>
                </select>
              </div>

              {/* Send Campaign Button */}
              <button
                type="button"
                disabled={sending || selectedCandidateIds.length === 0}
                onClick={handleSendFollowUps}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all disabled:opacity-50"
              >
                {sending ? (
                  <>
                    <RotateCw className="h-4 w-4 animate-spin" />
                    Sending Follow-Ups ({sendProgress?.current || 0}/{sendProgress?.total || selectedCandidateIds.length})...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Send Follow-Up to {selectedCandidateIds.length} Selected Brands
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right Column: Selected Candidate Preview List (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-primary" />
                    Oldest Contacted Brands Candidate Queue
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Sorted by oldest <code className="font-mono">lastContactedAt</code> timestamp (never contacted first).
                  </p>
                </div>

                <button
                  onClick={toggleSelectAllCandidates}
                  className="flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
                >
                  {selectedCandidateIds.length === candidates.length ? (
                    <>
                      <CheckSquare className="h-4 w-4" /> Unselect All
                    </>
                  ) : (
                    <>
                      <Square className="h-4 w-4" /> Select All ({candidates.length})
                    </>
                  )}
                </button>
              </div>

              {loadingCandidates ? (
                <div className="py-16 text-center">
                  <RotateCw className="h-8 w-8 animate-spin text-primary mx-auto mb-3" />
                  <p className="text-xs font-medium text-muted-foreground">Loading target brand candidates...</p>
                </div>
              ) : candidates.length === 0 ? (
                <div className="py-16 text-center rounded-xl border border-dashed border-border p-6">
                  <Building2 className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
                  <h4 className="text-sm font-bold text-foreground mb-1">No Brand Candidates Found</h4>
                  <p className="text-xs text-muted-foreground">
                    Add recipients to your database to enable follow-up campaigns.
                  </p>
                </div>
              ) : (
                <div className="max-h-[620px] overflow-y-auto pr-1 space-y-2.5 custom-scrollbar">
                  {candidates.map((candidate) => {
                    const isSelected = selectedCandidateIds.includes(candidate.id);
                    return (
                      <div
                        key={candidate.id}
                        onClick={() => toggleCandidateSelect(candidate.id)}
                        className={`flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer ${
                          isSelected
                            ? "bg-primary/5 border-primary/40 shadow-sm"
                            : "bg-background/60 border-border/60 hover:bg-accent/40"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <button
                            type="button"
                            className={`h-5 w-5 rounded grid place-items-center shrink-0 border transition-all ${
                              isSelected
                                ? "bg-primary border-primary text-primary-foreground"
                                : "border-border bg-background"
                            }`}
                          >
                            {isSelected && <CheckCircle2 className="h-3.5 w-3.5" />}
                          </button>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              {candidate.company ? (
                                <span className="inline-flex items-center gap-1 rounded-md bg-purple-500/10 px-2 py-0.5 text-xs font-bold text-purple-400 border border-purple-500/20 truncate">
                                  <Building2 className="h-3 w-3 shrink-0" />
                                  {candidate.company}
                                </span>
                              ) : (
                                <span className="text-xs font-bold text-foreground">
                                  {candidate.name || "Recipient"}
                                </span>
                              )}
                              <span className="text-xs text-muted-foreground truncate">
                                {candidate.email}
                              </span>
                            </div>
                            <div className="mt-1 flex items-center gap-3 text-[11px] text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                Last: {formatDate(candidate.lastContactedAt)}
                              </span>
                              <span className="rounded-full bg-secondary px-2 py-0.2 text-[10px] font-semibold text-foreground">
                                {candidate.followUpCount === 0
                                  ? "0 Follow-ups"
                                  : `${candidate.followUpCount} Follow-up(s) sent`}
                              </span>
                            </div>
                          </div>
                        </div>

                        <ChevronRight className="h-4 w-4 text-muted-foreground/50 shrink-0" />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Tab 2: Sent Email History & Audit Log Table */
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-card border border-border/70 p-4 rounded-2xl">
            {/* Search filter */}
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={historySearch}
                onChange={(e) => {
                  setHistorySearch(e.target.value);
                  fetchHistoryLogs(e.target.value);
                }}
                placeholder="Search by email, brand name, or subject..."
                className="w-full rounded-xl border border-border bg-background pl-10 pr-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/40 font-medium"
              />
            </div>

            {/* Selection & Action controls */}
            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
              {selectedLogIds.length > 0 && (
                <button
                  type="button"
                  onClick={handleDeleteSelectedLogs}
                  disabled={deletingLogs}
                  className="flex items-center gap-2 rounded-xl bg-destructive/15 border border-destructive/30 text-destructive px-4 py-2 text-xs font-bold hover:bg-destructive/25 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete Selected ({selectedLogIds.length})
                </button>
              )}

              <span className="text-xs text-muted-foreground font-semibold">
                Showing {logs.length} of {totalLogCount} logs
              </span>
            </div>
          </div>

          {/* Sent History Table */}
          <div className="rounded-2xl border border-border/70 bg-card overflow-hidden shadow-sm">
            {loadingLogs ? (
              <div className="py-20 text-center">
                <RotateCw className="h-8 w-8 animate-spin text-primary mx-auto mb-3" />
                <p className="text-xs font-medium text-muted-foreground">Loading sent email history...</p>
              </div>
            ) : logs.length === 0 ? (
              <div className="py-20 text-center p-6">
                <Clock className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
                <h4 className="text-sm font-bold text-foreground mb-1">No Sent History Found</h4>
                <p className="text-xs text-muted-foreground">
                  Emails sent from campaigns or follow-ups will record exact timestamps here.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-secondary/40 border-b border-border/60 text-muted-foreground font-semibold uppercase tracking-wider">
                    <tr>
                      <th className="py-3.5 px-4 w-10">
                        <button
                          type="button"
                          onClick={toggleSelectAllLogs}
                          className="hover:text-foreground"
                        >
                          {selectedLogIds.length === logs.length && logs.length > 0 ? (
                            <CheckSquare className="h-4 w-4 text-primary" />
                          ) : (
                            <Square className="h-4 w-4" />
                          )}
                        </button>
                      </th>
                      <th className="py-3.5 px-4">Date & Time Sent</th>
                      <th className="py-3.5 px-4">Brand / Company</th>
                      <th className="py-3.5 px-4">Recipient Email</th>
                      <th className="py-3.5 px-4">Subject</th>
                      <th className="py-3.5 px-4">Follow-Up Count</th>
                      <th className="py-3.5 px-4 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {logs.map((log) => {
                      const isSelected = selectedLogIds.includes(log.id);
                      return (
                        <tr
                          key={log.id}
                          className={`transition-colors ${
                            isSelected ? "bg-primary/5" : "hover:bg-accent/30"
                          }`}
                        >
                          <td className="py-3.5 px-4">
                            <button
                              type="button"
                              onClick={() => toggleLogSelect(log.id)}
                              className="hover:text-foreground"
                            >
                              {isSelected ? (
                                <CheckSquare className="h-4 w-4 text-primary" />
                              ) : (
                                <Square className="h-4 w-4 text-muted-foreground" />
                              )}
                            </button>
                          </td>
                          <td className="py-3.5 px-4 font-semibold text-foreground whitespace-nowrap">
                            <span className="flex items-center gap-1.5 text-primary">
                              <Clock className="h-3.5 w-3.5 shrink-0" />
                              {formatDate(log.sentAt)}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            {log.recipient.company ? (
                              <span className="inline-flex items-center gap-1 rounded-md bg-purple-500/10 px-2 py-0.5 text-xs font-bold text-purple-400 border border-purple-500/20">
                                <Building2 className="h-3 w-3 shrink-0" />
                                {log.recipient.company}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 font-medium text-foreground">
                            <div>{log.recipient.email}</div>
                            {log.recipient.name && (
                              <div className="text-[11px] text-muted-foreground">{log.recipient.name}</div>
                            )}
                          </td>
                          <td className="py-3.5 px-4 max-w-xs truncate font-medium text-foreground">
                            {log.subject}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="rounded-full bg-secondary px-2.5 py-0.5 text-[11px] font-bold text-foreground">
                              {log.recipient.followUpCount === 0
                                ? "Initial Email"
                                : `Follow-up #${log.recipient.followUpCount}`}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <StatusBadge status={log.status} />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

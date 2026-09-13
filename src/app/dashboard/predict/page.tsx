"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Search,
  Copy,
  Check,
  Download,
  Trash2,
  Send,
  UserPlus,
  Loader2,
  Building2,
  Mail,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Info,
  ArrowRight,
  FileSpreadsheet,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

interface PredictedItem {
  id: string;
  name: string;
  predictedEmail: string;
  confidence: "High" | "Medium" | "Low";
  patternUsed: string;
}

interface AnalysisSummary {
  domain: string;
  pattern: string;
  patternType: string;
  confidencePercent: number;
  why: string;
}

const DEFAULT_SAMPLES = `rahul.sharma@tcs.com\npriya.mehta@tcs.com\namit.verma@tcs.com\nsupport@tcs.com`;
const DEFAULT_NAMES = `Shorya Gupta\nRahul Sharma\nPriya Mehta\nAman Verma\nNeha Singh\nVikram Aditya`;

export default function MailPredictionPage() {
  const router = useRouter();
  const [samplesText, setSamplesText] = useState(DEFAULT_SAMPLES);
  const [namesText, setNamesText] = useState(DEFAULT_NAMES);

  const [predicting, setPredicting] = useState(false);
  const [summary, setSummary] = useState<AnalysisSummary | null>(null);
  const [results, setResults] = useState<PredictedItem[]>([]);
  const [filterQuery, setFilterQuery] = useState("");
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [addingToRecipients, setAddingToRecipients] = useState(false);

  // Run prediction API
  const handlePredict = async () => {
    if (!samplesText.trim() && !namesText.trim()) {
      toast.error("Please enter sample emails or a list of names");
      return;
    }

    setPredicting(true);
    try {
      const res = await fetch("/api/predict-emails", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sampleEmailsText: samplesText,
          namesText: namesText,
        }),
      });

      const data = await res.json();
      if (res.ok && data) {
        setSummary({
          domain: data.domain,
          pattern: data.pattern,
          patternType: data.patternType,
          confidencePercent: data.confidencePercent,
          why: data.why,
        });
        setResults(data.predictions || []);
        toast.success(`Generated ${data.predictions?.length || 0} predicted emails!`);
      } else {
        toast.error(data.error || "Failed to predict emails");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Prediction failed");
    } finally {
      setPredicting(false);
    }
  };

  // Copy single email to clipboard
  const handleCopySingle = (email: string) => {
    navigator.clipboard.writeText(email);
    setCopiedEmail(email);
    toast.success(`Copied: ${email}`);
    setTimeout(() => setCopiedEmail(null), 2000);
  };

  // Copy all predicted emails to clipboard
  const handleCopyAll = () => {
    if (results.length === 0) return;
    const allEmails = results.map((r) => r.predictedEmail).join(", ");
    navigator.clipboard.writeText(allEmails);
    setCopiedAll(true);
    toast.success(`Copied ${results.length} predicted emails to clipboard!`);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  // Export results as CSV file download
  const handleExportCSV = () => {
    if (results.length === 0) return;

    const headers = ["Name", "Predicted Email", "Confidence", "Pattern Used"];
    const rows = results.map((r) => [
      `"${r.name.replace(/"/g, '""')}"`,
      `"${r.predictedEmail}"`,
      `"${r.confidence}"`,
      `"${r.patternUsed}"`,
    ]);

    const csvContent = [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `email-predictions-${summary?.domain || "results"}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Exported CSV file!");
  };

  // Bulk add to Recipients DB
  const handleAddToRecipients = async () => {
    if (results.length === 0) return;

    setAddingToRecipients(true);
    try {
      const payload = results.map((r) => ({
        email: r.predictedEmail,
        name: r.name,
        company: summary?.domain ? summary.domain.replace(/\.[a-z]+$/i, "").toUpperCase() : null,
      }));

      const res = await fetch("/api/recipients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipients: payload }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(`Added ${data.added || results.length} predicted recipients to address book!`);
      } else {
        toast.error(data.error || "Failed to add to recipients");
      }
    } catch {
      toast.error("Failed to save recipients");
    } finally {
      setAddingToRecipients(false);
    }
  };

  // Send directly to Compose Page
  const handleOpenInCompose = () => {
    if (results.length === 0) return;
    toast.info("Transferring predicted emails to Compose...");
    router.push("/dashboard/compose");
  };

  // Clear results
  const handleClear = () => {
    setResults([]);
    setSummary(null);
    toast.info("Cleared results");
  };

  // Filtered results
  const filteredResults = results.filter((r) => {
    if (!filterQuery.trim()) return true;
    const q = filterQuery.toLowerCase();
    return r.name.toLowerCase().includes(q) || r.predictedEmail.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-7 w-full">
      <PageHeader
        title="Mail Prediction Engine"
        description="Paste sample emails from a company to auto-detect their pattern & generate emails for any list of names."
      />

      {/* Main Workflow Section */}
      <div className="grid gap-6 lg:grid-cols-12 w-full items-start">
        {/* Step 1: Sample Emails Input (6 cols) */}
        <div className="surface p-6 sm:p-7 space-y-4 lg:col-span-6 rounded-3xl border border-border">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-bold text-foreground flex items-center gap-2">
              <span className="grid h-6 w-6 place-items-center rounded-full bg-primary text-primary-foreground text-xs font-black">
                1
              </span>
              Sample Company Emails
            </Label>
            <button
              type="button"
              onClick={() => setSamplesText(DEFAULT_SAMPLES)}
              className="text-xs text-violet-400 hover:text-violet-300 font-bold transition-colors"
            >
              Use Sample Data
            </button>
          </div>
          <Textarea
            value={samplesText}
            onChange={(e) => setSamplesText(e.target.value)}
            rows={7}
            placeholder={`rahul.sharma@company.com\npriya.mehta@company.com\namit.verma@company.com\nsupport@company.com`}
            className="font-mono text-sm leading-relaxed rounded-2xl p-4 resize-none bg-secondary/30"
          />
          <p className="text-xs text-muted-foreground font-medium">
            Paste 1 or more sample emails from the target domain to detect pattern &amp; domain.
          </p>
        </div>

        {/* Step 2: Target Names Input (6 cols) */}
        <div className="surface p-6 sm:p-7 space-y-4 lg:col-span-6 rounded-3xl border border-border">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-bold text-foreground flex items-center gap-2">
              <span className="grid h-6 w-6 place-items-center rounded-full bg-primary text-primary-foreground text-xs font-black">
                2
              </span>
              Target Names (One per line)
            </Label>
            <span className="text-xs text-muted-foreground font-bold">
              {namesText.split("\n").filter((l) => l.trim()).length} names
            </span>
          </div>
          <Textarea
            value={namesText}
            onChange={(e) => setNamesText(e.target.value)}
            rows={7}
            placeholder={`Shorya Gupta\nRahul Sharma\nPriya Mehta\nAman Verma\nNeha Singh`}
            className="font-mono text-sm leading-relaxed rounded-2xl p-4 resize-none bg-secondary/30"
          />
          <p className="text-xs text-muted-foreground font-medium">
            Paste full names or first names. AI applies pattern intelligently per name.
          </p>
        </div>
      </div>

      {/* Action Button: Run AI Prediction */}
      <div className="flex justify-center pt-1">
        <Button
          onClick={handlePredict}
          disabled={predicting}
          className="gradient-accent text-primary-foreground h-13 px-8 text-base font-extrabold rounded-2xl shadow-lg hover:opacity-95 transition-all scale-[1.02] active:scale-100"
        >
          {predicting ? (
            <>
              <Loader2 className="mr-2.5 h-5 w-5 animate-spin" />
              Detecting Pattern &amp; Generating Emails...
            </>
          ) : (
            <>
              <Sparkles className="mr-2.5 h-5 w-5" />
              Predict Email Addresses
            </>
          )}
        </Button>
      </div>

      {/* Step 3: Pattern Detection Explanation Card */}
      {summary && (
        <div className="surface p-6 sm:p-7 rounded-3xl border border-violet-500/30 bg-violet-500/5 space-y-4 animate-fade-in">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-4">
            <div className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-2xl bg-violet-500/20 text-violet-300">
                <Building2 className="h-5 w-5" />
              </span>
              <div>
                <h3 className="text-base font-extrabold text-foreground">
                  Detected Pattern Explanation
                </h3>
                <p className="text-xs text-muted-foreground">
                  AI inferred naming convention from sample emails
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-muted-foreground">Confidence:</span>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-extrabold">
                <ShieldCheck className="h-3.5 w-3.5" />
                {summary.confidencePercent}%
              </span>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl bg-secondary/40 border border-border p-3.5 space-y-1">
              <span className="text-xs text-muted-foreground font-semibold block">Detected Pattern</span>
              <code className="text-sm font-mono font-extrabold text-violet-300 block truncate">
                {summary.pattern}
              </code>
            </div>

            <div className="rounded-2xl bg-secondary/40 border border-border p-3.5 space-y-1">
              <span className="text-xs text-muted-foreground font-semibold block">Company Domain</span>
              <code className="text-sm font-mono font-extrabold text-foreground block truncate">
                {summary.domain}
              </code>
            </div>

            <div className="rounded-2xl bg-secondary/40 border border-border p-3.5 space-y-1">
              <span className="text-xs text-muted-foreground font-semibold block">Pattern Type</span>
              <span className="text-sm font-bold text-foreground block capitalize truncate">
                {summary.patternType.replace(/[._-]/g, " ")}
              </span>
            </div>
          </div>

          <div className="flex items-start gap-2.5 pt-1 text-xs text-foreground/90 font-medium bg-secondary/20 p-3 rounded-2xl border border-border">
            <Info className="h-4 w-4 text-violet-400 shrink-0 mt-0.5" />
            <p>
              <strong>Why:</strong> {summary.why}
            </p>
          </div>
        </div>
      )}

      {/* Results Table Section */}
      {results.length > 0 && (
        <div className="space-y-4">
          {/* Header Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                Predicted Emails ({results.length})
              </h2>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                onClick={handleCopyAll}
                className="h-10 px-3.5 text-xs font-bold rounded-xl border-border"
              >
                {copiedAll ? <Check className="mr-1.5 h-3.5 w-3.5 text-emerald-400" /> : <Copy className="mr-1.5 h-3.5 w-3.5" />}
                {copiedAll ? "Copied All!" : "Copy All"}
              </Button>

              <Button
                variant="outline"
                onClick={handleExportCSV}
                className="h-10 px-3.5 text-xs font-bold rounded-xl border-border"
              >
                <Download className="mr-1.5 h-3.5 w-3.5" /> Export CSV
              </Button>

              <Button
                variant="outline"
                onClick={handleAddToRecipients}
                disabled={addingToRecipients}
                className="h-10 px-3.5 text-xs font-bold rounded-xl border-border"
              >
                {addingToRecipients ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <UserPlus className="mr-1.5 h-3.5 w-3.5" />}
                Add to Address Book
              </Button>

              <Button
                onClick={handleOpenInCompose}
                className="gradient-accent text-primary-foreground h-10 px-4 text-xs font-bold rounded-xl hover:opacity-90 shadow-sm"
              >
                <Send className="mr-1.5 h-3.5 w-3.5" /> Send Outreach
              </Button>

              <Button
                variant="ghost"
                onClick={handleClear}
                className="h-10 px-3 text-xs font-semibold text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          {/* Filter / Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder="Filter by name or predicted email..."
              className="pl-11 h-11 text-sm bg-secondary/30 rounded-2xl"
            />
          </div>

          {/* Table Container */}
          <div className="surface overflow-hidden rounded-3xl border border-border">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-xs uppercase tracking-wider text-muted-foreground font-bold bg-secondary/40">
                    <th className="px-6 py-4">Name</th>
                    <th className="px-6 py-4">Predicted Email</th>
                    <th className="px-6 py-4">Confidence</th>
                    <th className="px-6 py-4">Pattern Used</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {filteredResults.map((r) => (
                    <tr key={r.id} className="hover:bg-secondary/40 transition-colors">
                      <td className="px-6 py-4 font-bold text-foreground">{r.name}</td>
                      <td className="px-6 py-4 font-mono text-sm text-violet-300 font-semibold">
                        {r.predictedEmail}
                      </td>
                      <td className="px-6 py-4">
                        {r.confidence === "High" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
                            🟢 High
                          </span>
                        ) : r.confidence === "Medium" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold">
                            🟡 Medium
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-bold">
                            🔴 Low
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-xs font-mono text-muted-foreground">
                        {r.patternUsed}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopySingle(r.predictedEmail)}
                          className="h-8 px-2.5 text-xs font-semibold hover:bg-secondary rounded-lg"
                        >
                          {copiedEmail === r.predictedEmail ? (
                            <Check className="h-3.5 w-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                          )}
                          <span className="ml-1">{copiedEmail === r.predictedEmail ? "Copied" : "Copy"}</span>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

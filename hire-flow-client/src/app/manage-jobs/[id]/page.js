"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogOverlay,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  FaBriefcase,
  FaCalendarAlt,
  FaCog,
  FaTachometerAlt,
  FaTasks,
  FaUsers,
} from "react-icons/fa";

const navItems = [
  { label: "Dashboard", href: "/" },
  { label: "Manage Jobs", href: "/manage-jobs" },
  { label: "All Candidates", href: "/all-candidates" },
  { label: "My Tasks", href: "#" },
  { label: "Calendar", href: "#" },
  { label: "Settings", href: "#" },
];

const iconByLabel = {
  Dashboard: FaTachometerAlt,
  "Manage Jobs": FaBriefcase,
  "All Candidates": FaUsers,
  "My Tasks": FaTasks,
  Calendar: FaCalendarAlt,
  Settings: FaCog,
};

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

const formatCandidateStatus = (status) => {
  if (status === "SCREENING_SCORE") return "Screening Score";
  return status || "PENDING_CALL";
};

const getScoreBarClass = (score) => {
  if (score >= 80) return "bg-emerald-500";
  if (score >= 60) return "bg-blue-500";
  if (score >= 40) return "bg-amber-500";
  return "bg-rose-500";
};

const getStatusPillClass = (status) => {
  if (status === "SCREENING_SCORE") return "bg-indigo-100 text-indigo-700";
  if (status === "QUALIFIED") return "bg-emerald-100 text-emerald-700";
  if (status === "REJECTED") return "bg-rose-100 text-rose-700";
  if (status === "CALLED") return "bg-blue-100 text-blue-700";
  return "bg-slate-100 text-slate-700";
};

const getInitials = (name = "") =>
  String(name)
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

function MatchingLoader() {
  return (
    <div className="mt-6 flex min-h-[55vh] items-center justify-center rounded-2xl border border-slate-200 bg-white/85 p-6 shadow-sm">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto h-14 w-14 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
        <h2 className="mt-5 text-xl font-semibold text-slate-900">
          Matching candidates...
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          We are comparing candidate profiles with the job description and
          ranking the best matches.
        </p>
        <div className="mt-5 h-2 w-full overflow-hidden rounded-full bg-slate-200">
          <div className="h-full w-1/3 animate-pulse rounded-full bg-blue-500" />
        </div>
      </div>
    </div>
  );
}

export default function ManageJobDetailsPage() {
  const params = useParams();
  const jobId = params?.id;

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [job, setJob] = useState(null);
  const [matches, setMatches] = useState([]);
  const [callingCandidateId, setCallingCandidateId] = useState("");
  const [isTranscriptOpen, setIsTranscriptOpen] = useState(false);
  const [transcriptPreview, setTranscriptPreview] = useState("");

  const fetchJobDetails = async () => {
    if (!jobId) return;
    try {
      setLoading(true);
      setErrorMessage("");
      const response = await fetch(`${BACKEND_URL}/api/jobs/${jobId}/matches`, {
        cache: "no-store",
      });
      if (!response.ok) {
        throw new Error("Unable to load job details");
      }
      const data = await response.json();
      setJob(data?.job || null);
      setMatches(Array.isArray(data?.matches) ? data.matches : []);
    } catch (error) {
      setErrorMessage(error?.message || "Failed to fetch job details");
      setJob(null);
      setMatches([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobDetails();
  }, [jobId]);

  const skillMatchedCandidates = useMemo(
    () =>
      matches.filter(
        (entry) =>
          Array.isArray(entry.matchedSkills) && entry.matchedSkills.length > 0,
      ),
    [matches],
  );

  const filteredRows = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return skillMatchedCandidates;
    return skillMatchedCandidates.filter((entry) => {
      const candidate = entry.candidate || {};
      const haystack = [
        candidate.name,
        candidate.email,
        candidate.phone_no,
        ...(candidate.skills || []),
        ...(entry.matchedSkills || []),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [skillMatchedCandidates, searchTerm]);

  const openTranscriptModal = (transcriptText) => {
    setTranscriptPreview(transcriptText || "");
    setIsTranscriptOpen(true);
  };

  const handleInitiateCall = async (candidateId) => {
    if (!candidateId || !jobId) return;
    try {
      setCallingCandidateId(candidateId);
      setErrorMessage("");
      const response = await fetch(`${BACKEND_URL}/api/calls/initiate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidateId, jobId }),
      });
      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        throw new Error(errorBody.message || "Failed to initiate call");
      }
      await fetchJobDetails();
    } catch (error) {
      setErrorMessage(error?.message || "Unable to initiate call");
    } finally {
      setCallingCandidateId("");
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-white text-slate-900 md:flex-row">
      <Sidebar className="md:min-h-screen">
        <SidebarHeader>
          <div className="text-2xl font-bold tracking-wide text-blue-700">
            HireFlow
          </div>
          <p className="mt-1 text-xs uppercase tracking-[0.25em] text-slate-500">
            Recruitment Suite
          </p>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.label}>
                <Link href={item.href}>
                  <SidebarMenuButton isActive={item.label === "Manage Jobs"}>
                    {(() => {
                      const Icon = iconByLabel[item.label];
                      return Icon ? <Icon className="text-sm" /> : null;
                    })()}
                    {item.label}
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>

      <main className="flex flex-1 overflow-x-auto p-4 md:p-8">
        <section className="w-full p-2 md:p-6">
          <Link
            href="/manage-jobs"
            className="text-sm font-medium text-blue-700 hover:underline"
          >
            ← Back to Manage Jobs
          </Link>

          {errorMessage ? (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {errorMessage}
            </div>
          ) : loading ? (
            <MatchingLoader />
          ) : !job ? (
            <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              Job not found.
            </div>
          ) : (
            <>
              <div className="mt-4 rounded-2xl border border-slate-200 bg-white/85 p-5 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                      {job.title || "-"}
                    </h1>
                    <p className="mt-1 text-sm text-slate-500">
                      {job.company || "-"}
                    </p>
                  </div>
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                    OPEN
                  </span>
                </div>
                <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500">
                      Department
                    </p>
                    <p className="mt-1 text-sm font-medium text-slate-700">
                      {(job.role || []).join(", ") || "General"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500">
                      Account
                    </p>
                    <p className="mt-1 text-sm font-medium text-slate-700">
                      {job.company || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500">
                      Experience
                    </p>
                    <p className="mt-1 text-sm font-medium text-slate-700">
                      {typeof job.exp_req === "number"
                        ? `${job.exp_req} years`
                        : "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500">
                      CTC Range
                    </p>
                    <p className="mt-1 text-sm font-medium text-slate-700">
                      {job.ctc || "-"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">
                      Candidate Match
                    </h2>
                    <p className="text-xs text-slate-500">
                      Showing only candidates with skill overlap
                    </p>
                  </div>
                  <Input
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Search matched candidates..."
                    className="max-w-xs bg-slate-50"
                  />
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Candidate</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Experience</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Call</TableHead>
                      <TableHead className="text-right">Transcript</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRows.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={9}
                          className="text-center text-slate-500"
                        >
                          No skill-matched candidates found for this job.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredRows.map((entry) => {
                        const candidate = entry.candidate || {};
                        const hasTranscript = Boolean(
                          entry?.callRecord?.transcript?.trim?.(),
                        );
                        const isCalling = callingCandidateId === candidate._id;
                        const transcriptText =
                          entry?.callRecord?.transcript || "";
                        return (
                          <TableRow
                            key={
                              candidate._id ||
                              `${candidate.email}-${entry.matchPercent}`
                            }
                            className="hover:bg-slate-50/80"
                          >
                            <TableCell className="font-medium text-slate-900">
                              <div className="flex items-center gap-2">
                                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-cyan-100 text-xs font-semibold text-cyan-700">
                                  {getInitials(candidate.name) || "NA"}
                                </span>
                                <span>{candidate.name || "-"}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              {(entry.matchedSkills || []).join(", ") || "-"}
                            </TableCell>
                            <TableCell>
                              <div className="w-24">
                                <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
                                  <div
                                    className={`h-full rounded-full ${getScoreBarClass(
                                      entry.matchPercent ?? 0,
                                    )}`}
                                    style={{
                                      width: `${Math.max(
                                        0,
                                        Math.min(
                                          100,
                                          Number(entry.matchPercent) || 0,
                                        ),
                                      )}%`,
                                    }}
                                  />
                                </div>
                                <p className="mt-1 text-xs font-medium text-slate-700">
                                  {entry.matchPercent ?? 0}%
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>{candidate.email || "-"}</TableCell>
                            <TableCell>{candidate.phone_no || "-"}</TableCell>
                            <TableCell>
                              {typeof candidate.experience === "number"
                                ? `${candidate.experience} years`
                                : "-"}
                            </TableCell>
                            <TableCell>
                              <span
                                className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusPillClass(
                                  candidate.status,
                                )}`}
                              >
                                {formatCandidateStatus(candidate.status)}
                              </span>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant={hasTranscript ? "outline" : "default"}
                                disabled={
                                  hasTranscript || isCalling || !candidate._id
                                }
                                onClick={() =>
                                  handleInitiateCall(candidate._id)
                                }
                              >
                                {hasTranscript
                                  ? "Called"
                                  : isCalling
                                    ? "Calling..."
                                    : "Call"}
                              </Button>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="outline"
                                disabled={!hasTranscript}
                                onClick={() =>
                                  openTranscriptModal(transcriptText)
                                }
                              >
                                Transcript
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </section>
      </main>

      <Dialog open={isTranscriptOpen}>
        <DialogOverlay onClick={() => setIsTranscriptOpen(false)} />
        <DialogContent className="max-h-[80vh] overflow-y-auto border-slate-200 bg-slate-50">
          <DialogHeader className="border-b border-slate-200 pb-3">
            <DialogTitle className="text-xl">
              Candidate Call Transcript
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            {transcriptPreview
              .split(/\r?\n/)
              .map((line) => line.trim())
              .filter(Boolean)
              .map((line, index) => {
                const isAgent = /agent|interviewer|bot/i.test(line);
                const isCandidate = /candidate|user/i.test(line);
                const alignClass = isAgent
                  ? "justify-start"
                  : isCandidate
                    ? "justify-end"
                    : "justify-start";
                const bubbleClass = isCandidate
                  ? "bg-blue-600 text-white"
                  : "bg-white text-slate-800 ring-1 ring-slate-200";
                return (
                  <div
                    key={`${line}-${index}`}
                    className={`flex ${alignClass}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${bubbleClass}`}
                    >
                      {line}
                    </div>
                  </div>
                );
              })}
            {!transcriptPreview.trim() ? (
              <div className="rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-500">
                Transcript is not available.
              </div>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

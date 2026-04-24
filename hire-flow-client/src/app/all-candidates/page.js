"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  FaBriefcase,
  FaCalendarAlt,
  FaCog,
  FaTasks,
  FaTachometerAlt,
  FaUsers,
} from "react-icons/fa";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

const formatCandidateStatus = (status) => {
  if (status === "SCREENING_SCORE") return "Screening Score";
  return status || "PENDING_CALL";
};

const getStatusClass = (status) => {
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

export default function AllCandidatesPage() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredRows = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return candidates;
    return candidates.filter((candidate) => {
      const haystack = [
        candidate.name,
        candidate.email,
        candidate.phone_no,
        candidate.status,
        ...(candidate.skills || []),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [candidates, searchTerm]);

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      setErrorMessage("");
      const response = await fetch(`${BACKEND_URL}/api/candidates`, { cache: "no-store" });
      if (!response.ok) {
        throw new Error("Unable to load candidates from backend");
      }
      const data = await response.json();
      setCandidates(Array.isArray(data) ? data : []);
    } catch (error) {
      setErrorMessage(error?.message || "Failed to fetch candidates");
      setCandidates([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-white text-slate-900 md:flex-row">
      <Sidebar className="md:min-h-screen">
        <SidebarHeader>
          <div className="text-2xl font-bold tracking-wide text-blue-700">HireFlow</div>
          <p className="mt-1 text-xs uppercase tracking-[0.25em] text-slate-500">
            Recruitment Suite
          </p>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.label}>
                <Link href={item.href}>
                  <SidebarMenuButton isActive={item.label === "All Candidates"}>
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
        <section className="w-full">
          <div className="rounded-2xl border border-slate-200 bg-white/85 p-6 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-blue-700">Candidates</p>
                <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                  All Candidates
                </h1>
                <p className="mt-2 text-sm text-slate-600">
                  Track candidate profiles, status, and skills in one place.
                </p>
              </div>
              <Button variant="outline" onClick={fetchCandidates}>
                Refresh
              </Button>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs uppercase text-slate-500">Total Candidates</p>
                <p className="mt-1 text-xl font-semibold text-slate-900">{candidates.length}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs uppercase text-slate-500">Visible</p>
                <p className="mt-1 text-xl font-semibold text-slate-900">{filteredRows.length}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs uppercase text-slate-500">In Screening</p>
                <p className="mt-1 text-xl font-semibold text-indigo-700">
                  {
                    candidates.filter((candidate) => candidate.status === "SCREENING_SCORE")
                      .length
                  }
                </p>
              </div>
            </div>
          </div>

          {errorMessage ? (
            <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {errorMessage}. Check `NEXT_PUBLIC_BACKEND_URL` and ensure backend is running.
            </div>
          ) : loading ? (
            <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              Loading candidates...
            </div>
          ) : filteredRows.length === 0 ? (
            <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              No candidates found in the database.
            </div>
          ) : (
            <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-end border-b border-slate-200 bg-slate-50/70 p-3">
                <Input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search candidates..."
                  className="max-w-xs bg-white"
                />
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Experience</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Skills</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRows.map((candidate) => (
                    <TableRow key={candidate._id} className="hover:bg-slate-50/80">
                      <TableCell className="font-medium text-slate-900">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-cyan-100 text-xs font-semibold text-cyan-700">
                            {getInitials(candidate.name) || "NA"}
                          </span>
                          <span>{candidate.name || "-"}</span>
                        </div>
                      </TableCell>
                      <TableCell>{candidate.email || "-"}</TableCell>
                      <TableCell>{candidate.phone_no || "-"}</TableCell>
                      <TableCell>
                        {typeof candidate.experience === "number"
                          ? `${candidate.experience} yrs`
                          : "-"}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusClass(
                            candidate.status
                          )}`}
                        >
                          {formatCandidateStatus(candidate.status)}
                        </span>
                      </TableCell>
                      <TableCell>{(candidate.skills || []).join(", ") || "-"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

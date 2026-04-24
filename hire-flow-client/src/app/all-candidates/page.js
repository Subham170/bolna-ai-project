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
    <div className="flex min-h-screen bg-linear-to-br from-slate-100 to-slate-200 text-slate-900">
      <Sidebar className="min-h-screen">
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

      <main className="flex flex-1 p-8">
        <section className="w-full p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">All Candidates</h1>
              <p className="mt-2 text-sm text-slate-600">
                Candidates fetched from your backend database.
              </p>
            </div>
            <Button variant="outline" onClick={fetchCandidates}>
              Refresh
            </Button>
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
            <div className="mt-4">
              <div className="flex items-center justify-end border-b border-slate-200 p-3">
                <Input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search candidates..."
                  className="max-w-xs"
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
                    <TableRow key={candidate._id}>
                      <TableCell className="font-medium text-slate-900">
                        {candidate.name || "-"}
                      </TableCell>
                      <TableCell>{candidate.email || "-"}</TableCell>
                      <TableCell>{candidate.phone_no || "-"}</TableCell>
                      <TableCell>
                        {typeof candidate.experience === "number"
                          ? `${candidate.experience} yrs`
                          : "-"}
                      </TableCell>
                      <TableCell>
                        <span className="rounded-full bg-cyan-500 px-2 py-1 text-xs font-medium text-white">
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

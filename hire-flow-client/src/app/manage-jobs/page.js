"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogOverlay,
  DialogTitle,
} from "@/components/ui/dialog";
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

const initialForm = {
  title: "",
  company: "",
  description: "",
  job_type: "Full time",
  ctc: "",
  exp_req: "",
  role: "",
  skills: "",
};

export default function ManageJobsPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState(initialForm);

  const parsedRows = useMemo(() => jobs || [], [jobs]);
  const filteredRows = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return parsedRows;
    return parsedRows.filter((job) => {
      const haystack = [
        job.title,
        job.company,
        job.job_type,
        job.ctc,
        ...(job.skills || []),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [parsedRows, searchTerm]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setErrorMessage("");
      const response = await fetch(`${BACKEND_URL}/api/jobs`, { cache: "no-store" });
      if (!response.ok) {
        throw new Error("Unable to load jobs from backend");
      }
      const data = await response.json();
      setJobs(Array.isArray(data) ? data : []);
    } catch (error) {
      setErrorMessage(error?.message || "Failed to fetch jobs");
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateJob = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    const payload = {
      id: `${form.title.trim().toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`,
      title: form.title.trim(),
      company: form.company.trim(),
      description: form.description.trim(),
      job_type: form.job_type,
      ctc: form.ctc.trim(),
      exp_req: form.exp_req ? Number(form.exp_req) : undefined,
      role: form.role
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      skills: form.skills
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    };

    try {
      const response = await fetch(`${BACKEND_URL}/api/jobs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        throw new Error(errorBody.message || "Failed to create job");
      }

      setIsDialogOpen(false);
      setForm(initialForm);
      await fetchJobs();
    } catch (error) {
      setErrorMessage(error?.message || "Unable to add job posting");
    } finally {
      setIsSubmitting(false);
    }
  };

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

      <main className="flex flex-1 p-8">
        <section className="w-full p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">Manage Jobs</h1>
              <p className="mt-2 text-sm text-slate-600">
                All jobs fetched from your backend database.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline">Filters</Button>
              <Button onClick={() => setIsDialogOpen(true)}>+ Add Job Posting</Button>
            </div>
          </div>
          {errorMessage ? (
            <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {errorMessage}. Check `NEXT_PUBLIC_BACKEND_URL` and ensure backend is running.
            </div>
          ) : loading ? (
            <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              Loading jobs...
            </div>
          ) : parsedRows.length === 0 ? (
            <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              No jobs found in the database.
            </div>
          ) : (
            <div className="mt-4">
              <div className="flex items-center justify-end border-b border-slate-200 p-3">
                <Input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search..."
                  className="max-w-xs"
                />
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Job Role &uarr;&darr;</TableHead>
                    <TableHead>Company Name &uarr;&darr;</TableHead>
                    <TableHead>Job Type &uarr;&darr;</TableHead>
                    <TableHead>Salary Range &uarr;&darr;</TableHead>
                    <TableHead>Your Role</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRows.map((job) => (
                    <TableRow
                      key={job._id || job.id}
                      className={job._id ? "cursor-pointer" : ""}
                      onClick={() => {
                        if (job._id) router.push(`/manage-jobs/${job._id}`);
                      }}
                      onKeyDown={(event) => {
                        if (!job._id) return;
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          router.push(`/manage-jobs/${job._id}`);
                        }
                      }}
                      tabIndex={job._id ? 0 : -1}
                      role={job._id ? "link" : undefined}
                    >
                      <TableCell className="font-medium text-slate-900">
                        {job._id ? (
                          <Link
                            href={`/manage-jobs/${job._id}`}
                            className="text-blue-700 hover:underline"
                            onClick={(event) => event.stopPropagation()}
                          >
                            {job.title || "Untitled Job"}
                          </Link>
                        ) : (
                          job.title || "Untitled Job"
                        )}
                      </TableCell>
                      <TableCell>{job.company || "-"}</TableCell>
                      <TableCell>
                        <span className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-700">
                          {job.job_type || "-"}
                        </span>
                      </TableCell>
                      <TableCell>{job.ctc || "-"}</TableCell>
                      <TableCell>
                        <span className="rounded-full bg-cyan-500 px-2 py-1 text-xs font-medium text-white">
                          Primary
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </section>
      </main>

      <Dialog open={isDialogOpen}>
        <DialogOverlay onClick={() => setIsDialogOpen(false)} />
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Job Posting</DialogTitle>
          </DialogHeader>

          <form className="grid gap-4" onSubmit={handleCreateJob}>
            <Input
              name="title"
              value={form.title}
              onChange={handleFormChange}
              placeholder="Job title"
              required
            />
            <Input
              name="company"
              value={form.company}
              onChange={handleFormChange}
              placeholder="Company name"
              required
            />
            <Textarea
              name="description"
              value={form.description}
              onChange={handleFormChange}
              placeholder="Job description"
              required
            />
            <div className="grid grid-cols-2 gap-4">
              <select
                name="job_type"
                value={form.job_type}
                onChange={handleFormChange}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none ring-blue-500 focus:ring-2"
              >
                <option>Full time</option>
                <option>Internship</option>
              </select>
              <Input
                name="ctc"
                value={form.ctc}
                onChange={handleFormChange}
                placeholder="Salary range (e.g. 15 LPA)"
              />
            </div>
            <Input
              name="exp_req"
              value={form.exp_req}
              onChange={handleFormChange}
              type="number"
              min="0"
              placeholder="Experience required in years"
            />
            <Input
              name="role"
              value={form.role}
              onChange={handleFormChange}
              placeholder="Role tags (comma separated)"
            />
            <Input
              name="skills"
              value={form.skills}
              onChange={handleFormChange}
              placeholder="Skills (comma separated)"
            />
            <div className="mt-1 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Posting..." : "Post Job"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

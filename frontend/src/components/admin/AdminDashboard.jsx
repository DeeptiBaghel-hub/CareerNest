import React, { useEffect, useState } from "react";
import Navbar from "../shared/Navbar";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  Building2,
  BriefcaseBusiness,
  Users,
  CheckCircle2,
  Clock,
  XCircle,
  TrendingUp,
  BarChart3,
  Calendar,
  Layers,
  ArrowUpRight,
  RefreshCw,
  AlertCircle
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { ANALYTICS_API_END_POINT } from "@/utils/constant";
import { toast } from "sonner";

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();

  const fetchAnalytics = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const res = await axios.get(`${ANALYTICS_API_END_POINT}/recruiter`, {
        withCredentials: true,
      });
      if (res.data.success) {
        setData(res.data.analytics);
      }
    } catch (error) {
      console.error("Failed to load analytics", error);
      toast.error(error.response?.data?.message || "Failed to load analytics data.");
    } finally {
      setLoading(false);
      if (isManual) setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const overview = data?.overview || {
    totalCompanies: 0,
    totalJobs: 0,
    activeJobs: 0,
    archivedJobs: 0,
    totalApplications: 0,
    pendingApplications: 0,
    acceptedApplications: 0,
    rejectedApplications: 0,
    withdrawnApplications: 0,
  };

  const applicationsPerMonth = data?.applicationsPerMonth || [];
  const maxMonthCount = Math.max(...applicationsPerMonth.map((m) => m.count), 1);

  const statusBreakdown = [
    {
      label: "Accepted",
      count: overview.acceptedApplications,
      color: "bg-emerald-500",
      textColor: "text-emerald-600 dark:text-emerald-400",
      bgColor: "bg-emerald-50 dark:bg-emerald-950/40",
      icon: CheckCircle2,
    },
    {
      label: "Pending",
      count: overview.pendingApplications,
      color: "bg-amber-500",
      textColor: "text-amber-600 dark:text-amber-400",
      bgColor: "bg-amber-50 dark:bg-amber-950/40",
      icon: Clock,
    },
    {
      label: "Rejected",
      count: overview.rejectedApplications,
      color: "bg-rose-500",
      textColor: "text-rose-600 dark:text-rose-400",
      bgColor: "bg-rose-50 dark:bg-rose-950/40",
      icon: XCircle,
    },
    {
      label: "Withdrawn",
      count: overview.withdrawnApplications,
      color: "bg-slate-400",
      textColor: "text-slate-500",
      bgColor: "bg-slate-100 dark:bg-slate-800",
      icon: AlertCircle,
    },
  ];

  const acceptanceRate = overview.totalApplications > 0
    ? Math.round((overview.acceptedApplications / overview.totalApplications) * 100)
    : 0;

  const formatMonthLabel = (monthStr) => {
    if (!monthStr) return "";
    const [year, month] = monthStr.split("-");
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const idx = parseInt(month, 10) - 1;
    return `${monthNames[idx] || month} '${(year || "").slice(2)}`;
  };

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "accepted":
        return <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">Accepted</Badge>;
      case "rejected":
        return <Badge className="bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/30">Rejected</Badge>;
      case "withdrawn":
        return <Badge className="bg-slate-500/15 text-slate-700 dark:text-slate-400 border border-slate-500/30">Withdrawn</Badge>;
      default:
        return <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30">Pending</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
        {/* Header */}
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                Recruiter Workspace
              </span>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Calendar className="size-3" /> Live Analytics
              </span>
            </div>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
              Hiring Analytics Dashboard
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Real-time insights across your companies, job postings, and incoming applications.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchAnalytics(true)}
              disabled={refreshing}
              className="rounded-full"
            >
              <RefreshCw className={`mr-1.5 size-3.5 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button
              onClick={() => navigate("/admin/jobs/create")}
              className="rounded-full shadow-sm"
              size="sm"
            >
              <BriefcaseBusiness className="mr-1.5 size-3.5" /> Post Job
            </Button>
            <Button
              onClick={() => navigate("/admin/companies/create")}
              variant="secondary"
              className="rounded-full"
              size="sm"
            >
              <Building2 className="mr-1.5 size-3.5" /> Add Company
            </Button>
          </div>
        </header>

        {loading ? (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 animate-pulse rounded-2xl border border-border bg-card/60 p-5" />
              ))}
            </div>
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="h-80 animate-pulse rounded-2xl border border-border bg-card/60 lg:col-span-2" />
              <div className="h-80 animate-pulse rounded-2xl border border-border bg-card/60" />
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Top Stat Cards */}
            <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {/* Companies */}
              <div className="group rounded-2xl border border-border bg-card p-5 shadow-sm transition-all hover:border-primary/40 hover:shadow-md">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Companies Managed
                  </span>
                  <div className="rounded-xl bg-primary/10 p-2.5 text-primary">
                    <Building2 className="size-5" />
                  </div>
                </div>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold">{overview.totalCompanies}</span>
                  <Link to="/admin/companies" className="text-xs text-primary hover:underline flex items-center">
                    View all <ArrowUpRight className="size-3" />
                  </Link>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">Active employer profiles</p>
              </div>

              {/* Total Jobs */}
              <div className="group rounded-2xl border border-border bg-card p-5 shadow-sm transition-all hover:border-primary/40 hover:shadow-md">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Jobs Listed
                  </span>
                  <div className="rounded-xl bg-blue-500/10 p-2.5 text-blue-600 dark:text-blue-400">
                    <BriefcaseBusiness className="size-5" />
                  </div>
                </div>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold">{overview.totalJobs}</span>
                  <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                    {overview.activeJobs} active
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {overview.archivedJobs} archived listings
                </p>
              </div>

              {/* Total Applications */}
              <div className="group rounded-2xl border border-border bg-card p-5 shadow-sm transition-all hover:border-primary/40 hover:shadow-md">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Total Candidates
                  </span>
                  <div className="rounded-xl bg-violet-500/10 p-2.5 text-violet-600 dark:text-violet-400">
                    <Users className="size-5" />
                  </div>
                </div>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold">{overview.totalApplications}</span>
                  <span className="text-xs text-muted-foreground">applications</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Across all active openings
                </p>
              </div>

              {/* Acceptance Rate */}
              <div className="group rounded-2xl border border-border bg-card p-5 shadow-sm transition-all hover:border-primary/40 hover:shadow-md">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Offer Rate
                  </span>
                  <div className="rounded-xl bg-emerald-500/10 p-2.5 text-emerald-600 dark:text-emerald-400">
                    <TrendingUp className="size-5" />
                  </div>
                </div>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold">{acceptanceRate}%</span>
                  <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                    {overview.acceptedApplications} accepted
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {overview.pendingApplications} waiting review
                </p>
              </div>
            </section>

            {/* Charts Section */}
            <section className="grid gap-6 lg:grid-cols-3">
              {/* Applications per Month Bar Chart */}
              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm lg:col-span-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
                  <div>
                    <div className="flex items-center gap-2">
                      <BarChart3 className="size-4 text-primary" />
                      <h2 className="text-lg font-bold">Applications Velocity</h2>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Monthly candidate volume over the last 6 months
                    </p>
                  </div>
                  <Badge variant="outline" className="w-fit text-xs font-medium">
                    Total: {applicationsPerMonth.reduce((acc, m) => acc + m.count, 0)} apps
                  </Badge>
                </div>

                {applicationsPerMonth.length === 0 ? (
                  <div className="flex h-56 items-center justify-center text-sm text-muted-foreground">
                    No application trend data available yet.
                  </div>
                ) : (
                  <div className="flex h-64 items-end gap-3 sm:gap-6 pt-6 pb-2 px-2">
                    {applicationsPerMonth.map((item, idx) => {
                      const heightPercent = maxMonthCount > 0
                        ? Math.max(Math.round((item.count / maxMonthCount) * 100), 8)
                        : 8;

                      return (
                        <div key={idx} className="flex flex-1 flex-col items-center gap-2 h-full justify-end group">
                          {/* Value pill */}
                          <span className="text-xs font-semibold text-foreground/80 transition-transform group-hover:scale-110">
                            {item.count}
                          </span>

                          {/* Bar */}
                          <div className="w-full relative flex items-end justify-center rounded-t-xl bg-muted/60 h-full max-h-[180px]">
                            <div
                              style={{ height: `${heightPercent}%` }}
                              className="w-full rounded-t-xl bg-gradient-to-t from-primary/80 to-primary transition-all duration-500 ease-out group-hover:from-primary group-hover:to-primary/90"
                            />
                          </div>

                          {/* Month Label */}
                          <span className="text-[11px] font-medium text-muted-foreground whitespace-nowrap">
                            {formatMonthLabel(item.month)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Application Status Distribution */}
              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Layers className="size-4 text-primary" />
                    <h2 className="text-lg font-bold">Status Breakdown</h2>
                  </div>
                  <p className="text-xs text-muted-foreground mb-5">
                    Pipeline health of current candidates
                  </p>

                  <div className="space-y-3.5">
                    {statusBreakdown.map((item) => {
                      const percentage = overview.totalApplications > 0
                        ? Math.round((item.count / overview.totalApplications) * 100)
                        : 0;

                      return (
                        <div key={item.label} className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="flex items-center gap-1.5 font-medium">
                              <item.icon className={`size-3.5 ${item.textColor}`} />
                              {item.label}
                            </span>
                            <span className="text-muted-foreground">
                              <span className="font-semibold text-foreground">{item.count}</span> ({percentage}%)
                            </span>
                          </div>
                          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                            <div
                              className={`h-full rounded-full ${item.color} transition-all duration-500`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-6 rounded-xl border border-border/60 bg-muted/30 p-3.5 text-xs text-muted-foreground">
                  💡 Tip: Fast feedback within 48 hours boosts applicant response rates by 3x.
                </div>
              </div>
            </section>

            {/* Secondary Grid: Jobs per Company + Top Jobs */}
            <section className="grid gap-6 lg:grid-cols-2">
              {/* Jobs per Company */}
              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-bold">Company Portfolio</h2>
                    <p className="text-xs text-muted-foreground">
                      Job listings and candidate inflow per brand
                    </p>
                  </div>
                  <Link to="/admin/companies">
                    <Button variant="ghost" size="sm" className="rounded-full text-xs">
                      Manage <ArrowUpRight className="ml-1 size-3" />
                    </Button>
                  </Link>
                </div>

                {(!data?.jobsPerCompany || data.jobsPerCompany.length === 0) ? (
                  <p className="py-8 text-center text-xs text-muted-foreground">
                    No company data available.
                  </p>
                ) : (
                  <div className="divide-y divide-border/60">
                    {data.jobsPerCompany.map((c, i) => (
                      <div key={i} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                        <div className="flex items-center gap-3">
                          <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 font-bold text-primary text-sm">
                            {c.companyName?.charAt(0) || "C"}
                          </div>
                          <div>
                            <p className="text-sm font-semibold">{c.companyName}</p>
                            <p className="text-xs text-muted-foreground">{c.jobCount} open roles</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-bold text-foreground">
                            {c.applicationCount}
                          </span>
                          <span className="ml-1 text-xs text-muted-foreground">applicants</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Top Performing Jobs */}
              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-bold">Top In-Demand Roles</h2>
                    <p className="text-xs text-muted-foreground">
                      Openings with highest application engagement
                    </p>
                  </div>
                  <Link to="/admin/jobs">
                    <Button variant="ghost" size="sm" className="rounded-full text-xs">
                      View all jobs <ArrowUpRight className="ml-1 size-3" />
                    </Button>
                  </Link>
                </div>

                {(!data?.topJobs || data.topJobs.length === 0) ? (
                  <p className="py-8 text-center text-xs text-muted-foreground">
                    No job application data yet.
                  </p>
                ) : (
                  <div className="divide-y divide-border/60">
                    {data.topJobs.map((j, i) => (
                      <Link
                        key={i}
                        to={j.id ? `/admin/jobs/${j.id}/applicants` : "/admin/jobs"}
                        className="flex items-center justify-between py-3 first:pt-0 last:pb-0 transition-colors hover:bg-muted/30 rounded-xl px-2 -mx-2 group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex size-7 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary">
                            #{i + 1}
                          </div>
                          <div>
                            <p className="text-sm font-semibold group-hover:text-primary flex items-center gap-1">
                              {j.title} <ArrowUpRight className="size-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </p>
                            <p className="text-xs text-muted-foreground">{j.companyName}</p>
                          </div>
                        </div>
                        <Badge variant="secondary" className="font-semibold text-xs rounded-full">
                          {j.applicationCount} applicants
                        </Badge>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </section>

            {/* Recent Applications Table */}
            <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
                <div>
                  <h2 className="text-lg font-bold">Recent Candidate Applications</h2>
                  <p className="text-xs text-muted-foreground">
                    Latest submissions awaiting or undergoing review
                  </p>
                </div>
                <Link to="/admin/jobs">
                  <Button variant="outline" size="sm" className="rounded-full text-xs">
                    Review by Job
                  </Button>
                </Link>
              </div>

              {(!data?.recentApplications || data.recentApplications.length === 0) ? (
                <div className="py-12 text-center text-xs text-muted-foreground">
                  No applications received yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Candidate</TableHead>
                        <TableHead>Target Role</TableHead>
                        <TableHead>Company</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Applied Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.recentApplications.map((app, idx) => (
                        <TableRow key={idx}>
                          <TableCell>
                            <div>
                              <p className="font-medium text-sm">{app.applicantName || "Candidate"}</p>
                              <p className="text-xs text-muted-foreground">{app.applicantEmail}</p>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium text-sm">{app.jobTitle}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{app.companyName}</TableCell>
                          <TableCell>{getStatusBadge(app.status)}</TableCell>
                          <TableCell className="text-right text-xs text-muted-foreground">
                            {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric"
                            }) : "Recent"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </section>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;


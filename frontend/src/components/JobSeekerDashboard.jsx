import React, { useEffect, useState } from "react";
import Navbar from "./shared/Navbar";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import {
  BriefcaseBusiness,
  CheckCircle2,
  Clock,
  XCircle,
  TrendingUp,
  Sparkles,
  BookmarkCheck,
  Bookmark,
  MapPin,
  ArrowUpRight,
  Eye,
  Calendar,
  AlertCircle,
  Pen,
  FileText,
  Search,
  Filter,
  Layers,
  ChevronDown,
  ChevronUp,
  User,
  Zap,
  Target
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { ANALYTICS_API_END_POINT, APPLICATION_API_END_POINT } from "@/utils/constant";
import { toast } from "sonner";
import { formatSalary } from "@/utils/jobUtils";
import UpdateProfileDialog from "./UpdateProfileDialog";
import useGetAppliedJobs from "@/hooks/useGetAppliedJobs";
import { setAllAppliedJobs } from "@/redux/jobSlice";

const JobSeekerDashboard = () => {
  const { user } = useSelector((store) => store.auth);
  const { allAppliedJobs = [], allJobs = [] } = useSelector((store) => store.job);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Load applied jobs
  useGetAppliedJobs(user?.role === "student");

  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openProfileEdit, setOpenProfileEdit] = useState(false);
  const [activeTab, setActiveTab] = useState("recommended"); // "recommended" | "applications" | "insights"
  const [recFilter, setRecFilter] = useState("all"); // "all" | "high-match" | "remote"
  const [appStatusFilter, setAppStatusFilter] = useState("all");
  const [searchJobQuery, setSearchJobQuery] = useState("");
  const [expandedAppId, setExpandedAppId] = useState(null);
  const [weeklyTarget, setWeeklyTarget] = useState(5);
  const [withdrawingId, setWithdrawingId] = useState(null);

  // Saved jobs from localStorage
  const savedKey = user?._id ? `careernest:saved-jobs:${user._id}` : null;
  const [savedJobIds, setSavedJobIds] = useState([]);

  useEffect(() => {
    if (savedKey) {
      try {
        setSavedJobIds(JSON.parse(localStorage.getItem(savedKey) || "[]"));
      } catch {
        setSavedJobIds([]);
      }
    }
  }, [savedKey]);

  // Fetch student analytics from backend with fallback
  useEffect(() => {
    const fetchStudentAnalytics = async () => {
      try {
        const res = await axios.get(`${ANALYTICS_API_END_POINT}/student`, {
          withCredentials: true,
        });
        if (res.data.success) {
          setAnalyticsData(res.data.analytics);
        }
      } catch (err) {
        console.warn("Could not load backend student analytics, using local state", err);
      } finally {
        setLoading(false);
      }
    };

    if (user?.role === "student") {
      fetchStudentAnalytics();
    } else {
      setLoading(false);
    }
  }, [user]);

  // Profile completion calculation
  const profileChecks = [
    { label: "Full Name", done: Boolean(user?.fullname) },
    { label: "Email Address", done: Boolean(user?.email) },
    { label: "Phone Number", done: Boolean(user?.phoneNumber) },
    { label: "Bio / Summary", done: Boolean(user?.profile?.bio) },
    { label: "Resume Uploaded", done: Boolean(user?.profile?.resume) },
    { label: "Skills Added", done: Boolean(user?.profile?.skills && user.profile.skills.length > 0) },
  ];
  const completedChecks = profileChecks.filter((c) => c.done).length;
  const profileScore = Math.round((completedChecks / profileChecks.length) * 100);

  // Status breakdown of student's applications
  const acceptedApps = allAppliedJobs.filter((a) => (a.status || "").toLowerCase() === "accepted");
  const pendingApps = allAppliedJobs.filter((a) => (a.status || "").toLowerCase() === "pending");
  const rejectedApps = allAppliedJobs.filter((a) => (a.status || "").toLowerCase() === "rejected");
  const withdrawnApps = allAppliedJobs.filter((a) => (a.status || "").toLowerCase() === "withdrawn");

  // Smart Skill Matching calculation for open jobs
  const userSkills = (user?.profile?.skills || []).map((s) => String(s).toLowerCase().trim());
  const appliedJobIdsSet = new Set(allAppliedJobs.map((a) => a.job?._id?.toString() || a.job?.toString()));

  const matchedJobsList = allJobs
    .filter((j) => !j.isArchived && !appliedJobIdsSet.has(j._id?.toString()))
    .map((j) => {
      const requirements = (j.requirements || []).map((r) => String(r).toLowerCase().trim());
      const matched = [];
      const missing = [];
      requirements.forEach((req) => {
        if (userSkills.some((skill) => skill.includes(req) || req.includes(skill))) {
          matched.push(req);
        } else {
          missing.push(req);
        }
      });
      const matchScore = requirements.length > 0 ? Math.round((matched.length / requirements.length) * 100) : 50;
      return {
        ...j,
        matchScore,
        matchedSkills: matched,
        missingSkills: missing,
      };
    })
    .sort((a, b) => b.matchScore - a.matchScore);

  // Filter recommendations
  const filteredRecommendations = matchedJobsList.filter((j) => {
    if (recFilter === "high-match" && j.matchScore < 70) return false;
    if (recFilter === "remote" && !(j.workMode || "").toLowerCase().includes("remote")) return false;
    if (searchJobQuery.trim()) {
      const q = searchJobQuery.toLowerCase().trim();
      const matchText = `${j.title} ${j.company?.name || ""} ${j.location || ""}`.toLowerCase();
      if (!matchText.includes(q)) return false;
    }
    return true;
  });

  // Filter applications list
  const filteredApplications = allAppliedJobs.filter((app) => {
    if (appStatusFilter !== "all" && (app.status || "").toLowerCase() !== appStatusFilter) return false;
    return true;
  });

  // Toggle Save job
  const toggleSaveJob = (jobId) => {
    if (!savedKey) return;
    const isSaved = savedJobIds.includes(jobId);
    const updated = isSaved ? savedJobIds.filter((id) => id !== jobId) : [...savedJobIds, jobId];
    localStorage.setItem(savedKey, JSON.stringify(updated));
    setSavedJobIds(updated);
    toast.success(isSaved ? "Job removed from saved list." : "Job saved to your list!");
  };

  // Withdraw application
  const handleWithdraw = async (applicationId) => {
    if (!window.confirm("Are you sure you want to withdraw this application?")) return;
    try {
      setWithdrawingId(applicationId);
      const res = await axios.post(
        `${APPLICATION_API_END_POINT}/withdraw/${applicationId}`,
        {},
        { withCredentials: true }
      );
      if (res.data.success) {
        dispatch(
          setAllAppliedJobs(
            allAppliedJobs.map((item) =>
              item._id === applicationId
                ? { ...item, status: "withdrawn", withdrawnAt: new Date().toISOString() }
                : item
            )
          )
        );
        toast.success("Application withdrawn.");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to withdraw application.");
    } finally {
      setWithdrawingId(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "accepted":
        return <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1"><CheckCircle2 className="size-3" /> Offer Extended</Badge>;
      case "rejected":
        return <Badge className="bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/30 flex items-center gap-1"><XCircle className="size-3" /> Not Selected</Badge>;
      case "withdrawn":
        return <Badge className="bg-slate-500/15 text-slate-700 dark:text-slate-400 border border-slate-500/30 flex items-center gap-1"><AlertCircle className="size-3" /> Withdrawn</Badge>;
      default:
        return <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30 flex items-center gap-1"><Clock className="size-3" /> In Review</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
        {/* Welcome & Profile Strength Banner */}
        <section className="mb-8 rounded-3xl border border-border bg-gradient-to-br from-card via-card to-primary/5 p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="size-16 sm:size-20 border-2 border-primary/20 shadow-sm">
                <AvatarImage src={user?.profile?.profilePhoto} alt={user?.fullname} />
                <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
                  {user?.fullname?.charAt(0)?.toUpperCase() || "S"}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                    Candidate Portal
                  </span>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Sparkles className="size-3 text-amber-500" /> Career Growth
                  </span>
                </div>
                <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight">
                  Welcome back, {user?.fullname || "Job Seeker"}! 👋
                </h1>
                <p className="mt-1 text-xs sm:text-sm text-muted-foreground line-clamp-1">
                  {user?.profile?.bio || "Track your job hunt progress, explore smart matched roles, and manage applications."}
                </p>
              </div>
            </div>

            {/* Profile Completeness Gauge */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 rounded-2xl border border-border/80 bg-background/80 p-4 shadow-sm backdrop-blur-sm">
              <div className="space-y-1">
                <div className="flex items-center justify-between gap-4 text-xs font-semibold">
                  <span className="flex items-center gap-1.5">
                    <Target className="size-4 text-primary" /> Profile Strength
                  </span>
                  <span className="text-primary font-bold">{profileScore}%</span>
                </div>
                <div className="h-2 w-40 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary/80 to-primary transition-all duration-700"
                    style={{ width: `${profileScore}%` }}
                  />
                </div>
                <p className="text-[11px] text-muted-foreground">
                  {profileScore === 100 ? "Profile fully optimized!" : `${completedChecks} of ${profileChecks.length} items complete`}
                </p>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setOpenProfileEdit(true)}
                className="rounded-full text-xs shrink-0"
              >
                <Pen className="mr-1 size-3" /> Edit Profile
              </Button>
            </div>
          </div>

          {/* Missing profile hints pill */}
          {profileScore < 100 && (
            <div className="mt-5 pt-4 border-t border-border/60 flex flex-wrap items-center gap-2 text-xs">
              <span className="text-muted-foreground font-medium">Quick Boost:</span>
              {profileChecks.filter((c) => !c.done).map((c) => (
                <Badge
                  key={c.label}
                  variant="outline"
                  onClick={() => setOpenProfileEdit(true)}
                  className="cursor-pointer hover:bg-primary/10 hover:text-primary transition-colors text-[11px] py-0.5 border-dashed"
                >
                  + {c.label}
                </Badge>
              ))}
            </div>
          )}
        </section>

        {/* 4 Key Metric Cards */}
        <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Applications Sent */}
          <div
            onClick={() => { setActiveTab("applications"); setAppStatusFilter("all"); }}
            className="group rounded-2xl border border-border bg-card p-5 shadow-sm transition-all hover:border-primary/40 hover:shadow-md cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Total Applied
              </span>
              <div className="rounded-xl bg-primary/10 p-2.5 text-primary">
                <BriefcaseBusiness className="size-5" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold">{allAppliedJobs.length}</span>
              <span className="text-xs text-muted-foreground">roles</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Active submission history</p>
          </div>

          {/* In Review */}
          <div
            onClick={() => { setActiveTab("applications"); setAppStatusFilter("pending"); }}
            className="group rounded-2xl border border-border bg-card p-5 shadow-sm transition-all hover:border-amber-500/40 hover:shadow-md cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                In Review
              </span>
              <div className="rounded-xl bg-amber-500/10 p-2.5 text-amber-600 dark:text-amber-400">
                <Clock className="size-5" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold">{pendingApps.length}</span>
              <span className="text-xs font-medium text-amber-600 dark:text-amber-400">pending</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Evaluating by recruiters</p>
          </div>

          {/* Offers Extended */}
          <div
            onClick={() => { setActiveTab("applications"); setAppStatusFilter("accepted"); }}
            className="group rounded-2xl border border-border bg-card p-5 shadow-sm transition-all hover:border-emerald-500/40 hover:shadow-md cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Offers / Shortlist
              </span>
              <div className="rounded-xl bg-emerald-500/10 p-2.5 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="size-5" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold">{acceptedApps.length}</span>
              <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">positive</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Next stage opportunities</p>
          </div>

          {/* Saved Jobs */}
          <div
            onClick={() => navigate("/saved")}
            className="group rounded-2xl border border-border bg-card p-5 shadow-sm transition-all hover:border-violet-500/40 hover:shadow-md cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Saved Jobs
              </span>
              <div className="rounded-xl bg-violet-500/10 p-2.5 text-violet-600 dark:text-violet-400">
                <BookmarkCheck className="size-5" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold">{savedJobIds.length}</span>
              <span className="text-xs text-primary flex items-center">
                View <ArrowUpRight className="size-3 ml-0.5" />
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Bookmarked for later</p>
          </div>
        </section>

        {/* Weekly Target Goal Tracker */}
        <section className="mb-8 rounded-2xl border border-border bg-card p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Target className="size-5" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Weekly Application Target</p>
              <h3 className="text-base font-bold">
                {Math.min(allAppliedJobs.length, weeklyTarget)} of {weeklyTarget} roles applied this cycle
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="h-2 w-full sm:w-48 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500"
                style={{ width: `${Math.min(Math.round((allAppliedJobs.length / weeklyTarget) * 100), 100)}%` }}
              />
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <Button
                variant="outline"
                size="sm"
                className="size-7 p-0 rounded-full text-xs"
                onClick={() => setWeeklyTarget((prev) => Math.max(1, prev - 1))}
              >
                -
              </Button>
              <span className="text-xs font-bold px-1.5">{weeklyTarget}</span>
              <Button
                variant="outline"
                size="sm"
                className="size-7 p-0 rounded-full text-xs"
                onClick={() => setWeeklyTarget((prev) => prev + 1)}
              >
                +
              </Button>
            </div>
          </div>
        </section>

        {/* Interactive Navigation Tabs */}
        <div className="mb-6 flex border-b border-border">
          <button
            onClick={() => setActiveTab("recommended")}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${
              activeTab === "recommended"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Sparkles className="size-4" />
            Smart Matches ({filteredRecommendations.length})
          </button>

          <button
            onClick={() => setActiveTab("applications")}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${
              activeTab === "applications"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <BriefcaseBusiness className="size-4" />
            Application Pipeline ({allAppliedJobs.length})
          </button>

          <button
            onClick={() => setActiveTab("insights")}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${
              activeTab === "insights"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <TrendingUp className="size-4" />
            My Application Trends
          </button>
        </div>

        {/* TAB 1: SMART RECOMMENDED JOBS */}
        {activeTab === "recommended" && (
          <section className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold">Roles Tailored To Your Skills</h2>
                <p className="text-xs text-muted-foreground">
                  Automatically ranked by how closely job requirements match your profile skills.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="relative w-full sm:w-60">
                  <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                  <Input
                    placeholder="Search title, company..."
                    value={searchJobQuery}
                    onChange={(e) => setSearchJobQuery(e.target.value)}
                    className="pl-8 h-9 text-xs rounded-full"
                  />
                </div>

                <div className="flex items-center gap-1">
                  {[
                    { id: "all", label: "All" },
                    { id: "high-match", label: "70%+ Match" },
                    { id: "remote", label: "Remote" },
                  ].map((f) => (
                    <Button
                      key={f.id}
                      variant={recFilter === f.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => setRecFilter(f.id)}
                      className="h-8 text-xs rounded-full"
                    >
                      {f.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {filteredRecommendations.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border p-12 text-center">
                <Sparkles className="mx-auto size-8 text-muted-foreground mb-3 opacity-60" />
                <h3 className="font-semibold text-base">No matching openings right now</h3>
                <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                  Try adding more skills to your profile or adjusting your search filters.
                </p>
                <Button onClick={() => setOpenProfileEdit(true)} size="sm" className="mt-4 rounded-full text-xs">
                  Update Skills
                </Button>
              </div>
            ) : (
              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {filteredRecommendations.map((job) => {
                  const isSaved = savedJobIds.includes(job._id);
                  return (
                    <div
                      key={job._id}
                      className="flex flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-sm transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-md"
                    >
                      <div>
                        {/* Match Badge & Save */}
                        <div className="flex items-center justify-between mb-3">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold border ${
                              job.matchScore >= 70
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                                : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                            }`}
                          >
                            <Zap className="size-3" /> {job.matchScore}% Match
                          </span>

                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => toggleSaveJob(job._id)}
                            className="size-8 rounded-full"
                          >
                            {isSaved ? (
                              <BookmarkCheck className="size-4 text-primary" />
                            ) : (
                              <Bookmark className="size-4 text-muted-foreground" />
                            )}
                          </Button>
                        </div>

                        {/* Title & Company */}
                        <div className="flex items-start gap-3">
                          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-border bg-secondary font-bold text-primary">
                            {job.company?.name?.charAt(0) || "C"}
                          </div>
                          <div>
                            <h3 className="font-bold text-base leading-snug hover:text-primary transition-colors">
                              {job.title}
                            </h3>
                            <p className="text-xs font-medium text-muted-foreground">{job.company?.name}</p>
                          </div>
                        </div>

                        {/* Meta tags */}
                        <div className="mt-4 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MapPin className="size-3" /> {job.location || "Remote"}
                          </span>
                          <span>•</span>
                          <span>{formatSalary(job.salary)}</span>
                          {job.workMode && (
                            <>
                              <span>•</span>
                              <Badge variant="secondary" className="text-[10px] py-0 px-2">
                                {job.workMode}
                              </Badge>
                            </>
                          )}
                        </div>

                        {/* Matched Skills */}
                        <div className="mt-3 flex flex-wrap gap-1">
                          {job.matchedSkills?.slice(0, 3).map((s, idx) => (
                            <Badge
                              key={idx}
                              className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 text-[10px] py-0"
                            >
                              ✓ {s}
                            </Badge>
                          ))}
                          {job.missingSkills?.slice(0, 2).map((s, idx) => (
                            <Badge
                              key={idx}
                              variant="outline"
                              className="text-[10px] py-0 opacity-70 border-dashed"
                            >
                              + {s}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Footer Actions */}
                      <div className="mt-5 pt-3 border-t border-border/60 flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/description/${job._id}`)}
                          className="flex-1 text-xs rounded-xl"
                        >
                          <Eye className="mr-1.5 size-3.5" /> Details
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => navigate(`/description/${job._id}`)}
                          className="flex-1 text-xs rounded-xl"
                        >
                          Apply <ArrowUpRight className="ml-1 size-3.5" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* TAB 2: APPLICATION PIPELINE */}
        {activeTab === "applications" && (
          <section className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold">Application Pipeline</h2>
                <p className="text-xs text-muted-foreground">
                  Track the real-time stage of each role you have submitted.
                </p>
              </div>

              {/* Status Filter Chips */}
              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  { id: "all", label: "All" },
                  { id: "pending", label: "In Review" },
                  { id: "accepted", label: "Accepted" },
                  { id: "rejected", label: "Rejected" },
                  { id: "withdrawn", label: "Withdrawn" },
                ].map((st) => (
                  <Button
                    key={st.id}
                    variant={appStatusFilter === st.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setAppStatusFilter(st.id)}
                    className="h-8 text-xs rounded-full"
                  >
                    {st.label}
                  </Button>
                ))}
              </div>
            </div>

            {filteredApplications.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border p-12 text-center">
                <BriefcaseBusiness className="mx-auto size-8 text-muted-foreground mb-3 opacity-60" />
                <h3 className="font-semibold text-base">No applications in this category</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Ready to apply? Explore smart recommended roles above.
                </p>
                <Button onClick={() => setActiveTab("recommended")} size="sm" className="mt-4 rounded-full text-xs">
                  Browse Openings
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredApplications.map((app) => {
                  const isExpanded = expandedAppId === app._id;
                  const isPending = (app.status || "").toLowerCase() === "pending";

                  return (
                    <div
                      key={app._id}
                      className="rounded-2xl border border-border bg-card p-5 shadow-sm transition-all"
                    >
                      <div
                        onClick={() => setExpandedAppId(isExpanded ? null : app._id)}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 font-bold text-primary text-sm">
                            {app.job?.company?.name?.charAt(0) || "C"}
                          </div>
                          <div>
                            <h4 className="font-bold text-base hover:text-primary transition-colors">
                              {app.job?.title || "Role Title"}
                            </h4>
                            <p className="text-xs text-muted-foreground">
                              {app.job?.company?.name} • Applied on {app.createdAt?.split("T")[0]}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          {getStatusBadge(app.status)}
                          <Button variant="ghost" size="icon" className="size-8 rounded-full">
                            {isExpanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                          </Button>
                        </div>
                      </div>

                      {/* Expandable Application Journey Timeline */}
                      {isExpanded && (
                        <div className="mt-5 pt-4 border-t border-border/60 space-y-4">
                          <div className="rounded-xl border border-border/80 bg-muted/20 p-4">
                            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
                              Hiring Timeline Progress
                            </p>

                            <div className="grid grid-cols-3 gap-2 text-center">
                              {/* Step 1: Submitted */}
                              <div className="flex flex-col items-center">
                                <div className="flex size-8 items-center justify-center rounded-full bg-emerald-500 text-white font-bold text-xs shadow-sm">
                                  ✓
                                </div>
                                <p className="mt-2 text-xs font-semibold">Submitted</p>
                                <p className="text-[11px] text-muted-foreground">{app.createdAt?.split("T")[0]}</p>
                              </div>

                              {/* Step 2: Under Review */}
                              <div className="flex flex-col items-center">
                                <div
                                  className={`flex size-8 items-center justify-center rounded-full font-bold text-xs shadow-sm ${
                                    app.status === "withdrawn"
                                      ? "bg-slate-400 text-white"
                                      : "bg-amber-500 text-white"
                                  }`}
                                >
                                  {app.status === "withdrawn" ? "—" : "2"}
                                </div>
                                <p className="mt-2 text-xs font-semibold">
                                  {app.status === "withdrawn" ? "Withdrawn" : "Recruiter Review"}
                                </p>
                                <p className="text-[11px] text-muted-foreground">
                                  {app.status === "withdrawn" ? "Cancelled by user" : "In queue"}
                                </p>
                              </div>

                              {/* Step 3: Decision */}
                              <div className="flex flex-col items-center">
                                <div
                                  className={`flex size-8 items-center justify-center rounded-full font-bold text-xs shadow-sm ${
                                    app.status === "accepted"
                                      ? "bg-emerald-500 text-white"
                                      : app.status === "rejected"
                                      ? "bg-rose-500 text-white"
                                      : "bg-muted text-muted-foreground border border-border"
                                  }`}
                                >
                                  {app.status === "accepted" ? "✓" : app.status === "rejected" ? "✕" : "3"}
                                </div>
                                <p className="mt-2 text-xs font-semibold">
                                  {app.status === "accepted"
                                    ? "Offer Extended"
                                    : app.status === "rejected"
                                    ? "Not Selected"
                                    : "Final Decision"}
                                </p>
                                <p className="text-[11px] text-muted-foreground">
                                  {app.status === "accepted"
                                    ? "Congrats!"
                                    : app.status === "rejected"
                                    ? "Application closed"
                                    : "Pending"}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-1">
                            {app.job?._id && (
                              <Link to={`/description/${app.job._id}`}>
                                <Button variant="outline" size="sm" className="text-xs rounded-full">
                                  View Job Details <ArrowUpRight className="ml-1 size-3" />
                                </Button>
                              </Link>
                            )}

                            {isPending && (
                              <Button
                                variant="outline"
                                size="sm"
                                disabled={withdrawingId === app._id}
                                onClick={() => handleWithdraw(app._id)}
                                className="text-xs text-destructive hover:bg-destructive/10 border-destructive/30 rounded-full"
                              >
                                {withdrawingId === app._id ? "Withdrawing..." : "Withdraw Application"}
                              </Button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* TAB 3: APPLICATION INSIGHTS */}
        {activeTab === "insights" && (
          <section className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Velocity Bar Chart */}
              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm lg:col-span-2">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-lg font-bold">Your Monthly Application Activity</h2>
                    <p className="text-xs text-muted-foreground">
                      Pace of submissions over the last 6 months
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    Total: {allAppliedJobs.length} apps
                  </Badge>
                </div>

                <div className="flex h-56 items-end gap-4 sm:gap-8 pt-6 pb-2 px-2">
                  {(analyticsData?.applicationsPerMonth || [
                    { month: "Jun", count: 0 },
                    { month: "Jul", count: 1 },
                    { month: "Aug", count: 0 },
                    { month: "Sep", count: 2 },
                    { month: "Oct", count: 3 },
                    { month: "Nov", count: allAppliedJobs.length },
                  ]).map((item, idx) => {
                    const maxCount = Math.max(
                      ...(analyticsData?.applicationsPerMonth || []).map((m) => m.count),
                      allAppliedJobs.length,
                      1
                    );
                    const heightPercent = Math.max(Math.round((item.count / maxCount) * 100), 8);

                    return (
                      <div key={idx} className="flex flex-1 flex-col items-center gap-2 h-full justify-end group">
                        <span className="text-xs font-semibold">{item.count}</span>
                        <div className="w-full relative flex items-end justify-center rounded-t-xl bg-muted/60 h-full max-h-[160px]">
                          <div
                            style={{ height: `${heightPercent}%` }}
                            className="w-full rounded-t-xl bg-gradient-to-t from-primary/80 to-primary transition-all duration-500"
                          />
                        </div>
                        <span className="text-[11px] font-medium text-muted-foreground">{item.month}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Conversion Tips & Stats */}
              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col justify-between">
                <div>
                  <h2 className="text-lg font-bold">Application Success Tips</h2>
                  <p className="text-xs text-muted-foreground mb-4">How to boost interview callback rates</p>

                  <div className="space-y-3 text-xs leading-relaxed text-muted-foreground">
                    <div className="p-3 rounded-xl bg-muted/40 border border-border">
                      <p className="font-semibold text-foreground mb-1">🎯 Target 70%+ Match Roles</p>
                      Candidates matching 70%+ of listed skills receive 4x more interview invitations.
                    </div>
                    <div className="p-3 rounded-xl bg-muted/40 border border-border">
                      <p className="font-semibold text-foreground mb-1">⚡ Apply in First 48 Hours</p>
                      Submitting your application within the first 2 days increases recruiter view chances by 65%.
                    </div>
                    <div className="p-3 rounded-xl bg-muted/40 border border-border">
                      <p className="font-semibold text-foreground mb-1">📄 Keep Resume Updated</p>
                      Ensure all technologies mentioned in your skills section are reflected in your project bullets.
                    </div>
                  </div>
                </div>

                <Button
                  onClick={() => setActiveTab("recommended")}
                  className="w-full mt-4 rounded-xl text-xs"
                >
                  Explore Recommended Roles
                </Button>
              </div>
            </div>
          </section>
        )}

        {/* Update Profile Modal Dialog */}
        <UpdateProfileDialog open={openProfileEdit} setOpen={setOpenProfileEdit} />
      </main>
    </div>
  );
};

export default JobSeekerDashboard;

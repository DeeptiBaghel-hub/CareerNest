import React, { useEffect, useState } from 'react'
import Navbar from '../shared/Navbar'
import { Input } from '../ui/input'
import { Button } from '../ui/button' 
import { useNavigate } from 'react-router-dom' 
import { useDispatch, useSelector } from 'react-redux'
import AdminJobsTable from './AdminJobsTable'
import useGetAllAdminJobs from '@/hooks/useGetAllAdminJobs'
import { setSearchJobByText } from '@/redux/jobSlice'
import { Archive, BriefcaseBusiness, Users } from 'lucide-react'

const AdminJobs = () => {
  useGetAllAdminJobs();
  const [input, setInput] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { allAdminJobs = [] } = useSelector(store => store.job);
  const activeJobs = allAdminJobs.filter(job => !job.isArchived);
  const archivedJobs = allAdminJobs.length - activeJobs.length;
  const applicationCount = allAdminJobs.reduce((total, job) => total + (job.applications?.length || 0), 0);

  useEffect(() => {
    dispatch(setSearchJobByText(input));
  }, [dispatch, input]);

  const statusOptions = [
    { value: "all", label: "All jobs", count: allAdminJobs.length },
    { value: "active", label: "Active", count: activeJobs.length },
    { value: "archived", label: "Archived", count: archivedJobs },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <header className="mb-7 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">Recruiter workspace</p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight">Your job listings</h1>
            <p className="mt-2 text-sm text-muted-foreground">Manage open roles and keep track of incoming applicants.</p>
          </div>
          <Button onClick={() => navigate("/admin/jobs/create")} className="rounded-full px-5">
            <BriefcaseBusiness className="mr-2 size-4" /> Post a job
          </Button>
        </header>

        <section aria-label="Recruiter job overview" className="mb-7 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between text-sm text-muted-foreground"><span>Active listings</span><BriefcaseBusiness className="size-4 text-primary" /></div>
            <p className="mt-3 text-3xl font-bold">{activeJobs.length}</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between text-sm text-muted-foreground"><span>Total applicants</span><Users className="size-4 text-primary" /></div>
            <p className="mt-3 text-3xl font-bold">{applicationCount}</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between text-sm text-muted-foreground"><span>Archived listings</span><Archive className="size-4 text-primary" /></div>
            <p className="mt-3 text-3xl font-bold">{archivedJobs}</p>
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Input
              aria-label="Search jobs by company or title"
              className="w-full sm:max-w-sm"
              placeholder="Search company or role"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <div role="group" aria-label="Filter jobs by status" className="flex flex-wrap gap-2">
              {statusOptions.map(option => (
                <Button
                  key={option.value}
                  type="button"
                  variant={statusFilter === option.value ? "secondary" : "outline"}
                  aria-pressed={statusFilter === option.value}
                  onClick={() => setStatusFilter(option.value)}
                  className="rounded-full"
                >
                  {option.label}<span className="ml-2 text-xs opacity-70">{option.count}</span>
                </Button>
              ))}
            </div>
          </div>
          <AdminJobsTable statusFilter={statusFilter} />
        </section>
      </main>
    </div>
  )
}

export default AdminJobs
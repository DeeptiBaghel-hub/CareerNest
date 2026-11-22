import React, { useEffect, useState } from 'react'
import Navbar from './shared/Navbar'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { APPLICATION_API_END_POINT, JOB_API_END_POINT } from '@/utils/constant';
import { setSingleJob } from '@/redux/jobSlice';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';
import { BriefcaseBusiness, CalendarDays, MapPin, Users } from 'lucide-react';
import { formatSalary } from '@/utils/jobUtils';

const getSafeWebsiteUrl = (value) => {
    if (!value) return null;
    try {
        const url = new URL(value);
        return url.protocol === 'http:' || url.protocol === 'https:' ? url.href : null;
    } catch {
        return null;
    }
};

const JobDescription = () => {
    const { singleJob } = useSelector(store => store.job);
    const { user } = useSelector(store => store.auth);
    const params = useParams();
    const jobId = params.id;
    const dispatch = useDispatch();
    const currentJob = singleJob?._id === jobId ? singleJob : null;
    const company = currentJob?.company;
    const companyWebsiteUrl = getSafeWebsiteUrl(company?.website);
    const hasCompanyDetails = company && (
        company.description ||
        company.industry ||
        company.companySize ||
        company.founded ||
        company.companyType ||
        company.location ||
        company.website ||
        company.specializations?.length
    );
    const [applicationStatus, setApplicationStatus] = useState(null);
    const [isApplying, setIsApplying] = useState(false);
    const hasCurrentApplicationStatus = applicationStatus?.jobId === jobId && applicationStatus?.userId === user?._id;
    const isApplied = hasCurrentApplicationStatus && applicationStatus.hasApplied;
    const isCheckingApplication = user?.role === "student" && !hasCurrentApplicationStatus;

    const applyJobHandler = async () => {
        try {
            setIsApplying(true);
            const res = await axios.post(`${APPLICATION_API_END_POINT}/apply/${jobId}`, {}, { withCredentials: true });

            if (res.data.success) {
                setApplicationStatus({ jobId, userId: user?._id, hasApplied: true });
                dispatch(setSingleJob({ ...currentJob, applicationCount: (currentJob.applicationCount || 0) + 1 }));
                toast.success(res.data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Something went wrong while applying.");
        } finally {
            setIsApplying(false);
        }
    }

    useEffect(() => {
        const controller = new AbortController();
        let isCurrent = true;
        dispatch(setSingleJob(null));

        const fetchSingleJob = async () => {
            let jobLoaded = false;
            try {
                const res = await axios.get(`${JOB_API_END_POINT}/get/${jobId}`, {
                    withCredentials: true,
                    signal: controller.signal
                });
                if (res.data.success && isCurrent) {
                    dispatch(setSingleJob(res.data.job));
                    jobLoaded = true;
                }
            } catch (error) {
                if (!axios.isCancel(error) && isCurrent) {
                    toast.error(error.response?.data?.message || "Unable to load this job.");
                }
            }

            if (jobLoaded && user?.role === "student" && isCurrent && !controller.signal.aborted) {
                try {
                    const res = await axios.get(`${APPLICATION_API_END_POINT}/check/${jobId}`, {
                        withCredentials: true,
                        signal: controller.signal
                    });
                    if (isCurrent && res.data.success) {
                        setApplicationStatus({
                            jobId,
                            userId: user._id,
                            hasApplied: res.data.hasApplied
                        });
                    }
                } catch (error) {
                    if (!axios.isCancel(error) && isCurrent) {
                        toast.error(error.response?.data?.message || "Unable to check your application status.");
                        setApplicationStatus({ jobId, userId: user._id, hasApplied: false });
                    }
                }
            }
        }
        fetchSingleJob();
        return () => {
            isCurrent = false;
            controller.abort();
        };
    }, [jobId, dispatch, user?._id, user?.role]);

    return (
        <div className="min-h-screen bg-background text-foreground">
            <Navbar />
            <main className="mx-auto max-w-5xl px-5 py-8 sm:py-12">
                <div className="mb-6 text-sm text-muted-foreground"><a href="/jobs" className="hover:text-primary">Jobs</a><span className="px-2">/</span><span>{currentJob?.company?.name || "Job details"}</span></div>
                <section className="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-10">
                    <div className="flex flex-col gap-6 border-b border-border pb-7 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex gap-4">
                            <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-xl font-bold text-primary">{currentJob?.company?.name?.charAt(0)?.toUpperCase() || "C"}</div>
                            <div><p className="font-medium text-muted-foreground">{currentJob?.company?.name}</p><h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">{currentJob?.title || "Loading job…"}</h1><div className="mt-3 flex flex-wrap gap-2"><Badge variant="secondary">{currentJob?.jobType}</Badge><Badge variant="secondary">{currentJob?.experienceLevel} years experience</Badge><Badge variant="secondary">{currentJob?.position} positions</Badge></div></div>
                        </div>
                        <Button onClick={isApplied ? undefined : applyJobHandler} disabled={isApplied || isApplying || isCheckingApplication || !currentJob} className="h-11 rounded-xl px-6">{isCheckingApplication ? "Checking…" : isApplying ? "Applying…" : isApplied ? 'Already Applied' : 'Apply Now'}</Button>
                    </div>
                    <div className="grid gap-4 py-6 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="flex items-center gap-3 rounded-2xl bg-secondary/60 p-4"><MapPin className="size-5 text-primary" /><div><p className="text-xs text-muted-foreground">Location</p><p className="font-medium">{currentJob?.location || "Not specified"}</p></div></div>
                        <div className="flex items-center gap-3 rounded-2xl bg-secondary/60 p-4"><BriefcaseBusiness className="size-5 text-primary" /><div><p className="text-xs text-muted-foreground">Salary</p><p className="font-medium">{formatSalary(currentJob?.salary)}</p></div></div>
                        <div className="flex items-center gap-3 rounded-2xl bg-secondary/60 p-4"><Users className="size-5 text-primary" /><div><p className="text-xs text-muted-foreground">Applicants</p><p className="font-medium">{currentJob?.applicationCount ?? 0} applicants</p></div></div>
                        {currentJob?.workMode && <div className="flex items-center gap-3 rounded-2xl bg-secondary/60 p-4"><BriefcaseBusiness className="size-5 text-primary" /><div><p className="text-xs text-muted-foreground">Work mode</p><p className="font-medium">{currentJob.workMode}</p></div></div>}
                    </div>
                    <div className="space-y-6 border-t border-border pt-7">
                        <div><h2 className="text-lg font-semibold">About the role</h2><p className="mt-3 whitespace-pre-line leading-7 text-muted-foreground">{currentJob?.description}</p></div>
                        {currentJob?.requirements?.length > 0 && <div><h2 className="text-lg font-semibold">What you’ll need</h2><ul className="mt-3 grid gap-2 text-muted-foreground sm:grid-cols-2">{currentJob.requirements.map((requirement, index) => <li key={`${requirement}-${index}`} className="flex gap-2"><span className="text-primary">•</span>{requirement}</li>)}</ul></div>}
                        {currentJob?.benefits?.length > 0 && <div><h2 className="text-lg font-semibold">Benefits</h2><ul className="mt-3 grid gap-2 text-muted-foreground sm:grid-cols-2">{currentJob.benefits.map((benefit, index) => <li key={`${benefit}-${index}`} className="flex gap-2"><span className="text-primary">•</span>{benefit}</li>)}</ul></div>}
                        {hasCompanyDetails && <section className="space-y-4 rounded-2xl bg-secondary/40 p-5">
                            <h2 className="text-lg font-semibold">About {company.name}</h2>
                            {company.description && <p className="whitespace-pre-line leading-7 text-muted-foreground">{company.description}</p>}
                            <dl className="grid gap-3 text-sm sm:grid-cols-2">
                                {company.industry && <div><dt className="font-medium">Industry</dt><dd className="mt-1 text-muted-foreground">{company.industry}</dd></div>}
                                {company.companySize && <div><dt className="font-medium">Company size</dt><dd className="mt-1 text-muted-foreground">{company.companySize}</dd></div>}
                                {company.founded && <div><dt className="font-medium">Founded</dt><dd className="mt-1 text-muted-foreground">{company.founded}</dd></div>}
                                {company.companyType && <div><dt className="font-medium">Company type</dt><dd className="mt-1 text-muted-foreground">{company.companyType}</dd></div>}
                                {company.location && <div><dt className="font-medium">Headquarters</dt><dd className="mt-1 text-muted-foreground">{company.location}</dd></div>}
                                {company.website && <div><dt className="font-medium">Website</dt><dd className="mt-1 text-muted-foreground">{companyWebsiteUrl ? <a href={companyWebsiteUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline">{company.website}</a> : company.website}</dd></div>}
                            </dl>
                            {company.specializations?.length > 0 && <div><h3 className="font-medium">Specializations</h3><ul className="mt-2 grid gap-2 text-muted-foreground sm:grid-cols-2">{company.specializations.map((specialization, index) => <li key={`${specialization}-${index}`} className="flex gap-2"><span className="text-primary">•</span>{specialization}</li>)}</ul></div>}
                        </section>}
                        {currentJob?.applicationDeadline && <p className="flex items-center gap-2 text-sm font-medium"><CalendarDays className="size-4 text-primary" />Apply by {new Date(currentJob.applicationDeadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })}</p>}
                        <p className="flex items-center gap-2 text-sm text-muted-foreground"><CalendarDays className="size-4" />Posted {currentJob?.createdAt ? new Date(currentJob.createdAt).toLocaleDateString() : "—"}</p>
                    </div>
                </section>
            </main>
        </div>
    )
}

export default JobDescription

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

const JobDescription = () => {
    const { singleJob } = useSelector(store => store.job);
    const { user } = useSelector(store => store.auth);
    const isIntiallyApplied = singleJob?.applications?.some(application => application.applicant === user?._id) || false;
    const [isApplied, setIsApplied] = useState(isIntiallyApplied);

    const params = useParams();
    const jobId = params.id;
    const dispatch = useDispatch();

    const applyJobHandler = async () => {
        try {
            const res = await axios.post(`${APPLICATION_API_END_POINT}/apply/${jobId}`, {}, { withCredentials: true });

            if (res.data.success) {
                setIsApplied(true);
                const updatedSingleJob = { ...singleJob, applications: [...singleJob.applications, { applicant: user?._id }] }
                dispatch(setSingleJob(updatedSingleJob));
                toast.success(res.data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response?.data?.message || "Something went wrong while applying.");
        }
    }

    useEffect(() => {
        const fetchSingleJob = async () => {
            try {
                const res = await axios.get(`${JOB_API_END_POINT}/get/${jobId}`, { withCredentials: true });
                if (res.data.success) {
                    dispatch(setSingleJob(res.data.job));
                    setIsApplied(res.data.job.applications.some(application => application.applicant === user?._id))
                }
            } catch (error) {
                console.log(error);
            }
        }
        fetchSingleJob();
    }, [jobId, dispatch, user?._id]);

    return (
        <div className="min-h-screen bg-background text-foreground">
            <Navbar />
            <main className="mx-auto max-w-5xl px-5 py-8 sm:py-12">
                <div className="mb-6 text-sm text-muted-foreground"><a href="/jobs" className="hover:text-primary">Jobs</a><span className="px-2">/</span><span>{singleJob?.company?.name || "Job details"}</span></div>
                <section className="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-10">
                    <div className="flex flex-col gap-6 border-b border-border pb-7 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex gap-4">
                            <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-xl font-bold text-primary">{singleJob?.company?.name?.charAt(0)?.toUpperCase() || "C"}</div>
                            <div><p className="font-medium text-muted-foreground">{singleJob?.company?.name}</p><h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">{singleJob?.title || "Loading job…"}</h1><div className="mt-3 flex flex-wrap gap-2"><Badge variant="secondary">{singleJob?.jobType}</Badge><Badge variant="secondary">{singleJob?.experienceLevel} years experience</Badge><Badge variant="secondary">{singleJob?.position} positions</Badge></div></div>
                        </div>
                        <Button onClick={isApplied ? undefined : applyJobHandler} disabled={isApplied || !singleJob} className="h-11 rounded-xl px-6">{isApplied ? 'Already Applied' : 'Apply Now'}</Button>
                    </div>
                    <div className="grid gap-4 py-6 sm:grid-cols-3">
                        <div className="flex items-center gap-3 rounded-2xl bg-secondary/60 p-4"><MapPin className="size-5 text-primary" /><div><p className="text-xs text-muted-foreground">Location</p><p className="font-medium">{singleJob?.location || "Not specified"}</p></div></div>
                        <div className="flex items-center gap-3 rounded-2xl bg-secondary/60 p-4"><BriefcaseBusiness className="size-5 text-primary" /><div><p className="text-xs text-muted-foreground">Salary</p><p className="font-medium">₹{singleJob?.salary}{!String(singleJob?.salary || "").includes("LPA") && " LPA"}</p></div></div>
                        <div className="flex items-center gap-3 rounded-2xl bg-secondary/60 p-4"><Users className="size-5 text-primary" /><div><p className="text-xs text-muted-foreground">Applicants</p><p className="font-medium">{singleJob?.applications?.length ?? 0} applicants</p></div></div>
                    </div>
                    <div className="space-y-6 border-t border-border pt-7">
                        <div><h2 className="text-lg font-semibold">About the role</h2><p className="mt-3 whitespace-pre-line leading-7 text-muted-foreground">{singleJob?.description}</p></div>
                        {singleJob?.requirements?.length > 0 && <div><h2 className="text-lg font-semibold">What you’ll need</h2><ul className="mt-3 grid gap-2 text-muted-foreground sm:grid-cols-2">{singleJob.requirements.map((requirement, index) => <li key={`${requirement}-${index}`} className="flex gap-2"><span className="text-primary">•</span>{requirement}</li>)}</ul></div>}
                        <p className="flex items-center gap-2 text-sm text-muted-foreground"><CalendarDays className="size-4" />Posted {singleJob?.createdAt ? new Date(singleJob.createdAt).toLocaleDateString() : "—"}</p>
                    </div>
                </section>
            </main>
        </div>
    )
}

export default JobDescription

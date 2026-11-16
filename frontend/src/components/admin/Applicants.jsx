import React, { useEffect, useMemo, useState } from 'react'
import Navbar from '../shared/Navbar'
import ApplicantsTable from './ApplicantsTable'
import axios from 'axios';
import { APPLICATION_API_END_POINT } from '@/utils/constant';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setAllApplicants } from '@/redux/applicationSlice';
import { CheckCircle2, Clock3, Users, XCircle } from 'lucide-react'
import { Button } from '../ui/button'
import { toast } from 'sonner'

const EMPTY_APPLICATIONS = [];

const Applicants = () => {
    const params = useParams();
    const dispatch = useDispatch();
    const { applicants: storedApplicants } = useSelector(store => store.application);
    const [fetchState, setFetchState] = useState({ jobId: null, status: "loading" });
    const [reloadKey, setReloadKey] = useState(0);

    useEffect(() => {
        const controller = new AbortController();
        let isCurrent = true;
        dispatch(setAllApplicants(null));
        const fetchAllApplicants = async () => {
            try {
                const res = await axios.get(`${APPLICATION_API_END_POINT}/${params.id}/applicants`, {
                    withCredentials: true,
                    signal: controller.signal
                });
                if (!isCurrent) return;
                if (!res.data.success) {
                    throw new Error(res.data.message || "Unable to load applicants.");
                }
                dispatch(setAllApplicants(res.data.job));
                setFetchState({ jobId: params.id, status: "loaded" });
            } catch (error) {
                if (isCurrent && !axios.isCancel(error)) {
                    const message = error.response?.data?.message || error.message || "Unable to load applicants.";
                    toast.error(message);
                    setFetchState({ jobId: params.id, status: "error", message });
                }
            }
        }
        fetchAllApplicants();
        return () => {
            isCurrent = false;
            controller.abort();
        };
    }, [dispatch, params.id, reloadKey]);

    const applicants = storedApplicants?._id === params.id ? storedApplicants : null;
    const applications = applicants?.applications || EMPTY_APPLICATIONS;
    const statusCounts = useMemo(() => applications.reduce((counts, application) => {
        const status = String(application.status || "pending").toLowerCase();
        counts[status] = (counts[status] || 0) + 1;
        return counts;
    }, { pending: 0, accepted: 0, rejected: 0, withdrawn: 0 }), [applications]);
    const loading = fetchState.jobId !== params.id
        || fetchState.status === "loading"
        || (fetchState.status === "loaded" && !applicants);
    const failed = fetchState.jobId === params.id && fetchState.status === "error";

    return (
        <div className="min-h-screen bg-background text-foreground">
            <Navbar />
            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
                <header className="mb-7">
                    <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">Recruiter workspace</p>
                    <h1 className="mt-1 text-3xl font-bold tracking-tight">Applicants</h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                        {loading ? "Loading applicant details…" : applicants?.title
                            ? <>Review candidates for <span className="font-semibold text-foreground">{applicants.title}</span>.</>
                            : "Review and manage candidates for this role."}
                    </p>
                </header>

                {loading ? (
                    <div role="status" className="rounded-2xl border border-border bg-card px-6 py-12 text-center text-muted-foreground">
                        Loading applicants…
                    </div>
                ) : failed ? (
                    <div className="rounded-2xl border border-border bg-card px-6 py-12 text-center">
                        <p className="font-semibold">Couldn’t load applicants</p>
                        <p className="mt-2 text-sm text-muted-foreground">{fetchState.message}</p>
                        <Button type="button" className="mt-4" onClick={() => {
                            setFetchState({ jobId: params.id, status: "loading" });
                            setReloadKey(key => key + 1);
                        }}>Try again</Button>
                    </div>
                ) : (
                    <>
                        <section aria-label="Applicant overview" className="mb-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                                <div className="flex items-center justify-between text-sm text-muted-foreground"><span>Total applicants</span><Users className="size-4 text-primary" /></div>
                                <p className="mt-3 text-3xl font-bold">{applications.length}</p>
                            </div>
                            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                                <div className="flex items-center justify-between text-sm text-muted-foreground"><span>Needs review</span><Clock3 className="size-4 text-amber-600" /></div>
                                <p className="mt-3 text-3xl font-bold">{statusCounts.pending || 0}</p>
                            </div>
                            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                                <div className="flex items-center justify-between text-sm text-muted-foreground"><span>Accepted</span><CheckCircle2 className="size-4 text-primary" /></div>
                                <p className="mt-3 text-3xl font-bold">{statusCounts.accepted || 0}</p>
                            </div>
                            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                                <div className="flex items-center justify-between text-sm text-muted-foreground"><span>Rejected</span><XCircle className="size-4 text-destructive" /></div>
                                <p className="mt-3 text-3xl font-bold">{statusCounts.rejected || 0}</p>
                            </div>
                        </section>
                        <ApplicantsTable />
                    </>
                )}
            </main>
        </div>
    )
}

export default Applicants
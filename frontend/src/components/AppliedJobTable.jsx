import React, { useState } from 'react'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from './ui/table'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { useDispatch, useSelector } from 'react-redux'
import axios from 'axios'
import { toast } from 'sonner'
import { APPLICATION_API_END_POINT } from '@/utils/constant'
import { setAllAppliedJobs } from '@/redux/jobSlice'
import { CheckCircle2, Clock, XCircle, AlertCircle, ArrowUpRight, ChevronDown, ChevronUp } from 'lucide-react'
import { Link } from 'react-router-dom'

const AppliedJobTable = () => {
    const { allAppliedJobs } = useSelector(store => store.job);
    const dispatch = useDispatch();
    const [withdrawingId, setWithdrawingId] = useState(null);
    const [expandedRow, setExpandedRow] = useState(null);

    const canWithdraw = (application) => {
        return application?.status === "pending" && application?.canWithdraw === true;
    };

    const withdrawApplication = async (application) => {
        if (!window.confirm("Withdraw this application? The recruiter will see it as withdrawn.")) return;

        try {
            setWithdrawingId(application._id);
            const response = await axios.post(`${APPLICATION_API_END_POINT}/withdraw/${application._id}`, {}, { withCredentials: true });
            if (response.data.success) {
                dispatch(setAllAppliedJobs(allAppliedJobs.map(item =>
                    item._id === application._id
                        ? { ...item, status: response.data.application.status, withdrawnAt: response.data.application.withdrawnAt }
                        : item
                )));
                toast.success(response.data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Unable to withdraw this application.");
        } finally {
            setWithdrawingId(null);
        }
    };

    const getStatusConfig = (status) => {
        switch (status?.toLowerCase()) {
            case "accepted":
                return {
                    badge: <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1"><CheckCircle2 className="size-3" /> Accepted</Badge>,
                    step: 3,
                    label: "Offer Extended"
                };
            case "rejected":
                return {
                    badge: <Badge className="bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/30 flex items-center gap-1"><XCircle className="size-3" /> Rejected</Badge>,
                    step: 3,
                    label: "Not Selected"
                };
            case "withdrawn":
                return {
                    badge: <Badge className="bg-slate-500/15 text-slate-700 dark:text-slate-400 border border-slate-500/30 flex items-center gap-1"><AlertCircle className="size-3" /> Withdrawn</Badge>,
                    step: 2,
                    label: "Candidate Withdrew"
                };
            default:
                return {
                    badge: <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30 flex items-center gap-1"><Clock className="size-3" /> In Review</Badge>,
                    step: 2,
                    label: "Under Recruiter Review"
                };
        }
    };

    const toggleExpand = (id) => {
        setExpandedRow(expandedRow === id ? null : id);
    };

    return (
        <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-sm">
            <Table>
                <TableCaption className="pb-4">Your real-time job application pipeline (click any row to view timeline)</TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-10"></TableHead>
                        <TableHead>Date Applied</TableHead>
                        <TableHead>Job Role</TableHead>
                        <TableHead>Company</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {allAppliedJobs.length <= 0 ? (
                        <TableRow>
                            <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                                You haven't applied to any jobs yet.
                            </TableCell>
                        </TableRow>
                    ) : (
                        allAppliedJobs.map((appliedJob) => {
                            const config = getStatusConfig(appliedJob?.status);
                            const isExpanded = expandedRow === appliedJob._id;

                            return (
                                <React.Fragment key={appliedJob._id}>
                                    <TableRow className="transition-colors hover:bg-muted/40 cursor-pointer" onClick={() => toggleExpand(appliedJob._id)}>
                                        <TableCell className="w-10 text-muted-foreground">
                                            {isExpanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                                        </TableCell>
                                        <TableCell className="text-xs text-muted-foreground">
                                            {appliedJob?.createdAt?.split("T")[0]}
                                        </TableCell>
                                        <TableCell>
                                            <p className="font-semibold text-sm">{appliedJob.job?.title || "Role"}</p>
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {appliedJob.job?.company?.name || "Company"}
                                        </TableCell>
                                        <TableCell>{config.badge}</TableCell>
                                        <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                                            <div className="flex items-center justify-end gap-2">
                                                {appliedJob.job?._id && (
                                                    <Link to={`/description/${appliedJob.job._id}`}>
                                                        <Button variant="ghost" size="sm" className="h-8 text-xs">
                                                            View <ArrowUpRight className="ml-1 size-3" />
                                                        </Button>
                                                    </Link>
                                                )}
                                                {canWithdraw(appliedJob) && (
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        className="h-8 text-xs text-destructive hover:bg-destructive/10"
                                                        disabled={withdrawingId === appliedJob._id}
                                                        onClick={() => withdrawApplication(appliedJob)}
                                                    >
                                                        {withdrawingId === appliedJob._id ? "Withdrawing..." : "Withdraw"}
                                                    </Button>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>

                                    {/* Expandable Visual Progress Tracker */}
                                    {isExpanded && (
                                        <TableRow className="bg-muted/20 border-b">
                                            <TableCell colSpan={6} className="p-4 sm:p-6">
                                                <div className="rounded-xl border border-border/80 bg-background p-4 sm:p-5">
                                                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
                                                        Application Journey • {appliedJob.job?.title} at {appliedJob.job?.company?.name}
                                                    </p>

                                                    {/* Progress Steps */}
                                                    <div className="grid grid-cols-3 gap-2 relative">
                                                        {/* Step 1: Submitted */}
                                                        <div className="flex flex-col items-center text-center">
                                                            <div className="flex size-8 items-center justify-center rounded-full bg-emerald-500 text-white font-bold text-xs shadow-sm">
                                                                ✓
                                                            </div>
                                                            <p className="mt-2 text-xs font-semibold">Submitted</p>
                                                            <p className="text-[11px] text-muted-foreground">
                                                                {appliedJob?.createdAt?.split("T")[0]}
                                                            </p>
                                                        </div>

                                                        {/* Step 2: In Review */}
                                                        <div className="flex flex-col items-center text-center">
                                                            <div className={`flex size-8 items-center justify-center rounded-full font-bold text-xs shadow-sm ${
                                                                appliedJob?.status === "withdrawn"
                                                                    ? "bg-slate-400 text-white"
                                                                    : "bg-amber-500 text-white"
                                                            }`}>
                                                                {appliedJob?.status === "withdrawn" ? "—" : "2"}
                                                            </div>
                                                            <p className="mt-2 text-xs font-semibold">
                                                                {appliedJob?.status === "withdrawn" ? "Withdrawn" : "Under Review"}
                                                            </p>
                                                            <p className="text-[11px] text-muted-foreground">
                                                                {appliedJob?.status === "withdrawn" ? "Application cancelled" : "Recruiter evaluating"}
                                                            </p>
                                                        </div>

                                                        {/* Step 3: Decision */}
                                                        <div className="flex flex-col items-center text-center">
                                                            <div className={`flex size-8 items-center justify-center rounded-full font-bold text-xs shadow-sm ${
                                                                appliedJob?.status === "accepted"
                                                                    ? "bg-emerald-500 text-white"
                                                                    : appliedJob?.status === "rejected"
                                                                    ? "bg-rose-500 text-white"
                                                                    : "bg-muted text-muted-foreground border border-border"
                                                            }`}>
                                                                {appliedJob?.status === "accepted" ? "✓" : appliedJob?.status === "rejected" ? "✕" : "3"}
                                                            </div>
                                                            <p className="mt-2 text-xs font-semibold">
                                                                {appliedJob?.status === "accepted"
                                                                    ? "Accepted"
                                                                    : appliedJob?.status === "rejected"
                                                                    ? "Decision Final"
                                                                    : "Decision"}
                                                            </p>
                                                            <p className="text-[11px] text-muted-foreground">
                                                                {config.label}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </React.Fragment>
                            );
                        })
                    )}
                </TableBody>
            </Table>
        </div>
    );
};

export default AppliedJobTable;

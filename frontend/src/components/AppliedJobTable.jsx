import React from 'react'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from './ui/table'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { useDispatch, useSelector } from 'react-redux'
import { useState } from 'react'
import axios from 'axios'
import { toast } from 'sonner'
import { APPLICATION_API_END_POINT } from '@/utils/constant'
import { setAllAppliedJobs } from '@/redux/jobSlice'

const AppliedJobTable = () => {
    const {allAppliedJobs} = useSelector(store=>store.job);
    const dispatch = useDispatch();
    const [withdrawingId, setWithdrawingId] = useState(null);

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

    return (
        <div>
            <Table>
                <TableCaption>A list of your applied jobs</TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Job Role</TableHead>
                        <TableHead>Company</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {
                        allAppliedJobs.length <= 0 ? <TableRow><TableCell colSpan={5}>You haven&apos;t applied any job yet.</TableCell></TableRow> : allAppliedJobs.map((appliedJob) => {
                            const status = (appliedJob?.status || "pending").toLowerCase();
                            return (
                                <TableRow key={appliedJob._id}>
                                    <TableCell>{appliedJob?.createdAt?.split("T")[0]}</TableCell>
                                    <TableCell>{appliedJob.job?.title}</TableCell>
                                    <TableCell>{appliedJob.job?.company?.name}</TableCell>
                                    <TableCell><Badge className={`${status === "rejected" ? 'bg-red-400' : status === "pending" || status === "withdrawn" ? 'bg-gray-400' : 'bg-green-400'}`}>{status.toUpperCase()}</Badge></TableCell>
                                    <TableCell className="text-right">
                                        {canWithdraw(appliedJob) && <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            disabled={withdrawingId === appliedJob._id}
                                            onClick={() => withdrawApplication(appliedJob)}
                                        >{withdrawingId === appliedJob._id ? "Withdrawing..." : "Withdraw"}</Button>}
                                        {status === "pending" && !canWithdraw(appliedJob) && <span className="text-xs text-muted-foreground">24-hour window ended</span>}
                                    </TableCell>
                                </TableRow>
                            );
                        })
                    }
                </TableBody>
            </Table>
        </div>
    )
}

export default AppliedJobTable
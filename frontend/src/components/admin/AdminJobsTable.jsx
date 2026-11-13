import React, { useMemo, useState } from 'react'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { Eye, MoreHorizontal, Pencil, RotateCcw, Trash2 } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'sonner'
import { JOB_API_END_POINT } from '@/utils/constant'
import { setAdminJobArchiveState } from '@/redux/jobSlice'

const AdminJobsTable = ({ statusFilter = "all" }) => {
    const {allAdminJobs = [], searchJobByText = ""} = useSelector(store=>store.job);

    const [workingJobId, setWorkingJobId] = useState(null);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const filterJobs = useMemo(() => allAdminJobs.filter(job => {
        const searchTerm = String(searchJobByText).trim().toLowerCase();
        const matchesSearch = !searchTerm
            || job?.title?.toLowerCase().includes(searchTerm)
            || job?.company?.name?.toLowerCase().includes(searchTerm);
        const matchesStatus = statusFilter === "all"
            || (statusFilter === "archived" ? job?.isArchived : !job?.isArchived);
        return matchesSearch && matchesStatus;
    }), [allAdminJobs, searchJobByText, statusFilter]);

    const updateArchiveState = (job) => dispatch(setAdminJobArchiveState({
        id: job._id,
        isArchived: job.isArchived,
        archivedAt: job.archivedAt,
    }));

    const archiveJob = async (job) => {
        if (!window.confirm(`Archive "${job.title}"? It will disappear from job searches, but its applications will be kept.`)) return;

        try {
            setWorkingJobId(job._id);
            const response = await axios.delete(`${JOB_API_END_POINT}/${job._id}`, { withCredentials: true });
            if (response.data.success) {
                updateArchiveState(response.data.job);
                toast.success(response.data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Unable to archive this job.");
        } finally {
            setWorkingJobId(null);
        }
    };

    const restoreJob = async (job) => {
        try {
            setWorkingJobId(job._id);
            const response = await axios.put(`${JOB_API_END_POINT}/${job._id}/restore`, {}, { withCredentials: true });
            if (response.data.success) {
                updateArchiveState(response.data.job);
                toast.success(response.data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Unable to restore this job.");
        } finally {
            setWorkingJobId(null);
        }
    };

    return (
        <div>
            <Table>
                <TableCaption>Your jobs and applicant counts. Archived jobs retain their application history.</TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead>Company Name</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Posted</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Applicants</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {
                        filterJobs.length ? filterJobs.map((job) => (
                            <TableRow key={job._id}>
                                <TableCell>{job?.company?.name}</TableCell>
                                <TableCell>{job?.title}</TableCell>
                                <TableCell>{job?.createdAt && !Number.isNaN(Date.parse(job.createdAt)) ? new Date(job.createdAt).toLocaleDateString() : "—"}</TableCell>
                                <TableCell><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${job?.isArchived ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary"}`}>{job?.isArchived ? "Archived" : "Active"}</span></TableCell>
                                <TableCell>{job?.applications?.length || 0}</TableCell>
                                <TableCell className="text-right cursor-pointer">
                                    <Popover>
                                        <PopoverTrigger><MoreHorizontal /></PopoverTrigger>
                                        <PopoverContent className="w-40">
                                            {!job?.isArchived && <button type="button" onClick={()=> navigate(`/admin/jobs/${job._id}/edit`)} className='mb-3 flex items-center gap-2 cursor-pointer'>
                                                <Pencil className='w-4'/>
                                                <span>Edit</span>
                                            </button>}
                                            <button type="button" onClick={()=> navigate(`/admin/jobs/${job._id}/applicants`)} className='mb-3 flex items-center gap-2 cursor-pointer'>
                                                <Eye className='w-4'/>
                                                <span>Applicants</span>
                                            </button>
                                            {job?.isArchived
                                                ? <button type="button" disabled={workingJobId === job._id} onClick={() => restoreJob(job)} className='flex items-center gap-2 disabled:opacity-50'>
                                                    <RotateCcw className='w-4'/>
                                                    <span>{workingJobId === job._id ? "Restoring..." : "Restore"}</span>
                                                </button>
                                                : <button type="button" disabled={workingJobId === job._id} onClick={() => archiveJob(job)} className='flex items-center gap-2 text-destructive disabled:opacity-50'>
                                                    <Trash2 className='w-4'/>
                                                    <span>{workingJobId === job._id ? "Archiving..." : "Delete"}</span>
                                                </button>}
                                        </PopoverContent>
                                    </Popover>
                                </TableCell>
                            </TableRow>
                        )) : <TableRow><TableCell colSpan={6} className="py-12 text-center text-muted-foreground">
                            {searchJobByText || statusFilter !== "all" ? "No jobs match these filters." : "No jobs posted yet. Create your first listing to get started."}
                        </TableCell></TableRow>
                    }
                </TableBody>
            </Table>
        </div>
    )
}

export default AdminJobsTable
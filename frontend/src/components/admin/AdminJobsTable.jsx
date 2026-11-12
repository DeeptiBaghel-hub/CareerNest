import React, { useEffect, useState } from 'react'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { Eye, MoreHorizontal, Pencil, RotateCcw, Trash2 } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'sonner'
import { JOB_API_END_POINT } from '@/utils/constant'
import { setAllAdminJobs } from '@/redux/jobSlice'

const AdminJobsTable = () => { 
    const {allAdminJobs, searchJobByText} = useSelector(store=>store.job);

    const [filterJobs, setFilterJobs] = useState(allAdminJobs);
    const [workingJobId, setWorkingJobId] = useState(null);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    useEffect(()=>{ 
        console.log('called');
        const filteredJobs = allAdminJobs.filter((job)=>{
            if(!searchJobByText){
                return true;
            };
            return job?.title?.toLowerCase()?.includes(searchJobByText.toLowerCase()) || job?.company?.name?.toLowerCase()?.includes(searchJobByText.toLowerCase());

        });
        setFilterJobs(filteredJobs);
    },[allAdminJobs,searchJobByText])

    const archiveJob = async (job) => {
        if (!window.confirm(`Archive "${job.title}"? It will disappear from job searches, but its applications will be kept.`)) return;

        try {
            setWorkingJobId(job._id);
            const response = await axios.delete(`${JOB_API_END_POINT}/${job._id}`, { withCredentials: true });
            if (response.data.success) {
                dispatch(setAllAdminJobs(allAdminJobs.map(item =>
                    item._id === job._id
                        ? { ...item, isArchived: response.data.job.isArchived, archivedAt: response.data.job.archivedAt }
                        : item
                )));
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
                dispatch(setAllAdminJobs(allAdminJobs.map(item =>
                    item._id === job._id
                        ? { ...item, isArchived: response.data.job.isArchived, archivedAt: response.data.job.archivedAt }
                        : item
                )));
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
                <TableCaption>A list of your recent  posted jobs</TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead>Company Name</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {
                        filterJobs?.map((job) => (
                            <tr key={job._id}>
                                <TableCell>{job?.company?.name}</TableCell>
                                <TableCell>{job?.title}</TableCell>
                                <TableCell>{job?.createdAt.split("T")[0]}</TableCell>
                                <TableCell>{job?.isArchived ? "Archived" : "Active"}</TableCell>
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
                            </tr>

                        ))
                    }
                </TableBody>
            </Table>
        </div>
    )
}

export default AdminJobsTable
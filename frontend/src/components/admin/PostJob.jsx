import React, { useEffect, useState } from 'react'
import Navbar from '../shared/Navbar'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { useSelector } from 'react-redux'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import axios from 'axios'
import { JOB_API_END_POINT } from '@/utils/constant'
import { toast } from 'sonner'
import { useNavigate, useParams } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import useGetAllCompanies from '@/hooks/useGetAllCompanies'

const PostJob = () => {
    useGetAllCompanies(); // page relied on Companies.jsx having already fetched this into redux — broke if a recruiter linked here directly
    const [input, setInput] = useState({
        title: "",
        description: "",
        requirements: "",
        salary: "",
        location: "",
        jobType: "",
        experience: "",
        position: 0,
        companyId: "",
        workMode: "",
        benefits: "",
        applicationDeadline: ""
    });
    const [loading, setLoading]= useState(false);
    const [jobLoading, setJobLoading] = useState(false);
    const navigate = useNavigate();
    const { id: jobId } = useParams();

    const { companies } = useSelector(store => store.company);
    const changeEventHandler = (e) => {
        setInput({ ...input, [e.target.name]: e.target.value });
    };

    const selectChangeHandler = (value) => {
        // Matching by lowercased company name breaks if two companies ever
        // collide on name-case (Mongo's unique index is case-sensitive), and
        // it silently no-ops if no match is found. Matching by _id (the
        // actual value we need anyway) avoids both problems.
        setInput({...input, companyId: value});
    };

    useEffect(() => {
        if (!jobId) return;

        const loadJob = async () => {
            try {
                setJobLoading(true);
                const res = await axios.get(`${JOB_API_END_POINT}/getAdminJobs`, { withCredentials: true });
                const job = res.data.jobs?.find((item) => item._id === jobId);
                if (!res.data.success || !job) {
                    toast.error(res.data.message || "Job not found.");
                    navigate("/admin/jobs");
                    return;
                }

                setInput({
                    title: job.title || "",
                    description: job.description || "",
                    requirements: job.requirements?.join(", ") || "",
                    salary: job.salary || "",
                    location: job.location || "",
                    jobType: job.jobType || "",
                    experience: job.experienceLevel || "",
                    position: job.position || 0,
                    companyId: job.company?._id || "",
                    workMode: job.workMode || "",
                    benefits: job.benefits?.join(", ") || "",
                    applicationDeadline: job.applicationDeadline
                        ? new Date(job.applicationDeadline).toISOString().slice(0, 10)
                        : ""
                });
            } catch (error) {
                toast.error(error.response?.data?.message || "Unable to load this job.");
                navigate("/admin/jobs");
            } finally {
                setJobLoading(false);
            }
        };

        loadJob();
    }, [jobId, navigate]);

    const submitHandler = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const request = jobId
                ? axios.put(`${JOB_API_END_POINT}/${jobId}`, input, { withCredentials: true })
                : axios.post(`${JOB_API_END_POINT}/post`, input, {
                headers:{
                    'Content-Type':'application/json'
                },
                withCredentials:true
            });
            const res = await request;
            if(res.data.success){
                toast.success(res.data.message);
                navigate("/admin/jobs");
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Something went wrong while posting the job.");
        } finally{
            setLoading(false);
        }
    }

    return (
        <div>
            <Navbar />
            <div className='flex items-center justify-center w-full my-5'>
                <form onSubmit = {submitHandler} className='p-8 max-w-4xl bg-card text-card-foreground border border-border shadow-lg rounded-md'>
                    <div className='grid grid-cols-2 gap-2'>
                        <div>
                            <Label>Title</Label>
                            <Input
                                type="text"
                                name="title"
                                value={input.title}
                                onChange={changeEventHandler}
                                className="focus-visible:ring-offset-0 focus-visible:ring-0 my-1"
                            />
                        </div>
                        <div>
                            <Label>Description</Label>
                            <textarea
                                name="description"
                                value={input.description}
                                onChange={changeEventHandler}
                                rows={5}
                                className="my-1 w-full resize-y rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                            />
                        </div>
                        <div>
                            <Label>Requirements</Label>
                            <Input
                                type="text"
                                name="requirements"
                                value={input.requirements}
                                onChange={changeEventHandler}
                                className="focus-visible:ring-offset-0 focus-visible:ring-0 my-1"
                            />
                        </div>
                        <div>
                            <Label>Salary (LPA)</Label>
                            <Input
                                type="text"
                                name="salary"
                                placeholder="e.g. 6-12"
                                value={input.salary}
                                onChange={changeEventHandler}
                                className="focus-visible:ring-offset-0 focus-visible:ring-0 my-1"
                            />
                            <p className="text-xs text-muted-foreground">Enter amount in Lakhs Per Annum. A single value ("8") or a range ("6-12") both work.</p>
                        </div>
                        <div>
                            <Label>Location</Label>
                            <Input
                                type="text"
                                name="location"
                                value={input.location}
                                onChange={changeEventHandler}
                                className="focus-visible:ring-offset-0 focus-visible:ring-0 my-1"
                            />
                        </div>
                        <div>
                            <Label>Job Type</Label>
                            <Input
                                type="text"
                                name="jobType"
                                value={input.jobType}
                                onChange={changeEventHandler}
                                className="focus-visible:ring-offset-0 focus-visible:ring-0 my-1"
                            />
                        </div>
                        <div>
                            <Label>Experience (years)</Label>
                            <Input
                                type="text"
                                name="experience"
                                placeholder="e.g. 0-2"
                                value={input.experience}
                                onChange={changeEventHandler}
                                className="focus-visible:ring-offset-0 focus-visible:ring-0 my-1"
                            />
                            <p className="text-xs text-muted-foreground">A single value ("2") or a range ("0-2") both work.</p>
                        </div>
                        <div>
                            <Label>Number of Positions</Label>
                            <Input
                                type="number"
                                name="position"
                                value={input.position}
                                onChange={changeEventHandler}
                                className="focus-visible:ring-offset-0 focus-visible:ring-0 my-1"
                            />
                        </div>
                        <div>
                            <Label>Work Mode</Label>
                            <Input
                                type="text"
                                name="workMode"
                                placeholder="e.g. Hybrid"
                                value={input.workMode}
                                onChange={changeEventHandler}
                                className="focus-visible:ring-offset-0 focus-visible:ring-0 my-1"
                            />
                        </div>
                        <div>
                            <Label>Application Deadline</Label>
                            <Input
                                type="date"
                                name="applicationDeadline"
                                value={input.applicationDeadline}
                                onChange={changeEventHandler}
                                className="focus-visible:ring-offset-0 focus-visible:ring-0 my-1"
                            />
                        </div>
                        <div className="col-span-2">
                            <Label>Benefits</Label>
                            <textarea
                                name="benefits"
                                placeholder="Separate benefits with commas"
                                value={input.benefits}
                                onChange={changeEventHandler}
                                rows={2}
                                className="my-1 w-full resize-y rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                            />
                        </div>
                        {
                            companies.length > 0 && (
                                <Select value={input.companyId || undefined} onValueChange={selectChangeHandler}>
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Select a Company" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            {
                                                companies.map((company) => {
                                                    return (
                                                        <SelectItem key={company._id} value={company._id}>{company.name}</SelectItem>
                                                    )
                                                })
                                            }

                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            )
                        }
                    </div> 
                    {
                        loading || jobLoading ? <Button className="w-full my-4" disabled> <Loader2 className='mr-2 h-4 w-4 animate-spin' /> Please wait </Button> : <Button type="submit" className="w-full my-4">{jobId ? "Update Job" : "Post New Job"}</Button>
                    }
                    {
                        companies.length === 0 && <p className='text-xs text-red-600 font-bold text-center my-3'>*Please register a company before posting a job.</p>
                    }
                </form>
            </div>
        </div>
    )
}

export default PostJob

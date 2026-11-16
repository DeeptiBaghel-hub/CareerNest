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
import { Eye, EyeOff, Loader2, MapPin } from 'lucide-react'
import useGetAllCompanies from '@/hooks/useGetAllCompanies'
import { formatSalary } from '@/utils/jobUtils'

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
    const [previewOpen, setPreviewOpen] = useState(false);
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

    const workModeChangeHandler = (value) => {
        setInput({ ...input, workMode: value });
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
        if (!input.companyId) {
            toast.error("Choose a company before posting this job.");
            return;
        }
        if (!Number.isInteger(Number(input.position)) || Number(input.position) < 1) {
            toast.error("Add at least one available position.");
            return;
        }
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
            <main className='mx-auto my-6 w-full max-w-5xl px-4 sm:my-10 sm:px-6'>
                <form onSubmit = {submitHandler} className='rounded-2xl border border-border bg-card p-5 text-card-foreground shadow-lg sm:p-8'>
                    <header className="mb-6">
                        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">Recruiter workspace</p>
                        <h1 className="mt-1 text-2xl font-bold">{jobId ? "Edit job listing" : "Create a job listing"}</h1>
                        <p className="mt-2 text-sm text-muted-foreground">Add clear details so candidates can quickly tell if the role is right for them.</p>
                    </header>
                    <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                        <div>
                            <Label htmlFor="job-title">Job title</Label>
                            <Input
                                id="job-title"
                                type="text"
                                name="title"
                                required
                                value={input.title}
                                onChange={changeEventHandler}
                                className="focus-visible:ring-offset-0 focus-visible:ring-0 my-1"
                            />
                        </div>
                        <div>
                            <Label htmlFor="job-description">Description</Label>
                            <textarea
                                id="job-description"
                                name="description"
                                required
                                value={input.description}
                                onChange={changeEventHandler}
                                rows={5}
                                className="my-1 w-full resize-y rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                            />
                        </div>
                        <div>
                            <Label htmlFor="job-requirements">Required skills <span className="font-normal text-muted-foreground">(optional)</span></Label>
                            <Input
                                id="job-requirements"
                                type="text"
                                name="requirements"
                                value={input.requirements}
                                onChange={changeEventHandler}
                                className="focus-visible:ring-offset-0 focus-visible:ring-0 my-1"
                            />
                        </div>
                        <div>
                            <Label htmlFor="job-salary">Salary (LPA)</Label>
                            <Input
                                id="job-salary"
                                type="text"
                                name="salary"
                                required
                                placeholder="e.g. 6-12"
                                value={input.salary}
                                onChange={changeEventHandler}
                                className="focus-visible:ring-offset-0 focus-visible:ring-0 my-1"
                            />
                            <p className="text-xs text-muted-foreground">Enter amount in Lakhs Per Annum. A single value ("8") or a range ("6-12") both work.</p>
                        </div>
                        <div>
                            <Label htmlFor="job-location">Location</Label>
                            <Input
                                id="job-location"
                                type="text"
                                name="location"
                                required
                                value={input.location}
                                onChange={changeEventHandler}
                                className="focus-visible:ring-offset-0 focus-visible:ring-0 my-1"
                            />
                        </div>
                        <div>
                            <Label htmlFor="job-type">Job type</Label>
                            <Input
                                id="job-type"
                                type="text"
                                name="jobType"
                                required
                                value={input.jobType}
                                onChange={changeEventHandler}
                                className="focus-visible:ring-offset-0 focus-visible:ring-0 my-1"
                            />
                        </div>
                        <div>
                            <Label htmlFor="job-experience">Experience (years)</Label>
                            <Input
                                id="job-experience"
                                type="text"
                                name="experience"
                                placeholder="e.g. 0-2"
                                required
                                value={input.experience}
                                onChange={changeEventHandler}
                                className="focus-visible:ring-offset-0 focus-visible:ring-0 my-1"
                            />
                            <p className="text-xs text-muted-foreground">A single value ("2") or a range ("0-2") both work.</p>
                        </div>
                        <div>
                            <Label htmlFor="job-position">Number of positions</Label>
                            <Input
                                id="job-position"
                                type="number"
                                name="position"
                                min="1"
                                required
                                value={input.position}
                                onChange={changeEventHandler}
                                className="focus-visible:ring-offset-0 focus-visible:ring-0 my-1"
                            />
                        </div>
                        <div>
                            <Label>Work Mode</Label>
                            <Select value={input.workMode || undefined} onValueChange={workModeChangeHandler}>
                                <SelectTrigger className="my-1 w-full">
                                    <SelectValue placeholder="Select a work mode" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectItem value="On-site">On-site</SelectItem>
                                        <SelectItem value="Remote">Remote</SelectItem>
                                        <SelectItem value="Hybrid">Hybrid</SelectItem>
                                        <SelectItem value="Temporarily remote">Temporarily remote</SelectItem>
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="job-deadline">Application deadline</Label>
                            <Input
                                id="job-deadline"
                                type="date"
                                name="applicationDeadline"
                                value={input.applicationDeadline}
                                onChange={changeEventHandler}
                                className="focus-visible:ring-offset-0 focus-visible:ring-0 my-1"
                            />
                        </div>
                        <div className="col-span-2">
                            <Label htmlFor="job-benefits">Benefits</Label>
                            <textarea
                                id="job-benefits"
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
                    <div className="mt-5 border-t border-border pt-5">
                        <Button type="button" variant="outline" aria-expanded={previewOpen} onClick={() => setPreviewOpen(open => !open)}>
                            {previewOpen ? <EyeOff className="mr-2 size-4" /> : <Eye className="mr-2 size-4" />}
                            {previewOpen ? "Hide preview" : "Preview job listing"}
                        </Button>
                        {previewOpen && <article aria-live="polite" className="mt-4 rounded-2xl border border-primary/20 bg-background p-5 shadow-sm">
                            <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-primary">Candidate preview</p>
                            <div className="flex flex-wrap items-start justify-between gap-3">
                                <div>
                                    <h2 className="text-xl font-bold">{input.title.trim() || "Your job title"}</h2>
                                    <p className="mt-1 font-medium text-muted-foreground">{companies.find(company => company._id === input.companyId)?.name || "Your company"}</p>
                                </div>
                                <p className="font-semibold text-primary">{formatSalary(input.salary)}</p>
                            </div>
                            <div className="mt-3 flex flex-wrap gap-3 text-sm text-muted-foreground">
                                <span className="inline-flex items-center gap-1"><MapPin className="size-4" />{input.location.trim() || "Location to be added"}</span>
                                {input.jobType.trim() && <span>{input.jobType}</span>}
                                {input.experience.trim() && <span>{input.experience} years</span>}
                                {input.workMode && <span>{input.workMode}</span>}
                            </div>
                            <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">{input.description.trim() || "Your job description will appear here."}</p>
                            {input.requirements.trim() && <div className="mt-4 flex flex-wrap gap-2">{input.requirements.split(",").map(skill => skill.trim()).filter(Boolean).map(skill => <span key={skill} className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-primary">{skill}</span>)}</div>}
                        </article>}
                    </div>
                    {
                        loading || jobLoading ? <Button type="submit" className="w-full my-4" disabled> <Loader2 className='mr-2 h-4 w-4 animate-spin' /> Please wait </Button> : <Button type="submit" className="w-full my-4">{jobId ? "Update Job" : "Post Job"}</Button>
                    }
                    {
                        companies.length === 0 && <p className='text-xs text-red-600 font-bold text-center my-3'>*Please register a company before posting a job.</p>
                    }
                </form>
            </main>
        </div>
    )
}

export default PostJob

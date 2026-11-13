import React, { useEffect, useState } from 'react'
import { Button } from './ui/button'
import { Bookmark, BookmarkCheck, Eye, MapPin } from 'lucide-react'
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar'
import { Badge } from './ui/badge'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { toast } from 'sonner'
import { formatSalary } from '@/utils/jobUtils'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog'

const Job = ({job, onSavedChange}) => {
    const navigate = useNavigate();
    const { user } = useSelector(store => store.auth);
    const savedKey = user?._id ? `careernest:saved-jobs:${user._id}` : null;
    const [isSaved, setIsSaved] = useState(false);
    const [quickViewOpen, setQuickViewOpen] = useState(false);

    useEffect(() => {
        if (!savedKey) { setIsSaved(false); return; }
        try {
            const saved = JSON.parse(localStorage.getItem(savedKey) || "[]");
            setIsSaved(saved.includes(job?._id));
        } catch { setIsSaved(false); }
    }, [savedKey, job?._id]);

    const toggleSaved = () => {
        if (!user) {
            toast.error("Log in to save jobs for later.");
            navigate("/login");
            return;
        }
        const saved = JSON.parse(localStorage.getItem(savedKey) || "[]");
        const next = isSaved ? saved.filter((id) => id !== job?._id) : [...new Set([...saved, job?._id])];
        localStorage.setItem(savedKey, JSON.stringify(next));
        setIsSaved(!isSaved);
        onSavedChange?.(!isSaved);
        toast.success(isSaved ? "Removed from saved jobs." : "Job saved for later.");
    };
    // const jobId = "lsekdhjgdsnfvsdkjf";

    const daysAgoFunction = (mongodbTime) => {
        const createdAt = new Date(mongodbTime);
        const currentTime = new Date();
        const timeDifference = currentTime - createdAt;
        return Math.floor(timeDifference/(1000*24*60*60));
    }
    
    return (
        <article className='flex h-full flex-col rounded-2xl border border-border bg-card p-5 text-card-foreground shadow-sm transition duration-200 hover:-translate-y-1 hover:border-primary/50 hover:shadow-xl'>
            <div className='flex items-center justify-between'>
                <p className='text-sm text-muted-foreground'>{daysAgoFunction(job?.createdAt) === 0 ? "Today" : `${daysAgoFunction(job?.createdAt)} days ago`}</p>
                <Button type="button" variant="outline" aria-label={isSaved ? "Remove saved job" : "Save job"} aria-pressed={isSaved} onClick={toggleSaved} className="rounded-full" size="icon">{isSaved ? <BookmarkCheck className="text-primary" /> : <Bookmark />}</Button>
            </div>

            <div className='flex items-center gap-2 my-2'>
                <div className="flex size-12 items-center justify-center overflow-hidden rounded-xl border border-border bg-secondary">
                    <Avatar>
                        <AvatarImage src={job?.company?.logo} />
                        <AvatarFallback>{job?.company?.name?.charAt(0)?.toUpperCase() || "C"}</AvatarFallback>
                    </Avatar>
                </div>
                <div>
                    <h1 className='font-medium text-lg'>{job?.company?.name}</h1>
                    <p className='text-sm text-muted-foreground'>{job?.location || "Location not specified"}</p>
                </div>
            </div>

            <div>
                <h1 className='font-bold text-lg my-2'>{job?.title}</h1>
                <p className='text-sm text-muted-foreground line-clamp-4'>{job?.description}</p>
            </div>
            <div className='mt-4 flex flex-wrap items-center gap-2'>
                <Badge className="rounded-full bg-secondary px-2.5 py-1 font-semibold text-primary" variant="ghost">{job?.position} Positions</Badge>
                <Badge className="rounded-full bg-accent px-2.5 py-1 font-semibold text-accent-foreground" variant="ghost">{job?.jobType}</Badge>
                <Badge className="rounded-full bg-muted px-2.5 py-1 font-semibold text-foreground" variant="ghost">{formatSalary(job?.salary)}</Badge>
            </div>
            <div className='mt-auto flex items-center gap-3 pt-5'>
                <Button type="button" onClick={() => setQuickViewOpen(true)} variant="outline"><Eye className="mr-1 size-4" />Quick view</Button>
                <Button onClick={()=> navigate(`/description/${job?._id}`)} variant="outline">Details</Button>
                <Button type="button" variant={isSaved ? "secondary" : "default"} onClick={toggleSaved}>{isSaved ? "Saved" : "Save For Later"}</Button>
            </div>
            <Dialog open={quickViewOpen} onOpenChange={setQuickViewOpen}>
                <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
                    <DialogHeader className="pr-8">
                        <div className="flex items-center gap-3">
                            <Avatar className="size-12 rounded-xl">
                                <AvatarImage src={job?.company?.logo} alt="" />
                                <AvatarFallback className="rounded-xl bg-secondary font-semibold text-primary">{job?.company?.name?.charAt(0)?.toUpperCase() || "C"}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">{job?.company?.name}</p>
                                <DialogTitle className="mt-1 text-xl font-bold">{job?.title}</DialogTitle>
                            </div>
                        </div>
                        <DialogDescription className="flex items-center gap-1.5 pt-1"><MapPin className="size-4" />{job?.location || "Location not specified"}</DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-wrap gap-2">
                        {job?.jobType && <Badge variant="secondary">{job.jobType}</Badge>}
                        {job?.workMode && <Badge variant="secondary">{job.workMode}</Badge>}
                        {job?.experienceLevel && <Badge variant="secondary">{job.experienceLevel} experience</Badge>}
                        {job?.salary && <Badge variant="secondary">{formatSalary(job.salary)}</Badge>}
                    </div>
                    <section>
                        <h3 className="font-semibold">About the role</h3>
                        <p className="mt-2 whitespace-pre-line text-sm leading-6 text-muted-foreground">{job?.description || "No description provided."}</p>
                    </section>
                    {Array.isArray(job?.requirements) && job.requirements.length > 0 && <section>
                        <h3 className="font-semibold">What you’ll need</h3>
                        <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
                            {job.requirements.map((requirement, index) => <li key={`${requirement}-${index}`} className="flex gap-2"><span className="text-primary">•</span>{requirement}</li>)}
                        </ul>
                    </section>}
                    {Array.isArray(job?.benefits) && job.benefits.length > 0 && <section>
                        <h3 className="font-semibold">Benefits</h3>
                        <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
                            {job.benefits.map((benefit, index) => <li key={`${benefit}-${index}`} className="flex gap-2"><span className="text-primary">•</span>{benefit}</li>)}
                        </ul>
                    </section>}
                    <DialogFooter className="gap-2 sm:justify-between">
                        <Button type="button" variant="outline" aria-pressed={isSaved} onClick={toggleSaved}>{isSaved ? <BookmarkCheck className="mr-1 size-4" /> : <Bookmark className="mr-1 size-4" />}{isSaved ? "Saved" : "Save for later"}</Button>
                        <Button type="button" onClick={() => navigate(`/description/${job?._id}`)}>View full details & apply</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </article>
    )
}

export default Job

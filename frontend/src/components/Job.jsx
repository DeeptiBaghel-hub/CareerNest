import React, { useEffect, useState } from 'react'
import { Button } from './ui/button'
import { Bookmark, BookmarkCheck } from 'lucide-react'
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar'
import { Badge } from './ui/badge'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { toast } from 'sonner'

const Job = ({job, onSavedChange}) => {
    const navigate = useNavigate();
    const { user } = useSelector(store => store.auth);
    const savedKey = user?._id ? `careernest:saved-jobs:${user._id}` : null;
    const [isSaved, setIsSaved] = useState(false);

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
                <Badge className={'text-blue-700 font-bold'} variant="ghost">{job?.position} Positions</Badge>
                <Badge className={'text-[#d97706] font-bold'} variant="ghost">{job?.jobType}</Badge>
                <Badge className={'text-[#4f46e5] font-bold'} variant="ghost">₹{job?.salary} LPA</Badge>
            </div>
            <div className='mt-auto flex items-center gap-3 pt-5'>
                <Button onClick={()=> navigate(`/description/${job?._id}`)} variant="outline">Details</Button>
                <Button type="button" variant={isSaved ? "secondary" : "default"} onClick={toggleSaved}>{isSaved ? "Saved" : "Save For Later"}</Button>
            </div>
        </article>
    )
}

export default Job

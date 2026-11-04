import React, { useEffect, useState } from 'react'
import { BookmarkCheck } from 'lucide-react'
import { useSelector } from 'react-redux'
import Navbar from './shared/Navbar'
import Job from './Job'
import useGetAllJobs from '@/hooks/useGetAllJobs'
import { Link } from 'react-router-dom'

const SavedJobs = () => {
    useGetAllJobs();
    const { user } = useSelector(store => store.auth);
    const { allJobs } = useSelector(store => store.job);
    const [savedIds, setSavedIds] = useState([]);
    const savedKey = user?._id ? `careernest:saved-jobs:${user._id}` : null;

    useEffect(() => {
        try { setSavedIds(savedKey ? JSON.parse(localStorage.getItem(savedKey) || '[]') : []); }
        catch { setSavedIds([]); }
    }, [savedKey]);

    const savedJobs = allJobs.filter(job => savedIds.includes(job._id));

    return <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <main className="mx-auto max-w-7xl px-5 py-10 sm:py-14">
            <div className="mb-8 flex items-end justify-between gap-4">
                <div><p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-primary">Your shortlist</p><h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Saved jobs</h1><p className="mt-2 text-muted-foreground">Keep the opportunities you like in one place.</p></div>
                <span className="rounded-full bg-secondary px-4 py-2 text-sm font-medium">{savedJobs.length} saved</span>
            </div>
            {savedJobs.length ? <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">{savedJobs.map(job => <Job key={job._id} job={job} onSavedChange={(stillSaved) => { if (!stillSaved) setSavedIds(ids => ids.filter(id => id !== job._id)); }} />)}</div> : <div className="flex min-h-72 flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-card px-6 text-center"><BookmarkCheck className="mb-4 size-10 text-primary" /><h2 className="text-xl font-semibold">No saved jobs yet</h2><p className="mt-2 max-w-md text-sm text-muted-foreground">Bookmark a role that interests you and it will show up here.</p><Link to="/jobs" className="mt-5 inline-flex h-9 items-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground">Explore jobs</Link></div>}
        </main>
    </div>
}

export default SavedJobs

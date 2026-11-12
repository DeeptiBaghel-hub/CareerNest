import React, { useEffect, useMemo, useState } from 'react'
import Navbar from './shared/Navbar'
import Job from './Job';
import { useDispatch, useSelector } from 'react-redux';
import { setSearchedQuery } from '@/redux/jobSlice';
import useGetAllJobs from '@/hooks/useGetAllJobs';
import FilterCard, { defaultJobFilters } from './FilterCard';
import { Search } from 'lucide-react';
import { Button } from './ui/button';

// const randomJobs = [1, 2,45];

const Browse = () => {
    useGetAllJobs();
    const {allJobs, searchedQuery} = useSelector(store=>store.job);
    const dispatch = useDispatch();
    const [filters, setFilters] = useState(defaultJobFilters);
    const [query, setQuery] = useState(searchedQuery);
    const popularQueries = ['Frontend Developer', 'Backend Developer', 'Data Science', 'Product Manager', 'Customer Support', 'Work From Home'];
    const filteredJobs = useMemo(() => allJobs.filter(job => {
        if (filters.posted !== 'any') {
            const age = (Date.now() - new Date(job.createdAt).getTime()) / 86400000;
            if (!Number.isFinite(age) || (filters.posted === 'today' ? age >= 1 : age > Number(filters.posted))) return false;
        }
        if (filters.salary !== 'any') {
            const raw = String(job.salary || '').replace(/,/g, '');
            const values = raw.match(/\d+(?:\.\d+)?/g)?.map(Number) || [];
            const salary = values.length ? Math.max(...values) * (/lpa/i.test(raw) ? 100000 : 1) : 0;
            if (salary < Number(filters.salary)) return false;
        }
        if (filters.payPeriod !== 'any' && filters.payPeriod !== 'yearly') return false;
        if (filters.jobType !== 'any' && !String(job.jobType || '').toLowerCase().includes(filters.jobType)) return false;
        if (filters.remote !== 'any' && !`${job.jobType || ''} ${job.location || ''} ${job.description || ''}`.toLowerCase().includes(filters.remote)) return false;
        if (filters.experience !== 'any') {
            const years = Number(String(job.experienceLevel || '').match(/\d+(?:\.\d+)?/)?.[0] || 0);
            if (years < Number(filters.experience)) return false;
        }
        return true;
    }), [allJobs, filters]);

    const search = (value = query) => { setQuery(value); dispatch(setSearchedQuery(value.trim())); };
    useEffect(()=>{
        return ()=>{
            dispatch(setSearchedQuery(""));
        }
    },[])
    return (
        <div className="min-h-screen bg-background text-foreground">
            <Navbar />
            <section className="bg-primary text-primary-foreground">
                <div className="mx-auto max-w-7xl px-5 py-8 sm:py-10"><p className="mb-2 text-sm font-medium opacity-80">Home <span className="px-2">›</span> Jobs</p><h1 className="mb-5 text-2xl font-bold sm:text-3xl">Find your next opportunity</h1><div className="flex flex-col gap-3 rounded-2xl bg-background p-2 sm:flex-row sm:rounded-xl"><div className="flex min-w-0 flex-1 items-center gap-2 px-3"><Search className="size-5 text-muted-foreground"/><input value={query} onChange={event => setQuery(event.target.value)} onKeyDown={event => event.key === 'Enter' && search()} placeholder="Job title, keywords, or company" className="h-11 w-full bg-transparent text-foreground outline-none placeholder:text-muted-foreground"/></div><Button onClick={() => search()} className="h-11 bg-slate-950 px-7 text-white hover:bg-slate-800">Search jobs</Button></div></div>
            </section>
            <main className='mx-auto my-8 max-w-7xl px-5 sm:my-10'>
                <header className="mb-6"><p className="text-2xl font-semibold tracking-tight">{filteredJobs.length} jobs found for you</p></header>
                <section className="mb-7 rounded-2xl border border-border bg-card p-5"><h2 className="mb-4 font-semibold">Popular searches</h2><div className="flex flex-wrap gap-2">{popularQueries.map(item => <button type="button" key={item} onClick={() => search(item)} className="rounded-full border border-border bg-background px-4 py-2 text-sm transition hover:border-primary hover:bg-primary/10 hover:text-primary">{item}</button>)}</div></section>
                <div className='flex flex-col gap-6 lg:flex-row'>
                    <aside className="w-full shrink-0 lg:w-64"><FilterCard filters={filters} onChange={setFilters} /></aside>
                    <div className="min-w-0 flex-1">
                    {filteredJobs.length ? <div className='grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-2'>
                    {
                        filteredJobs.map((job) => {
                            return (
                                <Job key={job._id} job={job}/>
                            )
                        })
                    }
                    </div> : <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card p-8 text-center"><h2 className="text-xl font-semibold">No jobs found</h2><p className="mt-2 text-sm text-muted-foreground">Try another search or filter.</p></div>}
                    </div>
                </div>
            </main>
        </div>
    )
}

export default Browse

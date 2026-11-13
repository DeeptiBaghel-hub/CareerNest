import React, { useEffect, useMemo, useState } from 'react'
import Navbar from './shared/Navbar'
import Job from './Job';
import { useDispatch, useSelector } from 'react-redux';
import { setSearchedQuery } from '@/redux/jobSlice';
import useGetAllJobs from '@/hooks/useGetAllJobs';
import FilterCard, { defaultJobFilters } from './FilterCard';
import { LayoutGrid, List, Search } from 'lucide-react';
import { Button } from './ui/button';
import { getMinimumAnnualSalary, matchesJobSearch, matchesWorkMode, sortJobs } from '@/utils/jobUtils';

// const randomJobs = [1, 2,45];

const Browse = () => {
    useGetAllJobs();
    const {allJobs, searchedQuery} = useSelector(store=>store.job);
    const dispatch = useDispatch();
    const [filters, setFilters] = useState(defaultJobFilters);
    const [query, setQuery] = useState(searchedQuery);
    const [sortOrder, setSortOrder] = useState('relevance');
    const [viewMode, setViewMode] = useState('grid');
    const popularQueries = ['Frontend Developer', 'Backend Developer', 'Data Science', 'Product Manager', 'Customer Support', 'Work From Home'];
    const filterNames = { posted: 'Date posted', salary: 'Minimum salary', experience: 'Experience', jobType: 'Job type', workMode: 'Work mode' };
    const filterValues = {
        posted: { today: 'Today', 3: 'Last 3 days', 7: 'Last 7 days' },
        salary: { 200000: '₹2,00,000+', 300000: '₹3,00,000+', 500000: '₹5,00,000+', 700000: '₹7,00,000+', 900000: '₹9,00,000+', 1300000: '₹13,00,000+' },
        experience: { 0: 'No experience', 1: '1+ year', 3: '3+ years', 5: '5+ years' },
        jobType: { 'full-time': 'Full-time', 'part-time': 'Part-time' },
        workMode: { 'on-site': 'On-site', remote: 'Remote', hybrid: 'Hybrid', 'temporarily remote': 'Temporarily remote' },
    };
    const filteredJobs = useMemo(() => allJobs.filter(job => {
        if (!matchesJobSearch(job, searchedQuery)) return false;
        if (filters.posted !== 'any') {
            const age = (Date.now() - new Date(job.createdAt).getTime()) / 86400000;
            if (!Number.isFinite(age) || (filters.posted === 'today' ? age >= 1 : age > Number(filters.posted))) return false;
        }
        if (filters.salary !== 'any') {
            if (getMinimumAnnualSalary(job.salary) < Number(filters.salary)) return false;
        }
        if (filters.jobType !== 'any' && !String(job.jobType || '').toLowerCase().includes(filters.jobType)) return false;
        if (!matchesWorkMode(job, filters.workMode)) return false;
        if (filters.experience !== 'any') {
            const years = Number(String(job.experienceLevel || '').match(/\d+(?:\.\d+)?/)?.[0] || 0);
            if (years < Number(filters.experience)) return false;
        }
        return true;
    }), [allJobs, filters, searchedQuery]);
    const sortedJobs = useMemo(() => sortJobs(filteredJobs, sortOrder), [filteredJobs, sortOrder]);
    const activeFilters = Object.entries(filters).filter(([, value]) => value !== 'any');
    const hasActiveCriteria = Boolean(searchedQuery) || activeFilters.length > 0;

    const search = (value = query) => { setQuery(value); dispatch(setSearchedQuery(value.trim())); };
    const clearSearchAndFilters = () => {
        setQuery('');
        dispatch(setSearchedQuery(''));
        setFilters(defaultJobFilters);
    };
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
                <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
                    <div><p className="text-2xl font-semibold tracking-tight">{sortedJobs.length} jobs found for you</p><p className="mt-1 text-sm text-muted-foreground">Explore, refine, and sort opportunities that fit you.</p></div>
                    <div className="flex flex-wrap items-center gap-3">
                        <label className="flex items-center gap-2 text-sm text-muted-foreground">Sort by
                            <select value={sortOrder} onChange={event => setSortOrder(event.target.value)} className="h-10 rounded-lg border border-input bg-card px-3 font-medium text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring">
                                <option value="relevance">Most relevant</option>
                                <option value="newest">Newest</option>
                                <option value="salary">Highest salary</option>
                            </select>
                        </label>
                        <div role="group" aria-label="Job layout" className="flex items-center rounded-lg border border-border bg-card p-1">
                            <Button type="button" variant={viewMode === 'grid' ? 'secondary' : 'ghost'} size="icon" aria-label="Grid view" aria-pressed={viewMode === 'grid'} onClick={() => setViewMode('grid')} className="size-8"><LayoutGrid className="size-4" /></Button>
                            <Button type="button" variant={viewMode === 'list' ? 'secondary' : 'ghost'} size="icon" aria-label="List view" aria-pressed={viewMode === 'list'} onClick={() => setViewMode('list')} className="size-8"><List className="size-4" /></Button>
                        </div>
                    </div>
                </header>
                {hasActiveCriteria && <section aria-label="Active search filters" className="mb-6 flex flex-wrap items-center gap-2">
                    <span className="mr-1 text-sm font-medium text-muted-foreground">Active:</span>
                    {searchedQuery && <button type="button" onClick={() => search('')} className="rounded-full bg-secondary px-3 py-1.5 text-sm text-foreground transition hover:bg-secondary/70">Search: {searchedQuery} <span aria-hidden="true">×</span></button>}
                    {activeFilters.map(([key, value]) => <button key={key} type="button" onClick={() => setFilters(current => ({ ...current, [key]: 'any' }))} className="rounded-full bg-secondary px-3 py-1.5 text-sm text-foreground transition hover:bg-secondary/70">{filterNames[key]}: {filterValues[key]?.[value] || value} <span aria-hidden="true">×</span></button>)}
                    <button type="button" onClick={clearSearchAndFilters} className="px-2 py-1.5 text-sm font-semibold text-primary hover:underline">Clear all</button>
                </section>}
                <section className="mb-7 rounded-2xl border border-border bg-card p-5"><h2 className="mb-4 font-semibold">Popular searches</h2><div className="flex flex-wrap gap-2">{popularQueries.map(item => <button type="button" key={item} onClick={() => search(item)} className="rounded-full border border-border bg-background px-4 py-2 text-sm transition hover:border-primary hover:bg-primary/10 hover:text-primary">{item}</button>)}</div></section>
                <div className='flex flex-col gap-6 lg:flex-row'>
                    <aside className="w-full shrink-0 lg:w-64"><FilterCard filters={filters} onChange={setFilters} /></aside>
                    <div className="min-w-0 flex-1">
                    {sortedJobs.length ? <div className={`grid grid-cols-1 gap-5 ${viewMode === 'grid' ? 'md:grid-cols-2' : ''}`}>
                    {
                        sortedJobs.map((job) => {
                            return (
                                <Job key={job._id} job={job}/>
                            )
                        })
                    }
                    </div> : <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card p-8 text-center"><h2 className="text-xl font-semibold">No jobs found</h2><p className="mt-2 text-sm text-muted-foreground">Try another search or filter.</p>{hasActiveCriteria && <Button variant="outline" className="mt-4" onClick={clearSearchAndFilters}>Clear search and filters</Button>}</div>}
                    </div>
                </div>
            </main>
        </div>
    )
}

export default Browse

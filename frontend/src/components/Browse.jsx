import React, { useEffect } from 'react'
import Navbar from './shared/Navbar'
import Job from './Job';
import { useDispatch, useSelector } from 'react-redux';
import { setSearchedQuery } from '@/redux/jobSlice';
import useGetAllJobs from '@/hooks/useGetAllJobs';
import FilterCard from './FilterCard';

// const randomJobs = [1, 2,45];

const Browse = () => {
    useGetAllJobs();
    const {allJobs} = useSelector(store=>store.job);
    const dispatch = useDispatch();
    useEffect(()=>{
        return ()=>{
            dispatch(setSearchedQuery(""));
        }
    },[])
    return (
        <div className="min-h-screen bg-background text-foreground">
            <Navbar />
            <main className='mx-auto my-8 max-w-7xl px-5 sm:my-10'>
                <header className="mb-7 rounded-3xl border border-border bg-card p-6 sm:p-8"><p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">CareerNest search</p><h1 className='mt-2 text-2xl font-bold tracking-tight sm:text-3xl'>Jobs for your next move</h1><p className="mt-2 text-muted-foreground">{allJobs.length} opportunities to explore</p></header>
                <div className='flex flex-col gap-6 lg:flex-row'>
                    <aside className="w-full shrink-0 lg:w-64"><FilterCard /></aside>
                    <div className="min-w-0 flex-1">
                    {allJobs.length ? <div className='grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-2'>
                    {
                        allJobs.map((job) => {
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

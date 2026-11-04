import React, { useEffect, useState } from 'react'
import Navbar from './shared/Navbar'
import FilterCard from './FilterCard'
import Job from './Job';
import { useSelector } from 'react-redux';
import useGetAllJobs from '@/hooks/useGetAllJobs';

const Jobs = () => {
    useGetAllJobs(); // this page never fetched jobs itself — it only worked if Home/Browse had already populated redux first
    const { allJobs, searchedQuery } = useSelector(store => store.job);
    const [filterJobs, setFilterJobs] = useState(allJobs);

    useEffect(() => {
        if (searchedQuery) {
            const filteredJobs = allJobs.filter((job) => {
                return job.title.toLowerCase().includes(searchedQuery.toLowerCase()) ||
                    job.description.toLowerCase().includes(searchedQuery.toLowerCase()) ||
                    job.location.toLowerCase().includes(searchedQuery.toLowerCase())
            })
            setFilterJobs(filteredJobs)
        } else {
            setFilterJobs(allJobs)
        }
    }, [allJobs, searchedQuery]);

    return (
        <div>
            <Navbar />
            <main className='mx-auto mt-8 max-w-7xl px-5'>
                <div className='flex flex-col gap-6 lg:flex-row'>
                    <aside className='w-full shrink-0 lg:w-64'>
                        <FilterCard />
                    </aside>
                    {
                        filterJobs.length <= 0 ? <div className="flex min-h-64 flex-1 flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card p-8 text-center"><h2 className="text-xl font-semibold">No matching jobs</h2><p className="mt-2 text-sm text-muted-foreground">Try another keyword or clear your filters.</p></div> : (
                            <div className='min-w-0 flex-1 pb-8'>
                                <div className='grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3'>
                                    {
                                        filterJobs.map((job) => (
                                            <div key={job?._id}>
                                                <Job job={job} />
                                            </div>
                                        ))
                                    }
                                </div>
                            </div>
                        )
                    }
                </div>
            </main>
        </div>
    )
}

export default Jobs

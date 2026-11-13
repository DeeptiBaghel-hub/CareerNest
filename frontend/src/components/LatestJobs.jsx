import React from 'react'
import LatestJobCards from './LatestJobCards';
import { useSelector } from 'react-redux'; 
import { Link } from 'react-router-dom'

// const randomJobs = [1, 2, 3, 4, 5, 6, 7, 8];

const LatestJobs = () => {
    const {allJobs} = useSelector(store=>store.job);
   
    return (
        <section className='mx-auto my-8 max-w-7xl rounded-[2rem] px-4 py-10 sm:my-12 sm:px-6 sm:py-14'>
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div><p className="mb-2 text-sm font-semibold tracking-wide text-[#e94b25]">FRESH OPPORTUNITIES</p><h2 className='text-3xl font-bold tracking-tight text-foreground sm:text-4xl'>Latest jobs for you</h2></div>
                <div className="flex items-end justify-between gap-5 sm:justify-end">
                    <p className="max-w-md text-sm leading-6 text-muted-foreground">Handpicked roles from teams looking for their next great hire.</p>
                    <Link to="/jobs" className="hidden shrink-0 items-center text-sm font-semibold text-primary transition hover:gap-2 sm:inline-flex">View all jobs <span aria-hidden="true">→</span></Link>
                </div>
            </div>
            <div className='grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3'>
                {
                    allJobs.length <= 0 ? <div className="col-span-full rounded-2xl border border-dashed border-border bg-card px-6 py-12 text-center"><p className="font-semibold">No jobs available just yet</p><p className="mt-1 text-sm text-muted-foreground">Check back soon for new opportunities.</p></div> : allJobs?.slice(0,6).map((job) => <LatestJobCards key={job._id} job={job}/>)
                }
            </div>
            <Link to="/jobs" className="mt-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-card px-5 py-2.5 text-sm font-semibold text-primary transition hover:border-primary hover:bg-primary/5 sm:hidden">View all jobs <span aria-hidden="true">→</span></Link>
        </section>
    )
}

export default LatestJobs

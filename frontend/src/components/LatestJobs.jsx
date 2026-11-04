import React from 'react'
import LatestJobCards from './LatestJobCards';
import { useSelector } from 'react-redux'; 

// const randomJobs = [1, 2, 3, 4, 5, 6, 7, 8];

const LatestJobs = () => {
    const {allJobs} = useSelector(store=>store.job);
   
    return (
        <section className='mx-auto my-16 max-w-7xl px-5 py-8 sm:my-20'>
            <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div><p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-primary">Fresh opportunities</p><h2 className='text-3xl font-bold tracking-tight sm:text-4xl'><span className='text-primary'>Latest &amp; top</span> jobs</h2></div>
                <p className="max-w-md text-sm text-muted-foreground">Handpicked roles from teams looking for their next great hire.</p>
            </div>
            <div className='grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3'>
                {
                    allJobs.length <= 0 ? <span>No Job Available</span> : allJobs?.slice(0,6).map((job) => <LatestJobCards key={job._id} job={job}/>)
                }
            </div>
        </section>
    )
}

export default LatestJobs

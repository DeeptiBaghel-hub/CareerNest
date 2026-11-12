import React from 'react'
import { Badge } from './ui/badge'
import { useNavigate } from 'react-router-dom'
import { formatSalary } from '@/utils/jobUtils'

const LatestJobCards = ({job}) => {
    const navigate = useNavigate();
    return (
        <button type="button" onClick={()=> navigate(`/description/${job._id}`)} className='group w-full rounded-2xl border border-border bg-card p-6 text-left text-card-foreground shadow-sm transition duration-200 hover:-translate-y-1 hover:border-primary/50 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'>
            <div>
                <h3 className='text-lg font-semibold tracking-tight'>{job?.company?.name}</h3>
                <p className='text-sm text-muted-foreground'>{job?.location || "Location not specified"}</p>
            </div>
            <div>
                <h3 className='my-3 text-xl font-bold tracking-tight group-hover:text-primary'>{job?.title}</h3>
                <p className='text-sm text-muted-foreground line-clamp-4'>{job?.description}</p>
            </div>
            <div className='mt-5 flex flex-wrap items-center gap-2'>
                <Badge className={'text-blue-700 font-bold'} variant="ghost">{job?.position} Positions</Badge>
                <Badge className={'text-[#d97706] font-bold'} variant="ghost">{job?.jobType}</Badge>
                <Badge className={'text-[#4f46e5] font-bold'} variant="ghost">{formatSalary(job?.salary)}</Badge>
            </div>

        </button>
    )
}

export default LatestJobCards

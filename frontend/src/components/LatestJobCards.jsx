import React from 'react'
import { Badge } from './ui/badge'
import { useNavigate } from 'react-router-dom'

const LatestJobCards = ({job}) => {
    const navigate = useNavigate();
    return (
        <div onClick={()=> navigate(`/description/${job._id}`)} className='p-5 rounded-md shadow-xl bg-card text-card-foreground border border-border cursor-pointer'>
            <div>
                <h1 className='font-medium text-lg'>{job?.company?.name}</h1>
                <p className='text-sm text-muted-foreground'>{job?.location || "Location not specified"}</p>
            </div>
            <div>
                <h1 className='font-bold text-lg my-2'>{job?.title}</h1>
                <p className='text-sm text-muted-foreground line-clamp-4'>{job?.description}</p>
            </div>
            <div className='flex items-center gap-2 mt-4'>
                <Badge className={'text-blue-700 font-bold'} variant="ghost">{job?.position} Positions</Badge>
                <Badge className={'text-[#d97706] font-bold'} variant="ghost">{job?.jobType}</Badge>
                <Badge className={'text-[#4f46e5] font-bold'} variant="ghost">₹{job?.salary} LPA</Badge>
            </div>

        </div>
    )
}

export default LatestJobCards

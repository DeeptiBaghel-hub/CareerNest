import React from 'react'
import { Badge } from './ui/badge'
import { useNavigate } from 'react-router-dom'
import { formatSalary } from '@/utils/jobUtils'
import { ArrowUpRight, MapPin } from 'lucide-react'

const LatestJobCards = ({job}) => {
    const navigate = useNavigate();
    return (
        <button type="button" onClick={()=> navigate(`/description/${job._id}`)} className='group relative w-full rounded-[1.4rem] border border-border/80 bg-card p-5 text-left text-card-foreground shadow-[0_6px_24px_-18px_rgba(15,35,80,0.28)] transition duration-200 hover:-translate-y-1 hover:border-primary/35 hover:shadow-[0_18px_40px_-22px_rgba(40,93,245,0.3)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:p-6'>
            <div className="flex items-start justify-between gap-3">
                <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-secondary text-lg font-bold text-primary">
                    {job?.company?.logo ? <img src={job.company.logo} alt="" className="size-full object-cover" /> : job?.company?.name?.charAt(0)?.toUpperCase() || "C"}
                </div>
                <ArrowUpRight className="size-5 text-muted-foreground transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
            </div>
            <div>
                <p className="mt-4 text-sm font-semibold text-muted-foreground">{job?.company?.name}</p>
                <h3 className='mt-1 text-lg font-bold tracking-tight transition-colors group-hover:text-primary'>{job?.title}</h3>
                <p className='mt-2 inline-flex items-center gap-1.5 text-sm text-muted-foreground'><MapPin className="size-3.5" />{job?.location || "Location not specified"}</p>
                <p className='mt-3 text-sm leading-6 text-muted-foreground line-clamp-2'>{job?.description}</p>
            </div>
            <div className='mt-5 flex flex-wrap items-center gap-2 border-t border-border/70 pt-4'>
                <Badge className="rounded-full bg-secondary px-2.5 py-1 font-semibold text-primary" variant="ghost">{job?.position} Positions</Badge>
                <Badge className="rounded-full bg-accent px-2.5 py-1 font-semibold text-accent-foreground" variant="ghost">{job?.jobType}</Badge>
                <Badge className="rounded-full bg-muted px-2.5 py-1 font-semibold text-foreground" variant="ghost">{formatSalary(job?.salary)}</Badge>
            </div>

        </button>
    )
}

export default LatestJobCards

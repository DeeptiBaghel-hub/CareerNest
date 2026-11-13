import React from 'react'
import { Link } from 'react-router-dom'

const BrandLogo = ({ compact = false }) => (
    <Link to="/" aria-label="CareerNest home" className="inline-flex shrink-0 items-center gap-2.5">
        <img src="/careernest-mark.svg" alt="" className="size-10" />
        {!compact && <span className="text-[1.35rem] font-bold tracking-tight text-foreground">
            Career<span className="text-primary">Nest</span>
        </span>}
    </Link>
)

export default BrandLogo

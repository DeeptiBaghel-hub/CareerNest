import React from 'react';
import { ArrowUpRight, BriefcaseBusiness, Building2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import BrandLogo from './BrandLogo'

const Footer = () => {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-6 sm:py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr]">
          <div>
            <BrandLogo />
            <p className="mt-4 max-w-sm text-sm leading-6 text-muted-foreground">A little closer to the work you love. Discover your next opportunity with CareerNest.</p>
          </div>
          <div>
            <h3 className="mb-3 text-sm font-bold text-foreground">Explore</h3>
            <div className="flex flex-col items-start gap-2.5 text-sm text-muted-foreground">
              <Link to="/jobs" className="transition-colors hover:text-primary">Find jobs</Link>
              <Link to="/browse" className="transition-colors hover:text-primary">Browse opportunities</Link>
              <Link to="/saved" className="transition-colors hover:text-primary">Saved jobs</Link>
            </div>
          </div>
          <div>
            <h3 className="mb-3 text-sm font-bold text-foreground">For everyone</h3>
            <div className="flex flex-col items-start gap-2.5 text-sm text-muted-foreground">
              <Link to="/signup" className="inline-flex items-center gap-2 transition-colors hover:text-primary"><BriefcaseBusiness className="size-4" /> Create a job seeker profile</Link>
              <Link to="/login" className="inline-flex items-center gap-2 transition-colors hover:text-primary"><Building2 className="size-4" /> Recruiter sign in <ArrowUpRight className="size-3.5" /></Link>
            </div>
          </div>
        </div>
        <div className="mt-9 flex flex-col gap-2 border-t border-border pt-5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 CareerNest. All rights reserved.</p>
          <p>Made for the next step in your career.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
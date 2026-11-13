import React, { useState } from 'react'
import { Button } from './ui/button'
import { ArrowRight, BriefcaseBusiness, MapPin, Search, Sparkles } from 'lucide-react'
import { useDispatch } from 'react-redux';
import { setSearchedQuery } from '@/redux/jobSlice';
import { useNavigate } from 'react-router-dom';

const HeroSection = () => {
    const [query, setQuery] = useState("");
    const [location, setLocation] = useState("");
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const searchJobHandler = (event) => {
        event?.preventDefault();
        dispatch(setSearchedQuery([query, location].map(value => value.trim()).filter(Boolean).join(" ")));
        navigate("/browse");
    }

    return (
        <section className="relative isolate overflow-hidden px-4 pb-14 pt-16 sm:px-6 sm:pb-20 sm:pt-24">
            <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_rgba(40,93,245,0.12),_transparent_60%)]" />
            <div className="pointer-events-none absolute -right-32 top-20 -z-10 size-80 rounded-full bg-orange-200/20 blur-3xl" />
            <div className="mx-auto flex max-w-5xl flex-col items-center text-center">
                <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-white/80 px-4 py-2 text-sm font-semibold text-primary shadow-sm">
                    <Sparkles className="size-4" /> Find work that moves you forward
                </span>
                <h1 className="max-w-4xl text-4xl font-bold leading-[1.08] tracking-tight text-foreground sm:text-6xl lg:text-[4.25rem]">
                    Find your next <span className="text-primary">big opportunity.</span>
                </h1>
                <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
                    Explore roles from teams that value your skills. Your next chapter starts here.
                </p>
                <form onSubmit={searchJobHandler} className="mt-9 flex w-full max-w-4xl flex-col gap-2 rounded-[1.6rem] border border-border/80 bg-card p-2.5 shadow-[0_20px_70px_-35px_rgba(27,52,110,0.28)] transition-shadow focus-within:shadow-[0_20px_70px_-28px_rgba(40,93,245,0.3)] sm:flex-row sm:items-center sm:rounded-full sm:p-2">
                    <label className="flex min-w-0 flex-1 items-center gap-3 rounded-xl px-4 py-3 sm:py-2">
                        <BriefcaseBusiness className="size-5 shrink-0 text-primary" />
                        <span className="sr-only">Job title, skills, or company</span>
                        <input
                            type="search"
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder="Job title, skills, or company"
                            className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground sm:text-base"
                        />
                    </label>
                    <div className="hidden h-9 w-px bg-border sm:block" />
                    <label className="flex min-w-0 items-center gap-3 rounded-xl px-4 py-3 sm:w-56 sm:py-2">
                        <MapPin className="size-5 shrink-0 text-primary" />
                        <span className="sr-only">City or location</span>
                        <input
                            type="search"
                            value={location}
                            onChange={(event) => setLocation(event.target.value)}
                            placeholder="City or location"
                            className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground sm:text-base"
                        />
                    </label>
                    <Button type="submit" className="h-12 shrink-0 rounded-full bg-primary px-7 text-primary-foreground shadow-md shadow-teal-900/20 transition hover:bg-primary/90 sm:h-12">
                        <Search className="size-4" /> Search jobs <ArrowRight className="size-4" />
                    </Button>
                </form>
                <p className="mt-4 text-sm text-muted-foreground">
                    Trending searches: <span className="font-medium text-foreground">Frontend Developer · React · Remote</span>
                </p>
            </div>
        </section>
    )
}

export default HeroSection

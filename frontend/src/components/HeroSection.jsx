import React, { useState } from 'react'
import { Button } from './ui/button'
import { Search } from 'lucide-react'
import { useDispatch } from 'react-redux';
import { setSearchedQuery } from '@/redux/jobSlice';
import { useNavigate } from 'react-router-dom';

const HeroSection = () => {
    const [query, setQuery] = useState("");
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const searchJobHandler = () => {
        dispatch(setSearchedQuery(query));
        navigate("/browse");
    }

    return (
        <section className='relative isolate overflow-hidden px-5 py-20 text-center sm:py-24'>
            <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 mx-auto h-80 max-w-4xl rounded-full bg-teal-500/10 blur-3xl" />
            <div className='mx-auto flex max-w-4xl flex-col items-center gap-6'>
                <span className='rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary'>Find work that moves you forward</span>
                <h1 className='text-4xl font-bold leading-tight tracking-tight sm:text-6xl lg:text-7xl'>Search, apply &amp;<br className="hidden sm:block" /> get your <span className='text-primary'>dream job</span></h1>
                <p className="max-w-2xl text-base text-muted-foreground sm:text-lg">Discover opportunities that fit your skills, build your career, and take the next step with confidence.</p>
                <div className='flex w-full max-w-2xl items-center gap-2 rounded-2xl border border-border bg-card p-2 shadow-xl shadow-black/5 sm:rounded-full'>
                    <input
                        type="text"
                        placeholder='Find your dream jobs'
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={(event) => event.key === 'Enter' && searchJobHandler()}
                        className='w-full border-none bg-transparent px-3 py-2 text-foreground outline-none placeholder:text-muted-foreground'

                    />
                    <Button onClick={searchJobHandler} className="rounded-xl bg-primary px-5 text-primary-foreground hover:opacity-90 sm:rounded-full">
                        <Search className='h-5 w-5' />
                    </Button>
                </div>
            </div>
        </section>
    )
}

export default HeroSection

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Button } from './ui/button'
import { ArrowRight, BriefcaseBusiness, MapPin, Search, Sparkles } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux';
import { setSearchedQuery } from '@/redux/jobSlice';
import { useNavigate } from 'react-router-dom';
import { getJobSearchSuggestions } from '@/utils/jobUtils';

const HeroSection = () => {
    const [query, setQuery] = useState("");
    const [location, setLocation] = useState("");
    const [activeField, setActiveField] = useState('role');
    const [activeSuggestion, setActiveSuggestion] = useState(-1);
    const [suggestionsOpen, setSuggestionsOpen] = useState(false);
    const searchRef = useRef(null);
    const { allJobs } = useSelector(store => store.job);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const trendingSearches = ['Frontend Developer', 'React', 'Remote'];
    const activeValue = activeField === 'location' ? location : query;
    const suggestions = useMemo(
        () => getJobSearchSuggestions(allJobs, activeValue, activeField),
        [allJobs, activeField, activeValue]
    );

    useEffect(() => {
        const closeOnOutsideClick = (event) => {
            if (!searchRef.current?.contains(event.target)) setSuggestionsOpen(false);
        };
        document.addEventListener('pointerdown', closeOnOutsideClick);
        return () => document.removeEventListener('pointerdown', closeOnOutsideClick);
    }, []);

    const searchJobHandler = (event) => {
        event?.preventDefault();
        dispatch(setSearchedQuery([query, location].map(value => value.trim()).filter(Boolean).join(" ")));
        setSuggestionsOpen(false);
        navigate("/browse");
    }

    const chooseSuggestion = (value) => {
        const nextQuery = activeField === 'role' ? value : query;
        const nextLocation = activeField === 'location' ? value : location;
        setQuery(nextQuery);
        setLocation(nextLocation);
        dispatch(setSearchedQuery([nextQuery, nextLocation].map(item => item.trim()).filter(Boolean).join(" ")));
        setSuggestionsOpen(false);
        navigate("/browse");
    };

    const handleSuggestionKeys = (event) => {
        if (event.key === 'Escape') {
            setSuggestionsOpen(false);
            setActiveSuggestion(-1);
            return;
        }
        if (!suggestionsOpen || !suggestions.length) return;
        if (event.key === 'ArrowDown') {
            event.preventDefault();
            setActiveSuggestion(current => (current + 1) % suggestions.length);
        } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            setActiveSuggestion(current => (current <= 0 ? suggestions.length - 1 : current - 1));
        } else if (event.key === 'Enter' && activeSuggestion >= 0) {
            event.preventDefault();
            chooseSuggestion(suggestions[activeSuggestion]);
        }
    };

    const renderSuggestions = (field) => {
        if (activeField !== field || !suggestionsOpen || !suggestions.length) return null;
        return <ul id={`${field}-job-suggestions`} role="listbox" className="absolute left-0 right-0 top-full z-30 mt-2 overflow-hidden rounded-2xl border border-border bg-card p-1.5 text-left shadow-xl">
            {suggestions.map((suggestion, index) => (
                <li key={`${field}-${suggestion}`}>
                    <button
                        type="button"
                        role="option"
                        aria-selected={activeSuggestion === index}
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => chooseSuggestion(suggestion)}
                        className={`w-full rounded-xl px-3 py-2.5 text-left text-sm transition-colors ${activeSuggestion === index ? 'bg-secondary text-primary' : 'text-foreground hover:bg-secondary'}`}
                    >
                        {suggestion}
                    </button>
                </li>
            ))}
        </ul>;
    };

    return (
        <section className="relative isolate overflow-hidden px-4 pb-14 pt-16 sm:px-6 sm:pb-20 sm:pt-24">
            <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_rgba(40,93,245,0.12),_transparent_60%)]" />
            <div className="pointer-events-none absolute -right-32 top-20 -z-10 size-80 rounded-full bg-orange-200/20 blur-3xl" />
            <div className="mx-auto flex max-w-5xl flex-col items-center text-center" ref={searchRef}>
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
                    <div className="relative flex min-w-0 flex-1 items-center">
                        <label className="flex w-full min-w-0 items-center gap-3 rounded-xl px-4 py-3 sm:py-2">
                            <BriefcaseBusiness className="size-5 shrink-0 text-primary" />
                            <span className="sr-only">Job title, skills, or company</span>
                            <input
                                type="search"
                                value={query}
                                onChange={(event) => { setQuery(event.target.value); setActiveField('role'); setActiveSuggestion(-1); setSuggestionsOpen(true); }}
                                onFocus={() => { setActiveField('role'); setActiveSuggestion(-1); setSuggestionsOpen(true); }}
                                onKeyDown={handleSuggestionKeys}
                                aria-autocomplete="list"
                                aria-controls="role-job-suggestions"
                                aria-expanded={activeField === 'role' && suggestionsOpen && suggestions.length > 0}
                                placeholder="Job title, skills, or company"
                                className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground sm:text-base"
                            />
                        </label>
                        {renderSuggestions('role')}
                    </div>
                    <div className="hidden h-9 w-px bg-border sm:block" />
                    <div className="relative flex min-w-0 items-center sm:w-56">
                        <label className="flex w-full min-w-0 items-center gap-3 rounded-xl px-4 py-3 sm:py-2">
                            <MapPin className="size-5 shrink-0 text-primary" />
                            <span className="sr-only">City or location</span>
                            <input
                                type="search"
                                value={location}
                                onChange={(event) => { setLocation(event.target.value); setActiveField('location'); setActiveSuggestion(-1); setSuggestionsOpen(true); }}
                                onFocus={() => { setActiveField('location'); setActiveSuggestion(-1); setSuggestionsOpen(true); }}
                                onKeyDown={handleSuggestionKeys}
                                aria-autocomplete="list"
                                aria-controls="location-job-suggestions"
                                aria-expanded={activeField === 'location' && suggestionsOpen && suggestions.length > 0}
                                placeholder="City or location"
                                className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground sm:text-base"
                            />
                        </label>
                        {renderSuggestions('location')}
                    </div>
                    <Button type="submit" className="h-12 shrink-0 rounded-full bg-primary px-7 text-primary-foreground shadow-md shadow-teal-900/20 transition hover:bg-primary/90 sm:h-12">
                        <Search className="size-4" /> Search jobs <ArrowRight className="size-4" />
                    </Button>
                </form>
                <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-sm text-muted-foreground">
                    <span className="mr-1">Trending searches:</span>
                    {trendingSearches.map(search => <button
                        key={search}
                        type="button"
                        onClick={() => { setQuery(search); setLocation(''); dispatch(setSearchedQuery(search)); navigate('/browse'); }}
                        className="rounded-full border border-border/70 bg-card/80 px-3 py-1.5 font-medium text-foreground transition hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
                    >{search}</button>)}
                </div>
            </div>
        </section>
    )
}

export default HeroSection

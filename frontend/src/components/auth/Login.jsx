import React, { useEffect, useState } from 'react'
import Navbar from '../shared/Navbar'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { USER_API_END_POINT } from '@/utils/constant'
import { toast } from 'sonner'
import { useDispatch, useSelector } from 'react-redux'
import { setLoading, setUser } from '@/redux/authSlice'
import { ArrowRight, BriefcaseBusiness, Eye, EyeOff, Loader2, Search, ShieldCheck, Sparkles } from 'lucide-react'
import BrandLogo from '../shared/BrandLogo'

const Login = () => {
    const [input, setInput] = useState({
        email: "",
        password: "",
        role: "",
    });
    const [showPassword, setShowPassword] = useState(false);
    const { loading,user } = useSelector(store => store.auth);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const changeEventHandler = (e) => {
        const { name, value } = e.target;
        setInput(current => ({ ...current, [name]: value }));
    }

    const submitHandler = async (e) => {
        e.preventDefault();
        if (!input.role) {
            toast.error("Choose whether you are signing in as a job seeker or recruiter.");
            return;
        }
        try {
            dispatch(setLoading(true));
            const res = await axios.post(`${USER_API_END_POINT}/login`, input, {
                headers: {
                    "Content-Type": "application/json"
                },
                withCredentials: true,
            });
            if (res.data.success) {
                dispatch(setUser(res.data.user));
                navigate(res.data.user?.role === "recruiter" ? "/admin/jobs" : "/");
                toast.success(res.data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Unable to connect to the server. Please try again.");
        } finally {
            dispatch(setLoading(false));
        }
    }
    useEffect(() => {
        if(user){
            navigate(user.role === "recruiter" ? "/admin/jobs" : "/", { replace: true });
        }
    }, [user, navigate])
    return (
        <div className="min-h-screen bg-background text-foreground">
            <Navbar />
            <main className="relative isolate overflow-hidden px-4 py-8 sm:px-6 sm:py-12 lg:py-16">
                <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
                    <div className="absolute -left-32 top-12 size-80 rounded-full bg-primary/10 blur-3xl" />
                    <div className="absolute -right-24 bottom-0 size-96 rounded-full bg-accent blur-3xl" />
                </div>
                <div className="mx-auto grid max-w-5xl overflow-hidden rounded-[2rem] border border-border/80 bg-card shadow-[0_32px_100px_-48px_rgba(15,35,50,0.35)] lg:grid-cols-[1fr_0.92fr]">
                    <section className="relative hidden min-h-[600px] flex-col justify-between overflow-hidden bg-primary p-10 text-primary-foreground lg:flex">
                        <div aria-hidden="true" className="absolute -right-24 top-20 size-72 rounded-full border border-white/10" />
                        <div aria-hidden="true" className="absolute -right-10 top-32 size-44 rounded-full border border-white/10" />
                        <div>
                            <Link to="/" aria-label="CareerNest home" className="inline-flex items-center gap-2.5">
                                <img src="/careernest-mark.svg" alt="" className="size-10" />
                                <span className="text-[1.35rem] font-bold tracking-tight text-primary-foreground">Career<span className="text-white/75">Nest</span></span>
                            </Link>
                            <div className="mt-24 max-w-sm">
                                <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold tracking-wide">
                                    <Sparkles className="size-3.5" /> YOUR NEXT STEP STARTS HERE
                                </span>
                                <h1 className="mt-6 text-4xl font-bold leading-tight tracking-tight">Good work starts with the right connection.</h1>
                                <p className="mt-4 text-base leading-7 text-primary-foreground/75">Find opportunities that fit your ambitions, or meet the people ready to build what’s next.</p>
                            </div>
                        </div>
                        <div className="grid gap-3">
                            <div className="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
                                <span className="flex size-10 items-center justify-center rounded-xl bg-white/15"><Search className="size-5" /></span>
                                <div><p className="font-semibold">For job seekers</p><p className="text-sm text-primary-foreground/70">Explore roles made for your next move</p></div>
                                <ArrowRight className="ml-auto size-4" />
                            </div>
                            <div className="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
                                <span className="flex size-10 items-center justify-center rounded-xl bg-white/15"><BriefcaseBusiness className="size-5" /></span>
                                <div><p className="font-semibold">For recruiters</p><p className="text-sm text-primary-foreground/70">Meet talent and manage your hiring</p></div>
                                <ArrowRight className="ml-auto size-4" />
                            </div>
                        </div>
                        <p className="flex items-center gap-2 text-xs text-primary-foreground/65"><ShieldCheck className="size-4" />A more thoughtful way to find the right fit.</p>
                    </section>

                    <section className="flex items-center justify-center p-6 sm:p-10 lg:p-12">
                        <form onSubmit={submitHandler} className="w-full max-w-md">
                            <div className="mb-8 lg:hidden"><BrandLogo /></div>
                            <p className="text-sm font-semibold text-primary">WELCOME BACK</p>
                            <h2 className="mt-2 text-3xl font-bold tracking-tight">Sign in to CareerNest</h2>
                            <p className="mt-2 text-sm text-muted-foreground">Pick up where your next opportunity begins.</p>

                            <fieldset className="mt-8">
                                <legend className="mb-3 text-sm font-medium">I’m signing in as</legend>
                                <div className="grid grid-cols-2 gap-3">
                                    {[{ value: "student", title: "Job seeker", detail: "Find your next role", Icon: Search }, { value: "recruiter", title: "Recruiter", detail: "Build your team", Icon: BriefcaseBusiness }].map(({ value, title, detail, Icon }) => (
                                        <label key={value} className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-3.5 transition ${input.role === value ? "border-primary bg-primary/5 ring-2 ring-primary/15" : "border-border hover:border-primary/40 hover:bg-muted/40"}`}>
                                            <input
                                                type="radio"
                                                name="role"
                                                value={value}
                                                checked={input.role === value}
                                                onChange={changeEventHandler}
                                                className="sr-only"
                                                required
                                            />
                                            <span className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${input.role === value ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}><Icon className="size-4" /></span>
                                            <span className="min-w-0"><span className="block text-sm font-semibold">{title}</span><span className="mt-0.5 block text-xs text-muted-foreground">{detail}</span></span>
                                        </label>
                                    ))}
                                </div>
                            </fieldset>

                            <div className="mt-6 space-y-5">
                                <div className="space-y-2">
                                    <Label htmlFor="login-email">Email address</Label>
                                    <Input
                                        id="login-email"
                                        type="email"
                                        value={input.email}
                                        name="email"
                                        onChange={changeEventHandler}
                                        placeholder="you@example.com"
                                        autoComplete="email"
                                        required
                                        className="h-12 rounded-xl bg-background"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="login-password">Password</Label>
                                    <div className="relative">
                                        <Input
                                            id="login-password"
                                            type={showPassword ? "text" : "password"}
                                            value={input.password}
                                            name="password"
                                            onChange={changeEventHandler}
                                            className="h-12 rounded-xl bg-background pr-12"
                                            autoComplete="current-password"
                                            required
                                        />
                                        <button type="button" onClick={() => setShowPassword(visible => !visible)} aria-label={showPassword ? "Hide password" : "Show password"} aria-pressed={showPassword} className="absolute inset-y-0 right-3 flex items-center text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                                            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <Button type="submit" disabled={loading || !input.email.trim() || !input.password || !input.role} className="mt-7 h-12 w-full rounded-xl text-base font-semibold">
                                {loading ? <><Loader2 className="mr-2 size-4 animate-spin" />Signing in…</> : <>Sign in <ArrowRight className="ml-2 size-4" /></>}
                            </Button>

                            <p className="mt-6 text-center text-sm text-muted-foreground">New to CareerNest? <Link to="/signup" className="font-semibold text-primary hover:underline">Create an account</Link></p>
                        </form>
                    </section>
                </div>
                <p className="mx-auto mt-6 max-w-5xl text-center text-xs text-muted-foreground">By continuing, you agree to use CareerNest respectfully and keep your account details secure.</p>
            </main>
        </div>
    )
}

export default Login

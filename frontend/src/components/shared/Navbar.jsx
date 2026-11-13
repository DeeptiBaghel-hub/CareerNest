import React, { useState } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { Button } from '../ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar'
import { BookmarkCheck, LogOut, Menu, Moon, Sun, User2, X } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import axios from 'axios'
import { USER_API_END_POINT } from '@/utils/constant'
import { setUser } from '@/redux/authSlice'
import { toast } from 'sonner'
import BrandLogo from './BrandLogo'

const Navbar = () => {
    const [menuOpen, setMenuOpen] = useState(false);
    const { user } = useSelector(store => store.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { theme, setTheme } = useTheme();

    const logoutHandler = async () => {
        try {
            const res = await axios.get(`${USER_API_END_POINT}/logout`, { withCredentials: true });
            if (res.data.success) {
                dispatch(setUser(null));
                navigate("/");
                toast.success(res.data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response?.data?.message || "Unable to log out.");
        }
    }

    return (
        <div className='sticky top-0 z-40 border-b border-border/80 bg-background/95 text-foreground shadow-sm shadow-slate-900/[0.03] backdrop-blur-xl'>
            <div className='mx-auto flex h-[72px] max-w-7xl items-center justify-between px-4 sm:px-6'>
                <BrandLogo />
                <div className='flex items-center gap-2 sm:gap-4'>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                        aria-label="Toggle theme"
                        className="rounded-full text-muted-foreground hover:text-primary"
                    >
                        {theme === "dark" ? <Sun /> : <Moon />}
                    </Button>
                    <div className='hidden items-center gap-8 md:flex'>
                        <ul className='flex items-center gap-8 text-sm font-medium text-muted-foreground'>
                            {user?.role === 'recruiter' ? (
                                <>
                                    <li><Link className="transition-colors hover:text-primary" to="/admin/companies">Companies</Link></li>
                                    <li><Link className="transition-colors hover:text-primary" to="/admin/jobs">Jobs</Link></li>
                                </>
                            ) : (
                                <>
                                    <li><Link className="transition-colors hover:text-primary" to="/">Home</Link></li>
                                    <li><Link className="transition-colors hover:text-primary" to="/jobs">Jobs</Link></li>
                                    <li><Link className="transition-colors hover:text-primary" to="/browse">Browse</Link></li>
                                    {user && <li><Link to="/saved" className="inline-flex items-center gap-1.5 transition-colors hover:text-primary"><BookmarkCheck className="size-4" />Saved</Link></li>}
                                </>
                            )}
                        </ul>
                        {!user ? (
                            <div className='flex items-center gap-2'>
                                <Link to="/login"><Button variant="outline" className="h-10 rounded-full border-primary/30 px-5 text-primary hover:border-primary hover:bg-primary/5">Login</Button></Link>
                                <Link to="/signup"><Button className="h-10 rounded-full bg-primary px-5 text-primary-foreground hover:bg-primary/90">Register</Button></Link>
                            </div>
                        ) : (
                            <Popover>
                                <PopoverTrigger nativeButton={false} render={<Avatar className="cursor-pointer" />}>
                                    <AvatarImage src={user?.profile?.profilePhoto} alt="Profile" />
                                    <AvatarFallback>{user?.fullname ? user.fullname.charAt(0).toUpperCase() : <User2 className="size-4" />}</AvatarFallback>
                                </PopoverTrigger>
                                <PopoverContent className="w-80">
                                    <div className='flex gap-2'>
                                        <Avatar>
                                            <AvatarImage src={user?.profile?.profilePhoto} alt="Profile" />
                                            <AvatarFallback>{user?.fullname ? user.fullname.charAt(0).toUpperCase() : <User2 className="size-4" />}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <h4 className='font-medium'>{user?.fullname}</h4>
                                            <p className='text-sm text-muted-foreground'>{user?.email}</p>
                                            <p className='text-sm text-muted-foreground'>{user?.profile?.bio}</p>
                                        </div>
                                    </div>
                                    <div className='flex flex-col my-2 text-muted-foreground'>
                                        <div className='flex items-center gap-2'>
                                            <User2 />
                                            <Button variant="link"><Link to="/profile">View Profile</Link></Button>
                                        </div>
                                        <div className='flex items-center gap-2'>
                                            <LogOut />
                                            <Button onClick={logoutHandler} variant="link">Logout</Button>
                                        </div>
                                    </div>
                                </PopoverContent>
                            </Popover>
                        )}
                    </div>
                    <div className="flex items-center gap-2 md:hidden">
                        {!user && <Link to="/login"><Button variant="outline" className="h-9 rounded-full border-primary/30 px-4 text-primary">Login</Button></Link>}
                        {user && <Popover>
                            <PopoverTrigger nativeButton={false} render={<Avatar className="size-9 cursor-pointer" />}>
                                <AvatarImage src={user?.profile?.profilePhoto} alt="Profile" />
                                <AvatarFallback>{user?.fullname ? user.fullname.charAt(0).toUpperCase() : <User2 className="size-4" />}</AvatarFallback>
                            </PopoverTrigger>
                            <PopoverContent className="w-72">
                                <div className="mb-3"><p className="font-semibold">{user?.fullname}</p><p className="text-sm text-muted-foreground">{user?.email}</p></div>
                                <Link to="/profile"><Button variant="ghost" className="w-full justify-start"><User2 />View Profile</Button></Link>
                                <Button onClick={logoutHandler} variant="ghost" className="w-full justify-start"><LogOut />Logout</Button>
                            </PopoverContent>
                        </Popover>}
                        <Button variant="ghost" size="icon" className="rounded-full" aria-label={menuOpen ? "Close menu" : "Open menu"} aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>
                            {menuOpen ? <X /> : <Menu />}
                        </Button>
                    </div>
                </div>
            </div>
            {menuOpen && <nav className="border-t border-border bg-background px-4 py-3 md:hidden">
                <ul className="mx-auto flex max-w-7xl flex-col gap-1">
                    {(user?.role === "recruiter"
                        ? [["Companies", "/admin/companies"], ["Jobs", "/admin/jobs"]]
                        : [["Home", "/"], ["Jobs", "/jobs"], ["Browse", "/browse"], ...(user ? [["Saved", "/saved"]] : [])]
                    ).map(([label, path]) => <li key={path}>
                        <Link to={path} onClick={() => setMenuOpen(false)} className="block rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-primary">{label}</Link>
                    </li>)}
                    {!user && <li><Link to="/signup" onClick={() => setMenuOpen(false)} className="block rounded-xl px-3 py-2.5 text-sm font-semibold text-primary">Create an account</Link></li>}
                </ul>
            </nav>}
        </div>
    )
}

export default Navbar

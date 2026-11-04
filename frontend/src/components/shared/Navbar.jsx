import React from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { Button } from '../ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar'
import { BookmarkCheck, LogOut, Moon, Sun, User2 } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import axios from 'axios'
import { USER_API_END_POINT } from '@/utils/constant'
import { setUser } from '@/redux/authSlice'
import { toast } from 'sonner'

const Navbar = () => {
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
        <div className='sticky top-0 z-40 border-b border-border bg-background/90 text-foreground backdrop-blur-xl'>
            <div className='mx-auto flex h-16 max-w-7xl items-center justify-between px-5'>
                <h1 className='text-2xl font-bold'>Career<span className='text-[#0d9488]'>Nest</span></h1>
                <div className='flex items-center gap-4'>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                        aria-label="Toggle theme"
                    >
                        {theme === "dark" ? <Sun /> : <Moon />}
                    </Button>
                    <div className='flex items-center gap-12'>
                        <ul className='flex font-medium items-center gap-5'>
                            {user?.role === 'recruiter' ? (
                                <>
                                    <li><Link to="/admin/companies">Companies</Link></li>
                                    <li><Link to="/admin/jobs">Jobs</Link></li>
                                </>
                            ) : (
                                <>
                                    <li><Link to="/">Home</Link></li>
                                    <li><Link to="/jobs">Jobs</Link></li>
                                    <li><Link to="/browse">Browse</Link></li>
                                    {user && <li><Link to="/saved" className="inline-flex items-center gap-1.5"><BookmarkCheck className="size-4" />Saved</Link></li>}
                                </>
                            )}
                        </ul>
                        {!user ? (
                            <div className='flex items-center gap-2'>
                                <Link to="/login"><Button variant="outline">Login</Button></Link>
                                <Link to="/signup"><Button className="bg-[#0d9488] hover:bg-[#0f766e]">Signup</Button></Link>
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
                </div>
            </div>
        </div>
    )
}

export default Navbar

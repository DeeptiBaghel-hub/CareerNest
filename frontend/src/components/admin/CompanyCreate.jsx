import React, { useState } from 'react'
import Navbar from '../shared/Navbar'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { COMPANY_API_END_POINT } from '@/utils/constant'
import { toast } from 'sonner'
import { useDispatch } from 'react-redux'
import { setSingleCompany } from '@/redux/companySlice'
import { Loader2 } from 'lucide-react'

const CompanyCreate = () => {
    const navigate = useNavigate();
    const [companyName, setCompanyName] = useState("");
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch();
    const registerNewCompany = async (event) => {
        event.preventDefault();
        try {
            setLoading(true);
            const res = await axios.post(`${COMPANY_API_END_POINT}/register`, {companyName}, {
                headers:{
                    'Content-Type':'application/json'
                },
                withCredentials:true
            });
            if(res?.data?.success){
                dispatch(setSingleCompany(res.data.company));
                toast.success(res.data.message);
                const companyId = res?.data?.company?._id;
                navigate(`/admin/companies/${companyId}`);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Something went wrong while registering the company.");
        } finally {
            setLoading(false);
        }
    }
    return (
        <div>
            <Navbar />
            <main className='mx-auto max-w-4xl px-4 sm:px-6'>
                <div className='my-10'>
                    <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">Recruiter workspace</p>
                    <h1 className='mt-1 font-bold text-2xl'>Register a company</h1>
                    <p className='mt-2 text-muted-foreground'>Add a company to organize and publish its job listings.</p>
                </div>
                <form onSubmit={registerNewCompany} className="max-w-xl rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
                    <Label htmlFor="company-name">Company name</Label>
                    <Input
                        id="company-name"
                        type="text"
                        className="my-2"
                        placeholder="e.g. Acme Technologies"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        maxLength={100}
                        required
                    />
                    <p className="text-xs text-muted-foreground">You can add the company profile, website, and logo next.</p>
                    <div className='mt-8 flex items-center justify-end gap-2'>
                        <Button type="button" variant="outline" onClick={() => navigate("/admin/companies")}>Cancel</Button>
                        <Button type="submit" disabled={loading || !companyName.trim()}>
                            {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
                            {loading ? "Creating..." : "Continue"}
                        </Button>
                    </div>
                </form>
            </main>
        </div>
    )
}

export default CompanyCreate

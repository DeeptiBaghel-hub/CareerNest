import React, { useState } from 'react'
import Navbar from '../shared/Navbar'
import { Button } from '../ui/button'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import axios from 'axios'
import { COMPANY_API_END_POINT } from '@/utils/constant'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { useSelector } from 'react-redux'
import useGetCompanyById from '@/hooks/useGetCompanyById'

const CompanySetup = () => {
    const params = useParams();
    useGetCompanyById(params.id);
    const {singleCompany} = useSelector(store=>store.company);
    const [editedFields, setEditedFields] = useState({});
    const input = {
        name: singleCompany?.name || "",
        description: singleCompany?.description || "",
        website: singleCompany?.website || "",
        location: singleCompany?.location || "",
        industry: singleCompany?.industry || "",
        companySize: singleCompany?.companySize || "",
        founded: singleCompany?.founded ? String(singleCompany.founded) : "",
        companyType: singleCompany?.companyType || "",
        specializations: singleCompany?.specializations?.join(", ") || "",
        file: null,
        ...editedFields,
    };
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const changeEventHandler = (e) => {
        setEditedFields(fields => ({ ...fields, [e.target.name]: e.target.value }));
    }

    const changeFileHandler = (e) => {
        const file = e.target.files?.[0];
        setEditedFields(fields => ({ ...fields, file }));
    }

    const submitHandler = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append("name", input.name);
        formData.append("description", input.description);
        formData.append("website", input.website);
        formData.append("location", input.location);
        formData.append("industry", input.industry);
        formData.append("companySize", input.companySize);
        formData.append("founded", input.founded);
        formData.append("companyType", input.companyType);
        formData.append("specializations", input.specializations);
        if (input.file) {
            formData.append("file", input.file);
        }
        try {
            setLoading(true);
            const res = await axios.put(`${COMPANY_API_END_POINT}/update/${params.id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                withCredentials: true
            });
            if (res.data.success) {
                toast.success(res.data.message);
                navigate("/admin/companies");
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response?.data?.message || "Something went wrong while updating the company.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div>
            <Navbar />
            <div className='max-w-xl mx-auto my-10'>
                <form onSubmit={submitHandler}>
                    <div className='flex items-center gap-5 p-8'>
                        <Button type="button" onClick={() => navigate("/admin/companies")} variant="outline" className="flex items-center gap-2 text-muted-foreground font-semibold">
                            <ArrowLeft />
                            <span>Back</span>
                        </Button>
                        <h1 className='font-bold text-xl'>Company Setup</h1>
                    </div>
                    <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                        <div>
                            <Label>Company Name</Label>
                            <Input
                                type="text"
                                name="name"
                                required
                                value={input.name}
                                onChange={changeEventHandler}
                            />
                        </div>
                        <div className="sm:col-span-2">
                            <Label>Description</Label>
                            <textarea
                                name="description"
                                value={input.description}
                                onChange={changeEventHandler}
                                rows={4}
                                className="w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                            />
                        </div>
                        <div>
                            <Label>Website</Label>
                            <Input
                                type="text"
                                name="website"
                                value={input.website}
                                onChange={changeEventHandler}
                            />
                        </div>
                        <div>
                            <Label>Location</Label>
                            <Input
                                type="text"
                                name="location"
                                value={input.location}
                                onChange={changeEventHandler}
                            />
                        </div>
                        <div>
                            <Label>Industry</Label>
                            <Input
                                type="text"
                                name="industry"
                                value={input.industry}
                                onChange={changeEventHandler}
                            />
                        </div>
                        <div>
                            <Label>Company Size</Label>
                            <Input
                                type="text"
                                name="companySize"
                                placeholder="e.g. 10,000+ Employees"
                                value={input.companySize}
                                onChange={changeEventHandler}
                            />
                        </div>
                        <div>
                            <Label>Founded</Label>
                            <Input
                                type="number"
                                name="founded"
                                min="1"
                                value={input.founded}
                                onChange={changeEventHandler}
                            />
                        </div>
                        <div>
                            <Label>Company Type</Label>
                            <Input
                                type="text"
                                name="companyType"
                                placeholder="e.g. Public Company"
                                value={input.companyType}
                                onChange={changeEventHandler}
                            />
                        </div>
                        <div className="sm:col-span-2">
                            <Label>Specializations</Label>
                            <textarea
                                name="specializations"
                                placeholder="Separate specializations with commas"
                                value={input.specializations}
                                onChange={changeEventHandler}
                                rows={3}
                                className="w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                            />
                        </div>
                        <div>
                            <Label>Logo</Label>
                            <Input
                                type="file"
                                accept="image/*"
                                onChange={changeFileHandler}
                            />
                        </div>
                    </div>
                    {
                        loading ? <Button type="submit" className="w-full my-4" disabled> <Loader2 className='mr-2 h-4 w-4 animate-spin' /> Please wait </Button> : <Button type="submit" className="w-full my-4">Update</Button>
                    }
                </form>
            </div>

        </div>
    )
}

export default CompanySetup

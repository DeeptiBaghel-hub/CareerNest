import React, { useEffect, useState } from 'react'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { Edit2, MoreHorizontal, Trash2 } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'sonner'
import { COMPANY_API_END_POINT } from '@/utils/constant'
import { setCompanies } from '@/redux/companySlice'

const CompaniesTable = () => {
    const { companies, searchCompanyByText } = useSelector(store => store.company);
    const [filterCompany, setFilterCompany] = useState(companies);
    const [deletingCompanyId, setDeletingCompanyId] = useState(null);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    useEffect(()=>{
        const filteredCompany = companies.length >= 0 && companies.filter((company)=>{
            if(!searchCompanyByText){
                return true
            };
            return company?.name?.toLowerCase().includes(searchCompanyByText.toLowerCase());

        });
        setFilterCompany(filteredCompany);
    },[companies,searchCompanyByText])

    const deleteCompany = async (company) => {
        if (!window.confirm(`Delete ${company.name}? Companies with linked jobs cannot be deleted.`)) return;

        try {
            setDeletingCompanyId(company._id);
            const response = await axios.delete(`${COMPANY_API_END_POINT}/${company._id}`, { withCredentials: true });
            if (response.data.success) {
                dispatch(setCompanies(companies.filter(item => item._id !== company._id)));
                toast.success(response.data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Unable to delete this company.");
        } finally {
            setDeletingCompanyId(null);
        }
    };

    return (
        <div>
            <Table>
                <TableCaption>A list of your recent registered companies</TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead>Logo</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {
                        filterCompany?.map((company) => (
                            <tr key={company._id}>
                                <TableCell>
                                    <Avatar>
                                        <AvatarImage src={company.logo}/>
                                        <AvatarFallback>{company?.name?.charAt(0)?.toUpperCase() || "C"}</AvatarFallback>
                                    </Avatar>
                                </TableCell>
                                <TableCell>{company.name}</TableCell>
                                <TableCell>{company.createdAt.split("T")[0]}</TableCell>
                                <TableCell className="text-right cursor-pointer">
                                    <Popover>
                                        <PopoverTrigger><MoreHorizontal /></PopoverTrigger>
                                        <PopoverContent className="w-40">
                                            <button type="button" onClick={()=> navigate(`/admin/companies/${company._id}`)} className='mb-3 flex items-center gap-2 cursor-pointer'>
                                                <Edit2 className='w-4' />
                                                <span>Edit</span>
                                            </button>
                                            <button type="button" disabled={deletingCompanyId === company._id} onClick={() => deleteCompany(company)} className='flex items-center gap-2 text-destructive disabled:opacity-50'>
                                                <Trash2 className='w-4' />
                                                <span>{deletingCompanyId === company._id ? "Deleting..." : "Delete"}</span>
                                            </button>
                                        </PopoverContent>
                                    </Popover>
                                </TableCell>
                            </tr>

                        ))
                    }
                </TableBody>
            </Table>
        </div>
    )
}

export default CompaniesTable
import { setSingleCompany } from '@/redux/companySlice'
import { COMPANY_API_END_POINT } from '@/utils/constant'
import axios from 'axios'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { toast } from 'sonner'

const useGetCompanyById = (companyId) => {
    const dispatch = useDispatch();
    useEffect(() => {
        if (!companyId) return undefined;
        const controller = new AbortController();
        dispatch(setSingleCompany(null));
        const fetchSingleCompany = async () => {
            try {
                const res = await axios.get(`${COMPANY_API_END_POINT}/get/${companyId}`, { withCredentials: true, signal: controller.signal });
                if(res.data.success){
                    dispatch(setSingleCompany(res.data.company));
                } else {
                    toast.error(res.data.message || "Unable to load company details.");
                }
            } catch (error) {
                if (!axios.isCancel(error)) {
                    toast.error(error.response?.data?.message || "Unable to load company details.");
                }
            }
        }
        fetchSingleCompany();
        return () => controller.abort();
    },[companyId, dispatch])
}

export default useGetCompanyById
import { setCompanies} from '@/redux/companySlice'
import { COMPANY_API_END_POINT} from '@/utils/constant'
import axios from 'axios'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { toast } from 'sonner'

const useGetAllCompanies = () => {
    const dispatch = useDispatch();
    useEffect(()=>{
        const controller = new AbortController();
        const fetchCompanies = async () => {
            try {
                const res = await axios.get(`${COMPANY_API_END_POINT}/get`, { withCredentials: true, signal: controller.signal });
                if(res.data.success){
                    dispatch(setCompanies(res.data.companies));
                } else {
                    toast.error(res.data.message || "Unable to load companies.");
                }
            } catch (error) {
                if (!axios.isCancel(error)) {
                    toast.error(error.response?.data?.message || "Unable to load companies.");
                }
            }
        }
        fetchCompanies();
        return () => controller.abort();
    },[dispatch])
}

export default useGetAllCompanies
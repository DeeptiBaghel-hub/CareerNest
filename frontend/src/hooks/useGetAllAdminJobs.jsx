import { setAllAdminJobs } from '@/redux/jobSlice'
import { JOB_API_END_POINT } from '@/utils/constant'
import axios from 'axios'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { toast } from 'sonner'

const useGetAllAdminJobs = () => {
    const dispatch = useDispatch();
    useEffect(()=>{
        const controller = new AbortController();
        const fetchAllAdminJobs = async () => {
            try {
                const res = await axios.get(`${JOB_API_END_POINT}/getAdminJobs`, { withCredentials: true, signal: controller.signal });
                if(res.data.success){
                    dispatch(setAllAdminJobs(res.data.jobs));
                } else {
                    toast.error(res.data.message || "Unable to load your job listings.");
                }
            } catch (error) {
                if (!axios.isCancel(error)) {
                    toast.error(error.response?.data?.message || "Unable to load your job listings.");
                }
            }
        }
        fetchAllAdminJobs();
        return () => controller.abort();
    },[dispatch])
}

export default useGetAllAdminJobs
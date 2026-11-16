import { setAllJobs } from '@/redux/jobSlice'
import { JOB_API_END_POINT } from '@/utils/constant'
import axios from 'axios'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'sonner'

const useGetAllJobs = () => {
    const dispatch = useDispatch();
    const {searchedQuery} = useSelector(store=>store.job);
    useEffect(()=>{
        const controller = new AbortController();
        const fetchAllJobs = async () => {
            try {
                const res = await axios.get(`${JOB_API_END_POINT}/get`, { params: { keyword: searchedQuery }, withCredentials: true, signal: controller.signal });
                if(res.data.success){
                    dispatch(setAllJobs(res.data.jobs));
                } else {
                    toast.error(res.data.message || "Unable to load jobs.");
                }
            } catch (error) {
                if (!axios.isCancel(error)) {
                    toast.error(error.response?.data?.message || "Unable to load jobs.");
                }
            }
        }
        fetchAllJobs();
        return () => controller.abort();
    },[searchedQuery, dispatch])
}

export default useGetAllJobs

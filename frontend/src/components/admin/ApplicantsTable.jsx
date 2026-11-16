import { useMemo, useState } from 'react'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Check, Loader2, MoreHorizontal, Search, X } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';
import { APPLICATION_API_END_POINT } from '@/utils/constant';
import { setAllApplicants } from '@/redux/applicationSlice';
import { filterApplications } from '@/utils/applicantUtils';
import axios from 'axios';

const statusOptions = [
    { value: 'all', label: 'All' },
    { value: 'pending', label: 'Pending' },
    { value: 'accepted', label: 'Accepted' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'withdrawn', label: 'Withdrawn' },
];

const statusStyles = {
    pending: 'bg-amber-500/10 text-amber-700 dark:text-amber-300',
    accepted: 'bg-primary/10 text-primary',
    rejected: 'bg-destructive/10 text-destructive',
    withdrawn: 'bg-muted text-muted-foreground',
};

const EMPTY_APPLICATIONS = [];

const ApplicantsTable = () => {
    const { applicants } = useSelector(store => store.application);
    const dispatch = useDispatch();
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [updatingId, setUpdatingId] = useState(null);
    const [openPopoverId, setOpenPopoverId] = useState(null);
    const applications = applicants?.applications || EMPTY_APPLICATIONS;
    const visibleApplications = useMemo(
        () => filterApplications(applications, search, statusFilter),
        [applications, search, statusFilter]
    );
    const statusCounts = useMemo(() => applications.reduce((counts, application) => {
        const status = String(application?.status || 'pending').toLowerCase();
        counts[status] = (counts[status] || 0) + 1;
        return counts;
    }, { pending: 0, accepted: 0, rejected: 0, withdrawn: 0 }), [applications]);

    const statusHandler = async (status, id) => {
        try {
            setUpdatingId(id);
            const res = await axios.post(
                `${APPLICATION_API_END_POINT}/status/${id}/update`,
                { status },
                { withCredentials: true }
            );
            if (res.data.success) {
                dispatch(setAllApplicants({
                    ...applicants,
                    applications: applications.map(application =>
                        application._id === id
                            ? { ...application, status: status.toLowerCase() }
                            : application
                    )
                }));
                toast.success(res.data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Something went wrong while updating the status.");
        } finally {
            setUpdatingId(null);
        }
    };

    return (
        <section className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5">
            <div className="mb-5 flex flex-col gap-4">
                <div className="relative w-full sm:max-w-sm">
                    <Search aria-hidden="true" className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        type="search"
                        aria-label="Search applicants"
                        placeholder="Search name, email, or phone"
                        value={search}
                        onChange={event => setSearch(event.target.value)}
                        className="h-11 rounded-xl pl-9"
                    />
                </div>
                <div role="group" aria-label="Filter applicants by status" className="flex flex-wrap gap-2">
                    {statusOptions.map(option => {
                        const count = option.value === 'all'
                            ? applications.length
                            : statusCounts[option.value] || 0;
                        return (
                            <Button
                                key={option.value}
                                type="button"
                                variant={statusFilter === option.value ? 'secondary' : 'outline'}
                                aria-pressed={statusFilter === option.value}
                                onClick={() => setStatusFilter(option.value)}
                                className="rounded-full"
                            >
                                {option.label}<span className="ml-2 text-xs opacity-70">{count}</span>
                            </Button>
                        );
                    })}
                    <span className="ml-auto self-center text-sm text-muted-foreground">
                        Showing {visibleApplications.length} of {applications.length}
                    </span>
                </div>
            </div>

            <Table>
                <TableCaption>Applicants for {applicants?.title || 'this job listing'}.</TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead>Candidate</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Resume</TableHead>
                        <TableHead>Applied</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {visibleApplications.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={6} className="py-12 text-center">
                                <p className="font-medium">
                                    {applications.length === 0
                                        ? "No applications yet."
                                        : "No applicants match these filters."}
                                </p>
                                {applications.length > 0 && (search || statusFilter !== 'all') && (
                                    <Button
                                        type="button"
                                        variant="link"
                                        className="mt-2"
                                        onClick={() => {
                                            setSearch('');
                                            setStatusFilter('all');
                                        }}
                                    >
                                        Clear search and filters
                                    </Button>
                                )}
                            </TableCell>
                        </TableRow>
                    ) : visibleApplications.map(application => {
                        const status = String(application?.status || 'pending').toLowerCase();
                        const applicantName = application?.applicant?.fullname || 'Applicant unavailable';
                        const isUpdating = updatingId === application?._id;
                        return (
                            <TableRow key={application._id}>
                                <TableCell>
                                    <div className="font-medium">{applicantName}</div>
                                    <div className="text-xs text-muted-foreground">{application?.applicant?.email || 'No email available'}</div>
                                </TableCell>
                                <TableCell>{application?.applicant?.phoneNumber || '—'}</TableCell>
                                <TableCell>
                                    {application?.applicant?.profile?.resume
                                        ? <a
                                            className="text-primary hover:underline"
                                            href={application.applicant.profile.resume}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >{application.applicant.profile.resumeOriginalName || 'View resume'}</a>
                                        : <span className="text-muted-foreground">Not provided</span>}
                                </TableCell>
                                <TableCell>
                                    {application?.createdAt && !Number.isNaN(Date.parse(application.createdAt))
                                        ? new Date(application.createdAt).toLocaleDateString('en-IN')
                                        : '—'}
                                </TableCell>
                                <TableCell>
                                    <Badge variant="secondary" className={`capitalize ${statusStyles[status] || 'bg-muted text-muted-foreground'}`}>
                                        {status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    {status !== 'withdrawn' && (
                                        <Popover
                                            open={openPopoverId === application._id}
                                            onOpenChange={open => setOpenPopoverId(open ? application._id : null)}
                                        >
                                            <PopoverTrigger render={<Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                aria-label={`Actions for ${applicantName}`}
                                                disabled={Boolean(updatingId)}
                                            />}>
                                                {isUpdating ? <Loader2 className="size-4 animate-spin" /> : <MoreHorizontal className="size-4" />}
                                            </PopoverTrigger>
                                            <PopoverContent align="end" className="w-44 max-w-[calc(100vw-2rem)]">
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    disabled={Boolean(updatingId)}
                                                    onClick={() => {
                                                        setOpenPopoverId(null);
                                                        statusHandler('Accepted', application._id);
                                                    }}
                                                    className="w-full justify-start"
                                                ><Check className="mr-2 size-4 text-primary" />Mark accepted</Button>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    disabled={Boolean(updatingId)}
                                                    onClick={() => {
                                                        setOpenPopoverId(null);
                                                        statusHandler('Rejected', application._id);
                                                    }}
                                                    className="w-full justify-start"
                                                ><X className="mr-2 size-4 text-destructive" />Mark rejected</Button>
                                            </PopoverContent>
                                        </Popover>
                                    )}
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </section>
    );
};

export default ApplicantsTable;

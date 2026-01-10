import React, { useState, useMemo } from 'react';
import { TabScreenWrapper } from '@/components/navigation/TabScreenWrapper';
import { JobHeader, JobTabs, JobList } from '@/components/jobs';
import { useGetJobs, useGetMyPosts } from '@/hooks/useJobApi';
import { useAuthStore } from '@/stores/authStore';

export default function JobsScreen() {
    const { user } = useAuthStore();
    const [search, setSearch] = useState('');
    const [jobTab, setJobTab] = useState<'others' | 'mine'>('others');

    // Fetch all jobs
    const {
        data: allJobsData,
        isLoading: allJobsLoading,
        error: allJobsError,
        refetch: refetchAllJobs,
    } = useGetJobs({
        page: 0,
        pageSize: 20,
        search,
    });

    // Fetch user's jobs
    const {
        data: myJobsData,
        isLoading: myJobsLoading,
        error: myJobsError,
        refetch: refetchMyJobs,
    } = useGetMyPosts({
        page: 1,
        pageSize: 20,
    });

    const currentUserId = user?.id;

    // Compute display jobs based on active tab
    const { displayJobs, isLoading, error, refetch } = useMemo(() => {
        const jobs =
            jobTab === 'mine'
                ? myJobsData?.posts || []
                : (allJobsData?.posts || []).filter((job: any) =>
                    currentUserId
                        ? String(job.creator_id).trim() !== String(currentUserId).trim()
                        : true,
                );

        return {
            displayJobs: jobs,
            isLoading: jobTab === 'mine' ? myJobsLoading : allJobsLoading,
            error: jobTab === 'mine' ? myJobsError : allJobsError,
            refetch: jobTab === 'mine' ? refetchMyJobs : refetchAllJobs,
        };
    }, [
        jobTab,
        myJobsData,
        allJobsData,
        currentUserId,
        myJobsLoading,
        allJobsLoading,
        myJobsError,
        allJobsError,
        refetchMyJobs,
        refetchAllJobs,
    ]);

    // Add ownership info to jobs
    const jobsWithOwnership = displayJobs.map((job: any) => ({
        ...job,
        isOwned: currentUserId
            ? String(job.creator_id).trim() === String(currentUserId).trim()
            : false,
    }));

    return (
        <TabScreenWrapper
            scrollViewProps={{
                contentContainerStyle: { paddingTop: 8, paddingBottom: 20, gap: 20 },
            }}
        >
            <JobHeader />
            <JobTabs activeTab={jobTab} onTabChange={setJobTab} />
            <JobList
                jobs={jobsWithOwnership}
                isLoading={isLoading}
                error={error}
                onRetry={refetch}
                search={search}
                onSearchChange={setSearch}
            />
        </TabScreenWrapper>
    );
}

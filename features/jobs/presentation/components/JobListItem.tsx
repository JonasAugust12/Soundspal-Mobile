import React from 'react';
import { View } from 'react-native';
import { Job } from '@/features/jobs/domain/entities/job.type';
import { JobCardFull } from './JobCardFull';

type JobListItemProps = {
    item: Job & { isOwned?: boolean };
};

export const JobListItem = React.memo(
    function JobListItem({ item }: JobListItemProps) {
        return (
            <View className="w-[90%] self-center">
                <JobCardFull job={item} isOwned={item.isOwned} />
            </View>
        );
    },
    (prev, next) =>
        prev.item.id === next.item.id &&
        prev.item.isOwned === next.item.isOwned &&
        prev.item.status === next.item.status &&
        prev.item.updated_at === next.item.updated_at,
);

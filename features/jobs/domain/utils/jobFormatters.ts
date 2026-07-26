/**
 * Format budget range for display
 */
export const formatBudget = (min: number, max: number, currency: string): string => {
    const formatNumber = (num: number) => {
        if (currency === 'VND') {
            return num >= 1000000 ? `${num / 1000000} triệu` : `${num / 1000}k`;
        }
        return num.toString();
    };

    if (min && max) {
        return `${formatNumber(min)}-${formatNumber(max)} ${currency}/buổi`;
    }
    if (min) return `Từ ${formatNumber(min)} ${currency}/buổi`;
    if (max) return `Đến ${formatNumber(max)} ${currency}/buổi`;
    return 'Thỏa thuận';
};

/**
 * Format date to Vietnamese locale (dd-MM-yyyy format)
 */
export const formatDate = (dateStr: string): string => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
};

/**
 * Format relative time (e.g., "2 ngày trước")
 */
export const formatDaysAgo = (dateStr: string): string => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Hôm nay';
    if (diffDays === 1) return 'Hôm qua';
    if (diffDays < 7) return `${diffDays} ngày trước`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} tuần trước`;
    return `${Math.floor(diffDays / 30)} tháng trước`;
};

/**
 * Format post status to Vietnamese display name
 */
export const formatPostStatus = (status: string): string => {
    const statusMap: Record<string, string> = {
        draft: 'Bản nháp',
        published: 'Đang tuyển',
        closed: 'Đã đóng',
        completed: 'Hoàn thành',
        cancelled: 'Đã hủy',
    };
    return statusMap[status?.toLowerCase()] || status || 'N/A';
};

/**
 * Format post visibility to Vietnamese display name
 */
export const formatPostVisibility = (visibility: string): string => {
    const visibilityMap: Record<string, string> = {
        public: 'Công khai',
        private: 'Riêng tư',
        invite_only: 'Chỉ mời',
    };
    return visibilityMap[visibility?.toLowerCase()] || visibility || 'N/A';
};

export const isJobAcceptingApplications = (status: string): boolean => status === 'published';

export const canReopenJob = (status: string): boolean => status === 'closed';

export function getJobPublishBlockReason(job: {
    title?: string;
    description?: string;
    post_type?: string;
    brief_description?: string;
}): string | null {
    if (!job.title?.trim() || job.title.trim().length < 5) {
        return 'Tiêu đề phải có ít nhất 5 ký tự';
    }
    if (!job.description?.trim() || job.description.trim().length < 20) {
        return 'Mô tả chi tiết phải có ít nhất 20 ký tự';
    }
    if (!job.brief_description?.trim()) {
        return 'Mô tả ngắn không được để trống';
    }
    if (!['job_offer', 'gig', 'availability'].includes(job.post_type ?? '')) {
        return 'Loại bài đăng không hợp lệ';
    }
    return null;
}

/**
 * Format job type to Vietnamese display name
 */
export const formatJobType = (type: string): string => {
    const typeMap: { [key: string]: string } = {
        venue: 'Nhà tuyển dụng',
        producer: 'Nhà sản xuất',
        singer: 'Ca sĩ',
        musician: 'Nhạc công',
        dj: 'DJ',
        band: 'Ban nhạc',
    };
    return typeMap[type?.toLowerCase()] || type || 'N/A';
};

/**
 * Format recruitment type to Vietnamese display name
 */
export const formatRecruitmentType = (type: string): string => {
    const typeMap: { [key: string]: string } = {
        full_time: 'Toàn thời gian',
        part_time: 'Bán thời gian',
        contract: 'Hợp đồng',
        one_time: 'Một lần',
    };
    return typeMap[type?.toLowerCase()] || type || 'N/A';
};

/**
 * Format experience level to Vietnamese display name
 */
export const formatExperienceLevel = (level: string): string => {
    const levelMap: { [key: string]: string } = {
        beginner: 'Mới bắt đầu',
        intermediate: 'Trung cấp',
        expert: 'Chuyên gia',
        any: 'Mọi cấp độ',
    };
    return levelMap[level?.toLowerCase()] || '';
};

/**
 * Format location type to Vietnamese display name
 */
export const formatLocationType = (type: string): string => {
    const typeMap: { [key: string]: string } = {
        remote: 'Làm việc từ xa',
        onsite: 'Tại địa điểm',
        hybrid: 'Kết hợp',
    };
    return typeMap[type?.toLowerCase()] || type || 'N/A';
};

/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    formatBudget,
    formatDate,
    formatDaysAgo,
    formatJobType,
    formatRecruitmentType,
    formatLocationType,
} from '@/features/jobs/domain/utils/jobFormatters';

describe('jobFormatters', () => {
    describe('formatBudget', () => {
        it('should format VND budget with triệu for values >= 1M', () => {
            expect(formatBudget(1000000, 2000000, 'VND')).toBe('1 triệu-2 triệu VND/buổi');
            expect(formatBudget(5000000, 10000000, 'VND')).toBe('5 triệu-10 triệu VND/buổi');
        });

        it('should format VND budget with k for values < 1M', () => {
            expect(formatBudget(500000, 800000, 'VND')).toBe('500k-800k VND/buổi');
            expect(formatBudget(100000, 999000, 'VND')).toBe('100k-999k VND/buổi');
        });

        it('should format budget with min only', () => {
            expect(formatBudget(1000000, 0, 'VND')).toBe('Từ 1 triệu VND/buổi');
            expect(formatBudget(500000, 0, 'VND')).toBe('Từ 500k VND/buổi');
        });

        it('should format budget with max only', () => {
            expect(formatBudget(0, 2000000, 'VND')).toBe('Đến 2 triệu VND/buổi');
            expect(formatBudget(0, 800000, 'VND')).toBe('Đến 800k VND/buổi');
        });

        it('should return "Thỏa thuận" when no min or max', () => {
            expect(formatBudget(0, 0, 'VND')).toBe('Thỏa thuận');
        });

        it('should format non-VND currency as-is', () => {
            expect(formatBudget(100, 200, 'USD')).toBe('100-200 USD/buổi');
            expect(formatBudget(50, 0, 'EUR')).toBe('Từ 50 EUR/buổi');
        });
    });

    describe('formatDate', () => {
        it('should format date to dd-MM-yyyy format', () => {
            expect(formatDate('2024-01-15')).toBe('15-01-2024');
            expect(formatDate('2024-12-31')).toBe('31-12-2024');
        });

        it('should pad single digit day and month with zero', () => {
            expect(formatDate('2024-03-05')).toBe('05-03-2024');
            expect(formatDate('2024-09-01')).toBe('01-09-2024');
        });

        it('should handle ISO datetime strings', () => {
            expect(formatDate('2024-06-24T10:30:00Z')).toBe('24-06-2024');
            expect(formatDate('2024-06-24T10:30:00.000Z')).toBe('24-06-2024');
        });

        it('should return "N/A" for empty or invalid dates', () => {
            expect(formatDate('')).toBe('N/A');
            expect(formatDate('invalid-date')).toBe('NaN-NaN-NaN');
        });
    });

    describe('formatDaysAgo', () => {
        beforeEach(() => {
            // Mock current date to 2024-06-24
            jest.useFakeTimers();
            jest.setSystemTime(new Date('2024-06-24T00:00:00Z'));
        });

        afterEach(() => {
            jest.useRealTimers();
        });

        it('should return "Hôm nay" for today', () => {
            expect(formatDaysAgo('2024-06-24')).toBe('Hôm nay');
        });

        it('should return "Hôm qua" for yesterday', () => {
            expect(formatDaysAgo('2024-06-23')).toBe('Hôm qua');
        });

        it('should return days ago for < 7 days', () => {
            expect(formatDaysAgo('2024-06-20')).toBe('4 ngày trước');
            expect(formatDaysAgo('2024-06-18')).toBe('6 ngày trước');
        });

        it('should return weeks ago for >= 7 days and < 30 days', () => {
            expect(formatDaysAgo('2024-06-10')).toBe('2 tuần trước');
            expect(formatDaysAgo('2024-06-01')).toBe('3 tuần trước');
        });

        it('should return months ago for >= 30 days', () => {
            expect(formatDaysAgo('2024-05-24')).toBe('1 tháng trước');
            expect(formatDaysAgo('2024-03-24')).toBe('3 tháng trước');
        });

        it('should return "N/A" for empty date', () => {
            expect(formatDaysAgo('')).toBe('N/A');
        });
    });

    describe('formatJobType', () => {
        it('should format known job types', () => {
            expect(formatJobType('venue')).toBe('Nhà tuyển dụng');
            expect(formatJobType('producer')).toBe('Nhà sản xuất');
            expect(formatJobType('singer')).toBe('Ca sĩ');
            expect(formatJobType('musician')).toBe('Nhạc công');
            expect(formatJobType('dj')).toBe('DJ');
            expect(formatJobType('band')).toBe('Ban nhạc');
        });

        it('should handle case-insensitive input', () => {
            expect(formatJobType('VENUE')).toBe('Nhà tuyển dụng');
            expect(formatJobType('Singer')).toBe('Ca sĩ');
            expect(formatJobType('DJ')).toBe('DJ');
        });

        it('should return original value for unknown types', () => {
            expect(formatJobType('unknown')).toBe('unknown');
            expect(formatJobType('custom-type')).toBe('custom-type');
        });

        it('should return "N/A" for empty or null input', () => {
            expect(formatJobType('')).toBe('N/A');
            expect(formatJobType(null as any)).toBe('N/A');
            expect(formatJobType(undefined as any)).toBe('N/A');
        });
    });

    describe('formatRecruitmentType', () => {
        it('should format known recruitment types', () => {
            expect(formatRecruitmentType('full_time')).toBe('Toàn thời gian');
            expect(formatRecruitmentType('part_time')).toBe('Bán thời gian');
            expect(formatRecruitmentType('contract')).toBe('Hợp đồng');
            expect(formatRecruitmentType('one_time')).toBe('Một lần');
        });

        it('should handle case-insensitive input', () => {
            expect(formatRecruitmentType('FULL_TIME')).toBe('Toàn thời gian');
            expect(formatRecruitmentType('Part_Time')).toBe('Bán thời gian');
        });

        it('should return original value for unknown types', () => {
            expect(formatRecruitmentType('unknown')).toBe('unknown');
        });

        it('should return "N/A" for empty or null input', () => {
            expect(formatRecruitmentType('')).toBe('N/A');
            expect(formatRecruitmentType(null as any)).toBe('N/A');
        });
    });

    describe('formatLocationType', () => {
        it('should format known location types', () => {
            expect(formatLocationType('remote')).toBe('Làm việc từ xa');
            expect(formatLocationType('onsite')).toBe('Tại địa điểm');
            expect(formatLocationType('hybrid')).toBe('Kết hợp');
        });

        it('should handle case-insensitive input', () => {
            expect(formatLocationType('REMOTE')).toBe('Làm việc từ xa');
            expect(formatLocationType('Onsite')).toBe('Tại địa điểm');
        });

        it('should return original value for unknown types', () => {
            expect(formatLocationType('unknown')).toBe('unknown');
        });

        it('should return "N/A" for empty or null input', () => {
            expect(formatLocationType('')).toBe('N/A');
            expect(formatLocationType(null as any)).toBe('N/A');
        });
    });
});

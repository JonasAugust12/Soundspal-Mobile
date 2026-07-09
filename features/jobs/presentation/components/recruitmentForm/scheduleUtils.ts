import { Moon, Sun, Sunset } from 'lucide-react-native';
import type { TagChipOption } from './TagChipPicker';

export const WEEKDAY_OPTIONS = [
    { value: 'T2', label: 'T2' },
    { value: 'T3', label: 'T3' },
    { value: 'T4', label: 'T4' },
    { value: 'T5', label: 'T5' },
    { value: 'T6', label: 'T6' },
    { value: 'T7', label: 'T7' },
    { value: 'CN', label: 'CN' },
] as const;

export const WORK_PERIOD_OPTIONS: TagChipOption[] = [
    { value: 'Sáng', label: 'Sáng', Icon: Sun },
    { value: 'Chiều', label: 'Chiều', Icon: Sunset },
    { value: 'Tối', label: 'Tối', Icon: Moon },
];

export interface WorkTimeDraft {
    days: string[];
    period?: string;
    startHour: number;
    startMinute: number;
    endHour: number;
    endMinute: number;
}

export const DEFAULT_WORK_TIME_DRAFT: WorkTimeDraft = {
    days: ['T6', 'T7'],
    period: 'Tối',
    startHour: 19,
    startMinute: 30,
    endHour: 21,
    endMinute: 30,
};

function padTimePart(value: number): string {
    return String(value).padStart(2, '0');
}

export function formatTimeParts(hour: number, minute: number): string {
    return `${padTimePart(hour)}:${padTimePart(minute)}`;
}

export function formatWorkTimeString(draft: WorkTimeDraft): string {
    if (draft.days.length === 0) {
        return '';
    }

    const daysStr = draft.days.join(', ');
    const periodPrefix = draft.period ? `${draft.period} ` : '';
    const start = formatTimeParts(draft.startHour, draft.startMinute);
    const end = formatTimeParts(draft.endHour, draft.endMinute);

    return `${periodPrefix}${daysStr} (${start} - ${end})`;
}

export function parseWorkTimeString(value?: string): WorkTimeDraft {
    if (!value?.trim()) {
        return { ...DEFAULT_WORK_TIME_DRAFT, days: [] };
    }

    const match = value
        .trim()
        .match(/^(?:(Sáng|Chiều|Tối)\s+)?(.+?)\s+\((\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})\)$/);
    if (!match) {
        return { ...DEFAULT_WORK_TIME_DRAFT, days: [] };
    }

    const [, period, daysPart, startHour, startMinute, endHour, endMinute] = match;
    const days = daysPart
        .split(',')
        .map((day) => day.trim())
        .filter(Boolean);

    return {
        days,
        period: period || undefined,
        startHour: Number(startHour),
        startMinute: Number(startMinute),
        endHour: Number(endHour),
        endMinute: Number(endMinute),
    };
}

export function formatDeadlineDate(date: Date): string {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
}

export function parseDeadlineDate(value?: string): Date | null {
    if (!value?.trim()) {
        return null;
    }

    const parts = value.split('-').map((part) => Number(part));
    if (parts.length !== 3 || parts.some((part) => Number.isNaN(part))) {
        return null;
    }

    const [day, month, year] = parts;
    const date = new Date(year, month - 1, day);
    if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
        return null;
    }

    return date;
}

export function createTimeDate(hour: number, minute: number): Date {
    const date = new Date();
    date.setHours(hour, minute, 0, 0);
    return date;
}

export function readTimeParts(date: Date): { hour: number; minute: number } {
    return {
        hour: date.getHours(),
        minute: date.getMinutes(),
    };
}

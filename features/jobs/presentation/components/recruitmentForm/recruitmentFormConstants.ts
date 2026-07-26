import type { LucideIcon } from 'lucide-react-native';
import {
    Award,
    Briefcase,
    Calendar,
    Clock,
    FileText,
    Folder,
    Globe,
    Guitar,
    Headphones,
    Landmark,
    Layers,
    Lock,
    MapPin,
    Mic,
    CircleOff,
    Music2,
    Sparkles,
    TrendingUp,
    UserPlus,
    Wifi,
    Zap,
} from 'lucide-react-native';
import type { TagChipOption } from './TagChipPicker';

export const JOB_TYPE_OPTIONS = [
    { value: 'venue', label: 'Nhà tuyển dụng', Icon: Landmark },
    { value: 'producer', label: 'Nhà sản xuất', Icon: Headphones },
    { value: 'singer', label: 'Ca sĩ', Icon: Mic },
] as const;

export const RECRUITMENT_TYPE_OPTIONS: TagChipOption[] = [
    { value: 'full_time', label: 'Toàn thời gian', Icon: Briefcase },
    { value: 'part_time', label: 'Bán thời gian', Icon: Clock },
    { value: 'contract', label: 'Hợp đồng', Icon: FileText },
    { value: 'one_time', label: 'Một lần', Icon: Zap },
];

export const LOCATION_TYPE_OPTIONS: TagChipOption[] = [
    { value: 'remote', label: 'Từ xa', Icon: Wifi },
    { value: 'onsite', label: 'Tại địa điểm', Icon: MapPin },
    { value: 'hybrid', label: 'Kết hợp', Icon: Layers },
];

export const PAYMENT_TYPE_OPTIONS: TagChipOption[] = [
    { value: 'bySession', label: 'Theo buổi', Icon: Calendar },
    { value: 'byHour', label: 'Theo giờ', Icon: Clock },
    { value: 'byProject', label: 'Theo dự án', Icon: Folder },
    { value: 'byMonth', label: 'Theo tháng', Icon: Calendar },
];

export const EXPERIENCE_LEVEL_OPTIONS: TagChipOption[] = [
    { value: 'beginner', label: 'Mới bắt đầu', Icon: Sparkles },
    { value: 'intermediate', label: 'Trung cấp', Icon: TrendingUp },
    { value: 'expert', label: 'Chuyên gia', Icon: Award },
    { value: 'any', label: 'Không yêu cầu', Icon: CircleOff },
];

export const POPULAR_GENRE_OPTIONS: TagChipOption[] = [
    { value: 'Pop', label: 'Pop', Icon: Music2 },
    { value: 'Rock', label: 'Rock', Icon: Guitar },
    { value: 'Jazz', label: 'Jazz', Icon: Music2 },
    { value: 'EDM', label: 'EDM', Icon: Music2 },
    { value: 'R&B', label: 'R&B', Icon: Music2 },
    { value: 'Hip Hop', label: 'Hip Hop', Icon: Music2 },
    { value: 'Ballad', label: 'Ballad', Icon: Music2 },
    { value: 'Acoustic', label: 'Acoustic', Icon: Guitar },
    { value: 'K-Pop', label: 'K-Pop', Icon: Music2 },
    { value: 'Bolero', label: 'Bolero', Icon: Music2 },
    { value: 'Nhạc trẻ', label: 'Nhạc trẻ', Icon: Music2 },
    { value: 'Nhạc vàng', label: 'Nhạc vàng', Icon: Music2 },
];

export const VISIBILITY_OPTIONS: TagChipOption[] = [
    { value: 'public', label: 'Công khai', Icon: Globe },
    { value: 'private', label: 'Riêng tư', Icon: Lock },
    { value: 'invite_only', label: 'Chỉ mời', Icon: UserPlus },
];

export type JobTypeValue = (typeof JOB_TYPE_OPTIONS)[number]['value'];
export type SegmentedOption = { value: string; label: string; Icon?: LucideIcon };

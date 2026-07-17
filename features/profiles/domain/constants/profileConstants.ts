// Đồng bộ với web (src/lib/profile-constants.ts)

export const SERVICE_TYPES = [
    { value: 'live_performance', label: 'Biểu diễn Live' },
    { value: 'wedding', label: 'Đám cưới / Sự kiện gia đình' },
    { value: 'corporate_event', label: 'Sự kiện doanh nghiệp' },
    { value: 'private_event', label: 'Sự kiện tư nhân / Tiệc' },
    { value: 'cafe_restaurant', label: 'Café / Nhà hàng' },
    { value: 'recording', label: 'Thu âm / Session' },
    { value: 'teaching', label: 'Dạy nhạc' },
    { value: 'dj_set', label: 'DJ Set' },
    { value: 'songwriting', label: 'Sáng tác / Viết lời' },
    { value: 'music_production', label: 'Sản xuất âm nhạc' },
] as const;

export type ServiceTypeValue = (typeof SERVICE_TYPES)[number]['value'];

export const serviceTypeLabel = (value: string): string =>
    SERVICE_TYPES.find((s) => s.value === value)?.label ?? value;

export const FEE_TIERS = [
    { value: 0, label: 'Dưới 1 triệu' },
    { value: 1_000_000, label: '1 – 2 triệu' },
    { value: 2_000_000, label: '2 – 5 triệu' },
    { value: 5_000_000, label: '5 – 10 triệu' },
    { value: 10_000_000, label: 'Trên 10 triệu' },
    { value: -1, label: 'Thương lượng' },
] as const;

export const feeLabel = (value: number | null | undefined): string => {
    if (value == null) return '';
    return FEE_TIERS.find((t) => t.value === value)?.label ?? '';
};

/**
 * Nhãn khoảng giá gọn: gộp fee_min/fee_max thành một chuỗi.
 * Bám theo feeRangeLabel bên web.
 */
export const feeRangeLabel = (
    min: number | null | undefined,
    max: number | null | undefined,
): string => {
    if (min == null && max == null) return '';
    const effectiveMin = min ?? (max as number);
    const effectiveMax = max ?? (min as number);

    if (effectiveMin === -1 || effectiveMax === -1) return 'Thương lượng';

    const toM = (n: number): string => {
        if (n === 0) return '0';
        if (n >= 1_000_000) {
            const m = n / 1_000_000;
            return Number.isInteger(m) ? `${m}` : `${m.toFixed(1)}`;
        }
        return `${n / 1000}k`;
    };

    if (effectiveMin === effectiveMax) return `${toM(effectiveMin)} triệu`;
    if (effectiveMax < 1_000_000) return `${toM(effectiveMin)} – ${toM(effectiveMax)}k`;
    return `${toM(effectiveMin)} – ${toM(effectiveMax)} triệu`;
};

export const VN_PROVINCES = [
    { iso: 'SG', name: 'Hồ Chí Minh' },
    { iso: 'HN', name: 'Hà Nội' },
    { iso: 'DN', name: 'Đà Nẵng' },
    { iso: 'BD', name: 'Bình Dương' },
    { iso: 'DNG', name: 'Đồng Nai' },
    { iso: 'CT', name: 'Cần Thơ' },
    { iso: 'HP', name: 'Hải Phòng' },
    { iso: 'BH', name: 'Bình Thuận' },
] as const;

export type ProvinceIso = (typeof VN_PROVINCES)[number]['iso'];

export const provinceNameByIso = (iso?: string | null): string =>
    VN_PROVINCES.find((p) => p.iso === iso)?.name ?? '';

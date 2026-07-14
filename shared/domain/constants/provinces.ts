// Tỉnh/thành phổ biến — đồng bộ với web `profile-constants.ts` (gửi lên backend qua `stateProvince`).
export const provinces = [
    { iso: 'SG', name: 'Hồ Chí Minh' },
    { iso: 'HN', name: 'Hà Nội' },
    { iso: 'DN', name: 'Đà Nẵng' },
    { iso: 'BD', name: 'Bình Dương' },
    { iso: 'DNG', name: 'Đồng Nai' },
    { iso: 'CT', name: 'Cần Thơ' },
    { iso: 'HP', name: 'Hải Phòng' },
    { iso: 'BH', name: 'Bình Thuận' },
] as const;

export type ProvinceIso = (typeof provinces)[number]['iso'];

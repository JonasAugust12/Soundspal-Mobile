// Loại dịch vụ của nghệ sĩ (singer/producer) — đồng bộ với web `profile-constants.ts`.
export const serviceTypes = [
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

export type ServiceType = (typeof serviceTypes)[number]['value'];

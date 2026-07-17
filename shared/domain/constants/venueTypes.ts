// Loại hình địa điểm (venue) — đồng bộ với web `profile-constants.ts`.
export const venueTypes = [
    { value: 'cafe', label: 'Café' },
    { value: 'bar', label: 'Bar / Pub' },
    { value: 'restaurant', label: 'Nhà hàng' },
    { value: 'rooftop', label: 'Rooftop' },
    { value: 'wedding_hall', label: 'Nhà tiệc / Wedding Hall' },
    { value: 'outdoor_stage', label: 'Sân khấu ngoài trời' },
    { value: 'studio', label: 'Studio' },
    { value: 'hotel', label: 'Khách sạn' },
    { value: 'event_center', label: 'Trung tâm sự kiện' },
    { value: 'other', label: 'Khác' },
] as const;

export type VenueType = (typeof venueTypes)[number]['value'];

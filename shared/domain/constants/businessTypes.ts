export const businessTypes = [
    { label: 'Phòng trà', value: 'tea_room' },
    { label: 'Quán cà phê', value: 'cafe' },
    { label: 'Bar / Club', value: 'bar_club' },
    { label: 'Nhà hàng', value: 'restaurant' },
    { label: 'Sân khấu ngoài trời', value: 'outdoor_stage' },
    { label: 'Nhà hát', value: 'theater' },
    { label: 'Trung tâm sự kiện', value: 'event_center' },
] as const;

export type BusinessType = (typeof businessTypes)[number]['value'];

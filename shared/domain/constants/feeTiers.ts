// Mốc thù lao (VND) cho bộ lọc khoảng giá của nghệ sĩ — đồng bộ với web `profile-constants.ts`.
// `feeMin` dùng mốc cận dưới, `feeMax` dùng mốc cận trên (khớp UI dropdown bên web).
export const FEE_MIN_OPTIONS = [
    { value: 500_000, label: '500k' },
    { value: 1_000_000, label: '1 triệu' },
    { value: 2_000_000, label: '2 triệu' },
    { value: 5_000_000, label: '5 triệu' },
    { value: 10_000_000, label: '10 triệu' },
] as const;

export const FEE_MAX_OPTIONS = [
    { value: 1_000_000, label: '1 triệu' },
    { value: 2_000_000, label: '2 triệu' },
    { value: 5_000_000, label: '5 triệu' },
    { value: 10_000_000, label: '10 triệu' },
    { value: 20_000_000, label: '20 triệu' },
] as const;

/** Nhãn khoảng thù lao gọn: 2_000_000 + 5_000_000 → "2 – 5 triệu". */
export function feeRangeLabel(
    min: number | null | undefined,
    max: number | null | undefined,
): string {
    if (min == null && max == null) return '';
    const effectiveMin = min ?? max!;
    const effectiveMax = max ?? min!;

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
}

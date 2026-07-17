import type { UserRole } from '@/features/explore/domain/entities/search.type';

/**
 * Ảnh bìa mặc định cho các thẻ ở màn Khám phá, dùng khi user chưa upload cover.
 * Toàn bộ ảnh lấy từ Unsplash, chủ đề nghệ thuật - âm nhạc, đã kiểm tra trả về 200.
 *
 * Ảnh phủ toàn bộ thẻ (phần dưới nằm sau lớp kính mờ) nên crop theo tỉ lệ thẻ ~1.54:1,
 * không phải tỉ lệ banner. `h=520&fit=crop` là bắt buộc vì một vài ảnh gốc ở dạng dọc.
 */
const COVER_QUERY = 'w=800&h=520&fit=crop&q=80&auto=format';

const unsplash = (photoId: string): string =>
    `https://images.unsplash.com/photo-${photoId}?${COVER_QUERY}`;

/** Ca sĩ: sân khấu, micro, phím đàn. */
const SINGER_COVERS: string[] = [
    unsplash('1493225457124-a3eb161ffa5f'), // Nghệ sĩ giơ tay trên sân khấu mờ khói
    unsplash('1511671782779-c97d3d27a1d4'), // Micro cổ điển trên nền bokeh đỏ
    unsplash('1485579149621-3123dd979885'), // Micro cổ điển tone tím
    unsplash('1516280440614-37939bbacd81'), // Cận cảnh micro trên nền tối
    unsplash('1571974599782-87624638275e'), // Phím piano với bokeh vàng
];

/** Producer: bàn mix, máy móc phòng thu, nhạc cụ. */
const PRODUCER_COVERS: string[] = [
    unsplash('1470225620780-dba8ba36b745'), // Tay DJ trên bàn mixer đèn tím
    unsplash('1598488035139-bdbb2231ce04'), // Phòng thu với console và tường guitar
    unsplash('1525362081669-2b476bb628c3'), // Pad MIDI phát sáng neon
    unsplash('1519892300165-cb5542fb47c7'), // Bộ trống và dùi trống
    unsplash('1614613535308-eb5fbd3d2c17'), // Đĩa than cam và bìa album
];

/** Venue: không gian biểu diễn, khán giả, ánh sáng sân khấu. */
const VENUE_COVERS: string[] = [
    unsplash('1470229722913-7c0e2dbbafd3'), // Khán giả và ánh sáng sân khấu vàng cam
    unsplash('1459749411175-04bf5292ceea'), // Sân khấu lớn rực sáng
    unsplash('1533174072545-7a4b6ad7a6c3'), // Concert với kim tuyến bay
    unsplash('1481886756534-97af88ccb438'), // Ban nhạc chơi live trong quán
    unsplash('1514320291840-2e0a9bf2a9ae'), // Phòng tập tường gạch với dàn trống
];

/** Dùng khi role không xác định. */
const ARTIST_COVERS: string[] = [
    unsplash('1508700115892-45ecd05ae2ad'), // Đèn neon "you are what you listen to"
    unsplash('1571330735066-03aaa9429d89'), // Băng cassette trên nền cam
    unsplash('1487180144351-b8472da7d491'), // Đài cassette retro
    unsplash('1519508234439-4f23643125c1'), // Dãy guitar điện nhiều màu
    unsplash('1465847899084-d164df4dedc6'), // Dàn violin trong dàn nhạc
];

export const DEFAULT_EXPLORE_COVERS: Record<UserRole | 'artist', string[]> = {
    singer: SINGER_COVERS,
    producer: PRODUCER_COVERS,
    venue: VENUE_COVERS,
    artist: ARTIST_COVERS,
};

/** Hash djb2 — cùng một seed luôn cho cùng một ảnh, tránh ảnh nhảy mỗi lần re-render. */
function hashSeed(seed: string): number {
    let hash = 5381;
    for (let i = 0; i < seed.length; i += 1) {
        hash = (hash * 33) ^ seed.charCodeAt(i);
    }
    return Math.abs(hash);
}

/**
 * Ảnh bìa mặc định ổn định theo `seed` (nên truyền user id hoặc username).
 * Chọn theo role để nội dung ảnh khớp với nghề của nghệ sĩ. `role` nhận cả kiểu
 * chuỗi tự do (vd: Job.type) — không khớp thì rơi về bộ ảnh 'artist'.
 */
export function getDefaultCoverUrl(seed: string, role?: UserRole | string): string {
    const key = role as keyof typeof DEFAULT_EXPLORE_COVERS;
    const covers = (role && DEFAULT_EXPLORE_COVERS[key]) || DEFAULT_EXPLORE_COVERS.artist;
    return covers[hashSeed(seed) % covers.length];
}

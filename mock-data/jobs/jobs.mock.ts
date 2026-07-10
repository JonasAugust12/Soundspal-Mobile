import type { Job } from '@/features/jobs/domain/entities/job.type';

/**
 * Job mock cho tab "Việc khác" ở màn Việc làm, dùng khi danh sách thật còn trống.
 *
 * Lưu ý về ngày tháng: `deadline`, `created_at`… được đưa qua `formatDate` (new Date())
 * nên phải là ISO string, KHÔNG dùng 'DD-MM-YYYY'. `type` giữ trong 3 ArtistType thật
 * (singer | producer | venue) để khớp bộ lọc và backend.
 */

/** Prefix để nhận diện job mock (dùng cho fallback ở màn chi tiết). */
export const MOCK_JOB_ID_PREFIX = 'job-mock-';

type MockJobInput = Partial<Job> & Pick<Job, 'id' | 'title' | 'type'>;

/** Điền đầy đủ các field bắt buộc của Job để mock hợp lệ về kiểu và hiển thị. */
function makeMockJob(input: MockJobInput): Job {
    return {
        // Meta
        post_type: 'job_offer',
        status: 'published',
        visibility: 'public',
        is_pool: false,
        pool_type: '',
        auto_notify: false,
        // Creator
        creator_id: 'mock-creator',
        creator_role: 'venue',
        creator_username: 'soundspal',
        creator_display_name: 'Soundspal',
        // Nội dung
        brief_description: '',
        description: '',
        recruitment_type: 'contract',
        location_type: 'onsite',
        location: 'TP. Hồ Chí Minh',
        // Ngân sách
        budget_min: 0,
        budget_max: 0,
        budget_currency: 'VND',
        payment_type: 'byProject',
        is_negotiable: false,
        // Thời gian
        deadline: '',
        work_time: '',
        published_at: '2026-07-01T09:00:00.000Z',
        created_at: '2026-07-01T09:00:00.000Z',
        updated_at: '2026-07-01T09:00:00.000Z',
        closed_at: '',
        // Yêu cầu
        experience_level: 'intermediate',
        genres: [],
        required_skills: [],
        benefits: [],
        // Quan hệ / số liệu
        assets: [],
        invites: [],
        tags: [],
        views_count: 0,
        applications_count: 0,
        bookings_count: 0,
        total_submissions: 0,
        can_accept_submissions: true,
        is_deadline_passed: false,
        ...input,
    };
}

export const MOCK_JOBS: Job[] = [
    makeMockJob({
        id: `${MOCK_JOB_ID_PREFIX}1`,
        title: 'Tuyển ca sĩ chính cho album Indie Pop',
        type: 'singer',
        post_type: 'job_offer',
        creator_role: 'producer',
        creator_username: 'lotus_records',
        creator_display_name: 'Lotus Records',
        brief_description: 'Cần giọng nữ Pop/Indie cho album 8 track, thu âm tại phòng thu Q.3.',
        description:
            'Lotus Records tìm ca sĩ chính cho dự án album Indie Pop phát hành cuối 2026. ' +
            'Yêu cầu quãng giọng rộng, cảm âm tốt, có kinh nghiệm thu âm studio và biểu diễn live. ' +
            'Ưu tiên ứng viên có sản phẩm cá nhân đã phát hành.',
        recruitment_type: 'contract',
        location_type: 'onsite',
        location: 'Quận 3, TP. Hồ Chí Minh',
        budget_min: 10_000_000,
        budget_max: 18_000_000,
        payment_type: 'byProject',
        deadline: '2026-08-15T00:00:00.000Z',
        work_time: 'Thu âm T2-T4-T6 (14:00 - 18:00)',
        experience_level: 'intermediate',
        genres: ['Indie', 'Pop', 'Ballad'],
        required_skills: ['Thu âm studio', 'Cảm âm', 'Biểu diễn live'],
        benefits: ['Credit trên album', 'Chia % doanh thu streaming', 'Hỗ trợ quay MV'],
        views_count: 486,
        applications_count: 17,
        created_at: '2026-07-09T08:00:00.000Z',
        published_at: '2026-07-09T08:00:00.000Z',
    }),
    makeMockJob({
        id: `${MOCK_JOB_ID_PREFIX}2`,
        title: 'Cần producer phối khí single R&B / Lo-fi',
        type: 'producer',
        post_type: 'job_offer',
        creator_role: 'singer',
        creator_username: 'mai_linh',
        creator_display_name: 'Mai Linh',
        brief_description: 'Sản xuất & phối khí 1 single R&B chill, có sẵn demo guitar và lời.',
        description:
            'Mình là ca sĩ độc lập, cần producer làm beat và phối khí cho 1 single R&B/Lo-fi. ' +
            'Đã có demo hát + hợp âm guitar, cần bạn dựng bản phối hoàn chỉnh, mix/master đạt chuẩn phát hành. ' +
            'Làm việc từ xa, trao đổi qua file và call.',
        recruitment_type: 'one_time',
        location_type: 'remote',
        location: 'Làm việc từ xa',
        budget_min: 5_000_000,
        budget_max: 12_000_000,
        payment_type: 'byProject',
        is_negotiable: true,
        deadline: '2026-08-05T00:00:00.000Z',
        work_time: 'Linh hoạt',
        experience_level: 'expert',
        genres: ['R&B', 'Lo-fi', 'Soul'],
        required_skills: ['Beatmaking', 'Mixing', 'Mastering', 'Ableton/FL Studio'],
        benefits: ['Credit producer', 'Thanh toán 50% tạm ứng'],
        views_count: 312,
        applications_count: 9,
        created_at: '2026-07-07T10:30:00.000Z',
        published_at: '2026-07-07T10:30:00.000Z',
    }),
    makeMockJob({
        id: `${MOCK_JOB_ID_PREFIX}3`,
        title: 'DJ chơi set House/Techno tối cuối tuần — Rooftop',
        type: 'producer',
        post_type: 'gig',
        creator_role: 'venue',
        creator_username: 'skyline_rooftop',
        creator_display_name: 'Skyline Rooftop Bar',
        brief_description: 'Tìm DJ cho 2 set tối T7 & CN, nhạc House/Techno, thiết bị có sẵn.',
        description:
            'Skyline Rooftop cần DJ chơi định kỳ tối cuối tuần. Không gian ngoài trời view thành phố, ' +
            'dàn Pioneer CDJ-3000 + DJM-900 sẵn sàng. Ưu tiên DJ có gu House/Melodic Techno, biết đọc không khí đám đông.',
        recruitment_type: 'part_time',
        location_type: 'onsite',
        location: 'Quận 1, TP. Hồ Chí Minh',
        budget_min: 2_000_000,
        budget_max: 3_500_000,
        payment_type: 'bySession',
        deadline: '2026-07-26T00:00:00.000Z',
        work_time: 'Tối T7 & CN (21:00 - 00:00)',
        experience_level: 'intermediate',
        genres: ['House', 'Techno', 'Deep House'],
        required_skills: ['DJ mixing', 'Đọc đám đông', 'Pioneer CDJ'],
        benefits: ['Lịch diễn đều đặn', 'Đồ uống miễn phí', 'Giới thiệu sự kiện lớn'],
        views_count: 254,
        applications_count: 6,
        created_at: '2026-07-04T12:00:00.000Z',
        published_at: '2026-07-04T12:00:00.000Z',
    }),
    makeMockJob({
        id: `${MOCK_JOB_ID_PREFIX}4`,
        title: 'Backing vocalist cho liveshow acoustic',
        type: 'singer',
        post_type: 'gig',
        creator_role: 'singer',
        creator_username: 'the_woods_band',
        creator_display_name: 'The Woods Band',
        brief_description: 'Cần 2 bè hát nữ cho liveshow acoustic, có 3 buổi tập trước show.',
        description:
            'The Woods Band tổ chức liveshow acoustic và cần 2 backing vocalist (giọng nữ) hát bè. ' +
            'Cần khả năng hát bè chắc, giữ nhịp tốt, phối hợp ăn ý. Có 3 buổi tập và 1 đêm diễn chính.',
        recruitment_type: 'one_time',
        location_type: 'onsite',
        location: 'Quận Bình Thạnh, TP. Hồ Chí Minh',
        budget_min: 1_500_000,
        budget_max: 2_500_000,
        payment_type: 'bySession',
        deadline: '2026-07-30T00:00:00.000Z',
        work_time: 'Tập T3-T5, diễn 09/08/2026',
        experience_level: 'beginner',
        genres: ['Acoustic', 'Pop', 'Folk'],
        required_skills: ['Hát bè', 'Giữ nhịp', 'Cảm âm'],
        benefits: ['Trải nghiệm sân khấu', 'Quay hình liveshow làm profile'],
        views_count: 198,
        applications_count: 21,
        created_at: '2026-06-30T09:15:00.000Z',
        published_at: '2026-06-30T09:15:00.000Z',
    }),
    makeMockJob({
        id: `${MOCK_JOB_ID_PREFIX}5`,
        title: 'Mixing & Mastering Engineer cho EP 5 bài',
        type: 'producer',
        post_type: 'job_offer',
        creator_role: 'producer',
        creator_username: 'northside_studio',
        creator_display_name: 'Northside Studio',
        brief_description: 'Mix & master EP 5 track Alternative Rock, đã có multitrack.',
        description:
            'Northside Studio cần kỹ sư mix/master cho EP Alternative Rock 5 bài. ' +
            'Đã có sẵn multitrack thu chuẩn, cần bạn xử lý mix cân bằng, master đạt chuẩn Spotify/Apple Music. ' +
            'Deadline gọn, ưu tiên người có reference các bản đã master.',
        recruitment_type: 'contract',
        location_type: 'hybrid',
        location: 'TP. Hồ Chí Minh (kết hợp online)',
        budget_min: 8_000_000,
        budget_max: 15_000_000,
        payment_type: 'byProject',
        is_negotiable: true,
        deadline: '2026-09-10T00:00:00.000Z',
        work_time: 'Theo tiến độ dự án',
        experience_level: 'expert',
        genres: ['Alternative Rock', 'Rock', 'Post-rock'],
        required_skills: ['Mixing', 'Mastering', 'Pro Tools', 'Xử lý loudness'],
        benefits: ['Credit trên EP', 'Cơ hội hợp tác dài hạn'],
        views_count: 176,
        applications_count: 4,
        created_at: '2026-07-08T14:45:00.000Z',
        published_at: '2026-07-08T14:45:00.000Z',
    }),
    makeMockJob({
        id: `${MOCK_JOB_ID_PREFIX}6`,
        title: 'Session singer thu âm jingle quảng cáo',
        type: 'singer',
        post_type: 'job_offer',
        creator_role: 'producer',
        creator_username: 'adhouse_media',
        creator_display_name: 'AdHouse Media',
        brief_description: 'Thu giọng nam/nữ cho jingle quảng cáo 30 giây, thu trong ngày.',
        description:
            'AdHouse Media cần session singer thu jingle cho một chiến dịch quảng cáo TVC. ' +
            'Giai điệu vui tươi, bắt tai; cần bạn hát chuẩn cao độ, thu nhanh gọn trong buổi. ' +
            'Thanh toán ngay sau buổi thu.',
        recruitment_type: 'one_time',
        location_type: 'onsite',
        location: 'Quận Phú Nhuận, TP. Hồ Chí Minh',
        budget_min: 3_000_000,
        budget_max: 5_000_000,
        payment_type: 'bySession',
        deadline: '2026-07-28T00:00:00.000Z',
        work_time: 'Thu 1 buổi (thỏa thuận)',
        experience_level: 'any',
        genres: ['Pop', 'Commercial'],
        required_skills: ['Hát chuẩn cao độ', 'Thu âm nhanh', 'Đọc bản nhạc'],
        benefits: ['Thanh toán trong ngày', 'Credit portfolio'],
        views_count: 143,
        applications_count: 11,
        created_at: '2026-07-06T11:00:00.000Z',
        published_at: '2026-07-06T11:00:00.000Z',
    }),
];

/** Tìm job mock theo id (dùng cho fallback ở màn chi tiết). */
export function findMockJobById(id: string): Job | undefined {
    return MOCK_JOBS.find((job) => job.id === id);
}

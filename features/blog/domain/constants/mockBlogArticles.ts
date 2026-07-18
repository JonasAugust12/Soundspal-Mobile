import type { BlogPost } from '@/features/blog/domain/entities/blog.type';

/**
 * Dữ liệu blog mẫu — dùng làm PHƯƠNG ÁN DỰ PHÒNG khi API `/blogs` trả rỗng hoặc lỗi,
 * để màn Blog (danh sách + chi tiết + preview ở Home) luôn có nội dung thật để hiển thị.
 *
 * - Ảnh lấy từ Unsplash (chủ đề âm nhạc), cùng bộ đã kiểm tra trả 200 với
 *   `features/explore/domain/constants/defaultCoverImages.ts` → không bị vỡ ảnh.
 * - `content` là HTML (h2/p/ul/blockquote) để `BlogDetailContent` render đầy đủ.
 * - Ngày để cố định (không dùng Date.now) cho ổn định, tránh nhảy mỗi lần mở.
 *
 * `useBlogArticle` (màn chi tiết) tìm bài theo `id` NGAY TRONG danh sách feed, nên chỉ cần
 * các bài này nằm trong feed là chi tiết cũng hoạt động — không cần mock riêng cho detail.
 */

// Ảnh bìa blog: tỉ lệ ngang 16:9.
const cover = (photoId: string): string =>
    `https://images.unsplash.com/photo-${photoId}?w=1200&h=675&fit=crop&q=80&auto=format`;

const base = {
    post_type: 'blog',
    status: 'published',
    visibility: 'public',
    creator_role: 'producer',
    downvote_count: 0,
    is_featured: false,
} as const satisfies Partial<BlogPost>;

export const MOCK_BLOG_ARTICLES: BlogPost[] = [
    {
        ...base,
        id: 'mock-blog-home-recording',
        title: '5 bước tự thu âm tại nhà cho người mới bắt đầu',
        category: 'Sản xuất',
        creator_display_name: 'Lope Phạm',
        creator_username: 'lopepham',
        thumbnail: cover('1598488035139-bdbb2231ce04'),
        readTime: 6,
        read_time: 6,
        publishedAt: '12 Th7, 2026',
        published_at: '2026-07-12T09:00:00.000Z',
        created_at: '2026-07-12T09:00:00.000Z',
        updated_at: '2026-07-12T09:00:00.000Z',
        tags: ['thu âm', 'home studio', 'người mới'],
        views_count: 1284,
        view_count: 1284,
        likes: 214,
        upvote_count: 214,
        comment_count: 37,
        bookmark_count: 58,
        brief_description:
            'Không cần phòng thu tiền tỷ — chỉ với micro, tai nghe và một góc phòng yên tĩnh, bạn đã có thể ra bản demo nghe được.',
        short_description:
            'Không cần phòng thu tiền tỷ — chỉ với micro, tai nghe và một góc phòng yên tĩnh, bạn đã có thể ra bản demo nghe được.',
        excerpt: 'Micro, tai nghe, một góc phòng yên tĩnh — đủ để bắt đầu.',
        content: `
<h2>1. Chọn không gian, không phải thiết bị đắt tiền</h2>
<p>Sai lầm phổ biến nhất của người mới là dồn tiền vào micro trong khi thu âm trong một căn phòng vọng âm. Âm thanh vọng (reverb) bám vào giọng hát <strong>không thể gỡ ra khi mix</strong>. Hãy thu ở phòng có nhiều đồ vải: rèm dày, chăn, tủ quần áo mở.</p>
<h2>2. Bộ thiết bị tối thiểu</h2>
<ul>
<li><strong>Micro condenser</strong> tầm 1–2 triệu là đủ cho demo.</li>
<li><strong>Audio interface</strong> để đưa tín hiệu vào máy tính sạch, độ trễ thấp.</li>
<li><strong>Tai nghe kín (closed-back)</strong> để tiếng beat không lọt vào micro.</li>
</ul>
<h2>3. Gain staging — chìa khoá của bản thu sạch</h2>
<p>Chỉnh mức thu sao cho đỉnh tín hiệu nằm quanh <strong>-12dB đến -6dB</strong>. Thu quá to sẽ méo (clip) và không cứu được; thu quá nhỏ thì nhiễu nền lộ rõ khi kéo âm lượng lên.</p>
<blockquote>Một bản thu sạch dở mix vẫn cứu được. Một bản thu bẩn thì mixing giỏi mấy cũng bó tay.</blockquote>
<h2>4. Thu nhiều lần (take), giữ lại phần hay nhất</h2>
<p>Đừng cố hát hoàn hảo trong một lần. Thu 3–4 lần cả bài, rồi ghép (comping) những câu tốt nhất lại. Đây là cách các phòng thu chuyên nghiệp vẫn làm.</p>
<h2>5. Xuất file đúng chuẩn</h2>
<p>Xuất WAV 24-bit/44.1kHz khi gửi cho người mix. Đừng gửi MP3 — nén mất dữ liệu, người mix không có gì để làm việc.</p>
`,
    },
    {
        ...base,
        id: 'mock-blog-pricing-gigs',
        title: 'Định giá show diễn: nghệ sĩ mới nên tính thế nào cho không lỗ?',
        category: 'Nghề nghiệp',
        creator_display_name: 'Tyronee',
        creator_username: 'itstyronehere',
        creator_role: 'artist',
        thumbnail: cover('1470229722913-7c0e2dbbafd3'),
        readTime: 5,
        read_time: 5,
        publishedAt: '09 Th7, 2026',
        published_at: '2026-07-09T08:30:00.000Z',
        created_at: '2026-07-09T08:30:00.000Z',
        updated_at: '2026-07-09T08:30:00.000Z',
        tags: ['cát-xê', 'đi diễn', 'tài chính'],
        views_count: 963,
        view_count: 963,
        likes: 178,
        upvote_count: 178,
        comment_count: 41,
        bookmark_count: 73,
        brief_description:
            'Nhận show 500k tưởng lời, nhưng trừ di chuyển, tập luyện và thời gian thì có khi lỗ. Đây là cách tính cát-xê minh bạch.',
        short_description:
            'Nhận show 500k tưởng lời, nhưng trừ chi phí thì có khi lỗ. Cách tính cát-xê minh bạch.',
        excerpt: 'Trừ hết chi phí ẩn rồi mới biết show đó lời hay lỗ.',
        content: `
<h2>Đừng chỉ nhìn con số trên hợp đồng</h2>
<p>Một show 800k nghe có vẻ ổn, nhưng hãy trừ đi: xăng xe/grab, thời gian tập, phục trang, phần trăm cho người kết nối. Con số thực nhận có khi chỉ còn một nửa.</p>
<h2>Công thức tối thiểu</h2>
<ul>
<li><strong>Chi phí trực tiếp:</strong> di chuyển + thiết bị + trang phục.</li>
<li><strong>Giá trị thời gian:</strong> giờ tập + giờ diễn + giờ di chuyển, nhân với mức bạn muốn được trả mỗi giờ.</li>
<li><strong>Phí rủi ro:</strong> cộng thêm 15–20% cho các phát sinh (huỷ show, kẹt xe, sự cố kỹ thuật).</li>
</ul>
<blockquote>Cát-xê không phải là "được bao nhiêu", mà là "sau khi trừ hết thì còn bao nhiêu".</blockquote>
<h2>Khi nào nên nhận show giá thấp?</h2>
<p>Chấp nhận giá thấp nếu đổi lại được thứ giá trị hơn tiền: sân khấu lớn để build tên tuổi, video biểu diễn chất lượng để làm portfolio, hoặc kết nối với người trong nghề. Nhưng phải <strong>chủ động lượng hoá</strong> giá trị đó, đừng để bị ép.</p>
`,
    },
    {
        ...base,
        id: 'mock-blog-mixing-mastering',
        title: 'Mixing và Mastering khác nhau ở đâu? Giải thích dễ hiểu',
        category: 'Kiến thức',
        creator_display_name: 'Obito',
        creator_username: 'obito',
        thumbnail: cover('1470225620780-dba8ba36b745'),
        readTime: 7,
        read_time: 7,
        publishedAt: '05 Th7, 2026',
        published_at: '2026-07-05T10:00:00.000Z',
        created_at: '2026-07-05T10:00:00.000Z',
        updated_at: '2026-07-05T10:00:00.000Z',
        tags: ['mixing', 'mastering', 'hậu kỳ'],
        views_count: 2071,
        view_count: 2071,
        likes: 342,
        upvote_count: 342,
        comment_count: 64,
        bookmark_count: 129,
        brief_description:
            'Nhiều người tưởng hai công đoạn này là một. Thực ra chúng làm hai việc rất khác nhau — hiểu rõ để giao đúng người.',
        short_description:
            'Hai công đoạn, hai mục tiêu khác nhau. Hiểu rõ để giao đúng người, đúng việc.',
        excerpt: 'Mixing lo cân bằng các nhạc cụ; mastering lo bản phối cuối.',
        content: `
<h2>Mixing: cân bằng bên trong bài hát</h2>
<p>Mixing là công đoạn bạn có <strong>tất cả các track riêng lẻ</strong> — giọng, trống, bass, guitar — và trộn chúng lại sao cho nghe hài hoà: cái nào to, cái nào nhỏ, cái nào bên trái, cái nào bên phải, cái nào vang xa.</p>
<h2>Mastering: đánh bóng bản phối cuối</h2>
<p>Mastering nhận <strong>một file stereo đã mix xong</strong> và làm nó nghe chuyên nghiệp, đủ to và đồng đều khi phát trên mọi thiết bị — từ tai nghe, loa điện thoại đến dàn xe hơi.</p>
<h3>So sánh nhanh</h3>
<ul>
<li><strong>Mixing</strong> làm việc với nhiều track. <strong>Mastering</strong> làm việc với một file.</li>
<li>Mixing quyết định <em>các phần nghe thế nào với nhau</em>. Mastering quyết định <em>cả bài nghe thế nào với thế giới</em>.</li>
</ul>
<blockquote>Mixing như nấu ăn — nêm nếm từng nguyên liệu. Mastering như bày đĩa — làm món ăn trông ngon trên bàn tiệc.</blockquote>
<h2>Có nên tự làm cả hai?</h2>
<p>Người mới nên tập trung mix cho tốt trước. Mastering đòi hỏi phòng nghe chuẩn và đôi tai đã quen, nên giai đoạn đầu có thể dùng dịch vụ mastering online để bản nhạc đủ sức cạnh tranh.</p>
`,
    },
    {
        ...base,
        id: 'mock-blog-personal-branding',
        title: 'Xây thương hiệu cá nhân trên nền tảng nhạc số: bắt đầu từ đâu?',
        category: 'Marketing',
        creator_display_name: 'Shiki',
        creator_username: 'shiki',
        creator_role: 'artist',
        thumbnail: cover('1508700115892-45ecd05ae2ad'),
        readTime: 6,
        read_time: 6,
        publishedAt: '01 Th7, 2026',
        published_at: '2026-07-01T07:45:00.000Z',
        created_at: '2026-07-01T07:45:00.000Z',
        updated_at: '2026-07-01T07:45:00.000Z',
        tags: ['thương hiệu', 'mạng xã hội', 'khán giả'],
        views_count: 1543,
        view_count: 1543,
        likes: 267,
        upvote_count: 267,
        comment_count: 52,
        bookmark_count: 96,
        brief_description:
            'Tài năng thôi chưa đủ nếu không ai biết đến bạn. Thương hiệu cá nhân là cầu nối giữa âm nhạc và khán giả.',
        short_description: 'Tài năng thôi chưa đủ nếu không ai biết đến bạn. Đây là cách bắt đầu.',
        excerpt: 'Chọn một chất riêng, kể một câu chuyện, xuất hiện đều đặn.',
        content: `
<h2>Thương hiệu = lời hứa lặp lại</h2>
<p>Thương hiệu cá nhân không phải logo hay màu sắc. Nó là <strong>cảm giác nhất quán</strong> mà khán giả nhận được mỗi lần gặp bạn — âm nhạc, hình ảnh, cách nói chuyện.</p>
<h2>Ba việc cần làm ngay</h2>
<ul>
<li><strong>Chọn một chất riêng:</strong> một dòng nhạc, một thông điệp bạn muốn gắn với tên mình.</li>
<li><strong>Kể câu chuyện thật:</strong> khán giả kết nối với con người, không kết nối với sản phẩm hoàn hảo.</li>
<li><strong>Xuất hiện đều đặn:</strong> một tuần một nội dung nhỏ còn hơn dồn hết vào một lần rồi im lặng ba tháng.</li>
</ul>
<blockquote>Người ta không nghe nhạc của người lạ. Hãy để khán giả quen bạn trước khi mời họ nghe.</blockquote>
<h2>Đo lường bằng chiều sâu, không phải lượt xem</h2>
<p>1.000 người thật sự quan tâm giá trị hơn 100.000 lượt xem lướt qua. Hãy nhìn vào lượt lưu, bình luận có nội dung, và số người quay lại — đó mới là fan.</p>
`,
    },
    {
        ...base,
        id: 'mock-blog-copyright-vn',
        title: 'Bản quyền âm nhạc ở Việt Nam: điều nghệ sĩ trẻ cần biết',
        category: 'Pháp lý',
        creator_display_name: 'VSTRA',
        creator_username: 'vstra',
        thumbnail: cover('1485579149621-3123dd979885'),
        readTime: 8,
        read_time: 8,
        publishedAt: '26 Th6, 2026',
        published_at: '2026-06-26T06:20:00.000Z',
        created_at: '2026-06-26T06:20:00.000Z',
        updated_at: '2026-06-26T06:20:00.000Z',
        tags: ['bản quyền', 'pháp lý', 'phát hành'],
        views_count: 1899,
        view_count: 1899,
        likes: 301,
        upvote_count: 301,
        comment_count: 88,
        bookmark_count: 154,
        brief_description:
            'Ai giữ quyền khi bạn hợp tác? Sample của người khác dùng thế nào cho đúng? Vài điều căn bản để không vướng rắc rối.',
        short_description:
            'Ai giữ quyền khi hợp tác? Dùng sample thế nào cho đúng? Vài điều căn bản cần biết.',
        excerpt: 'Hiểu quyền tác giả và quyền liên quan trước khi phát hành.',
        content: `
<h2>Hai loại quyền dễ nhầm</h2>
<p><strong>Quyền tác giả</strong> thuộc về người sáng tác (nhạc và lời). <strong>Quyền liên quan</strong> thuộc về người biểu diễn và nhà sản xuất bản ghi. Một bài hát có thể có nhiều bên cùng giữ quyền.</p>
<h2>Khi hợp tác, hãy thoả thuận bằng văn bản</h2>
<ul>
<li>Ai giữ bao nhiêu phần trăm quyền tác giả?</li>
<li>Ai được quyền phát hành và trên nền tảng nào?</li>
<li>Doanh thu chia thế nào, ai đứng tên đăng ký?</li>
</ul>
<blockquote>Thoả thuận miệng giữa bạn bè là nguồn gốc của phần lớn các vụ tranh chấp âm nhạc.</blockquote>
<h2>Dùng sample và beat của người khác</h2>
<p>Beat mua "lease" thường có giới hạn số bản phát hành và không được đăng ký độc quyền. Sample từ bài hát khác <strong>bắt buộc phải xin phép (clear)</strong> — nếu không, nền tảng có thể gỡ hoặc chuyển toàn bộ doanh thu cho chủ sở hữu gốc.</p>
<h2>Đăng ký để có bằng chứng</h2>
<p>Đăng ký quyền tác giả không bắt buộc để có quyền, nhưng là <strong>bằng chứng mạnh</strong> khi xảy ra tranh chấp. Với nghệ sĩ trẻ, đây là khoản đầu tư nhỏ đổi lấy sự an tâm lớn.</p>
`,
    },
    {
        ...base,
        id: 'mock-blog-bedroom-to-stage',
        title: 'Từ bedroom producer đến sân khấu lớn: hành trình của Gen Z',
        category: 'Câu chuyện',
        creator_display_name: 'Master D',
        creator_username: 'dientran1801',
        creator_role: 'producer',
        thumbnail: cover('1525362081669-2b476bb628c3'),
        readTime: 5,
        read_time: 5,
        publishedAt: '20 Th6, 2026',
        published_at: '2026-06-20T05:10:00.000Z',
        created_at: '2026-06-20T05:10:00.000Z',
        updated_at: '2026-06-20T05:10:00.000Z',
        tags: ['truyền cảm hứng', 'producer', 'gen z'],
        views_count: 2456,
        view_count: 2456,
        likes: 428,
        upvote_count: 428,
        comment_count: 97,
        bookmark_count: 187,
        brief_description:
            'Nhiều nghệ sĩ đang phủ sóng bảng xếp hạng bắt đầu chỉ với một chiếc laptop trong phòng ngủ. Điều gì tạo nên khác biệt?',
        short_description:
            'Bắt đầu chỉ với một chiếc laptop trong phòng ngủ. Điều gì tạo nên khác biệt?',
        excerpt: 'Kiên trì ra sản phẩm đều đặn quan trọng hơn thiết bị xịn.',
        content: `
<h2>Khởi đầu ai cũng giống nhau</h2>
<p>Không ai bắt đầu với phòng thu hoàn hảo. Điểm chung của những producer thành công là họ <strong>ra sản phẩm đều đặn</strong> khi còn "vô danh", thay vì chờ đủ thiết bị mới bắt đầu.</p>
<h2>Ba điều họ làm khác</h2>
<ul>
<li><strong>Hoàn thành, không hoàn hảo:</strong> một beat xong và đăng còn giá trị hơn mười beat dang dở.</li>
<li><strong>Kết nối cộng đồng:</strong> tìm ca sĩ, rapper để hợp tác, thay vì ngồi một mình.</li>
<li><strong>Học từ phản hồi:</strong> đăng, nghe góp ý, sửa, đăng tiếp — vòng lặp này là trường học thật sự.</li>
</ul>
<blockquote>Tài năng đưa bạn tới cánh cửa. Sự kiên trì mới là thứ mở được nó.</blockquote>
<h2>Nền tảng thay đổi luật chơi</h2>
<p>Ngày nay một bản beat làm trong phòng ngủ có thể tới tai hàng triệu người mà không cần hãng đĩa. Rào cản không còn là thiết bị — mà là <strong>bạn có dám xuất hiện đều đặn hay không</strong>.</p>
`,
    },
    {
        ...base,
        id: 'mock-blog-first-mic',
        title: 'Chọn micro thu âm đầu tiên: condenser hay dynamic?',
        category: 'Thiết bị',
        creator_display_name: 'Obito',
        creator_username: 'obito',
        thumbnail: cover('1511671782779-c97d3d27a1d4'),
        readTime: 6,
        read_time: 6,
        publishedAt: '15 Th6, 2026',
        published_at: '2026-06-15T08:00:00.000Z',
        created_at: '2026-06-15T08:00:00.000Z',
        updated_at: '2026-06-15T08:00:00.000Z',
        tags: ['micro', 'thiết bị', 'thu âm'],
        views_count: 1187,
        view_count: 1187,
        likes: 196,
        upvote_count: 196,
        comment_count: 33,
        bookmark_count: 61,
        brief_description:
            'Câu hỏi muôn thuở của người mới. Câu trả lời phụ thuộc vào phòng thu và ngân sách của bạn, chứ không phải cái nào "xịn hơn".',
        short_description:
            'Condenser hay dynamic? Câu trả lời phụ thuộc phòng thu và ngân sách, không phải cái nào xịn hơn.',
        excerpt: 'Phòng ồn thì dynamic; phòng yên thì condenser.',
        content: `
<h2>Khác biệt cốt lõi</h2>
<p><strong>Condenser</strong> nhạy, thu được chi tiết tinh tế của giọng hát — nhưng cũng thu luôn tiếng quạt, tiếng xe ngoài đường. <strong>Dynamic</strong> ít nhạy hơn, bỏ qua phần lớn tạp âm nền — đổi lại giọng nghe bớt "airy".</p>
<h2>Chọn theo phòng, không theo giá</h2>
<ul>
<li><strong>Phòng chưa tiêu âm, hay ồn:</strong> chọn dynamic để giọng không lẫn tạp âm.</li>
<li><strong>Phòng yên tĩnh, có tiêu âm:</strong> condenser sẽ cho bản thu chi tiết và chuyên nghiệp hơn.</li>
</ul>
<blockquote>Micro tốt trong phòng xấu vẫn thua micro thường trong phòng tốt.</blockquote>
<h2>Đừng quên phụ kiện</h2>
<p>Một chiếc <strong>pop filter</strong> vài chục nghìn loại bỏ tiếng "bụp" ở âm "p", "b"; một <strong>chân micro chống rung</strong> tránh tiếng gõ bàn lọt vào. Hai thứ rẻ tiền này cải thiện bản thu nhiều hơn bạn tưởng.</p>
`,
    },
    {
        ...base,
        id: 'mock-blog-distribution',
        title: '5 kênh phân phối nhạc số nghệ sĩ Việt nên biết',
        category: 'Phát hành',
        creator_display_name: 'VSTRA',
        creator_username: 'vstra',
        thumbnail: cover('1519892300165-cb5542fb47c7'),
        readTime: 7,
        read_time: 7,
        publishedAt: '10 Th6, 2026',
        published_at: '2026-06-10T09:30:00.000Z',
        created_at: '2026-06-10T09:30:00.000Z',
        updated_at: '2026-06-10T09:30:00.000Z',
        tags: ['phát hành', 'streaming', 'phân phối'],
        views_count: 1642,
        view_count: 1642,
        likes: 259,
        upvote_count: 259,
        comment_count: 47,
        bookmark_count: 112,
        brief_description:
            'Làm xong bài hát mới là một nửa. Đưa nó lên Spotify, Apple Music, YouTube Music... cần đi qua một nhà phân phối (aggregator).',
        short_description:
            'Làm xong bài hát mới là một nửa. Đưa lên các nền tảng cần đi qua nhà phân phối.',
        excerpt: 'Bạn không tự đẩy nhạc lên Spotify — phải qua aggregator.',
        content: `
<h2>Vì sao cần nhà phân phối?</h2>
<p>Spotify hay Apple Music không nhận nhạc trực tiếp từ nghệ sĩ độc lập. Bạn cần một <strong>aggregator</strong> — bên trung gian đẩy nhạc lên tất cả nền tảng và thu hộ tiền bản quyền.</p>
<h2>Những lựa chọn phổ biến</h2>
<ul>
<li><strong>DistroKid / TuneCore:</strong> phổ biến toàn cầu, trả phí theo năm, giữ 100% doanh thu.</li>
<li><strong>Believe / ONE Distribution:</strong> mạnh ở thị trường châu Á, có hỗ trợ marketing.</li>
<li><strong>Kênh nội địa (Zing MP3, NCT):</strong> tiếp cận trực tiếp người nghe Việt Nam.</li>
</ul>
<blockquote>Chọn aggregator không chỉ nhìn phí — nhìn vào việc họ trả tiền có minh bạch và đúng hạn không.</blockquote>
<h2>Chuẩn bị trước khi phát hành</h2>
<p>Ảnh bìa vuông tối thiểu 3000×3000px, file WAV chất lượng cao, thông tin nghệ sĩ và ngày phát hành đặt trước <strong>ít nhất 2–4 tuần</strong> để nền tảng kịp duyệt và có cơ hội vào playlist.</p>
`,
    },
    {
        ...base,
        id: 'mock-blog-livestream',
        title: 'Livestream biểu diễn: cách thu hút và giữ chân khán giả',
        category: 'Marketing',
        creator_display_name: 'Tyronee',
        creator_username: 'itstyronehere',
        creator_role: 'artist',
        thumbnail: cover('1459749411175-04bf5292ceea'),
        readTime: 5,
        read_time: 5,
        publishedAt: '04 Th6, 2026',
        published_at: '2026-06-04T10:15:00.000Z',
        created_at: '2026-06-04T10:15:00.000Z',
        updated_at: '2026-06-04T10:15:00.000Z',
        tags: ['livestream', 'khán giả', 'biểu diễn'],
        views_count: 1358,
        view_count: 1358,
        likes: 231,
        upvote_count: 231,
        comment_count: 39,
        bookmark_count: 84,
        brief_description:
            'Livestream là sân khấu không giới hạn khoảng cách. Nhưng giữ người xem ở lại khó hơn kéo họ vào — vài mẹo thực chiến.',
        short_description:
            'Livestream là sân khấu không giới hạn khoảng cách. Giữ người xem khó hơn kéo họ vào.',
        excerpt: 'Âm thanh tốt và tương tác đều đặn giữ người xem ở lại.',
        content: `
<h2>Âm thanh quan trọng hơn hình ảnh</h2>
<p>Người xem tha thứ cho hình mờ, nhưng bỏ đi ngay khi âm thanh rè. Đầu tư một micro rời và kiểm tra đường tiếng <strong>trước khi lên sóng</strong> — đừng phó mặc cho mic điện thoại.</p>
<h2>Ba phút đầu quyết định</h2>
<ul>
<li><strong>Vào thẳng vấn đề:</strong> hát ngay một đoạn hook, đừng dành 5 phút chào hỏi.</li>
<li><strong>Gọi tên người xem:</strong> nhắc tên người vừa vào để họ thấy được nhìn thấy.</li>
<li><strong>Báo trước lịch:</strong> nói rõ "9h tối thứ 6 hàng tuần" để khán giả biết đường quay lại.</li>
</ul>
<blockquote>Livestream không phải buổi diễn một chiều — nó là cuộc trò chuyện có nhạc.</blockquote>
<h2>Sau khi tắt sóng vẫn còn việc</h2>
<p>Cắt những khoảnh khắc hay nhất thành clip ngắn đăng lại. Một buổi live 1 tiếng có thể "nuôi" nội dung cả tuần và kéo người mới tới buổi sau.</p>
`,
    },
];

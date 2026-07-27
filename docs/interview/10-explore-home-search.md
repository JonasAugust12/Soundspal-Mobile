# 10 — Khám phá, Trang chủ, Tìm kiếm (Explore / Home / Search)

> Gộp 3 feature vì chúng dùng **chung một datasource** (`searchRemoteDataSource`) và
> chung một mô hình dữ liệu. Sự chồng chéo giữa chúng chính là chủ đề hỏi hay nhất.

## 0. Bản đồ file

| File                                                                                                                               | Vai trò                                           |
| ---------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| [features/explore/data/datasources/searchRemoteDataSource.ts](../../features/explore/data/datasources/searchRemoteDataSource.ts)   | 4 endpoint — dùng chung cho cả 3 feature          |
| [features/explore/presentation/store/searchStore.ts](../../features/explore/presentation/store/searchStore.ts)                     | Bộ lọc (Zustand, không persist)                   |
| [features/explore/domain/entities/search.type.ts](../../features/explore/domain/entities/search.type.ts)                           | `SearchUsersRequest` — có field chết              |
| [features/explore/presentation/screens/ExploreScreen.tsx](../../features/explore/presentation/screens/ExploreScreen.tsx)           | Khám phá người (373 dòng), debounce **500 ms**    |
| [features/search/presentation/screens/UnifiedSearchScreen.tsx](../../features/search/presentation/screens/UnifiedSearchScreen.tsx) | Tìm kiếm tổng hợp (340 dòng), debounce **400 ms** |
| [features/search/presentation/hooks/useUnifiedSearch.ts](../../features/search/presentation/hooks/useUnifiedSearch.ts)             | Tìm song song người + việc                        |
| [features/home/presentation/screens/HomeScreen.tsx](../../features/home/presentation/screens/HomeScreen.tsx)                       | Trang chủ (385 dòng)                              |
| [features/home/domain/utils/mapFeaturedToHomeItems.ts](../../features/home/domain/utils/mapFeaturedToHomeItems.ts)                 | Map response landing → item hiển thị              |

---

## A. Kiến trúc

1. **[KT]** Ba feature dùng **chung** `searchRemoteDataSource` nằm trong `features/explore`. `features/search` và `features/home` import ngược vào explore. Ranh giới feature có còn đúng không? Datasource này nên nằm ở đâu?

2. **[KT]** `features/home` chỉ có `presentation/` + `domain/`, `features/search` chỉ có `presentation/`. Cả hai **không có tầng data**. Đây là ngoại lệ hợp lý (vì chúng chỉ tiêu thụ dữ liệu của feature khác) hay là phá vỡ quy tắc?

3. **[KT]** Có **hai màn "Explore"** trong app: `(tabs)/explore` (tìm người) và `(challenge)/explore` (tìm beat). Việc trùng tên ảnh hưởng gì đến bảo trì và onboarding người mới?

4. **[KT]** `shared/presentation/ui/SearchBar.tsx` là component chung. Nhưng thực tế có **ba** ô tìm kiếm khác nhau trong dự án. Kể tên.
    - `↳` (1) `shared/presentation/ui/SearchBar.tsx`; (2) `features/jobs/presentation/components/SearchBar.tsx` (bản riêng, jobs dùng); (3) `TextInput` viết tay trong `ExploreScreen` và `UnifiedSearchScreen`. Component chung gần như không ai dùng.

5. **[SÂU]** Vì sao có component chung mà không ai dùng? Điều đó nói gì về cách thiết lập design system trong dự án?

---

## B. Luồng đi

### B1. Trang chủ

6. **[LUỒNG]** `HomeScreen` gọi những API nào và map ra sao?
    - `↳` `GET /landing/featured-users?limit=N` và `GET /landing/featured-jobs?limit=N` → `mapFeaturedUsersToArtistItems()` / `mapFeaturedJobsToJobItems()`.

7. **[BIZ]** `mapFeaturedUsersToArtistItems` đọc `featuredUsersData?.data?.users?.users` — **ba tầng lồng**, tầng cuối lại tên `users` lần nữa. Đây là lỗi hợp đồng API hay là đúng thiết kế?

8. **[LUỒNG]** Mapper giữ lại `username` trong item. Vì sao quan trọng?
    - `↳` Comment `mapFeaturedToHomeItems.ts:21-22`: để điều hướng sang trang cá nhân; nếu không sẽ phải dò ngược mảng gốc theo index — rất dễ lệch khi 2 mảng khác độ dài.

9. **[BIZ]** Fallback khi thiếu dữ liệu: `brief_bio || '<role> chuyên nghiệp'`, location → `'Chưa cập nhật'`, skills → `'Chưa cập nhật'`. Hiển thị chuỗi mặc định như vậy có tốt hơn để trống không? Bạn quyết định dựa vào gì?

10. **[SÂU]** `useFeaturedUsers`/`useFeaturedJobs` đặt `staleTime: 5 phút`, `gcTime: 10 phút`. Nội dung "nổi bật" đổi bao lâu một lần ở backend? Con số này có căn cứ không?

### B2. Khám phá (Explore)

11. **[LUỒNG]** Kể luồng từ lúc người dùng gõ vào ô tìm kiếm đến khi thấy kết quả.
    - `↳` `setSearchText` → `useEffect` debounce **500 ms** → `searchStore.setQuery()` (reset `page: 1`) → `useSearchUsersInfinite(filters)` → `POST /search/users`.

12. **[SÂU]** Vì sao tìm kiếm dùng **`POST`** cho một thao tác đọc? Ảnh hưởng tới cache HTTP/CDN và tới khả năng chia sẻ link?
    - `↳` Lý do thường gặp: body filter phức tạp (mảng genres, khoảng giá) vượt giới hạn query string. Đổi lại: mất HTTP cache, không bookmark được kết quả.

13. **[SÂU]** Debounce ở Explore là **500 ms**, ở UnifiedSearch là **400 ms**. Vì sao lệch? Con số nào đúng và bạn chọn dựa trên gì?

14. **[SÂU]** Debounce chỉ **hoãn** request, không **huỷ** request cũ. Người dùng gõ nhanh 5 ký tự thì có bao nhiêu request bay và chúng có chạy đua không? React Query xử lý ra sao?
    - `↳` React Query dedupe theo `queryKey` nên mỗi từ khoá là một query riêng — không ghi đè lẫn nhau, nhưng vẫn tốn băng thông. Cần `AbortSignal` để huỷ thật.

15. **[BIZ]** `setRole()` **dọn sạch** các filter đặc thù role kia (genres, serviceTypes, businessTypes, feeMin/Max, venueType, isAvailable) nhưng **giữ** `query` và `stateProvince`. Quy tắc này từ đâu ra?
    - `↳` Khớp hành vi web. Nhưng nó có nghĩa người dùng mất filter khi đổi role — có nên cảnh báo không?

16. **[SÂU]** `totalResults` chỉ đọc từ **trang 0** (`data?.pages[0]?.data?.total`). Nếu tổng số thay đổi giữa các trang (có người đăng ký mới) thì con số hiển thị sai. Có quan trọng không?

17. **[SÂU]** `getNextPageParam` của `useSearchUsersInfinite` kiểm tra **hai** điều kiện: `lastPageUsers < pageSize` **và** `loadedCount < total`. Vì sao cần cả hai? Điều gì xảy ra nếu backend trả `total` sai?

### B3. Tìm kiếm tổng hợp (Unified Search)

18. **[LUỒNG]** `UnifiedSearchScreen` chạy **hai** infinite query song song. Kể tên và endpoint.
    - `↳` `useUnifiedUserSearch` → `POST /search/users`; `useUnifiedJobSearch` → `jobRepository.getJobs({status:'published', visibility:'public'})`.

19. **[KT]** `useUnifiedSearch.ts` import **cả** `searchRepository` **và** `jobRepository`. Một hook chạm hai feature — đây là chỗ đúng để đặt nó chưa?

20. **[BIZ]** Cả hai query đều `enabled: enabled` (chỉ chạy khi có từ khoá). Người dùng mở màn tìm kiếm mà chưa gõ gì thì thấy gì? Có nên hiện gợi ý / lịch sử tìm kiếm không?

21. **[SÂU]** Hai query có `pageSize` khác nhau không? Nếu người dùng cuộn, cả hai cùng load thêm hay tách biệt? Trải nghiệm ra sao khi một bên hết dữ liệu còn bên kia còn?

---

## C. Business logic

22. **[BIZ]** `SearchUsersRequest` khai báo `capacity`, `openHour`, `rentPrice`, `convenientFacilities`, `sortBy`, `sortOrder` — nhưng **không chỗ nào trong luồng tìm kiếm điền chúng**. Vì sao tồn tại?
    - `↳` Nhiều khả năng sao chép type từ bản web mà không lược bớt. Cần xác nhận và dọn.

23. **[SÂU]** `searchRemoteDataSource.searchUsers` lọc bỏ field `undefined` và chuỗi rỗng trước khi gửi (`Object.fromEntries(...filter)`). Đây có phải là lý do các field chết kia "vô hại"? Nhưng chúng vẫn gây hiểu nhầm cho người đọc code — bạn xử lý sao?

24. **[BIZ]** `searchStore` **không persist**. Người dùng đặt bộ lọc rồi rời app, quay lại thì mất. Đây là chủ đích (bắt đầu sạch) hay thiếu sót?

25. **[BIZ]** `defaultCoverImages.ts` (76 dòng) — ảnh bìa mặc định cho beat/user. Quy tắc chọn ảnh là gì (random, theo id, theo genre)? Có ổn định giữa các lần render không?

26. **[BIZ]** `useGetGenres` đặt `staleTime: 1 giờ` — dài nhất trong nhóm. Hợp lý vì genre hiếm khi đổi. Nhưng nếu admin thêm genre mới thì người dùng phải chờ bao lâu?

---

## D. Đào sâu

27. **[SÂU]** `features/explore/.../CustomTabBar.tsx` là **code chết hoàn toàn** (nhãn hardcode, không có `onPress`, không ai import). Vì sao còn trong repo? Công cụ nào phát hiện?

28. **[SÂU]** `BeatCard`, `BeatList`, `MiniPlayer` nằm trong `features/explore` nhưng chỉ `ChallengeExploreScreen` dùng. Đây là component của feature nào? Di chuyển thì ảnh hưởng bao nhiêu import?

29. **[SÂU]** `ExploreUserCard` (260 dòng) và `shared/presentation/ui/ArtistCardSearch.tsx` (81 dòng) và `features/home/.../ArtistCard.tsx` (164 dòng) — **ba** thẻ hiển thị nghệ sĩ. Chúng khác nhau ở đâu và có gộp được không?

30. **[SÂU]** Tìm kiếm hiện chỉ khớp theo tên/username. Nếu cần tìm theo genre, kỹ năng, vị trí với xếp hạng liên quan (relevance), kiến trúc hiện tại có đỡ được không hay cần search engine riêng (Elasticsearch/Meilisearch)?

31. **[SÂU]** Không có **lịch sử tìm kiếm**, không có **gợi ý (autocomplete)**, không có **analytics** về từ khoá. Bạn ưu tiên thêm cái nào trước và đo hiệu quả bằng gì?

32. **[SÂU]** Nếu số người dùng tăng lên 1 triệu, `POST /search/users` với filter phức tạp sẽ là điểm nghẽn. Client làm gì được để giảm tải (cache, prefetch, giới hạn filter)?

---

## E. Điểm yếu nên chủ động thừa nhận

| Vấn đề                                                 | Hướng trả lời                                                     |
| ------------------------------------------------------ | ----------------------------------------------------------------- |
| Field filter khai báo nhưng không bao giờ gửi          | Thừa nhận là sao chép type từ web; cần dọn                        |
| Ba ô tìm kiếm khác nhau, component chung không ai dùng | Thừa nhận thiếu kỷ luật design system; nêu cách enforce           |
| Debounce lệch nhau (500 vs 400 ms)                     | Thừa nhận thiếu nhất quán; nên gom vào một hằng số dùng chung     |
| Không huỷ request cũ khi gõ tiếp                       | Thừa nhận; nêu `AbortSignal` của React Query v5 làm hướng vá      |
| `totalResults` chỉ lấy từ trang 0                      | Thừa nhận sai lệch nhỏ; nêu ngưỡng khi nó thành vấn đề            |
| `CustomTabBar` code chết                               | Thừa nhận; đề xuất `knip`/`ts-prune` vào CI                       |
| `POST` cho thao tác đọc                                | Giải thích lý do (body filter phức tạp), thừa nhận mất HTTP cache |
| Ba component thẻ nghệ sĩ trùng chức năng               | Thừa nhận trùng lặp; nêu tiêu chí gộp                             |

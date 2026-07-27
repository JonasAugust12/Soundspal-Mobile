# 08 — Hồ sơ nghệ sĩ & venue (Profiles)

> ~8 100 dòng, **29 endpoint**, hai loại hồ sơ khác nhau (artist 7 tab / venue 4 tab).
> Feature có nhiều API vụn nhất — rất tốt để hỏi về thiết kế API và transaction.

## 0. Bản đồ file

| File                                                                                                                                         | Vai trò                                 |
| -------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- |
| [features/profiles/data/datasources/userRemoteDataSource.ts](../../features/profiles/data/datasources/userRemoteDataSource.ts)               | 29 endpoint                             |
| [features/profiles/presentation/hooks/useUserApi.ts](../../features/profiles/presentation/hooks/useUserApi.ts)                               | 333 dòng hook                           |
| [features/profiles/domain/entities/user.type.ts](../../features/profiles/domain/entities/user.type.ts)                                       | 267 dòng — 8 payload cập nhật khác nhau |
| [features/profiles/presentation/screens/ArtistProfileScreen.tsx](../../features/profiles/presentation/screens/ArtistProfileScreen.tsx)       | Hồ sơ nghệ sĩ (450 dòng)                |
| [features/profiles/presentation/screens/VenueEditProfileScreen.tsx](../../features/profiles/presentation/screens/VenueEditProfileScreen.tsx) | Sửa hồ sơ venue (642 dòng)              |
| [features/profiles/presentation/components/profile/InfoProfile.tsx](../../features/profiles/presentation/components/profile/InfoProfile.tsx) | Header hồ sơ                            |
| [features/profiles/domain/utils/profileCompletion.ts](../../features/profiles/domain/utils/profileCompletion.ts)                             | Tính % hoàn thiện hồ sơ                 |

---

## A. Kiến trúc

1. **[KT]** 29 endpoint cho một feature "hồ sơ". **[SÂU]** Vì sao chia nhỏ (`/users/me/basic`, `/contact`, `/social`, `/venue/basic`, `/venue/contact`, `/venue/additional`…) thay vì một `PATCH /users/me`? Ưu điểm và cái giá.

2. **[SÂU]** Chú ý: `updateMyProfile` **là** `PATCH /users/me` (gộp basic + location + offering + availability) — tồn tại song song với các endpoint lẻ. Vậy có **hai cách** làm cùng một việc. Khi nào dùng cái nào? Đây là thiết kế hay di sản?

3. **[KT]** Payload cập nhật có **8 type khác nhau** (`UpdateBasicInfoPayload`, `UpdateContactInfoPayload`, `UpdateSocialLinksPayload`, `UpdateVenueBasicPayload`…). Chi phí bảo trì khi thêm một trường mới?

4. **[KT]** Artist và venue dùng **chung entity `User`** nhưng hiển thị hai màn hoàn toàn khác. Bạn thấy nên tách entity không? Đánh đổi là gì?

5. **[KT]** `profileCompletion.ts` ở `domain/utils` — hàm thuần tính % hoàn thiện. Đây là ví dụ domain logic đúng nghĩa. Quy tắc tính là gì và ai quyết định trọng số?

---

## B. Luồng đi

### B1. Xem hồ sơ người khác

6. **[LUỒNG]** Mở hồ sơ một nghệ sĩ thì app gọi bao nhiêu API song song?
    - `↳` `GET /users/{username}`, `/users/media/{username}`, `/users/videos/all/{username}`, `/users/genres/{username}`, `/users/experiences/{username}` — ít nhất **5 request**.

7. **[SÂU]** 5 request song song cho một màn hình. Có nên gộp thành một `GET /users/{username}/full` không? Bảo vệ cả hai phía.

8. **[LUỒNG]** Nút "Nhắn tin" trên hồ sơ hoạt động thế nào?
    - `↳` `getOrCreateConversation(userData.id)` → `POST /conversations` với `name: 'TL-MESS'`, `isGroup: false` → `router.push('/(messages)/detailMessage', {conversationId})`.

9. **[SÂU]** **Kéo-để-làm-mới ở hồ sơ nghệ sĩ không gọi refetch** — `onRefresh` chỉ `setIsRefetching(true)` rồi `setIsRefetching(false)` ngay lập tức (`ArtistProfileScreen.tsx:95-98`). Người dùng tưởng đã làm mới. Đây là bug hay chưa làm xong?

### B2. Sửa hồ sơ

10. **[LUỒNG]** Người dùng sửa 3 tab rồi bấm Lưu — có **bao nhiêu request**? Có transaction không? Nửa chừng lỗi thì trạng thái ra sao?

11. **[SÂU]** Không có transaction ⇒ hồ sơ có thể ở trạng thái **nửa vời** (basic đã lưu, contact chưa). Bạn xử lý thế nào ở client: rollback, retry, hay báo lỗi từng phần?

12. **[LUỒNG]** `featured-releases` phải gửi **cả mảng** (`PUT /users/me/featured-releases` với `featured_release_links: string[]`), không có API thêm/xoá từng phần tử. Hệ quả khi 2 thiết bị cùng sửa?
    - `↳` Last-write-wins — thiết bị lưu sau ghi đè hoàn toàn. Chưa xử lý.

13. **[BIZ]** `updateUserGenres(username, genreNames)` nhận **username** chứ không phải `me`. Vì sao endpoint sửa dữ liệu của chính mình lại cần username? Có rủi ro phân quyền không?

### B3. Upload ảnh / video

14. **[LUỒNG]** Có mấy loại upload trong feature này và đi đường nào?
    - `↳` avatar, cover, media (portfolio), video — **tất cả** qua `postMultipartWithFetch` + `unwrapUploadPayload`. Đây là feature làm **đúng chuẩn nhất** về upload.

15. **[SÂU]** Vì sao profiles nhớ gọi `unwrapUploadPayload()` mà challenge thì quên? Điều đó nói gì về quy trình review code?

16. **[SÂU]** Upload avatar hardcode `image/jpeg` / `avatar.jpg` bất kể file thật là gì. Người dùng chọn PNG/HEIC thì backend nhận sai MIME. So sánh với `resolveBlogMediaFileMeta()` bên blog (làm đúng) — vì sao hai chỗ khác nhau?

17. **[BIZ]** `deleteUserMedia(mediaId)` / `deleteUserVideo(videoId)` — xoá có xác nhận không? File trên storage có bị xoá theo không hay chỉ xoá bản ghi?

---

## C. Business logic

18. **[BIZ]** `InfoProfile` render icon xác minh (`BadgeCheck`) **không điều kiện** (`InfoProfile.tsx:91`) ⇒ **mọi hồ sơ đều trông như đã xác minh**. Đây là hiểu nhầm nghiêm trọng về độ tin cậy — vì sao chưa sửa? Sửa thì dựa vào field nào?
    - `↳` `authStore` đã có `is_verified`; `User` entity cần field tương ứng từ `/users/{username}`.

19. **[BIZ]** Điểm đánh giá **`4.9`** (nghệ sĩ, `ArtistProfileScreen.tsx:167`) và **`4.8`** (venue, `VenueProfileScreen.tsx:135`) là **số hardcode** — chưa có hệ thống đánh giá. Đây là **dữ liệu giả hiển thị cho người dùng thật**. Bạn bảo vệ thế nào?
    - `↳` Không nên bảo vệ. Trả lời đúng: thừa nhận là placeholder lọt ra production, phải ẩn đi cho tới khi có hệ thống rating thật.

20. **[BIZ]** `PremiumBadge` hiển thị dựa trên `isPremiumActive()` (`shared/domain/utils/premium.ts`). Vì sao badge Premium làm đúng mà badge xác minh làm sai? Rút ra bài học gì?

21. **[BIZ]** Hồ sơ nghệ sĩ có 7 tab, venue có 4 tab. Kể tên và cho biết tab nào bắt buộc điền để hồ sơ được coi là "hoàn thiện".

22. **[BIZ]** `ProfileCompletionBar` khuyến khích điền đủ hồ sơ. Có ràng buộc nghiệp vụ nào gắn với % này không (ví dụ hồ sơ < 50% thì không được ứng tuyển)?

23. **[BIZ]** `VenueOpenJobs` lọc danh sách tin công khai theo `creator_username` **ở phía client** ⇒ tin ngoài trang 1 bị bỏ sót. Vì sao không dùng filter của backend?

24. **[BIZ]** Thuật ngữ vai trò: `producer` → "Nhà sản xuất", `venue` → "Nhà tuyển dụng", `singer` → "Ca sĩ". Vì sao `venue` không dịch là "Địa điểm"? Có chỗ nào dùng nhầm bản dịch không?

---

## D. Bên thứ ba & thư viện

25. **[3RD]** YouTube: app **chỉ mở app ngoài**, không có player trong app. Vì sao? (Chính sách YouTube, kích thước bundle, hay đơn giản là chưa làm?)

26. **[3RD]** Regex rút video id 11 ký tự có xử lý được `youtu.be/`, `/shorts/`, `/live/`, và URL có `?t=`/playlist không? Nếu không thì người dùng dán link dạng nào sẽ hỏng?

27. **[3RD]** `BlurView` trên Android "gần như không có blur thật". Bạn chấp nhận khác biệt nền tảng hay tìm giải pháp thay thế? Cân nhắc chi phí hiệu năng.

28. **[3RD]** `SocialLinksForm` validate URL bằng Zod `z.string().url()`. Có chặn được `javascript:` scheme không? Người dùng dán link độc hại rồi người khác bấm vào thì sao?

---

## E. Đào sâu

29. **[SÂU]** `useUpdateBasicInfo`, `useUploadFile` là **code chết**; route `mediaGallery` **không khai trong `_layout.tsx`**. Bao nhiêu % feature này không được dùng? Công cụ nào phát hiện?

30. **[SÂU]** Nếu backend gộp 29 endpoint thành 3, bạn xoá được bao nhiêu code ở client? Có mất gì không?

31. **[SÂU]** `getUserExperiences()` phòng thủ 3 dạng response (`Array`, `data.experiences`, `data.items`). Cùng câu hỏi như bên blog: phòng thủ hay che giấu?

32. **[SÂU]** Hồ sơ là dữ liệu công khai — có cần cache khác biệt so với dữ liệu riêng tư không? Hiện `staleTime` cho `/users/{username}` là bao nhiêu và có hợp lý không?

33. **[SÂU]** Nếu một nghệ sĩ có 500 ảnh portfolio, `PortfolioGalleryScreen` xử lý thế nào? Có lazy load / virtualization không?

34. **[SÂU]** Dữ liệu cá nhân (email, SĐT, ảnh) — app có tuân thủ Nghị định 13/2023 / GDPR không? Có màn **"xoá tài khoản"** không (Google Play bắt buộc từ 2024)?

---

## F. Điểm yếu nên chủ động thừa nhận

| Vấn đề                                            | Hướng trả lời                                                                    |
| ------------------------------------------------- | -------------------------------------------------------------------------------- |
| Icon xác minh hiện cho **mọi** hồ sơ              | Bug nghiêm trọng về độ tin cậy; sửa 1 dòng, ưu tiên cao                          |
| Rating 4.9/4.8 hardcode                           | Dữ liệu giả cho người dùng thật — thừa nhận thẳng, đề xuất ẩn ngay               |
| Kéo-để-làm-mới không refetch                      | Bug thật, người dùng bị đánh lừa                                                 |
| Không transaction khi lưu nhiều tab               | Thừa nhận; nêu hướng gộp về `PATCH /users/me` hoặc saga ở client                 |
| `featured-releases` gửi cả mảng ⇒ last-write-wins | Thừa nhận race condition chưa xử lý; nêu hướng optimistic locking                |
| Avatar hardcode MIME `image/jpeg`                 | Thừa nhận; blog đã có helper đúng, chỉ cần tái dùng                              |
| Không có màn xoá tài khoản                        | Yêu cầu bắt buộc của Google Play — nêu là việc phải làm trước khi phát hành rộng |

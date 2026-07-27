# 06 — Blog & bình luận

> Feature chịu **nhiều nợ hợp đồng API nhất**: envelope không nhất quán, thiếu endpoint chi tiết,
> read-after-write không đảm bảo. Rất tốt để hỏi về "làm việc với backend chưa ổn định".

## 0. Bản đồ file

| File                                                                                                                         | Vai trò                                                              |
| ---------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| [features/blog/data/datasources/blogRemoteDataSource.ts](../../features/blog/data/datasources/blogRemoteDataSource.ts)       | 316 dòng — gồm cả `extractArrayFromEnvelope`, `enrichCommentAuthors` |
| [features/blog/data/mappers/blogPostMapper.ts](../../features/blog/data/mappers/blogPostMapper.ts)                           | Map `BlogItem` → `BlogPost` (có hardcode)                            |
| [features/blog/data/utils/blogMediaUtils.ts](../../features/blog/data/utils/blogMediaUtils.ts)                               | **Bản sao riêng** của helper upload                                  |
| [features/blog/presentation/hooks/useBlogApi.ts](../../features/blog/presentation/hooks/useBlogApi.ts)                       | 264 dòng — hook + `setQueryData` thủ công                            |
| [features/blog/presentation/store/blogBookmarkStore.ts](../../features/blog/presentation/store/blogBookmarkStore.ts)         | Bookmark lai client + server                                         |
| [features/blog/presentation/components/CreateBlogModal.tsx](../../features/blog/presentation/components/CreateBlogModal.tsx) | 668 dòng                                                             |

---

## A. Kiến trúc

1. **[KT]** Blog có `data/mappers/` riêng (3 mapper) — feature duy nhất tách mapper thành thư mục. Vì sao ở đây cần mà chỗ khác không?

2. **[KT]** `blogMediaUtils.ts` có `postStorageUploadWithFetch()` — gần như **sao chép** `postMultipartWithFetch()` ở `shared/infrastructure/api/multipartUpload.ts`. Vì sao có bản sao? Khác nhau chỗ nào?
    - `↳` Bản blog hardcode path `/storage/upload`, log chi tiết hơn, và có `extractStorageUploadUrl()` chấp nhận cả `url` lẫn `data.file_url`.

3. **[KT]** `blogRemoteDataSource` gọi `apiClient.get(...)` trực tiếp thay vì `createApiCall`. Vì sao lệch chuẩn so với các feature khác?

4. **[KT]** `AddBlogPostMediaUseCase` là use case duy nhất của blog. Nó chứa logic gì thực sự?

---

## B. Luồng đi

### B1. Xem danh sách bài

5. **[LUỒNG]** `fetchBlogPosts()` gọi endpoint nào và map ra sao?
    - `↳` `GET /blogs` với `topic_id`/`author_id`/`page_size`/`page` → `response.data.data.items` → `mapBlogItemToBlogPost()`.

6. **[BIZ]** Tham số phân trang được tính từ `offset`/`limit`: `page = Math.floor(offset/limit) + 1`. Điều gì xảy ra nếu `offset` không chia hết cho `limit`?

### B2. Xem chi tiết bài — điểm yếu lớn nhất

7. **[LUỒNG]** Backend **không có `GET /blogs/{id}`**. `useBlogArticle` xử lý thế nào?
    - `↳` `useBlogApi.ts:233-240` — `fetchQuery` **toàn bộ feed** rồi `.find(p => p.id === articleId)`; không thấy thì ném `'Blog not found'`.

8. **[SÂU]** Hệ quả cụ thể: bài không nằm trong feed trả về ⇒ hiện **"Blog not found"** dù bài tồn tại; deep link tới bài cũ **gãy**. Vì sao chưa yêu cầu backend bổ sung endpoint? Bạn ước lượng chi phí sửa ở backend là bao nhiêu?

9. **[SÂU]** Nếu không thể sửa backend, bạn vá ở client thế nào cho đỡ tệ hơn? (Gợi ý: phân trang dò như `findOwnedJobById` bên jobs, hoặc dùng `/blogs/search?q=`.)

### B3. Upload ảnh bìa & media

10. **[LUỒNG]** Kể luồng upload ảnh cho bài blog.
    - `↳` `resolveBlogMediaFileMeta()` (đoán tên + MIME) → `postStorageUploadWithFetch()` → `extractStorageUploadUrl()` → `POST /blogs/{id}/media` với `media_type` từ `apiMediaKindFromMime()`.

11. **[BIZ]** `resolveBlogMediaFileMeta()` tự sinh tên `cover_<timestamp>.<ext>` khi file không có đuôi. Bảng map MIME → đuôi hỗ trợ png/webp/gif/heic, còn lại fallback `jpg`. Có trường hợp nào sai không?

12. **[SÂU]** So sánh với avatar ở feature profiles (hardcode `image/jpeg` + `avatar.jpg`). Blog làm **đúng hơn** — vì sao hai chỗ lại khác nhau? Bạn thống nhất thế nào?

### B4. Bình luận

13. **[LUỒNG]** `useCreateComment` **không** chỉ invalidate mà **ghi thẳng cache** bằng `setQueryData`. Vì sao?
    - `↳` Comment `useBlogApi.ts:147-149`: refetch chạy đua với backend (đọc trễ) → bình luận không hiện, phải reload mới thấy.

14. **[SÂU]** Đây là dấu hiệu backend chưa **read-after-write consistent**. Rủi ro cache lệch thật là gì? Nếu tạo thất bại một nửa (server tạo được nhưng response lỗi) thì sao?

15. **[LUỒNG]** `useCreateComment` còn tự điền `author` từ `authStore`. Vì sao?
    - `↳` API tạo comment không trả kèm tên/avatar → nếu không điền sẽ hiện `'User'` + avatar mặc định.

16. **[LUỒNG]** `enrichCommentAuthors()` gọi thêm `GET /users/{id}` cho từng tác giả thiếu thông tin. Chi phí là bao nhiêu request cho một trang 20 bình luận của 15 người khác nhau?
    - `↳` 15 request song song (`Promise.all`), dedupe bằng `Set` theo `author_id`. Backend nên trả kèm — đây là N+1 ở client.

17. **[BIZ]** `parentId` được giữ từ response, thiếu thì lấy từ request. Vì sao cần phòng thủ hai lớp?

### B5. Bookmark

18. **[LUỒNG]** Bookmark blog là **client hay server**?
    - `↳` Cả hai: gọi `POST/DELETE /blogs/{id}/bookmark` **và** lưu nguyên object vào MMKV qua `blogBookmarkStore`.

19. **[SÂU]** Lưu **cả object `BlogPost`** vào MMKV = copy server state sang client state — đúng thứ mà nguyên tắc React Query/Zustand khuyên tránh. Vì sao chấp nhận? Dữ liệu bookmark cũ (tiêu đề, ảnh, số like) stale thì xử lý sao?

20. **[SÂU]** `mergeServer()` có chốt `if (!serverPosts.length) return state`. Chốt này che giấu trường hợp nào?
    - `↳` Người dùng **thật sự đã xoá hết bookmark** trên web → server trả mảng rỗng → app giữ nguyên danh sách cũ. Xung đột này chưa có cách giải.

21. **[BIZ]** Bookmark **blog** có API, bookmark **job** thì hoàn toàn client-side (không endpoint), bookmark **beat** lại có API riêng (`/beats/{id}/bookmark`). Ba feature, ba cách. Giải thích và nêu cách thống nhất.

---

## C. Business logic

22. **[BIZ]** `mapBlogItemToBlogPost()` **hardcode 3 field**. Kể tên và giải thích hệ quả.
    - `↳` `creator_display_name: 'Tác giả'`, `creator_role: 'user'`, `category: 'BÀI VIẾT'`. Hệ quả: `creatorRoleLabel()` thành code chết, mọi bài đều hiện cùng một tên tác giả.

23. **[BIZ]** `creator_username` bị gán bằng `author_id`. Người dùng thấy một chuỗi id thay vì tên. Đây là bug hay chờ backend?

24. **[BIZ]** `publishedAt` được format thành chuỗi `dd/MM/yyyy` **ngay trong mapper** (tầng data). Đúng chỗ chưa? Nếu sau này cần "3 giờ trước" thì sửa ở đâu?

25. **[BIZ]** Bài chưa xuất bản hiện `'Chưa xuất bản'`. Quy tắc phân biệt draft/published nằm ở đâu — client hay server?

26. **[SÂU]** `extractArrayFromEnvelope()` bóc **3 tầng** và chấp nhận **6 tên trường** (`items`, `data`, `posts`, `bookmarks`, `comments`, `records`). Đây là lập trình phòng thủ hay che giấu việc không nắm được hợp đồng API? Bảo vệ quan điểm của bạn.

27. **[SÂU]** So sánh với `unwrapBlogData()` (chỉ bóc 1 tầng và **ném lỗi** nếu không đúng dạng). Hai hàm cùng file, hai triết lý ngược nhau — vì sao?

---

## D. Bên thứ ba & thư viện

28. **[3RD]** `react-native-render-html` render HTML từ nội dung bài viết. Có **sanitize** không? Nguy cơ XSS / script injection từ nội dung backend là gì trên React Native?
    - `↳` Trả lời tốt: RN không có DOM/JS execution như browser, nên XSS cổ điển không áp dụng; nhưng vẫn có rủi ro qua thẻ `<iframe>`, link `javascript:`, hoặc thư viện tự mở WebView.

29. **[3RD]** `VoicePlayer` và `VoiceCommentButton` — bình luận giọng nói. `VoiceCommentButton` **không được import ở đâu**. Tính năng này có thật sự chạy không?

30. **[SÂU]** `TagSelector`, `useBlogPosts`, `useAddBlogComment`, `useAddCommentLike`, `BLOG_FEED_TABS` — đều là code chết. Bao nhiêu % feature này là code chết? Có công cụ nào phát hiện (`ts-prune`, `knip`) không?

31. **[SÂU]** `useAddBlogComment` được đánh dấu `@deprecated` và trả về object giả (`{id: 'deprecated'}`). Vì sao giữ thay vì xoá?

---

## E. Đào sâu

32. **[SÂU]** `useBlogFeed` đặt `staleTime: 5 phút` còn `useBlogPosts` đặt `staleTime: 0`. Hai hook cùng gọi một hàm với cấu hình ngược nhau. Giải thích, hoặc thừa nhận là thiếu nhất quán.

33. **[SÂU]** `useBlogSearch` dùng `placeholderData: (prev) => prev` — giữ kết quả cũ khi gõ tiếp. Trải nghiệm này tên là gì trong React Query và nó khác `keepPreviousData` cũ ra sao?

34. **[SÂU]** `useBlogTopics` đặt `staleTime: 30 phút`, `gcTime: 60 phút` — dài nhất dự án. Vì sao hợp lý ở đây?

35. **[SÂU]** Nếu backend bổ sung `GET /blogs/{id}` ngày mai, bạn xoá được bao nhiêu code? Liệt kê chính xác file và hàm.

36. **[SÂU]** `CreateBlogModal` 668 dòng + `EditBlogModal` 530 dòng, phần lớn logic trùng nhau. Bạn refactor theo hướng nào mà không phá vỡ hành vi?

---

## F. Điểm yếu nên chủ động thừa nhận

| Vấn đề                                                   | Hướng trả lời                                                                    |
| -------------------------------------------------------- | -------------------------------------------------------------------------------- |
| Không có `GET /blogs/{id}` ⇒ fetch cả feed rồi `.find()` | Lỗi nghiêm trọng nhất của feature; nêu rõ triệu chứng + chi phí sửa BE           |
| Mapper hardcode tên tác giả / category                   | Thừa nhận là placeholder chờ backend, không phải thiết kế                        |
| `extractArrayFromEnvelope` bóc 3 tầng, 6 khoá            | Thừa nhận là triệu chứng, không phải giải pháp; cần chốt hợp đồng API            |
| `setQueryData` thay vì invalidate                        | Giải thích lý do (read-after-write) — đây là quyết định **đúng** trong hoàn cảnh |
| `mergeServer` không xử lý xoá hết bookmark               | Thừa nhận là xung đột chưa giải, nêu hướng (tombstone / timestamp)               |
| Bản sao helper upload                                    | Thừa nhận trùng lặp; nêu cách gom về `shared`                                    |
| Nhiều code chết                                          | Thừa nhận thiếu công cụ; đề xuất `knip` vào CI                                   |

# 02 — Tuyển dụng / Tin đăng (Jobs)

> Feature lớn nhất dự án: ~9 300 dòng, 18 endpoint, 2 vai trò (venue đăng tin / artist ứng tuyển).

## 0. Bản đồ file

| File                                                                                                                               | Vai trò                                          |
| ---------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| [features/jobs/data/datasources/jobRemoteDataSource.ts](../../features/jobs/data/datasources/jobRemoteDataSource.ts)               | 18 endpoint, tự chọn `/posts` vs `/posts/search` |
| [features/jobs/data/repositories/jobRepositoryHelpers.ts](../../features/jobs/data/repositories/jobRepositoryHelpers.ts)           | Vá 3 khoảng hở của backend                       |
| [features/jobs/presentation/hooks/useJobApi.ts](../../features/jobs/presentation/hooks/useJobApi.ts)                               | 17 hook + `jobKeys`                              |
| [features/jobs/domain/entities/job.type.ts](../../features/jobs/domain/entities/job.type.ts)                                       | Enum trạng thái (329 dòng)                       |
| [features/jobs/presentation/screens/RecruitmentFormScreen.tsx](../../features/jobs/presentation/screens/RecruitmentFormScreen.tsx) | Wizard tạo tin 4 bước (805 dòng)                 |
| [features/jobs/presentation/screens/EditJobScreen.tsx](../../features/jobs/presentation/screens/EditJobScreen.tsx)                 | Sửa tin (840 dòng)                               |
| [features/jobs/presentation/screens/JobApplicantsScreen.tsx](../../features/jobs/presentation/screens/JobApplicantsScreen.tsx)     | Venue duyệt đơn                                  |

---

## A. Kiến trúc

1. **[KT]** Jobs là một trong ít feature có `domain/usecases` (`GetJobsUseCase`, `SubmitJobApplicationUseCase`). Hai use case này chứa logic gì? Nếu không có logic thì chúng tồn tại để làm gì?

2. **[KT]** `jobRepositoryHelpers.ts` nằm ở tầng **data** nhưng chứa quy tắc nghiệp vụ (dựng payload đầy đủ, dò bài của mình khi 404). Đặt ở đây đúng chưa, hay nên lên `domain`?

3. **[KT]** `jobKeys` được gom thành object có phân cấp (`all → lists → list(params)`). Giải thích lợi ích khi invalidate và cho ví dụ: sau `useCreateJob` thì những query nào bị vô hiệu hoá?
    - `↳` `invalidateQueries({queryKey: jobKeys.lists()})` quét mọi query bắt đầu bằng `['jobs','list']`, kể cả `infinite`.

4. **[KT]** Feature `collab` **sao chép** type, endpoint và response shape của jobs, tạo hai cache riêng. Đây là lỗi thiết kế hay quyết định có chủ đích? Hậu quả người dùng gặp là gì?

---

## B. Luồng đi

### B1. Xem danh sách tin

5. **[LUỒNG]** `jobRemoteDataSource.getJobs()` tự chọn giữa **hai endpoint**. Quy tắc chọn là gì?
    - `↳` Có `search` **và không** có filter nâng cao → `/posts/search`. Còn lại → `/posts` (endpoint hỗ trợ `JobPostFilters`), vẫn đính `q` để BE lọc thêm nếu hỗ trợ.

6. **[SÂU]** Logic chọn endpoint này đặt ở **client** có đúng chỗ chưa, hay nên để backend gộp một endpoint? Bảo vệ lựa chọn hiện tại.

7. **[LUỒNG]** `useGetJobsInfinite` xác định trang kế tiếp thế nào khi backend **có** và **không** trả `pagination`?
    - `↳` `getJobListNextPageParam()` — có `pagination` thì so `current_page >= total_pages`; không có thì đoán bằng `posts.length < pageSize`.

8. **[SÂU]** `useGetJobsInfinite` đặt `refetchOnMount: false`. Người dùng vào chi tiết rồi quay ra, dữ liệu có tự làm mới không? Đánh đổi với việc giữ vị trí cuộn?

### B2. Xem chi tiết tin

9. **[LUỒNG]** `GET /posts/{id}` trả **404 cho chính bài nháp của mình**. App xử lý ra sao?
    - `↳` `getJobByIdWithOwnedFallback()` — bắt 404 → `findOwnedJobById()` phân trang `/posts/me` 50 bài/trang cho đến khi tìm thấy.

10. **[SÂU]** Bài nháp thứ 200 thì mất bao nhiêu request? Vì sao chọn vá ở client thay vì yêu cầu backend sửa? Bạn ước lượng chi phí sửa ở backend là bao nhiêu?

11. **[LUỒNG]** `useGetJobById` còn có `placeholderData` lấy từ cache `myPosts`. Cơ chế đó giúp gì và có rủi ro hiển thị dữ liệu cũ không?
    - `↳` `findJobInMyPostsQueryCache()` quét mọi trang infinite của `myPosts` để hiện ngay trong lúc chờ API.

### B3. Tạo tin (wizard 4 bước)

12. **[LUỒNG]** Kể 4 bước của wizard và cho biết bước nào có validate.

13. **[SÂU]** Chỉ bước 1 validate ⇒ người dùng đi tới bước 4 với dữ liệu rỗng. Đây là chủ đích (cho phép lưu nháp) hay thiếu sót? Nếu là nháp thì tại sao không tách rõ "lưu nháp" vs "xuất bản"?

14. **[BIZ]** Ô ngân sách ở màn **tạo** nhập theo **triệu** (nhân ×1 000 000), màn **sửa** nhập thẳng **VND**. Cùng một trường, hai đơn vị. Điều gì xảy ra khi người dùng sửa lại bài vừa tạo?

### B4. Sửa / đóng / mở lại tin

15. **[LUỒNG]** `PUT /posts/{id}` **không phải partial update**. App dựng body thế nào?
    - `↳` `buildUpdatePayloadFromJob(job, overrides)` — copy đủ 20 field từ object hiện có rồi ghi đè phần thay đổi.

16. **[SÂU]** Thêm một trường mới vào `Job` mà quên cập nhật `buildUpdatePayloadFromJob` ⇒ **mất dữ liệu im lặng**. Có cách nào bắt lỗi này ở **type level** không?
    - `↳` Hướng: dùng `Record<keyof UpdateJobRequest, ...>` để TS bắt buộc liệt kê đủ khoá (exhaustiveness check).

17. **[LUỒNG]** Backend **không có endpoint "mở lại tuyển dụng"**. `reopenOwnedJob()` ghép thế nào và rủi ro ra sao?
    - `↳` Fetch full job (có fallback 404) → `buildUpdatePayloadFromJob(job, {status:'published'})` → `PUT`. Không có transaction: fetch xong mà PUT lỗi thì không đổi gì, nhưng nếu job bị sửa giữa chừng thì ghi đè bằng bản cũ.

18. **[BIZ]** Vì sao không dùng `/posts/{id}/publish` để mở lại?
    - `↳` `/publish` chỉ nhận bài ở trạng thái `draft`, không nhận `closed`.

### B5. Ứng tuyển & duyệt đơn

19. **[LUỒNG]** Artist ứng tuyển: kể luồng từ `JobApplyModal` tới lúc thấy đơn trong "Đơn của tôi".
    - `↳` `POST /posts/{jobId}/submit` → invalidate `jobKeys.detail(jobId)` + `jobKeys.mySubmissions()`.

20. **[LUỒNG]** Venue duyệt đơn: hai đường đơn lẻ và hàng loạt là gì, và invalidate những key nào?
    - `↳` `PUT /submissions/{id}/review` và `POST /submissions/bulk-action`; cả hai invalidate `jobSubmissions(jobId)`, `detail(jobId)`, `pendingCount()`.

21. **[BIZ]** `JobApplicantsScreen` tải **một trang 50 đơn, không phân trang**. Bài có 200 ứng viên thì sao? Đây là giới hạn chấp nhận được ở phạm vi hiện tại không?

---

## C. Business logic

22. **[BIZ]** Có **hai enum trạng thái không tương thích**: `ApplicationStatus` (4 giá trị) và `SubmissionStatus` (7 giá trị). Vì sao tồn tại cả hai? Đã gây bug gì chưa?
    - `↳` `job.type.ts:165` vs `job.type.ts:199`. `Application` là entity cũ, `OpportunitySubmission` là entity mới — chưa hợp nhất.

23. **[BIZ]** `skipped` là giá trị hợp lệ của cả `SubmissionStatus` lẫn `ReviewActionType`, nhưng UI **không bao giờ phát hành động `skip`**. Code chết hay tính năng dở dang?

24. **[BIZ]** Body review chỉ gửi `{ action }`, **không bao giờ gửi `review_notes`** dù API hỗ trợ. Rút đơn thì gửi `{ reason: '' }` **luôn rỗng**. Giải thích.

25. **[BIZ]** Deadline lưu dạng chuỗi `dd-MM-yyyy`, **không phải ISO 8601**. Timezone xử lý ở đâu? `is_deadline_passed` được tính ở client hay server?

26. **[BIZ]** Công tắc thù lao bị **đảo**: `isFixed = !is_negotiable`. Vì sao lại đảo và có test không?

27. **[BIZ]** `useGetPendingApplicationsCount` đặt `refetchInterval: 60000`. Nó có **tiếp tục poll khi app ở nền** không? Đo pin/băng thông chưa? React Query có cơ chế nào dừng khi app inactive không?

28. **[BIZ]** Ba tab danh sách được **mount cùng lúc** và ẩn bằng `display:none`. Đánh đổi giữa giữ vị trí cuộn và bộ nhớ/số request là gì? Với 3 infinite list thì tốn bao nhiêu RAM?

---

## D. Đào sâu

29. **[SÂU]** Ứng tuyển từ màn job có thể mở thẳng chat với người đăng, và tin nhắn đầu tiên được bọc `:::JOB_REF:{json}:::`. Hợp đồng này thuộc jobs hay messaging? Ai sở hữu và version hoá nó?
    - `↳` Xem thêm [03-messaging.md](03-messaging.md) mục JOB_REF.

30. **[SÂU]** Nếu backend chuyển `PUT /posts/{id}` sang PATCH partial update, bạn xoá được bao nhiêu code ở client? Liệt kê chính xác.

31. **[SÂU]** `MediaPicker` cho tin tuyển dụng đi đường upload nào — axios hay fetch? Chỗ đó có nhất quán với profiles/challenge không?

32. **[SÂU]** Thiết kế lại phân trang cho `JobApplicantsScreen`: bạn chọn infinite scroll hay phân trang số? Vì sao, xét đến hành vi "duyệt hàng loạt"?

33. **[SÂU]** Nếu số tin tăng lên 100 000 và backend không đổi, đâu là điểm nghẽn đầu tiên ở client?

---

## E. Điểm yếu nên chủ động thừa nhận

| Vấn đề                                             | Hướng trả lời                                                               |
| -------------------------------------------------- | --------------------------------------------------------------------------- |
| Ngân sách hai đơn vị (triệu vs VND)                | Bug UX thật, sửa nhanh, nên gom về một helper duy nhất                      |
| `buildUpdatePayloadFromJob` dễ mất dữ liệu im lặng | Thừa nhận, nêu giải pháp exhaustiveness check ở type level                  |
| Dò `/posts/me` 50 bài/trang để tìm bài nháp        | Nợ của backend, client gánh tạm; nêu chi phí thật khi dữ liệu lớn           |
| Hai enum trạng thái chồng nhau                     | Kế hoạch hợp nhất về `SubmissionStatus`, giữ `ApplicationStatus` deprecated |
| `JobApplicantsScreen` không phân trang             | Thừa nhận giới hạn 50, nêu ngưỡng dữ liệu mà nó bắt đầu sai                 |
| `review_notes` / `reason` không bao giờ được gửi   | Tính năng dở dang, không phải quyết định thiết kế                           |

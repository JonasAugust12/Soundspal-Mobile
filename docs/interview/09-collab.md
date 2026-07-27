# 09 — Cộng tác / Quản lý đơn ứng tuyển (Collab)

> Feature nhỏ (~1 000 dòng) nhưng là **case study tốt nhất về nợ kiến trúc**: nó gần như
> sao chép feature `jobs`. Rất hay để hỏi "vì sao trùng lặp và cái giá phải trả".

## 0. Bản đồ file

| File                                                                                                                                                 | Vai trò                                         |
| ---------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| [features/collab/data/datasources/collabRemoteDataSource.ts](../../features/collab/data/datasources/collabRemoteDataSource.ts)                       | 6 endpoint — **trùng gần hết với jobs**         |
| [features/collab/domain/entities/collaboration.type.ts](../../features/collab/domain/entities/collaboration.type.ts)                                 | `SubmissionStatus` **4 giá trị**                |
| [features/collab/presentation/hooks/useCollabApi.ts](../../features/collab/presentation/hooks/useCollabApi.ts)                                       | `collabKeys` — cache riêng, tách khỏi `jobKeys` |
| [features/collab/presentation/components/CollabList.tsx](../../features/collab/presentation/components/CollabList.tsx)                               | Rẽ nhánh theo tab                               |
| [features/collab/presentation/components/CollabStatusBadge.tsx](../../features/collab/presentation/components/CollabStatusBadge.tsx)                 | Badge trạng thái, `switch` **không có default** |
| [features/collab/presentation/components/OpportunitySubmissionCard.tsx](../../features/collab/presentation/components/OpportunitySubmissionCard.tsx) | Thẻ đơn ứng tuyển                               |

---

## A. Kiến trúc

1. **[KT]** Đối chiếu `collabRemoteDataSource` với `jobRemoteDataSource`: những endpoint nào **trùng hoàn toàn**?
    - `↳` `/my-submissions`, `/posts/me`, `/posts/{id}/submissions`, `/submissions/{id}/withdraw`, `/submissions/{id}/review` — 5/6 endpoint trùng. Chỉ `/my-posts/submissions` là riêng.

2. **[SÂU]** Hệ quả trực tiếp của việc trùng lặp: **hai cache React Query riêng biệt** (`jobKeys` và `collabKeys`) cho cùng dữ liệu. Người dùng rút đơn ở màn Collab thì màn "Đơn của tôi" bên Jobs có cập nhật không?
    - `↳` **Không** — `useWithdrawSubmission` của collab chỉ invalidate `collabKeys.mySubmissions()`, không đụng tới `jobKeys.mySubmissions()`.

3. **[SÂU]** Đây là lỗi thiết kế hay quyết định có chủ đích? Nếu hợp nhất, bạn hợp nhất theo hướng nào — xoá collab, xoá phần trùng ở jobs, hay tách một module `submissions` dùng chung?

4. **[KT]** `SubmissionStatus` của collab có **4 giá trị**, của jobs có **7 giá trị**. Hai type cùng tên, khác nội dung, cùng map một endpoint backend. Điều gì xảy ra khi backend trả `expired` hoặc `skipped`?

5. **[KT]** `collab` import `JobListResponse` từ `features/jobs` (`collabRemoteDataSource.ts:9`). Vậy hai feature **đã** phụ thuộc nhau. Ranh giới feature còn ý nghĩa không?

---

## B. Luồng đi

6. **[LUỒNG]** Hai tab của màn Collab là gì và mỗi tab gọi endpoint nào?
    - `↳` Tab **"Đã gửi"** → `GET /my-submissions` (đơn tôi nộp). Tab **"Nhận được"** → `GET /posts/me` (**bài đăng của tôi**, không phải đơn nhận được).

7. **[SÂU]** Tab "Nhận được" thực chất liệt kê **bài đăng của tôi**, không phải đơn nhận được. Người dùng phải bấm vào từng bài mới thấy danh sách đơn. Đây là lỗi đặt tên hay thiết kế 2 cấp có chủ đích? Bạn đặt lại tên thế nào?

8. **[LUỒNG]** Từ tab "Nhận được", luồng xem đơn của một bài đi qua mấy màn?
    - `↳` `CollabList` → `JobPostCard.onPress` → `onViewJobSubmissions(jobId, jobTitle)` → màn danh sách đơn (`GET /posts/{id}/submissions`).

9. **[LUỒNG]** Rút đơn: kể luồng đầy đủ và cho biết body gửi lên là gì.
    - `↳` `PUT /submissions/{id}/withdraw` với `{ reason }` — nhưng UI có thực sự thu thập `reason` không, hay luôn gửi chuỗi rỗng?

10. **[LUỒNG]** Duyệt đơn (`useReviewSubmission`) invalidate key nào? Nó có invalidate `mySubmissions` của người nộp không?
    - `↳` Chỉ `collabKeys.opportunitySubmissions()`. Người nộp không thấy cập nhật cho tới khi cache hết hạn.

---

## C. Business logic

11. **[BIZ]** `CollabStatusBadge.getStatusConfig()` là `switch` **không có `default`**. Backend trả về giá trị thứ 5 thì chuyện gì xảy ra?
    - `↳` `getStatusConfig()` trả `undefined` → `config.icon` ném `TypeError` → **crash component**, không phải hiển thị sai. Đây là lỗi nghiêm trọng hơn nhiều so với "hiển thị badge trống".

12. **[SÂU]** TypeScript **không bắt được** lỗi này. Vì sao? Cách nào bắt được ở compile time?
    - `↳` TS suy kiểu trả về là `Config | undefined` nhưng code không bật `noUncheckedIndexedAccess`/strict null ở chỗ dùng. Cách chuẩn: thêm `default` với `never` check, hoặc dùng `Record<SubmissionStatus, Config>` để TS bắt buộc liệt kê đủ.

13. **[BIZ]** `CollabList` **thiếu nhánh `return` cuối cùng** — an toàn chỉ vì `tab` là union 2 giá trị. Thêm giá trị thứ ba = render `undefined`. Vì sao TypeScript không cảnh báo?
    - `↳` Kiểu trả về của component là `JSX.Element` được suy ra, không được khai báo tường minh. Khai báo `(): JSX.Element` sẽ khiến TS báo lỗi "not all code paths return a value".

14. **[BIZ]** `JobPostCard` map `total_submissions: post.applications_count || 0`. Nếu backend không trả `applications_count` thì venue thấy "0 đơn" dù thực tế có đơn. Đã kiểm chứng field này chưa?

15. **[BIZ]** `submission_deadline` được gán bằng `post.deadline`. Hai khái niệm này giống nhau hay khác nhau về nghiệp vụ (hạn nộp đơn vs hạn của công việc)?

16. **[BIZ]** `post_type: post.post_type || post.type` — hai field cho cùng một khái niệm. Vì sao? Field nào là chuẩn?

---

## D. Đào sâu

17. **[SÂU]** `useGetMyPostedJobsSubmissions` — phân tích hàm này và chỉ ra **ba** vấn đề.
    - `↳` (1) Chỉ truy vấn **bài đầu tiên** (`postsData?.posts?.[0]?.id`) rồi coi như là "tất cả đơn"; (2) **bỏ qua** endpoint `/my-posts/submissions` vốn đã có sẵn trong datasource và đúng mục đích; (3) **không màn hình nào gọi nó** — code chết.

18. **[SÂU]** Vì sao một hàm vừa sai vừa thừa lại tồn tại? Điều đó nói gì về quy trình review?

19. **[SÂU]** `OpportunitySubmissionCard` bọc `ScrollView` **lồng trong `ScrollView` cùng trục dọc** (`CollabList` render `ScrollView`, card lại là `ScrollView`). Hậu quả là gì?
    - `↳` Cuộn giật, gesture tranh nhau, RN cảnh báo `VirtualizedLists should never be nested`. Cách sửa: card dùng `View`, hoặc dùng `FlatList` cho danh sách ngoài.

20. **[SÂU]** Cả hai tab đều dùng `ScrollView` + `.map()` với `pageSize: 20` cố định, **không phân trang, không infinite scroll**. So sánh với `useGetJobsInfinite` bên jobs (đã làm infinite). Vì sao collab không?

21. **[SÂU]** Nếu bạn được 1 ngày để dọn feature này, bạn làm gì theo thứ tự ưu tiên?
    - `↳` Gợi ý thứ tự: (1) thêm `default` cho badge (chống crash); (2) xoá `useGetMyPostedJobsSubmissions`; (3) bỏ `ScrollView` lồng nhau; (4) hợp nhất cache với `jobKeys`; (5) đổi tên tab.

22. **[SÂU]** Về lâu dài: xoá hẳn feature `collab` và gộp vào `jobs` thì mất gì, được gì? Ước lượng số file bị ảnh hưởng.

---

## E. Điểm yếu nên chủ động thừa nhận

| Vấn đề                                             | Hướng trả lời                                                                  |
| -------------------------------------------------- | ------------------------------------------------------------------------------ |
| Sao chép gần như toàn bộ `jobs`                    | Thừa nhận là nợ kiến trúc, không phải thiết kế; nêu kế hoạch hợp nhất          |
| Hai cache riêng ⇒ dữ liệu lệch giữa 2 màn          | Nêu kịch bản cụ thể người dùng gặp (rút đơn ở A, B chưa cập nhật)              |
| `CollabStatusBadge` không có `default` ⇒ **crash** | Nêu rõ đây là crash chứ không phải hiển thị sai — mức độ nghiêm trọng khác hẳn |
| `CollabList` thiếu `return` cuối                   | Thừa nhận; nêu cách để TS bắt được (khai báo kiểu trả về tường minh)           |
| `useGetMyPostedJobsSubmissions` vừa sai vừa thừa   | Thừa nhận thẳng, không bào chữa; xoá là đúng                                   |
| Tab "Nhận được" đặt tên gây hiểu nhầm              | Thừa nhận lỗi UX; đề xuất tên "Tin của tôi"                                    |
| `ScrollView` lồng `ScrollView`                     | Thừa nhận; nêu cách sửa và vì sao RN cảnh báo                                  |
| Không phân trang                                   | Thừa nhận giới hạn 20 bản ghi; nêu ngưỡng dữ liệu bắt đầu sai                  |

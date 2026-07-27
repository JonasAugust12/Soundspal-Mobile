# 00 — Hạ tầng dùng chung (Core / Shared)

> Không phải một chức năng nghiệp vụ, nhưng mọi feature đều đứng trên tầng này.
> Hỏi kỹ ở đây thì các file sau chỉ còn hỏi phần nghiệp vụ.

## 0. Bản đồ file

| File                                                                                                   | Vai trò                                              |
| ------------------------------------------------------------------------------------------------------ | ---------------------------------------------------- |
| [shared/infrastructure/api/apiClient.ts](../../shared/infrastructure/api/apiClient.ts)                 | Axios instance + interceptor 401 + `createApiCall`   |
| [shared/infrastructure/api/multipartUpload.ts](../../shared/infrastructure/api/multipartUpload.ts)     | Đường upload thứ hai (fetch) + `unwrapUploadPayload` |
| [shared/infrastructure/api/queryClient.ts](../../shared/infrastructure/api/queryClient.ts)             | Cấu hình React Query toàn cục                        |
| [shared/infrastructure/storage/mmkvStorage.ts](../../shared/infrastructure/storage/mmkvStorage.ts)     | Adapter MMKV cho Zustand persist                     |
| [shared/presentation/hooks/useProtectedRoute.ts](../../shared/presentation/hooks/useProtectedRoute.ts) | Guard điều hướng theo trạng thái đăng nhập           |
| [shared/utils/jwt.ts](../../shared/utils/jwt.ts)                                                       | Decode JWT lấy `role`, `is_verified`, `tier`         |
| [app/\_layout.tsx](../../app/_layout.tsx)                                                              | Nơi ráp toàn bộ provider                             |

---

## A. Kiến trúc

1. **[KT]** Dự án chia **feature-first** (`features/<name>/{data,domain,presentation}`) chứ không chia theo layer ở cấp cao nhất. Giải thích lựa chọn này và cái giá phải trả khi một màn hình cần dữ liệu của 3 feature.

2. **[KT]** Vẽ lại chiều phụ thuộc đúng của Clean Architecture, rồi chỉ ra **hai chỗ trong dự án đang đi ngược chiều**.
    - `↳` `apiClient.ts:7` import `useAuthStore` (presentation của auth); `socketService.ts:3` import `useMessagingStore`. Cả hai là infrastructure → presentation.

3. **[KT]** Nếu phải sửa hai phụ thuộc ngược đó mà không đập lại kiến trúc, bạn làm thế nào?
    - `↳` Hướng chuẩn: inversion — đăng ký `tokenProvider` / `messageSink` từ ngoài vào lúc bootstrap (`app/_layout.tsx`), infrastructure chỉ giữ interface.

4. **[KT]** `features/home` chỉ có `presentation/` + `domain/`, `features/search` chỉ có `presentation/`. Quy tắc "mỗi feature đủ 3 tầng" bị phá — đây là ngoại lệ có chủ đích hay nợ kỹ thuật?

5. **[KT]** Tiêu chí nào quyết định một component nằm ở `shared/presentation/ui` hay trong `features/<x>`? Lấy `MessageBubble`, `ChatItem`, `TypingIndicator` làm ví dụ phản chứng.

6. **[KT]** Tầng `domain/usecases` chỉ tồn tại ở vài feature (auth, jobs, blog). `GetJobsUseCase` gọi thẳng repository, không có logic. **[SÂU]** Lớp này đang mang lại giá trị gì? Nếu không, giữ hay bỏ — và bỏ thì bỏ đồng loạt hay bỏ dần?

---

## B. Luồng đi — vòng đời một request

7. **[LUỒNG]** Kể tuần tự các bước từ khi component gọi `useGetJobs()` cho tới khi có data trên màn hình. Nêu rõ mỗi bước nằm ở tầng nào.
    - `↳` `hook (React Query)` → `useCase` → `repository` → `datasource` → `createApiCall` → `apiClient.request` → request interceptor gắn Bearer → response.

8. **[LUỒNG]** `createApiCall` có gì đặc biệt so với gọi `apiClient.get` trực tiếp? Vì sao nó phân biệt `method === 'GET'` để đẩy `data` vào `params`?
    - `↳` `apiClient.ts:188-193` — GET dùng `params`, còn lại dùng `data`; và **không** set `Content-Type` khi body là FormData để axios tự thêm boundary.

9. **[LUỒNG]** Mô tả **cơ chế hàng đợi 401** đầy đủ: request đầu tiên gặp 401 làm gì, request thứ 2–5 đang bay cùng lúc làm gì, và khi refresh xong thì ai được đánh thức.
    - `↳` `isRefreshing` + `failedQueue`; request đầu set `_retry = true` rồi refresh; các request sau `push` vào queue chờ; `processQueue(null, token)` resolve toàn bộ.

10. **[SÂU]** Các request được đánh thức từ `failedQueue` retry bằng `apiClient(originalRequest)` nhưng **không** được gán `_retry = true`. Điều gì xảy ra nếu token mới cũng bị 401?
    - `↳` Chúng lại rơi vào nhánh refresh → nguy cơ lặp. Đây là lỗ hổng thật, nên thừa nhận và nêu cách vá (set `_retry` trước khi retry).

11. **[SÂU]** `isRefreshing` là biến **module-level**, không nằm trong store. Người dùng bấm Đăng xuất đúng lúc đang refresh thì trạng thái ra sao?

12. **[LUỒNG]** Vì sao hàm refresh phải gọi bằng `axios` trần (`axios.post`) chứ không dùng `apiClient`?
    - `↳` Dùng `apiClient` thì chính request refresh cũng đi qua interceptor → 401 lồng 401 → đệ quy vô hạn.

13. **[LUỒNG]** Guard điều hướng chạy ở đâu và theo mấy nhánh?
    - `↳` `useProtectedRoute.ts` — 3 nhánh: (1) chưa đăng nhập + đang ở nhóm bảo vệ → lưu `returnTo` rồi về login; (2) đã đăng nhập nhưng `!is_verified` → ép sang `email-verification-required`; (3) đã verify mà đang ở `(auth)` → nhảy về `returnTo` hoặc `(tabs)`.

14. **[SÂU]** Guard phụ thuộc `authHydrated`. Vì sao không thể bỏ cờ này? Bỏ đi thì bug biểu hiện thế nào?
    - `↳` MMKV rehydrate là bất đồng bộ; render đầu tiên `isAuthenticated` còn `false` → user đã đăng nhập vẫn bị đá về login rồi nháy ngược lại.

---

## C. Business logic & quyết định kỹ thuật

15. **[BIZ]** Dự án dùng **hai hệ thống state song song** (React Query + Zustand). Ranh giới bạn đặt ở đâu? Chỉ một ví dụ trong dự án mà ranh giới đó bị mờ.
    - `↳` Messaging: `useMessagingApi.ts` có hook React Query nhưng màn chat lại lấy nguồn sự thật từ `messagingStore`.

16. **[BIZ]** Giải thích cấu hình React Query toàn cục và biện minh từng con số.
    - `↳` `queryClient.ts` — `staleTime: 5 phút`, `gcTime: 10 phút`, `retry: 2` (mutation `1`), `refetchOnWindowFocus: false`, **`refetchOnReconnect: false`**.

17. **[SÂU]** `refetchOnReconnect: false` trên môi trường **mobile** — mạng rớt liên tục. Vì sao tắt? Người dùng vào hầm rồi ra thì dữ liệu cũ tồn tại đến bao giờ?

18. **[SÂU]** `gcTime` 10 phút + không persist cache React Query ⇒ app **không có chế độ offline**. Đây là yêu cầu nghiệp vụ hay giới hạn kỹ thuật? Nếu muốn có offline thì sửa ở đâu trước?

19. **[BIZ]** Có **hai đường upload file** trong dự án. Kể tên, chỉ ra feature nào dùng đường nào, và giải thích vì sao phải có đường thứ hai.
    - `↳` (a) axios qua `apiClient` — chat dùng; (b) `postMultipartWithFetch` — profiles, challenge, blog dùng. Lý do: axios 1.x trên RN gửi FormData rỗng → `ERR_NETWORK`.

20. **[SÂU]** Đường `postMultipartWithFetch` **không đi qua interceptor 401**, token đọc thủ công tại thời điểm gọi. Token hết hạn giữa lúc upload 100 MB thì sao? Đề xuất cách xử lý.

21. **[SÂU]** Kể cả đường axios cũng không cứu được multipart: `rejectMultipartReplay()` chủ động ném `ERR_UPLOAD_AUTH_REFRESH`. Giải thích **vì sao không thể replay FormData** và bạn sẽ tự động hoá việc này ra sao thay vì bắt người dùng làm lại.
    - `↳` FormData là stream, đã bị tiêu thụ ở lần gửi đầu. Hướng vá: refresh **trước** khi upload nếu token sắp hết hạn, hoặc dựng lại FormData từ draft.

22. **[BIZ]** `unwrapUploadPayload()` tồn tại vì backend **không nhất quán** — chỗ trả envelope `{code,message,data}`, chỗ trả thẳng object. Ai nên gánh việc chuẩn hoá này, client hay backend? Hiện có feature nào **quên gọi** hàm này không?
    - `↳` `challengeRemoteDataSource` gọi `postMultipartWithFetch` mà không unwrap — backend đổi sang envelope là điểm số hiện `undefined`.

23. **[SÂU]** JWT được **decode ở client không verify chữ ký** để lấy `role`, `is_verified`, `tier`. Nêu chính xác mô hình đe doạ: ai sửa được payload, sửa xong thì đạt được gì, và ai phải chặn.
    - `↳` `jwt.ts:40` chỉ base64-decode. Sửa payload chỉ đổi được **giao diện**; backend vẫn verify chữ ký. Rủi ro thật = UI hiển thị sai quyền, không phải leo thang quyền.

24. **[SÂU]** `isTokenValid()` tồn tại nhưng `apiClient` **không dùng** — dự án chọn hướng **reactive** (cứ gọi, 401 thì refresh). So sánh reactive vs proactive refresh. Với 5 request song song lúc token vừa hết hạn thì tốn thêm bao nhiêu round-trip?

25. **[BIZ]** MMKV được chọn thay AsyncStorage. Ngoài lý do tốc độ, MMKV 4 kéo theo ràng buộc gì?
    - `↳` Cần `react-native-nitro-modules` + **New Architecture** (`app.json: newArchEnabled: true`) → mọi thư viện khác cũng phải tương thích New Arch.

26. **[SÂU]** `EXPO_PUBLIC_STORAGE_ENCRYPTION_KEY` có tiền tố `EXPO_PUBLIC_` ⇒ được nhúng thẳng vào bundle. Vậy "MMKV có mã hoá" thực sự chống được **mô hình đe doạ nào**? Refresh token nên nằm ở đâu?
    - `↳` Chỉ chống đọc file thô trên máy chưa root. Chuẩn hơn: Keychain (iOS) / EncryptedSharedPreferences hoặc Keystore (Android).

---

## D. Bên thứ ba & cấu hình

27. **[3RD]** Liệt kê toàn bộ biến `EXPO_PUBLIC_*` app đang cần và điều gì hỏng nếu thiếu từng cái.
    - `↳` `API_BASE_URL`, `AUTH_REFRESH_URL`, `SOCKET_URL`, `SOCKET_PATH`, `GOOGLE_WEB_CLIENT_ID`, `STORAGE_ENCRYPTION_KEY`.

28. **[3RD]** Vì sao `EXPO_PUBLIC_AUTH_REFRESH_URL` là **URL tuyệt đối** thay vì path tương đối như mọi endpoint khác?
    - `↳` Vì nó gọi bằng `axios` trần, không có `baseURL` của `apiClient`. Hệ quả: nó có thể trỏ nhầm domain mà không ai phát hiện.

29. **[3RD]** `app.json` khai `scheme: "soundspal"` — custom scheme, **không phải** App Links/Universal Links có xác minh domain. Rủi ro là gì với luồng callback thanh toán, và lộ trình chuyển đổi?

30. **[SÂU]** `app.json` khai plugin cho `expo-font`, `expo-splash-screen`, `expo-build-properties`, `datetimepicker`, `firebase/app`, `firebase/messaging` — nhưng **không khai** `expo-av`, `expo-image-picker`, `expo-document-picker`, và `ios` chỉ có `supportsTablet`. Bản iOS sẽ gặp chuyện gì khi xin quyền micro / thư viện ảnh?

31. **[SÂU]** `minSdkVersion: 28` (Android 9+). Quyết định này dựa trên số liệu nào? Bao nhiêu % thiết bị ở VN bị loại?

---

## E. Chất lượng & vận hành

32. **[SÂU]** `createApiCall` in `console.warn('✅ ... success', response.data)` cho **mọi** response, **không có guard `__DEV__`** — bao gồm cả `/auth/login` (chứa `access_token`, `refresh_token`). Đánh giá mức độ nghiêm trọng và cách vá tối thiểu.

33. **[SÂU]** ESLint đặt `no-console` chỉ cho phép `warn`/`error`. Kết quả là cả dự án dùng `console.warn` để log thông tin bình thường. Rule đang được **tuân thủ** hay đang bị **lách**? Bạn sẽ cấu hình lại thế nào?

34. **[SÂU]** Axios **không đặt timeout mặc định** ở `apiClient`. Request treo vô hạn thì UI xử lý ra sao? So sánh với `postMultipartWithFetch` (có `AbortController`, mặc định 120s).

35. **[SÂU]** Có **request cancellation** khi người dùng rời màn hình không? Nếu không thì hệ quả là gì?

36. **[SÂU]** Có test cho interceptor 401 không? Đây là đoạn logic tinh vi nhất dự án — nếu chưa có, thiết kế 3 test case bạn sẽ viết đầu tiên.
    - `↳` Gợi ý: (a) 1 request 401 → refresh → retry thành công; (b) 5 request song song → chỉ 1 lần gọi refresh; (c) refresh fail → `logout()` được gọi và mọi promise trong queue đều reject.

---

## F. Điểm yếu nên chủ động thừa nhận

| Vấn đề                                        | Cách trả lời không chống chế                                                  |
| --------------------------------------------- | ----------------------------------------------------------------------------- |
| Phụ thuộc ngược infrastructure → presentation | Thừa nhận, nêu hướng inversion, ước lượng phạm vi sửa (2 file)                |
| `failedQueue` retry không set `_retry`        | Thừa nhận là bug tiềm ẩn, mô tả kịch bản kích hoạt, nêu 1 dòng sửa            |
| Log token ở production                        | Thừa nhận là lỗi bảo mật, ưu tiên vá cao nhất                                 |
| Không có timeout axios                        | Thừa nhận, nêu con số đề xuất (30s) và lý do khác với upload (120s)           |
| Không persist cache ⇒ không offline           | Nêu rõ là **phạm vi đồ án**, không phải quên; nếu làm tiếp thì dùng persister |

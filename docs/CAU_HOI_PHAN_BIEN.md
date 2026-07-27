# Bộ câu hỏi phản biện — Soundspal Mobile (TL-Mobile)

> Soạn từ `docs/html/*` + source thật. Ký hiệu:
> **[BẪY]** = dự án thật sự có điểm yếu ở chỗ này, đừng chống chế — nên thừa nhận + nêu hướng khắc phục.
> **[SÂU]** = câu hỏi đào sâu kiến thức nền, trả lời tốt sẽ ghi điểm.

---

## A. Kiến trúc tổng thể

1. Vì sao chọn **Clean Architecture 3 tầng** cho một app mobile client, trong khi app "không chứa business logic phía server"? Nếu domain gần như rỗng thì lợi ích thật sự là gì, hay chỉ là thêm boilerplate?
2. Hãy chứng minh bằng một ví dụ thật: nếu backend đổi từ REST sang GraphQL, chính xác bạn phải sửa bao nhiêu file, ở đâu? Đã ai từng thực hiện thay đổi đó chưa hay chỉ là giả định?
3. `docs/architecture.md` nói use case chỉ mới "partial (auth, jobs, blog)". **[BẪY]** Vậy 9 feature còn lại đi thẳng `presentation → repository`, bỏ qua tầng `domain/usecases`. Kiến trúc có còn nhất quán không? Tại sao không bỏ luôn use case cho đồng nhất?
4. `GetJobsUseCase` được mô tả là "chỉ là lớp đệm, gọi thẳng repository, không có logic". **[BẪY]** Lớp này mang lại giá trị gì ngoài việc thoả mãn sơ đồ kiến trúc?
5. `*RepositoryImpl` trong dự án "thường chỉ gán thẳng hàm từ datasource". Vậy repository có phải là indirection thừa không? Nêu một kịch bản cụ thể trong 6 tháng tới mà nó cứu bạn.
6. Quy tắc "domain không import React/Expo/axios" được **kiểm chứng bằng gì**? Có ESLint rule (`no-restricted-imports`) hay chỉ là quy ước bằng miệng? Nếu chỉ là quy ước thì làm sao chống vi phạm khi có thành viên mới?
7. `app/` yêu cầu "chỉ một dòng re-export". Có công cụ nào enforce không, hay ai cũng có thể viết logic vào đó?
8. Tại sao chia theo **feature** thay vì theo **layer** ở cấp cao nhất? Đánh đổi là gì khi một màn hình dùng dữ liệu của 3 feature (ví dụ `HomeScreen`)?
9. `features/home` chỉ có `presentation/` — nó phá vỡ quy tắc "mỗi feature đúng 3 thư mục con". Bạn giải thích thế nào?
10. Ranh giới giữa `shared/` và `features/` được quyết định bằng tiêu chí nào? Ví dụ `ChatItem`, `MessageBubble`, `MessageInput`, `TypingIndicator` nằm trong `shared/presentation/ui/` nhưng **chỉ feature messaging dùng** — vì sao không đặt trong `features/messaging`? **[BẪY]**
11. Feature `collab` **sao chép nguyên xi** API, type và response shape của feature `jobs`, tạo ra hai cache riêng biệt. **[BẪY]** Đây là lỗi thiết kế hay quyết định có chủ đích? Hậu quả người dùng gặp phải là gì và vì sao chưa sửa?
12. Component beat (`BeatCard`, `BeatList`, `MiniPlayer`) nằm trong `features/explore/` nhưng chỉ `ChallengeExploreScreen` dùng. **[BẪY]** Vì sao không di chuyển sang `features/challenge`?
13. Có **hai màn "Explore"** (`(tabs)/explore` tìm người, `(challenge)/explore` tìm beat). Việc trùng tên này ảnh hưởng gì đến khả năng bảo trì và onboarding người mới?
14. Tab `(tabs)/notifications` thực chất là **danh sách chat**, không phải thông báo. **[BẪY]** Vì sao đặt tên gây hiểu nhầm như vậy và tại sao chưa đổi?
15. Dependency rule vẽ mũi tên `presentation → data → domain`. Nhưng `socketService` (ở `shared/infrastructure`) lại **import trực tiếp `messagingStore`** (ở `features/messaging/presentation`). **[BẪY]** Đây là dependency ngược từ hạ tầng lên presentation — bạn giải thích thế nào?
16. `apiClient.ts` (shared/infrastructure) import `useAuthStore` (features/auth/presentation). Cũng là phụ thuộc ngược. Vì sao không dùng inversion (đăng ký token provider từ ngoài vào)?
17. **[SÂU]** Nếu phải tách app này thành nhiều bundle/micro-frontend hoặc chia cho 3 team làm song song, kiến trúc hiện tại có hỗ trợ không? Điểm nghẽn nằm ở đâu?
18. Bạn đo "kiến trúc tốt" bằng chỉ số nào? (số dòng trung bình/file, độ sâu import, số circular dependency…) Có công cụ nào đang chạy không?
19. Có file nào vượt quá ngưỡng hợp lý không? `MyContentScreen.tsx` 981 dòng và dùng toàn `StyleSheet` trong khi cả app dùng NativeWind. **[BẪY]** Vì sao tồn tại ngoại lệ này?
20. Tài liệu `docs/features/challenge.md` được chính doc mới thừa nhận là "đã lỗi thời, không còn khớp code". **[BẪY]** Quy trình nào đảm bảo tài liệu không tiếp tục trôi khỏi code?

---

## B. Quản lý state (React Query + Zustand)

21. Tại sao dùng **hai hệ thống state song song**? Ranh giới "server state / client state" có bao giờ mơ hồ không? Cho ví dụ trong dự án.
22. `jobBookmarkStore` và `blogBookmarkStore` lưu **cả object** `Job`/`BlogPost` trong MMKV — tức là copy server state sang client state, đúng thứ mà chính doc nói là "lỗi thường gặp". **[BẪY]** Vì sao chấp nhận vi phạm? Dữ liệu bookmark cũ (giá, deadline, trạng thái) bị stale thì xử lý sao?
23. Bookmark job **hoàn toàn client-side, không có endpoint**. Vậy người dùng đổi máy hoặc cài lại app thì mất sạch. Đây có phải là yêu cầu nghiệp vụ hay hạn chế kỹ thuật?
24. Bookmark blog thì lại có API (`POST/DELETE /blogs/{id}/bookmark`) — **hai feature cùng khái niệm mà hai cách làm khác nhau**. Giải thích?
25. `mergeServer()` của blog có chốt `if (!serverPosts.length) return state`. **[SÂU]** Chốt này che giấu trường hợp người dùng thật sự đã xoá hết bookmark trên web. Bạn xử lý xung đột đó thế nào?
26. Feature messaging **không dùng React Query làm nguồn sự thật** mà dùng Zustand. Nhưng `useMessagingApi.ts` lại có đầy đủ hook React Query dùng ở nơi khác. **[BẪY]** Hai cơ chế state cho cùng một domain — bạn bảo vệ thế nào?
27. Nếu socket đẩy `message:new` vào Zustand nhưng `useGetConversations` (React Query) vẫn giữ bản cũ, hai màn hình sẽ hiển thị khác nhau. Đã xử lý chưa? Bằng cách nào?
28. `staleTime` toàn cục 5 phút. Với dữ liệu như "số đơn chờ duyệt" hay "trạng thái thanh toán", 5 phút là quá dài. Bạn override ở đâu và theo nguyên tắc nào?
29. `refetchOnReconnect: false` — trên mobile mạng rớt liên tục. **[BẪY]** Vì sao tắt? Người dùng vào thang máy ra ngoài thì thấy dữ liệu cũ đến bao giờ?
30. `gcTime` 10 phút + không persist React Query cache ⇒ **app không có offline**. Đây có phải yêu cầu? Nếu người dùng ở khu vực sóng yếu thì trải nghiệm ra sao?
31. `themeStore` và `settingsStore` đều **bị tắt persist (comment lại)**. **[BẪY]** Nghĩa là user chọn dark mode, mở lại app là mất. Vì sao chưa bật? Có bug gì đằng sau?
32. `settingsStore.notifications` và `language` **khai báo nhưng không dùng ở đâu**. **[BẪY]** Đây là code chết hay tính năng dở dang?
33. `userStore.ts` chỉ chứa `{name, email}`, persist bị comment, **không được import ở đâu** — `authStore` mới là store thật. **[BẪY]** Vì sao còn giữ?
34. Query key được gom vào object (`jobKeys`, `messagingKeys`). Có chuẩn hoá giữa các feature không, hay mỗi feature một kiểu? Rủi ro va chạm key giữa `jobs` và `collab` là gì?
35. `queryClient.clear()` sau login/logout — điều gì xảy ra nếu có mutation đang bay lúc đó?
36. **[SÂU]** Vì sao chọn Zustand mà không phải Redux Toolkit / Jotai / Context? Nếu state realtime phình to (nhiều phòng chat, nhiều tin), Zustand có vấn đề re-render không? Bạn có dùng selector/`shallow` không?
37. `messagingStore` dùng cấu trúc chuẩn hoá `Record<id, T>` — tốt. Nhưng `onlineUsers` là `Set`. **[SÂU]** `Set` là mutable, Zustand so sánh tham chiếu — bạn có tạo `Set` mới mỗi lần cập nhật không? Nếu không thì component sẽ không re-render.
38. `messagingStore` không persist ⇒ mở lại app là mất hết. Nhưng cũng nghĩa là **mất unread count** cho đến khi gọi API. Đã kiểm tra chưa?

---

## C. Tầng mạng — `apiClient`, refresh token, upload

39. Giải thích chi tiết cơ chế **hàng đợi 401**. Vì sao cần `failedQueue` thay vì để mỗi request tự refresh?
40. **[BẪY]** Các request nằm trong `failedQueue` khi được retry bằng `apiClient(originalRequest)` **không được đặt `_retry = true`**. Nếu token mới cũng bị 401 (server thu hồi, clock skew), chúng sẽ lại rơi vào nhánh refresh. Bạn đã kiểm chứng chưa có vòng lặp chưa?
41. `isRefreshing` là biến **module-level**. Nếu người dùng đăng xuất giữa lúc đang refresh thì sao? Có race condition không?
42. **[BẪY]** `createApiCall` in `console.warn('✅ ... success', response.data)` cho **mọi** response — bao gồm cả response của `/auth/login` (chứa `access_token`, `refresh_token`). Log này **không có guard `__DEV__`** nên vẫn chạy ở bản production. Đây là rò rỉ token vào logcat. Bạn xử lý thế nào?
43. Tương tự, `socketService` in ra `Socket ID`, `senderId`, `conversationId` của mọi tin nhắn. Có vi phạm quyền riêng tư không? Đã cân nhắc chưa?
44. ESLint rule `no-console` chỉ cho phép `warn`/`error`. **[BẪY]** Kết quả là cả dự án dùng `console.warn` để log thông tin bình thường — rule đang bị lách chứ không được tuân thủ. Bạn nhận xét gì về cách thiết lập rule này?
45. **[BẪY]** `EXPO_PUBLIC_AUTH_REFRESH_URL` là URL tuyệt đối và trong `.env.example` đang trỏ **domain cũ `talentlink.io.vn`** trong khi `API_BASE_URL` đã sang `api.soundspal.com`. Đây là lỗi cấu hình đang tồn tại hay có lý do? Điều gì xảy ra nếu domain cũ bị tắt?
46. Vì sao refresh phải gọi bằng `axios` trần thay vì `apiClient`? Nếu không tách, chuyện gì xảy ra?
47. **[SÂU]** `shared/utils/jwt.ts` có `isTokenValid()` nhưng `apiClient` **không dùng** — chọn hướng reactive (cứ gọi, 401 thì refresh). Ưu/nhược của reactive vs proactive refresh? Với 5 request song song lúc token vừa hết hạn, chi phí là bao nhiêu round-trip thừa?
48. JWT được **decode ở client mà không verify chữ ký** để lấy `role`, `is_verified`, `tier`. Nếu ai đó sửa payload trên máy đã root, giao diện sẽ hiển thị sai quyền. Rủi ro thật sự là gì và ai chịu trách nhiệm chặn?
49. **[BẪY]** Có **hai đường upload file** (axios và `postMultipartWithFetch`) và việc chọn đường **không nhất quán**: chat dùng axios (đường mà chính helper cảnh báo là hỏng), blog có **bản sao riêng** của helper, challenge dùng fetch nhưng **không gọi `unwrapUploadPayload()`**. Giải thích tình trạng này và kế hoạch thống nhất.
50. Đường `postMultipartWithFetch` **không đi qua interceptor 401**, token đọc thủ công từ store. Nếu token hết hạn giữa lúc upload 100MB thì sao?
51. Upload avatar hardcode `image/jpeg` / `avatar.jpg` bất kể file thật là gì. **[BẪY]** Người dùng chọn PNG/HEIC thì backend nhận sai MIME. Đã kiểm thử chưa?
52. `ERR_UPLOAD_AUTH_REFRESH` — app bảo người dùng "hãy thử lại". **[SÂU]** Có cách nào tự động thay vì bắt người dùng làm lại (ví dụ refresh token _trước_ khi upload, hoặc dựng lại FormData)?
53. Có **timeout mặc định** cho axios không? (Trong code không thấy đặt.) Request treo vô hạn thì UI xử lý ra sao?
54. Có cơ chế **retry/backoff cho lỗi mạng** (không phải 401) không? React Query `retry: 2` áp cho query, còn mutation chỉ 1 — dựa trên cơ sở nào?
55. Có **request cancellation** khi người dùng rời màn hình không? Nếu không, có memory leak / setState sau unmount không?
56. Backend trả envelope `{code, message, data}` ở một số endpoint, trả thẳng ở endpoint khác — blog phải viết `extractArrayFromEnvelope()` bóc **3 tầng**. **[BẪY]** Đây là lỗi hợp đồng API. Vì sao app phải gánh thay vì yêu cầu backend thống nhất?

---

## D. Realtime — Socket.IO

57. Vì sao gửi token ở **cả 3 chỗ** (`auth`, `query`, `extraHeaders`)? **[BẪY]** Đây là "bắn nhiều hướng cho chắc" — nghĩa là bạn không nắm rõ backend đọc ở đâu. Có rủi ro gì khi token nằm trong **query string** (bị ghi vào access log của nginx/proxy)?
58. `extraHeaders` chỉ có tác dụng với transport `polling`, không dùng được cho WebSocket thuần. Bạn có biết điều đó không? Vậy nó tồn tại để làm gì?
59. **[BẪY]** Socket dùng `accessToken` lúc connect và **không bao giờ cập nhật khi token được refresh**. Sau 15–60 phút token hết hạn, server đá ra (`io server disconnect`) → `handleDisconnect()` gọi lại `connect()` với **token cũ trong store nếu chưa refresh**. Bạn đã xử lý vòng lặp này chưa?
60. **[BẪY]** Cờ `hasAttemptedTokenRefresh` được khai báo và reset ở 3 nơi nhưng **không bao giờ được gán `true`**. Nghĩa là điều kiện `!this.hasAttemptedTokenRefresh` luôn đúng → mỗi lần server đá là reconnect vô hạn. Giải thích.
61. **[BẪY]** `this.isConnecting = false` được đặt **ngay sau khi gọi `io()`**, không phải sau khi `connect` thành công. Vậy guard chống kết nối trùng gần như vô tác dụng. Đúng không?
62. Có **hai cơ chế reconnect chồng nhau**: `reconnectionAttempts: 5` của Socket.IO **và** backoff thủ công 5 lần trong `handleConnectionError`. **[BẪY]** Tổng cộng bao nhiêu lần thử? Có tạo storm không?
63. Sau 5 lần thất bại, `hasReachedMaxAttempts = true` và **ngừng hẳn cho đến khi khởi động lại app**. **[BẪY]** Người dùng mất mạng 1 phút rồi có lại — app sẽ im lặng không bao giờ kết nối lại. Vì sao không lắng nghe `NetInfo` để reset?
64. `setQueryClient()` lưu `queryClient` vào service nhưng **biến đó không được dùng ở đâu**. **[BẪY]** Code chết?
65. Quyết định **ngắt socket khi app xuống nền** để nhận được push. **[SÂU]** Đây là ràng buộc hai chiều với backend. Nếu backend đổi cách xác định "offline" (ví dụ dùng last-seen thay vì socket), app có phải sửa không? Có ai ghi hợp đồng này ở đâu ngoài tài liệu này không?
66. Hệ quả: mỗi lần chuyển foreground/background là một vòng disconnect/connect (handshake + auth). Người dùng chuyển app 50 lần/ngày = 50 lần handshake. Chi phí pin/băng thông đã đo chưa?
67. **[BẪY]** `users:online` đã wire ở client nhưng **backend chưa gửi** ⇒ lúc mới vào, app không biết ai online, phải chờ sự kiện lẻ. Trạng thái online hiển thị sai trong bao lâu? Bạn có fallback nào không?
68. `message:read` đến ở **hai dạng payload khác nhau** tuỳ nguồn (gateway vs REST). **[BẪY]** Vì sao app phải chuẩn hoá thay vì backend thống nhất? Ai sở hữu hợp đồng sự kiện này?
69. Sự kiện socket **không có schema validation** (không Zod). Nếu backend đổi tên trường, app crash hay im lặng sai? Bạn kiểm chứng bằng gì?
70. Không có **acknowledgement / message ordering / dedupe**. Nếu socket đẩy trùng `message:new` (reconnect), tin nhắn có bị nhân đôi không?
71. `conversation:join` được gọi khi mở màn. Nếu socket chưa connect kịp, hàm chỉ `console.warn` rồi return. **[BẪY]** Vậy người dùng vào phòng lúc mạng chậm sẽ **không nhận tin realtime** cho tới khi mở lại màn. Có retry không?
72. **[SÂU]** Vì sao chọn Socket.IO thay vì WebSocket thuần / SSE / MQTT? Đánh đổi (overhead, fallback polling, cần sticky session ở LB)?
73. Yêu cầu hạ tầng: nginx phải `proxy_set_header Upgrade`, LB phải sticky session hoặc redis-adapter. **[SÂU]** Bạn đã kiểm chứng môi trường production đáp ứng chưa, hay chỉ ghi trong tài liệu?

---

## E. Push notification (FCM)

74. Vì sao thân `setBackgroundMessageHandler` **để trống**? Điều gì xảy ra nếu xoá luôn hàm đó?
75. Vì sao phải import handler ở **đầu** `app/_layout.tsx` dưới dạng side-effect? Nếu import xuống dưới thì lỗi gì?
76. **[SÂU]** Giải thích bẫy `requestPermission()` của RNFirebase trên Android. Vì sao FCM vẫn giao message mà banner không hiện? Bạn phát hiện ra bằng cách nào?
77. Timeout 5 giây cho `getDevicePayload()`. Nếu mạng chậm hơn 5 giây, người dùng đăng nhập xong **không nhận được push cho đến lần đăng nhập sau**. **[BẪY]** Vì sao không retry ngầm sau khi vào app?
78. `device_id` là UUID lưu MMKV. Gỡ app → id mới → **bản ghi cũ ở backend thành rác**. **[BẪY]** Ai dọn? Có endpoint huỷ đăng ký không?
79. **[BẪY]** `logout()` **không gọi API huỷ device token**. Máy dùng chung: người A đăng xuất, người B đăng nhập — người A vẫn nhận push của mình trên máy đó. Đây là lỗ hổng quyền riêng tư. Bạn xử lý thế nào?
80. **Không có notification channel riêng** cho Android ⇒ không phân biệt được mức ưu tiên tin nhắn vs tin tuyển dụng, người dùng không tắt riêng từng loại được. **[BẪY]** Kế hoạch?
81. **Không có lịch sử thông báo trong app** — vuốt đi là mất. Đây có phải yêu cầu nghiệp vụ hay thiếu sót?
82. **[BẪY]** iOS chưa cấu hình: chưa có APNs key trên Firebase, `app.json` chưa có `NSUserNotificationsUsageDescription`. Vậy **push trên iOS chưa từng chạy**? Bạn đã test trên iOS chưa?
83. `resolvePushRoute` phải xử lý **hai quy ước đặt tên** (`job_id` snake_case của job-post-service vs `conversationId` camelCase của messaging-service) và **messaging-service không gửi `type`**. **[BẪY]** Vì sao không yêu cầu backend thống nhất? App đang gánh nợ của backend.
84. messaging-service gửi `route: "/(messages)/<id>"` — **route đó không tồn tại trong app**. **[BẪY]** Nghĩa là backend và app chưa từng thống nhất hợp đồng. Ai chịu trách nhiệm?
85. Push chỉ gửi cho người **offline**. Vậy nếu người dùng đang mở app nhưng ở màn khác (không phải phòng chat đó), họ có được báo không? Cơ chế nào?
86. Deep link từ push: nếu app bị kill và người dùng **chưa đăng nhập**, `router.push()` tới `/(messages)/detailMessage` sẽ bị guard đá về login. Sau khi đăng nhập có quay lại đúng màn không? **[SÂU]**
87. Bạn xử lý **race condition** giữa `getInitialNotification()` và `useProtectedRoute` như thế nào? Cái nào chạy trước?

---

## F. Xác thực & bảo mật

88. **[BẪY]** `EXPO_PUBLIC_STORAGE_ENCRYPTION_KEY` mang tiền tố `EXPO_PUBLIC_` ⇒ **được nhúng thẳng vào APK**, ai giải nén cũng đọc được. Vậy "MMKV có mã hoá" bảo vệ được gì? Nêu chính xác mô hình đe doạ mà nó chống lại.
89. `refreshToken` được lưu trong MMKV (persist Zustand). Vì sao không dùng **Keychain (iOS) / EncryptedSharedPreferences hoặc Keystore (Android)** cho refresh token?
90. **[SÂU]** Có chống **root/jailbreak detection**, **certificate pinning**, **code obfuscation** không? Nếu không thì lý do là gì (chi phí, phạm vi đồ án)?
91. Refresh token có được **rotate** không? Nếu có, backend có phát hiện **reuse** (dấu hiệu token bị đánh cắp) không? App phản ứng thế nào?
92. Access token sống bao lâu? Refresh token sống bao lâu? Có "remember me" hay session vô hạn?
93. Đăng xuất trên **một thiết bị** có thu hồi phiên trên các thiết bị khác không? Có màn "quản lý phiên đăng nhập" không?
94. **[BẪY]** `useProtectedRoute` chỉ là guard **UI**. Ví dụ `/(jobs)/my-applications` không hề guard theo role. Bạn nói gì với câu "phân quyền phía client không phải là bảo mật"?
95. **[BẪY]** Nút "Đăng tin" hiển thị cho **mọi role** — một ca sĩ cũng đăng được tin tuyển dụng. Đây là yêu cầu nghiệp vụ hay thiếu ràng buộc? Backend có chặn không?
96. Mật khẩu chỉ yêu cầu **≥ 6 ký tự, 1 hoa, 1 số** — không có ký tự đặc biệt, không kiểm tra mật khẩu phổ biến. Có đủ không theo tiêu chuẩn nào (OWASP MASVS / NIST)?
97. OTP 6 số. Có giới hạn số lần nhập sai không? Chống brute-force ở đâu — client hay server? Đếm ngược 30 giây ở client **dễ lách** (kill app). **[BẪY]**
98. Luồng "đổi OTP lấy `reset_token`" — `reset_token` được truyền sang màn 3 qua **route param**. **[SÂU]** Route param có bị ghi vào log điều hướng/deep link history không? Có an toàn hơn là giữ trong memory không?
99. Google Sign-In dùng **server auth code flow**. Vì sao không dùng ID token flow? Ưu điểm cụ thể là gì?
100.    Vì sao phải gọi `GoogleSignin.signOut()` trước `signIn()`? Nó có tác dụng phụ gì với UX?
101.    **[BẪY]** Deep link dùng **custom scheme `soundspal://`**, không phải App Links/Universal Links có xác minh domain. Bất kỳ app nào cũng đăng ký được scheme này và **cướp callback thanh toán**. Rủi ro thật sự? Kế hoạch chuyển sang App Links?
102.    Có xử lý **`ERR_UPLOAD_AUTH_REFRESH`, lỗi 403, lỗi 429** thống nhất không, hay mỗi feature tự dịch?
103.    **[BẪY]** Trong repo root có các file `@jonasaugust12__talent_link*.jks` và `upload_certificate.pem`. Chúng **không được commit** (`.gitignore` chặn `*.jks`, `*.pem`) — bạn xác nhận được điều đó không? Chúng được sao lưu ở đâu ngoài máy này? Mất keystore = không bao giờ update được app đã phát hành.
104.    Dữ liệu người dùng: app có tuân thủ Nghị định 13/2023 về bảo vệ dữ liệu cá nhân / GDPR không? Có màn "xoá tài khoản" (Google Play bắt buộc từ 2024) không? **[BẪY]**
105.    Privacy Policy + Data Safety form trên Play Console đã khai đúng những gì app thu thập (FCM token, device id, email, ảnh, ghi âm) chưa?

---

## G. Thanh toán PayOS

106. Vì sao mở PayOS bằng **trình duyệt ngoài** (`Linking.openURL`) thay vì WebView trong app? Đánh đổi UX vs bảo mật?
107. **[BẪY]** Bảng giá **hardcode ở client** (`payment.ts`: 49 000 ₫ / 490 000 ₫). Đổi giá phải phát hành bản mới, và người dùng chưa cập nhật sẽ gửi `amount` cũ. Backend re-validate — vậy người dùng bản cũ sẽ **bị từ chối thanh toán** mà không hiểu vì sao. Xử lý thế nào?
108. `description` phải **≤ 25 ký tự ASCII không dấu**. Ràng buộc này được enforce ở đâu — hardcode hay có validate? Nếu thêm gói mới mà quên thì lỗi ở đâu?
109. **Poll trạng thái 10 lần × 2 giây = 20 giây**. **[BẪY]** Nếu webhook đến ở giây thứ 25 thì sao? Người dùng thấy gì? Có cơ chế push từ backend khi webhook xử lý xong không?
110. Riêng lỗi 404 retry tới 8 lần vì "giao dịch chưa kịp ghi DB". **[SÂU]** Đây là dấu hiệu backend chưa idempotent hoặc chưa ghi đơn trước khi trả checkout_url. Bạn có đề xuất gì?
111. `orderCode` luôn `null` ngay sau checkout — phải lấy từ deep link hoặc `GET /payments/history?limit=10`. **[BẪY]** Nếu người dùng có 2 giao dịch trong 10 giây thì `resolvePaymentOrderCodeFromHistory()` lấy nhầm đơn. Đã xử lý chưa?
112. **Không tự động gia hạn** (không subscription). Đây là hạn chế của PayOS hay quyết định nghiệp vụ? Ảnh hưởng doanh thu thế nào?
113. **Không huỷ được giao dịch từ app**. Người dùng tạo 5 phiên rác thì backend/PayOS xử lý sao?
114. `isPremiumActive()` phải kiểm tra cả `is_premium` **và** `premium_expired_at` vì "backend để cờ true tới lần quét dọn kế tiếp". **[BẪY]** Đây là bug backend mà client phải gánh. Vì sao không sửa ở nguồn?
115. Nếu người dùng đổi giờ hệ thống về quá khứ, `premium_expired_at > now` sẽ đúng ⇒ **được dùng Premium miễn phí trên UI**. Server có chặn không?
116. Có **đối soát giao dịch** (reconciliation) giữa PayOS và DB không? Ai kiểm tra tiền về mà premium không kích hoạt?
117. Chỉ có `PaymentPurpose = 'ACCOUNT_UPGRADE'`. Nếu sau này bán beat / tài trợ challenge, kiến trúc hiện tại mở rộng thế nào?
118. Test PayOS ở dev cần ngrok + sandbox. **[SÂU]** Có test tự động nào cho luồng thanh toán không, hay 100% thủ công?
119. PayOS dashboard "chỉ nhận URL http/https" — tài liệu đề xuất trang trung gian. **[BẪY]** Hiện tại đã triển khai trang trung gian chưa, hay đang dùng `soundspal://` trực tiếp và may mắn PayOS chấp nhận?

---

## H. Câu hỏi theo từng chức năng

### Jobs / Tuyển dụng

120. Có **hai enum trạng thái không tương thích** (`ApplicationStatus` 4 giá trị, `SubmissionStatus` 7 giá trị). **[BẪY]** Vì sao? Đã gây bug gì chưa?
121. `jobRemoteDataSource` tự chọn giữa `/posts/search` và `/posts` dựa trên `hasAdvancedFilters`. **[SÂU]** Logic này ở client là đúng chỗ chưa, hay nên để backend gộp một endpoint?
122. **[BẪY]** Ô ngân sách ở màn **tạo** nhập theo **triệu** (nhân ×1 000 000), màn **sửa** nhập thẳng **VND**. Cùng một trường, hai đơn vị. Người dùng sửa bài sẽ nhập sai. Vì sao chưa sửa?
123. **[BẪY]** Deadline lưu dạng chuỗi `dd-MM-yyyy`, **không phải ISO 8601**. Timezone xử lý thế nào? So sánh `is_deadline_passed` ở đâu?
124. Công tắc thù lao bị **đảo** (`isFixed = !is_negotiable`). Có test không?
125. `PUT /posts/{id}` **không phải partial update** — phải dựng body đầy đủ bằng `buildUpdatePayloadFromJob()`. **[BẪY]** Thêm trường mới mà quên cập nhật hàm này = **mất dữ liệu im lặng**. Có cơ chế nào chống (type-level exhaustiveness check)?
126. Backend **không có endpoint "mở lại tuyển dụng"** — app ghép thủ công bằng fetch + PUT full body. **[BẪY]** Nếu request PUT thất bại giữa chừng thì trạng thái ra sao?
127. `GET /posts/{id}` trả 404 cho **chính bài nháp của mình** ⇒ app phải phân trang `/posts/me` 50 bài/trang để tìm. **[BẪY]** Bài nháp thứ 200 thì mất bao nhiêu request? Vì sao không yêu cầu backend sửa?
128. `JobApplicantsScreen` tải **một trang 50 đơn, không phân trang**. Bài có 200 ứng viên thì 150 người bị bỏ sót. **[BẪY]** Đây là giới hạn chấp nhận được?
129. `VenueOpenJobs` lọc danh sách công khai theo `creator_username` **ở client** ⇒ tin ngoài trang 1 bị bỏ sót. **[BẪY]**
130. Body review chỉ gửi `{ action }` — **không bao giờ gửi `review_notes`** dù API hỗ trợ. Rút đơn gửi `{ reason: '' }` **luôn rỗng**. **[BẪY]** Tính năng dở dang?
131. `skipped` là giá trị hợp lệ của cả `SubmissionStatus` lẫn `ReviewActionType` nhưng **UI không bao giờ phát hành động `skip`**. Code chết?
132. 3 danh sách tab được **mount cùng lúc** và ẩn bằng `display:none`. **[SÂU]** Đánh đổi giữa giữ scroll position và bộ nhớ/số request. Đã đo chưa? Với 3 infinite list thì tốn bao nhiêu RAM?
133. Wizard 4 bước nhưng **chỉ bước 1 có validate**. Người dùng có thể đi tới bước 4 với dữ liệu rỗng. Đúng không?
134. `useGetPendingApplicationsCount` có `refetchInterval: 60000` — **poll liên tục kể cả khi app ở nền**? Đã kiểm tra chưa? Tốn pin không?

### Messaging

135. **Không có phân trang tin nhắn** — `GET /messages/conversation/{id}` tải **toàn bộ**. **[BẪY]** Phòng chat 10 000 tin thì sao? `prependMessages()` đã có sẵn nhưng chưa dùng — vì sao?
136. **Không có optimistic UI** khi gửi tin. Mạng 3G thì người dùng chờ bao lâu mới thấy tin mình gửi? Vì sao không làm?
137. Giao thức `:::JOB_REF:{json}:::` **nhúng JSON vào trường content**. **[BẪY]** Vì sao không dùng trường riêng (`message_type` + `metadata`)? Nếu người dùng gõ tay chuỗi đó thì sao? Nếu title job có dấu `:::` thì sao?
138. Giao thức JOB_REF **dùng chung với bản web** — "sửa một bên phải sửa cả hai". Hợp đồng này được version hoá ở đâu?
139. Đính kèm chat đi **đường axios** — chính đường mà `multipartUpload.ts` cảnh báo gửi body rỗng trên RN. **[BẪY]** Đã gặp lỗi chưa? Vì sao chưa chuyển sang fetch?
140. Giới hạn 10 MB được **kiểm tra ở client**. Server có kiểm tra không? Có quét virus/nội dung không?
141. Ảnh/tệp upload lên `/storage/upload` trả về URL. URL đó có **public** không? Người ngoài đoán URL có xem được tin nhắn riêng tư không? **[BẪY][SÂU]**
142. **Chat nhóm có model nhưng không có UI**. Vì sao giữ `isGroup` trong type? Mọi hội thoại đều đặt `name: 'TL-MESS'` — chuỗi này là gì và vì sao còn tên cũ "TL"?
143. **Không có mã hoá đầu-cuối**. Với app có chat riêng tư, đây có phải vấn đề? Bạn sẽ nói gì nếu hội đồng hỏi về quyền riêng tư tin nhắn?
144. `NotificationsScreen` **vẫn gọi `messagingRepository` trực tiếp trong component**. **[BẪY]** Chính doc thừa nhận là "cùng kiểu vi phạm phân tầng mà màn phòng chat đã sửa". Vì sao chưa sửa nốt?
145. Tìm kiếm hội thoại lọc **phía client** ⇒ chỉ tìm được trong danh sách đã tải. Có phân trang danh sách hội thoại không?

### Blog

146. **[BẪY]** Backend **không có `GET /blogs/{id}`** ⇒ `useBlogArticle` fetch **toàn bộ feed rồi `.find()`**. Bài không nằm trang đầu ⇒ **"Blog not found"** dù bài tồn tại; deep link tới bài cũ gãy. Đây là lỗi nghiêm trọng — vì sao chưa yêu cầu backend bổ sung?
147. Mapper hardcode `creator_display_name = 'Tác giả'`, `creator_role = 'user'`, `category = 'BÀI VIẾT'`. **[BẪY]** Hàm `creatorRoleLabel()` thành code chết. Vì sao?
148. `creator_username` bị gán bằng `author_id`. Người dùng thấy id thay vì tên. Đúng không?
149. `extractArrayFromEnvelope()` bóc **3 tầng** và chấp nhận 6 tên trường khác nhau. **[SÂU]** Đây là lập trình phòng thủ hay che giấu việc không nắm được hợp đồng API?
150. Bình luận dùng `setQueryData` ghi thẳng cache "vì refetch chạy đua với backend". **[BẪY]** Đây là dấu hiệu backend chưa read-after-write consistent. Rủi ro cache lệch thật?
151. `useBlogPosts`, `useAddBlogComment`, `useAddCommentLike`, `TagSelector`, `VoiceCommentButton`, `BLOG_FEED_TABS` — **đều là code chết**. **[BẪY]** Bao nhiêu % codebase là code chết? Có công cụ nào phát hiện (`ts-prune`, `knip`) không?
152. "Bình luận giọng nói" được nhắc trong tổng quan nhưng `VoiceCommentButton` không được import. **[BẪY]** Tính năng này có thật sự chạy không?
153. `react-native-render-html` render HTML từ CMS. **[SÂU]** Có sanitize không? Nguy cơ XSS/script injection từ nội dung backend?

### Challenge / Thu âm

154. "Challenge chính là Beat" — không có entity riêng. **[SÂU]** Nếu sau này một beat có nhiều challenge (khác luật, khác thời gian) thì model hiện tại chịu được không?
155. Chấm điểm AI 6 tiêu chí — **app không tham gia**. Bạn hiểu thuật toán chấm không? Nếu hội đồng hỏi "AI chấm bằng gì" thì trả lời thế nào?
156. **[BẪY]** Không có **polling cho `scoring_status = 'pending'`** ⇒ người dùng nộp bài xong phải tự thoát ra vào lại mới thấy điểm. Vì sao?
157. **[BẪY]** `submitEntry`/`createBeat` **không invalidate cache** ⇒ nộp bài xong danh sách không cập nhật.
158. **[BẪY]** `useDeleteEntry` không làm mới bảng xếp hạng đang xem.
159. **[BẪY]** Dạng sóng (waveform) là **giả** — không dùng metering thật. Người dùng bị đánh lừa về mặt hiển thị?
160. **[BẪY]** **Không bù trễ (latency compensation)** khi thu giọng đè lên beat. Trên Android, độ trễ audio 100–300ms là bình thường ⇒ bản thu **lệch nhịp**. Đây là lỗi chí mạng của một app âm nhạc. Bạn giải quyết thế nào?
161. **[BẪY]** **Không kiểm tra dung lượng file** dù UI có ghi giới hạn.
162. **[BẪY]** Nút "Chia sẻ" ở màn kết quả **chưa gắn hành động**.
163. **[BẪY]** Logic vote bị **viết hai lần**; `getHeroBeat` cũng bị viết lại ở 2 nơi.
164. **[BẪY]** `MyContentScreen` gọi `useAudioStore.getState()` **ngay trong render** ⇒ đọc không phản ứng, không re-render khi state đổi. Đây là lỗi dùng sai Zustand.
165. **[BẪY]** `beatDetail/HeroSection` hiển thị `duration_seconds` dưới nhãn **"LƯỢT NGHE"**. Nhãn sai hoàn toàn.
166. **[BẪY]** Datasource challenge **không gọi `unwrapUploadPayload()`** — nếu backend đổi sang trả envelope, mọi điểm hiện `0`/`NaN`. Đây là quả bom hẹn giờ. Vì sao chưa sửa?
167. 3 chế độ `setAudioModeAsync` khác nhau. **[SÂU]** Nếu quên khôi phục `allowsRecordingIOS: false` sau khi thu, chuyện gì xảy ra với âm lượng phát trên iOS?
168. `expo-av` đã bị Expo **deprecate** (thay bằng `expo-audio`/`expo-video`). Kế hoạch migrate?
169. **[BẪY]** `app.json` **không khai `expo-av`, `expo-image-picker`, `expo-document-picker`** trong `plugins`, và **không có `NSMicrophoneUsageDescription`**. Vậy bản iOS sẽ **bị App Store từ chối** hoặc **crash khi xin quyền micro**. Bạn đã build iOS bao giờ chưa?

### Profiles

170. **[BẪY]** `InfoProfile` render icon xác minh **không điều kiện** ⇒ **mọi hồ sơ đều trông như đã xác minh**. Đây là hiểu nhầm nghiêm trọng về độ tin cậy. Vì sao chưa sửa?
171. **[BẪY]** Điểm đánh giá `4.9` (nghệ sĩ) và `4.8` (venue) là **số hardcode** — chưa có hệ thống đánh giá. Đây là **dữ liệu giả hiển thị cho người dùng thật**. Bạn bảo vệ thế nào?
172. **[BẪY]** Kéo-để-làm-mới ở hồ sơ nghệ sĩ **không gọi refetch** — chỉ bật/tắt cờ. Người dùng tưởng đã làm mới.
173. **[BẪY]** `useUpdateBasicInfo`, `useUploadFile` là code chết. `mediaGallery` không khai trong `_layout.tsx`.
174. Hồ sơ nghệ sĩ 7 tab, venue 4 tab, 29 endpoint. **[SÂU]** Vì sao chia nhỏ endpoint như vậy thay vì một `PATCH /users/me`? Nếu người dùng sửa 3 tab rồi bấm lưu, có bao nhiêu request? Có transaction không — nửa chừng lỗi thì sao?
175. `featured-releases` phải gửi **cả mảng**, không có API thêm/xoá từng phần tử ⇒ race condition khi 2 thiết bị cùng sửa. Đã xử lý chưa?
176. YouTube: chỉ mở app ngoài, không có player trong app. Regex rút id 11 ký tự có xử lý được `youtu.be`, `shorts`, `live` không?
177. `BlurView` trên Android "gần như không có blur thật". **[SÂU]** Bạn có cân nhắc `expo-blur` alternative hay chấp nhận khác biệt nền tảng?

### Explore / Home / Search

178. **[BẪY]** `capacity`, `openHour`, `rentPrice`, `convenientFacilities`, `sortBy`, `sortOrder` **khai báo trong type nhưng không bao giờ được điền**. Có phải bạn sao chép type từ web mà không lược bớt?
179. **[BẪY]** `totalResults` chỉ đọc từ trang 0 ⇒ sai nếu tổng thay đổi giữa các trang.
180. **[BẪY]** `shared/presentation/ui/SearchBar.tsx` là component chung nhưng **cả Explore lẫn UnifiedSearch đều tự viết `TextInput` riêng**. Vì sao có component chung mà không dùng?
181. **[BẪY]** `features/explore/.../CustomTabBar.tsx` là code chết hoàn toàn (nhãn hardcode, không `onPress`, không ai import).
182. Tìm kiếm dùng `POST /search/users` — **vì sao POST cho một thao tác đọc**? Ảnh hưởng tới cache HTTP/CDN?
183. Debounce 500ms. Có huỷ request cũ khi gõ tiếp không, hay để chúng chạy đua?

### Collab

184. **[BẪY]** Tab "Nhận được" thực chất liệt kê **bài đăng của tôi**, không phải đơn nhận được. Đây là lỗi UX/đặt tên.
185. **[BẪY]** `CollabList` **thiếu nhánh `return` cuối** — an toàn chỉ vì `tab` là union 2 giá trị. Thêm giá trị thứ ba = render `undefined`. Vì sao TypeScript không bắt được?
186. **[BẪY]** `OpportunitySubmissionCard` bọc `ScrollView` **lồng trong `ScrollView`** cùng trục ⇒ cuộn giật.
187. **[BẪY]** `useGetMyPostedJobsSubmissions` "vừa thừa vừa sai" — chỉ truy vấn bài **đầu tiên**, bỏ qua endpoint `/my-posts/submissions`, và **không màn hình nào gọi nó**.
188. Enum trạng thái collab chỉ có 4 giá trị **không fallback** ⇒ backend trả `expired`/`skipped` thì UI hiển thị gì? Có crash badge không?

---

## I. Công nghệ & thư viện

189. Vì sao chọn **Expo** thay vì bare React Native? Đánh đổi gì (kích thước app, thời gian build, phụ thuộc EAS)?
190. Vì sao chọn **React Native** thay vì Flutter / native / KMP? Với app nặng audio, RN có phù hợp không? **[SÂU]**
191. **New Architecture (Fabric + TurboModules)** đã bật. Bạn có kiểm chứng **toàn bộ 40+ thư viện** tương thích chưa? Đã gặp crash nào chưa? Vì sao bật (bắt buộc bởi MMKV 4 / nitro-modules)?
192. `minSdkVersion 28` = Android 9 trở lên ⇒ **loại bỏ ~5–8% thiết bị** ở VN. Quyết định dựa trên số liệu nào?
193. Vì sao chọn **NativeWind** thay vì StyleSheet thuần / styled-components / Tamagui? Chi phí runtime thực tế bao nhiêu?
194. **[BẪY]** RHF + Zod **chỉ dùng ở feature auth + 3 form hồ sơ nghệ sĩ**; phần còn lại dùng `useState` + validate thủ công. Chính doc gọi đây là "nợ kỹ thuật, không phải thiết kế có chủ đích". Kế hoạch trả nợ?
195. Validate email/phone bằng **regex tự viết** ở nhiều nơi. Có nguy cơ lệch giữa các màn không? Vì sao không gom vào `domain/constants`?
196. **[BẪY]** `expo-video` và `expo-video-player` có trong `package.json` nhưng **không được import ở đâu cả**. Bao nhiêu dependency thừa? Ảnh hưởng bundle size?
197. Vì sao dùng **MMKV** thay AsyncStorage? Con số "nhanh hơn 10–30 lần" bạn lấy từ đâu, có tự đo không?
198. **[SÂU]** MMKV 4 yêu cầu `react-native-nitro-modules` và New Architecture. Nếu một thư viện khác chưa hỗ trợ New Arch, bạn xử lý sao?
199. `react-native-reanimated/plugin` **phải nằm cuối** danh sách Babel plugins. Vì sao? Nếu sai thứ tự thì lỗi gì?
200. Alias `@` khai ở **3 nơi** (`tsconfig`, `babel.config`, `jest.config`). **[SÂU]** Có cách nào single-source-of-truth không? Nếu lệch nhau thì lỗi biểu hiện thế nào (build pass nhưng test fail)?
201. `axios` bị lỗi FormData trên RN. **[SÂU]** Đây là bug đã biết của axios hay do cấu hình? Bạn đã thử `transformRequest` hoặc bản axios mới hơn chưa, hay chỉ workaround bằng fetch? Nếu vậy vì sao còn giữ axios?
202. Có bao nhiêu dependency? Có audit lỗ hổng (`npm audit`) trong CI không? **[BẪY]**
203. Bundle size hiện tại là bao nhiêu (APK/AAB)? Đã đo chưa? Có Hermes không? Có ProGuard/R8 không?
204. Có **crash reporting** (Sentry/Crashlytics) không? **[BẪY]** Nếu không thì bạn biết app crash ở đâu ngoài đời bằng cách nào? `RootErrorBoundary` chỉ chặn lỗi render JS, không bắt lỗi native.
205. Có **analytics** không? Bạn đo được bao nhiêu người dùng hoàn tất đăng ký/thanh toán không?
206. Có **OTA update** (`eas update`) không? Script có trong `package.json` nhưng `app.json` **không có khối `updates`**. **[BẪY]** Vậy `npm run update` có chạy được không?
207. **i18n**: mọi chuỗi tiếng Việt hardcode trong `domain/constants`. `settingsStore.language` không dùng. **[BẪY]** Nếu cần tiếng Anh thì làm thế nào?
208. **Accessibility**: có `accessibilityLabel`, hỗ trợ screen reader, kích thước chữ động không? **[BẪY]**

---

## J. Setup bên thứ ba

209. Vì sao **Google Sign-In và FCM nằm ở hai Google project khác nhau** (`talent-link-480717` vs `talentlink-22clc`)? Đây là chủ đích hay lịch sử để lại? Rủi ro quản trị?
210. Giải thích vì sao phải tạo **2 OAuth client** nhưng code chỉ dùng **1** (Web client). Android client tồn tại để làm gì?
211. Có **3 SHA-1 khác nhau** (debug / EAS upload key / Google Play signing key). Bạn đã thêm đủ cả ba chưa? Nếu thiếu cái nào thì triệu chứng là gì?
212. **[SÂU]** Nếu Google thu hồi/xoay `client_secret`, app có phải build lại không? Ai giữ secret đó?
213. OAuth consent screen đang ở trạng thái `Testing` hay đã `Publish`? Nếu Testing thì giới hạn 100 test user — app đã lên Play mà chưa publish consent screen thì sao? **[BẪY]**
214. `google-services.json` bị gitignore, CI ghi lại từ **secret base64**. **[SÂU]** Ai có quyền truy cập secret đó? Có rotate không? Nếu người rời dự án thì sao?
215. Firebase service account JSON (để backend gửi push) — ai giữ? Lưu ở đâu? Có secret manager không? **[BẪY]**
216. PayOS: 3 khoá (Client ID, API Key, Checksum Key) thuộc backend. Bạn xác nhận được là **không khoá nào lọt vào app** không? Chứng minh bằng cách nào?
217. Webhook PayOS: backend có **verify chữ ký bằng Checksum Key** không? Bạn kiểm chứng được không, hay chỉ tin lời backend? **[BẪY]**
218. Webhook có **idempotent** không? PayOS gửi lại 3 lần thì user có được cộng 3 lần hạn premium không?
219. Socket.IO: hạ tầng production đã cấu hình `proxy_set_header Upgrade` và sticky session chưa? Bạn kiểm chứng bằng cách nào — hay chỉ ghi trong tài liệu? **[BẪY]**
220. EAS: keystore do EAS quản lý. Đã **tải về sao lưu ngoại tuyến** chưa? Lưu ở đâu? Ai có quyền? **[BẪY]**
221. Play App Signing đã bật chưa? Nếu chưa và mất upload key thì sao?
222. Tài khoản Play Developer đứng tên **cá nhân hay tổ chức**? Nếu cá nhân thì bàn giao dự án thế nào?
223. Play Console: đã hoàn tất Privacy policy, Data safety, Content rating, Target audience, Ads declaration, App access chưa? App có yêu cầu đăng nhập ⇒ phải cấp **tài khoản test cho Google reviewer** — đã làm chưa? **[BẪY]**
224. Có kế hoạch cho **iOS/App Store** không? Cần Apple Developer 99 USD/năm, APNs key, `NSMicrophoneUsageDescription`, `NSPhotoLibraryUsageDescription`… Hiện `app.json` **chưa có mục nào**. **[BẪY]**

---

## K. CI/CD & phát hành

225. 5 workflow GitHub Actions. **[BẪY]** `test.yml` chạy trên `main`/`develop`, nhưng **không có branch protection** bắt buộc test pass trước khi merge? Xác nhận?
226. **[BẪY]** Lỗ hổng lớn nhất của pipeline (chính doc thừa nhận): `.env` nằm trong `.gitignore` **và** `.easignore` ⇒ **bản build từ GitHub Actions không có 7 biến `EXPO_PUBLIC_*`** ⇒ app cài được nhưng **không gọi được backend**. Vậy pipeline auto-deploy hiện tại **có bao giờ tạo ra bản chạy được không**? Bạn đã chạy end-to-end thành công lần nào chưa?
227. Nếu chọn cách "EAS Environment Variables" — ai quản lý? Có tách dev/staging/prod không? Hiện `eas.json` khai `environment: development|preview|production` — đã tạo biến cho từng môi trường trên expo.dev chưa?
228. `eas.json` **không có cấu hình iOS** và `submit.production` rỗng. **[BẪY]** Vậy `npm run submit:ios` chạy được không?
229. Version bump: `sync-version.js` **và** `autoIncrement` của EAS **đều tăng `versionCode`** ⇒ số nhảy cách quãng. **[BẪY]** Đây có phải xung đột thiết kế? Nguồn sự thật của versionCode là ai? (`eas.json` đặt `appVersionSource: "remote"` nhưng `app.json` vẫn có `versionCode: 13` — mâu thuẫn.)
230. Bản đầu tiên **bắt buộc upload thủ công** lên Play. Điều đó có nghĩa quy trình "một lệnh → lên store" chỉ đúng từ lần thứ hai. Bạn có ghi rõ trong tài liệu bàn giao không?
231. Fastlane chỉ upload lên track `internal`. Ai promote lên production? Có quy trình duyệt không?
232. Có **rollback** không? Nếu bản 1.0.29 crash trên diện rộng, bạn xử lý thế nào (không có OTA update)?
233. Có **staging environment** riêng không, hay dev test thẳng trên production backend? **[BẪY]**
234. `build.yml` chạy `expo prebuild` với `google-services.json` **giả**. Nó chứng minh được điều gì và **không** chứng minh được điều gì?
235. Có **smoke test / E2E** sau khi build không? Hay chỉ "build xong là xong"?
236. Commit convention được enforce bằng husky. Nhưng husky chỉ chạy ở **máy local** — dev có thể `--no-verify`. `commit-lint.yml` bù lại phần nào? **[SÂU]**

---

## L. Kiểm thử & chất lượng

237. **[BẪY]** `jest.config.js` ghi rõ: _"Coverage threshold removed to allow CI to pass. Current coverage: ~15% with 276 passing tests."_ — tức là **hạ tiêu chuẩn để CI xanh**. Bạn bảo vệ quyết định này thế nào? Con số 15% có chấp nhận được cho một app xử lý thanh toán không?
238. 15% coverage — **phần nào được test và phần nào không**? Luồng thanh toán, refresh token, socket có test không?
239. `__tests__/` nằm ở root, không co-located. `docs/architecture.md` liệt kê "co-locate tests" là việc **chưa làm**. Vì sao?
240. Có test cho **`apiClient` interceptor 401** không? Đây là đoạn logic tinh vi nhất dự án. **[BẪY]**
241. Có test cho **`socketService`** không? Cho `handleConnectionError` backoff không?
242. Có **E2E test** (Detox/Maestro) không? Nếu không thì luồng đăng nhập → ứng tuyển → chat được kiểm tra bằng cách nào? **[BẪY]**
243. `jest.setup.js` mock MMKV, Firebase, expo-router… **[SÂU]** Mock nhiều như vậy thì test còn kiểm chứng được gì? Có nguy cơ test xanh mà app đỏ không?
244. Prettier flag 256 file trên nhánh sạch, 18 test fail ở baseline. **[BẪY]** Xác nhận tình trạng hiện tại? Đây có phải "broken window" không?
245. Có **static analysis** ngoài ESLint không (SonarQube, ts-prune, knip, madge để bắt circular dependency)?
246. Bạn phát hiện code chết bằng cách nào? Doc liệt kê **≥12 chỗ code chết** — có nghĩa là không có công cụ tự động. **[BẪY]**
247. Có **code review** không? Bao nhiêu người? PR có bắt buộc approve không?
248. **[SÂU]** Nếu tôi là người mới, mất bao lâu để chạy được app? Bạn đã thử onboarding một người thật chưa?

---

## M. Hiệu năng & trải nghiệm

249. Đã đo **thời gian khởi động lạnh** chưa? Chuỗi `hydration → /users/me → guard → push register` có chặn màn hình đầu không?
250. `useAuthInitialize` gọi `GET /users/me` mỗi lần mở app. Nếu mạng chậm, người dùng thấy màn loading bao lâu? Có timeout không? **[BẪY]**
251. FlatList có `getItemLayout`, `keyExtractor`, `removeClippedSubviews`, `windowSize` không? Danh sách 500 job có giật không?
252. Ảnh: có caching, resize, progressive loading không? Dùng `Image` của RN hay `expo-image`? **[SÂU]** (`expo-image` không có trong dependencies.)
253. Có đo **FPS / JS thread** khi cuộn danh sách + phát nhạc + socket cùng lúc không?
254. Đã test trên máy cấu hình thấp chưa? Danh sách thiết bị test là gì?
255. Dark mode: đã kiểm tra **toàn bộ màn hình** chưa, hay chỉ một số? Có màn nào chữ trắng trên nền trắng không?
256. `MyContentScreen` dùng StyleSheet, phần còn lại NativeWind — dark mode ở màn đó có hoạt động không? **[BẪY]**
257. Xử lý **màn hình xoay**, tablet (`supportsTablet: true`), notch, edge-to-edge — đã test chưa?
258. Có **empty state / error state / offline state** nhất quán không, hay mỗi màn tự làm?

---

## N. Nghiệp vụ & sản phẩm

259. Ba vai trò `singer/producer/venue` **cố định sau đăng ký, không đổi được**. **[BẪY]** Một người vừa là ca sĩ vừa là producer thì sao? Phải tạo 2 tài khoản?
260. Vì sao `venue` được dịch là **"Nhà tuyển dụng"** thay vì "Địa điểm"? Có gây hiểu nhầm không?
261. Người dùng chưa xác thực email bị chặn **toàn bộ app**. Có quá cứng không? Tỷ lệ rơi rớt (drop-off) là bao nhiêu?
262. Premium mang lại quyền lợi gì cụ thể? **[BẪY]** Doc jobs ghi rõ _"feature jobs không có bất kỳ ràng buộc premium nào"_. Vậy người dùng trả 490 000 ₫ để nhận được gì? Quyền lợi có được **enforce ở server** không hay chỉ là huy hiệu?
263. Có cơ chế **báo cáo/chặn người dùng**, kiểm duyệt nội dung không? App có chat + upload media + blog ⇒ Google Play yêu cầu UGC moderation. **[BẪY]**
264. Có **điều khoản sử dụng** trong app không? Người dùng đồng ý ở đâu?
265. Có luồng **xoá tài khoản** không? Google Play bắt buộc. **[BẪY]**
266. Ai là người dùng mục tiêu, đã có bao nhiêu người dùng thật? Có test với người dùng thật chưa?
267. Nếu 10 000 người dùng đồng thời, hệ thống chịu được không? Bạn đã load test socket chưa?

---

## O. 20 câu "chí mạng" — chuẩn bị kỹ nhất

> Đây là những câu có xác suất bị hỏi cao nhất **và** dự án thật sự yếu.

1. **CI/CD không có `.env`** ⇒ bản build tự động không gọi được backend. Pipeline "một lệnh lên store" đã bao giờ chạy end-to-end thành công chưa? _(Q226)_
2. **Coverage 15%, threshold bị gỡ để CI xanh**, luồng thanh toán và refresh token không có test. _(Q237, 240)_
3. **`console.warn` log nguyên response, kể cả token đăng nhập, không guard `__DEV__`** ⇒ rò rỉ token vào logcat bản production. _(Q42)_
4. **MMKV encryption key là `EXPO_PUBLIC_`** ⇒ nằm trong APK, ai cũng đọc được. "Mã hoá" bảo vệ được gì? _(Q88)_
5. **`EXPO_PUBLIC_AUTH_REFRESH_URL` đang trỏ domain cũ `talentlink.io.vn`** trong khi API đã sang `soundspal.com`. _(Q45)_
6. **iOS chưa từng chạy được**: thiếu APNs key, thiếu `NSMicrophoneUsageDescription`, thiếu plugin `expo-av`/`image-picker`/`document-picker` trong `app.json`, `eas.json` không có config iOS. _(Q82, 169, 224, 228)_
7. **Blog không có `GET /blogs/{id}`** ⇒ fetch cả feed rồi `.find()`; bài cũ mở ra báo "not found", deep link gãy. _(Q146)_
8. **Thu âm không bù trễ** ⇒ giọng lệch beat trên Android. Lỗi chí mạng cho app âm nhạc. _(Q160)_
9. **Điểm đánh giá 4.9/4.8 là số hardcode**; **icon "đã xác minh" hiện cho mọi hồ sơ**. Hiển thị dữ liệu giả cho người dùng thật. _(Q170, 171)_
10. **Socket dùng token cũ mãi mãi**, cờ `hasAttemptedTokenRefresh` không bao giờ được set `true`, `isConnecting` reset sai chỗ ⇒ logic reconnect không hoạt động như mô tả. _(Q59, 60, 61)_
11. **Sau 5 lần fail, socket ngừng hẳn tới khi restart app** — mất mạng 1 phút là mất realtime cả phiên. _(Q63)_
12. **`logout()` không huỷ device token** ⇒ máy dùng chung vẫn nhận push của tài khoản cũ. _(Q79)_
13. **`collab` sao chép nguyên feature `jobs`** ⇒ hai cache lệch nhau, cùng dữ liệu hiển thị hai kết quả. _(Q11, 184–188)_
14. **Ngân sách: màn tạo nhập theo triệu, màn sửa nhập theo VND** ⇒ sửa bài là sai giá 10⁶ lần. _(Q122)_
15. **`PUT /posts/{id}` full-body**: quên cập nhật `buildUpdatePayloadFromJob` = mất dữ liệu im lặng. _(Q125)_
16. **Giá Premium hardcode client**, không tự gia hạn, poll chỉ 20 giây, không có xác nhận khi premium kích hoạt. _(Q107, 109, 112)_
17. **`isPremiumActive` phải chữa cháy cho bug backend** (`is_premium` vẫn `true` sau khi hết hạn). _(Q114)_
18. **Deep link dùng custom scheme, không phải App Links** ⇒ có thể bị app khác cướp callback thanh toán. _(Q101)_
19. **Không có crash reporting, không có analytics, không có OTA update** ⇒ app ra ngoài là mù thông tin và không vá nóng được. _(Q204, 205, 206)_
20. **Không có luồng xoá tài khoản, không có moderation UGC** ⇒ vi phạm chính sách Google Play. _(Q263, 265)_

---

## P. Cách trả lời khi bị dồn

- **Với câu [BẪY]**: thừa nhận thẳng → nêu **nguyên nhân thật** (thời gian, phụ thuộc backend, ưu tiên) → nêu **cách khắc phục cụ thể + ước lượng công sức**. Đừng chống chế; hội đồng đánh giá cao người biết điểm yếu của hệ thống mình.
- **Với câu "vì sao chọn X"**: luôn trả lời theo cấu trúc **yêu cầu → phương án đã cân nhắc → tiêu chí chọn → đánh đổi chấp nhận**.
- **Với câu về backend**: phân định rõ ranh giới trách nhiệm, nhưng **đừng đổ lỗi** — nói "hợp đồng API chưa thống nhất, app đang gánh phần chuẩn hoá; hướng đúng là đưa về backend".
- **Câu bạn nên chủ động nêu trước** (biến điểm yếu thành điểm mạnh): lỗ hổng `.env` trong CI, coverage 15%, iOS chưa hoàn thiện, trùng lặp `jobs`/`collab`. Nêu trước kèm kế hoạch = chủ động; bị hỏi mới nói = bị động.

# 01 — Xác thực & phân quyền (Auth)

## 0. Bản đồ file

| File                                                                                                                   | Vai trò                                    |
| ---------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| [features/auth/data/datasources/authRemoteDataSource.ts](../../features/auth/data/datasources/authRemoteDataSource.ts) | 14 endpoint auth                           |
| [features/auth/presentation/store/authStore.ts](../../features/auth/presentation/store/authStore.ts)                   | Token + user, persist qua MMKV             |
| [features/auth/presentation/hooks/useGoogleSignIn.ts](../../features/auth/presentation/hooks/useGoogleSignIn.ts)       | Luồng Google server-auth-code              |
| [features/auth/presentation/hooks/useAuthInitialize.ts](../../features/auth/presentation/hooks/useAuthInitialize.ts)   | Xác thực token khi mở app                  |
| [features/auth/domain/utils/resolveAuthErrorMessage.ts](../../features/auth/domain/utils/resolveAuthErrorMessage.ts)   | Dịch mã lỗi API sang tiếng Việt (219 dòng) |
| [shared/presentation/hooks/useProtectedRoute.ts](../../shared/presentation/hooks/useProtectedRoute.ts)                 | Guard điều hướng                           |
| [shared/utils/jwt.ts](../../shared/utils/jwt.ts)                                                                       | Decode JWT                                 |

Màn hình: `LoginScreen`, `RegisterScreen`, `VerifyEmailScreen`, `ForgotPasswordScreen`,
`VerifyResetCodeScreen`, `ResetPasswordScreen`, `ChangeEmailScreen`,
`CompleteOAuthProfileScreen`, `EmailVerificationRequiredScreen`.

---

## A. Kiến trúc

1. **[KT]** Auth là feature **duy nhất dùng đủ 3 tầng + usecase + RHF/Zod**. Vì sao đầu tư nhiều ở đây mà các feature khác dùng `useState` + validate tay?

2. **[KT]** `authStore` nằm ở `presentation/store` nhưng bị **infrastructure import** (`apiClient`, `socketService`, `multipartUpload`). Đó là store trạng thái UI hay hạ tầng? Bạn xếp lại thế nào?

3. **[KT]** Có **hai store user**: `authStore` (thật, đang dùng) và `shared/.../userStore.ts` (chỉ có `{name, email}`, persist bị comment, không ai import). Vì sao còn giữ?

4. **[KT]** `resolveAuthErrorMessage.ts` dài 219 dòng nằm ở `domain/utils`. Đây đúng là domain hay là presentation (nó sinh chuỗi hiển thị tiếng Việt)?

---

## B. Luồng đi

### B1. Đăng nhập bằng email/mật khẩu

5. **[LUỒNG]** Kể tuần tự từ lúc bấm nút đăng nhập đến khi vào được trang chủ.
    - `↳` `LoginForm` → `useLogin` (React Query mutation) → `authRemoteDataSource.login` (`POST /auth/login`) → nhận `access_token`/`refresh_token` → `getUserFromToken()` decode → `setCredentials()` → MMKV persist → `useProtectedRoute` phát hiện đang ở `(auth)` và đã verified → `router.replace` về `returnTo` hoặc `(tabs)`.

6. **[LUỒNG]** Vì sao thông tin user lấy từ **decode JWT** chứ không từ body response? Đánh đổi là gì khi backend đổi claim?

7. **[SÂU]** Điều hướng sau đăng nhập **không** do màn login gọi `router.push`, mà do `useProtectedRoute` phản ứng với thay đổi state. Ưu điểm của mô hình reactive này? Nhược điểm khi debug?

### B2. Mở app khi đã có token trong MMKV

8. **[LUỒNG]** Mô tả `useAuthInitialize()` + `useAuthHydration()`. Vì sao cần cả hai?
    - `↳` Hydration = chờ MMKV nạp xong (bất đồng bộ); Initialize = gọi `GET /users/me` để (a) xác thực token còn sống, (b) làm mới `is_verified`/`avatar_url` mà JWT cũ không có.

9. **[LUỒNG]** Nếu token đã hết hạn lúc mở app, chuyện gì xảy ra theo đúng thứ tự?
    - `↳` `/users/me` trả 401 → interceptor refresh → thành công thì `setCredentials` mới; thất bại thì `logout()` → guard đá về login.

### B3. Quên mật khẩu (3 màn)

10. **[LUỒNG]** Vẽ luồng 3 bước và nêu tên endpoint từng bước.
    - `↳` `/auth/reset-password-request` (gửi OTP) → `/auth/confirm-reset-password-request` (đổi OTP lấy `reset_token`) → `/auth/reset-password` (đặt mật khẩu mới).

11. **[SÂU]** `reset_token` được truyền sang màn 3 bằng **route param**. Route param có bị ghi vào lịch sử điều hướng / deep-link log không? Giữ trong memory (store) có an toàn hơn không, và đánh đổi là gì?

12. **[BIZ]** Có `resendResetPasswordCode` riêng (`/auth/reset-password-request-resend`). Vì sao không tái dùng endpoint gửi lần đầu?

### B4. Google Sign-In

13. **[LUỒNG]** Kể đủ 7 bước của `signInWithGoogle()`.
    - `↳` `configure()` → `hasPlayServices()` → **`signOut()`** → `signIn()` → lấy `serverAuthCode` → `getDevicePayload()` (FCM token) → `POST /auth/mobile-oauth` → rẽ nhánh theo `is_registered`.

14. **[LUỒNG]** Rẽ nhánh sau `mobile-oauth`: `is_registered === true` và `false` khác nhau thế nào?
    - `↳` `true` → có `access_token`/`refresh_token`, đăng nhập luôn. `false` → chỉ có `registration_token`, đẩy sang `complete-oauth-profile` để chọn role rồi gọi `/auth/complete-oauth`.

15. **[SÂU]** Vì sao phải gọi `GoogleSignin.signOut()` **trước** `signIn()`? Tác dụng phụ với UX là gì?
    - `↳` Ép hiện lại bảng chọn tài khoản + đảm bảo `serverAuthCode` mới (code chỉ dùng một lần). Đổi lại: người dùng phải chọn tài khoản mỗi lần, không "một chạm".

---

## C. Business logic

16. **[BIZ]** Trạng thái `is_verified === false` bị guard xử lý thế nào, và người dùng vẫn làm được gì?
    - `↳` `useProtectedRoute` nhánh 2 ép về `email-verification-required`, chỉ cho ở lại `verify-email`.

17. **[BIZ]** Cơ chế `returnTo` hoạt động ra sao và **vì sao loại trừ** `(tabs)` với `(editprofile)`?
    - `↳` `redirectStore.setPending()`; loại `(tabs)` để logout không tự bắt chính màn đang đứng làm điểm quay lại.

18. **[BIZ]** OTP 6 số, đếm ngược 30 giây ở client. Chống brute-force nằm ở đâu? Người dùng kill app rồi mở lại có lách được đếm ngược không?

19. **[BIZ]** Ràng buộc mật khẩu hiện tại là gì và có đủ theo OWASP MASVS / NIST không?

20. **[BIZ]** `logout()` chỉ `set()` các field về `null`. Nó **không** gọi API huỷ device token và **không** ngắt socket trực tiếp. Hệ quả trên máy dùng chung là gì?
    - `↳` Socket bị ngắt gián tiếp qua `SocketProvider` (effect phụ thuộc `accessToken`). Nhưng FCM token vẫn còn trên backend → người A đã đăng xuất vẫn nhận push trên máy đó.

21. **[BIZ]** Có endpoint `POST /auth/logout` trong datasource. Nó có được gọi không, và nếu có thì backend thu hồi refresh token ở đâu?

22. **[SÂU]** Đăng xuất trên một thiết bị có thu hồi phiên ở thiết bị khác không? Có màn "quản lý phiên đăng nhập" không? Nếu không thì đây là thiếu sót hay ngoài phạm vi?

---

## D. Bên thứ ba — Google Sign-In

23. **[3RD]** Dự án dùng **server auth code flow**, không phải ID token flow. So sánh hai flow và nêu lợi ích cụ thể mà bạn nhận được.
    - `↳` `offlineAccess: true` + `forceCodeForRefreshToken: true` → backend đổi code lấy refresh token của Google, chủ động gọi API Google về sau mà không cần client.

24. **[3RD]** `webClientId` phải là OAuth client loại **Web application**, không phải Android. Vì sao? Android client tồn tại để làm gì nếu code không dùng đến nó?
    - `↳` Comment ở `useGoogleSignIn.ts:27-31` nói rõ: phải trùng client_id mà backend giữ `client_secret`. Android client tồn tại để Google Play Services xác thực chữ ký app (SHA-1).

25. **[3RD]** Có **3 SHA-1** cần khai (debug, EAS upload key, Google Play signing key). Thiếu từng cái thì triệu chứng lỗi khác nhau ra sao?

26. **[3RD]** Google Sign-In và FCM nằm ở **hai Google project khác nhau** (`talent-link-480717` vs `talentlink-22clc`). Chủ đích hay lịch sử để lại? Rủi ro quản trị?

27. **[3RD]** Nếu Google xoay `client_secret`, app có phải build lại không? Ai giữ secret đó?

28. **[3RD]** OAuth consent screen đang `Testing` hay đã `Publish`? Nếu `Testing` thì giới hạn 100 test user — app đã lên Play mà consent screen chưa publish thì người dùng thấy gì?

29. **[SÂU]** `getDevicePayload()` có timeout 5 giây. Mạng chậm hơn 5s ⇒ đăng nhập vẫn thành công nhưng **không gửi FCM token**. Hệ quả là gì và bạn bù lại ở đâu?
    - `↳` Người dùng không nhận push cho tới lần đăng nhập sau. `usePushTokenSync` chỉ bắt sự kiện `onTokenRefresh`, không retry chủ động → đây là khoảng hở thật.

---

## E. Đào sâu

30. **[SÂU]** `useProtectedRoute` chỉ là guard **UI**. Route `/(jobs)/my-applications` không guard theo role. Phản biện câu "phân quyền phía client không phải là bảo mật" — bạn đồng ý tới đâu?

31. **[SÂU]** Nút "Đăng tin" hiển thị cho **mọi role** (ca sĩ cũng đăng được tin tuyển dụng). Yêu cầu nghiệp vụ hay thiếu ràng buộc? Backend có chặn không, và bạn kiểm chứng bằng cách nào?

32. **[SÂU]** `authStore` persist **cả `refreshToken`** vào MMKV. Nếu chuyển sang Keychain/Keystore thì phải sửa những gì? Zustand `persist` có hỗ trợ storage bất đồng bộ không?

33. **[SÂU]** Access token sống bao lâu, refresh token sống bao lâu? Refresh token có **rotate** không? Backend có phát hiện **reuse** (dấu hiệu token bị đánh cắp) không, và app phản ứng thế nào?

34. **[SÂU]** Có certificate pinning / root-jailbreak detection / obfuscation không? Nếu không, lý do là chi phí, phạm vi đồ án, hay chưa cân nhắc?

---

## F. Điểm yếu nên chủ động thừa nhận

| Vấn đề                                             | Hướng trả lời                                                              |
| -------------------------------------------------- | -------------------------------------------------------------------------- |
| `logout()` không huỷ device token trên backend     | Lỗ hổng riêng tư thật trên máy dùng chung; cần `DELETE /auth/device-token` |
| Log response `/auth/login` ra console ở production | Thừa nhận, ưu tiên vá cao nhất                                             |
| Refresh token trong MMKV thay vì Keychain/Keystore | Nêu rõ mô hình đe doạ được/không được che                                  |
| Guard chỉ ở UI, không guard theo role              | Khẳng định backend là nơi chặn thật; UI chỉ là trải nghiệm                 |
| Không có màn quản lý phiên / xoá tài khoản         | Google Play bắt buộc "xoá tài khoản" từ 2024 — cần bổ sung                 |

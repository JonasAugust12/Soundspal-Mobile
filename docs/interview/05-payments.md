# 05 — Thanh toán & Premium (PayOS)

> Feature nhạy cảm nhất: dính tiền thật. Luồng bất đồng bộ 3 bên (app ↔ backend ↔ PayOS)
> và app **không** có kênh nhận kết quả trực tiếp — phải poll.

## 0. Bản đồ file

| File                                                                                                                                   | Vai trò                                           |
| -------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| [features/payments/domain/constants/payment.ts](../../features/payments/domain/constants/payment.ts)                                   | Bảng giá + tham số poll                           |
| [features/payments/domain/utils/payment.ts](../../features/payments/domain/utils/payment.ts)                                           | Chuẩn hoá trạng thái, parse return URL (305 dòng) |
| [features/payments/data/datasources/paymentsRemoteDataSource.ts](../../features/payments/data/datasources/paymentsRemoteDataSource.ts) | 3 endpoint: checkout / history / status           |
| [features/payments/presentation/hooks/usePaymentApi.ts](../../features/payments/presentation/hooks/usePaymentApi.ts)                   | Hook + retry đặc biệt cho 404                     |
| [features/payments/presentation/screens/PremiumScreen.tsx](../../features/payments/presentation/screens/PremiumScreen.tsx)             | Toàn bộ luồng UI (827 dòng)                       |
| [shared/domain/utils/premium.ts](../../shared/domain/utils/premium.ts)                                                                 | Quy tắc xác định Premium còn hạn                  |

---

## A. Kiến trúc

1. **[KT]** Toàn bộ luồng nằm trong **một màn 827 dòng**. Nếu tách, bạn tách theo ranh giới nào? Cái gì thuộc hook, cái gì thuộc component?

2. **[KT]** `premium.ts` nằm ở `shared/domain/utils` chứ không trong `features/payments`. Vì sao?
    - `↳` Badge Premium hiển thị ở profiles, explore, cards… — nhiều feature dùng chung, và nó **mirror `lib/premium.ts` bên web** để hai nền tảng hiểu giống nhau.

3. **[KT]** `payment.ts` (domain/utils) chứa 4 `Set` trạng thái + hàm parse URL. Đây là domain logic thật hay là lớp chống đỡ cho API không nhất quán?

---

## B. Luồng đi

### B1. Toàn cảnh

4. **[LUỒNG]** Vẽ luồng thanh toán đầy đủ, ghi rõ ai gọi ai.
    - `↳`
        ```
        App: POST /payments/checkout  → BE tạo link PayOS → trả checkout_url (orderCode = null)
        App: Linking.openURL(checkout_url) → TRÌNH DUYỆT NGOÀI
        User thanh toán trên PayOS
        PayOS → webhook → BE (cập nhật DB, set is_premium + premium_expired_at)
        PayOS → redirect_url (deep link soundspal://) → App quay lại
        App: parse URL lấy orderCode + status → poll GET /payments/status/{orderCode}
        App: refetch GET /users/me để lấy is_premium mới
        ```

5. **[LUỒNG]** App có **mấy nguồn** để biết kết quả thanh toán? Kể đủ và nêu thứ tự ưu tiên.
    - `↳` (1) query param trong deep link (`payosReturnStatus` — ưu tiên cao nhất); (2) `GET /payments/status/{orderCode}` (poll); (3) `is_premium`/`premium_expired_at` từ `/users/me`.

6. **[LUỒNG]** `PremiumScreen` có **4 `useEffect` khác nhau** cùng phản ứng với việc quay lại app. Kể tên và cho biết cái nào bắt tình huống nào.
    - `↳` (a) `searchParams` (expo-router truyền orderCode/status); (b) `Linking.getInitialURL` + listener `url`; (c) `AppState` chuyển sang `active` → refetch status; (d) interval poll 2s.

7. **[SÂU]** Bốn cơ chế chồng nhau có gây gọi API trùng lặp không? Bạn có thể hợp nhất chúng thành mấy cái?

### B2. Tạo phiên thanh toán

8. **[LUỒNG]** `buildPremiumUpgradeCheckoutRequest()` gửi lên những field nào?
    - `↳` `purpose: 'ACCOUNT_UPGRADE'`, `amount`, `billing_period`, `description`, `reference_id` (= userId), `redirect_url`, `cancel_url`.

9. **[BIZ]** `redirect_url` và `cancel_url` được dựng bằng `ExpoLinking.createURL('/(payments)/premium')`, cancel thêm `?cancel=1`. Vì sao phải phân biệt hai URL khi app đằng nào cũng parse?
    - `↳` PayOS đính `cancel=1` vào cancel_url; app dựa vào đó suy ra `CANCELLED` khi không có `status` (`payment.ts:181-185`).

10. **[SÂU]** `createCheckout` trả về `orderCode: null` **luôn luôn** (`paymentsRemoteDataSource.ts:27`). Vì sao? App lấy `orderCode` ở đâu?
    - `↳` Backend không trả về. App lấy từ deep link, hoặc fallback `resolvePaymentOrderCodeFromHistory()` → `GET /payments/history?limit=10` rồi lấy đơn mới nhất.

11. **[SÂU]** Nếu người dùng tạo **2 giao dịch trong 10 giây**, `extractLatestOrderCodeFromHistory()` có lấy nhầm đơn không? Đã xử lý chưa?

### B3. Poll trạng thái

12. **[LUỒNG]** Tham số poll là gì và tổng thời gian bao lâu?
    - `↳` `PAYMENT_STATUS_POLL_INTERVAL_MS = 2000`, `PAYMENT_STATUS_MAX_POLLS = 10` ⇒ ~20 giây, sau đó `pollBudgetExhausted = true` và dừng.

13. **[SÂU]** Webhook đến ở giây thứ 25 thì người dùng thấy gì? Có cơ chế push từ backend khi webhook xử lý xong không? Bạn đề xuất gì (socket event? FCM silent push?).

14. **[SÂU]** Riêng lỗi **404** được retry tới **8 lần** với backoff tăng dần, còn lỗi khác chỉ 1 lần (`usePaymentApi.ts:87-89`). Vì sao 404 lại đặc biệt?
    - `↳` "Giao dịch chưa kịp ghi DB" — backend trả `checkout_url` **trước khi** ghi bản ghi giao dịch. Đây là dấu hiệu backend chưa write-then-return.

15. **[SÂU]** Đó là vá ở client cho một vấn đề thiết kế ở backend. Bạn đề xuất sửa ở nguồn thế nào?

16. **[LUỒNG]** Sau khi `payosReturnStatus === 'success'` nhưng `isPremium` vẫn `false`, có một interval **riêng** chỉ refetch `/users/me`. Vì sao cần vòng lặp thứ hai này?
    - `↳` Status giao dịch `success` ≠ user đã được nâng cấp. Webhook cập nhật user là bước tách rời.

---

## C. Business logic

17. **[BIZ]** Bảng giá **hardcode ở client**: 49 000 ₫/tháng, 490 000 ₫/năm. Backend re-validate `amount` theo `billing_period` và từ chối nếu lệch. Vậy khi đổi giá, người dùng bản cũ gặp gì?
    - `↳` Gửi `amount` cũ → backend từ chối → thông báo lỗi chung chung. Cần cơ chế force-update hoặc lấy bảng giá từ API.

18. **[BIZ]** Vì sao `description` bị giới hạn **≤ 25 ký tự ASCII không dấu**? Ràng buộc này được enforce ở đâu?
    - `↳` PayOS dùng nó làm **memo chuyển khoản VietQR**; chuỗi dài/có dấu làm `CreatePaymentLink` fail. Hiện chỉ hardcode trong `PREMIUM_PLANS`, **không có validate runtime** — thêm gói mới mà quên thì lỗi ở PayOS.

19. **[BIZ]** Gói năm = 10× giá tháng (tặng 2 tháng, ~17%). Gói mặc định là `yearly`. Đây là quyết định kinh doanh — bạn đo hiệu quả bằng gì?

20. **[BIZ]** Giải thích **vì sao `is_premium` một mình là chưa đủ** để hiện badge.
    - `↳` `premium.ts:6-8` — hết hạn thì backend vẫn để `true` cho tới lần quét dọn kế tiếp. Nên `isPremiumActive()` phải kiểm tra **cả** `is_premium` **và** `premium_expired_at > now`.

21. **[SÂU]** Đó là bug backend mà client gánh. Nhưng nó cũng tạo lỗ hổng: người dùng **đổi giờ hệ thống về quá khứ** thì `premium_expired_at > now` đúng ⇒ UI cho dùng Premium. Rủi ro thật là gì? Server có chặn không?

22. **[BIZ]** `PremiumState` có 3 giá trị `none | active | expired`. Vì sao tách `expired` khỏi `none`?
    - `↳` `expired` hiện CTA **"Gia hạn Premium"** thay vì "Nâng cấp Premium".

23. **[BIZ]** `PremiumScreen` có fallback về `tier === 'premium'` khi backend chưa trả `is_premium`. Fallback này còn cần không, hay là code chết?

24. **[BIZ]** Quyền lợi Premium khác nhau theo role: venue có thêm "đăng 100 tin/tháng". Quota này được **enforce ở đâu** — client hay server? Bạn kiểm chứng bằng cách nào?

25. **[BIZ]** **Không tự động gia hạn** (không subscription). Hạn chế của PayOS hay quyết định nghiệp vụ? Ảnh hưởng doanh thu?

26. **[BIZ]** **Không huỷ được giao dịch từ app**. Người dùng tạo 5 phiên rác thì backend/PayOS xử lý sao?

27. **[BIZ]** Chỉ có `PaymentPurpose = 'ACCOUNT_UPGRADE'`. Nếu sau này bán beat hoặc tài trợ challenge, kiến trúc hiện tại mở rộng thế nào?

---

## D. Bên thứ ba — PayOS

28. **[3RD]** Vì sao mở PayOS bằng **trình duyệt ngoài** (`Linking.openURL`) thay vì WebView trong app? Đánh đổi UX vs bảo mật.
    - `↳` Trình duyệt ngoài: người dùng thấy thanh địa chỉ + khoá HTTPS (chống phishing), app không chạm vào form thẻ. Đổi lại: rời app, phải quay về bằng deep link.

29. **[3RD]** PayOS có **3 khoá**: Client ID, API Key, Checksum Key. Bạn xác nhận được là **không khoá nào lọt vào app** không? Chứng minh bằng cách nào?
    - `↳` Grep toàn bộ `EXPO_PUBLIC_*` và bundle; mọi lời gọi PayOS đều qua backend (`/payments/checkout`), app chỉ nhận `checkout_url`.

30. **[3RD]** Backend có **verify chữ ký webhook bằng Checksum Key** không? Bạn kiểm chứng được hay chỉ tin lời backend? Nếu không verify thì kẻ tấn công làm được gì?

31. **[3RD]** Webhook có **idempotent** không? PayOS gửi lại 3 lần thì user có được cộng 3 lần hạn premium không?

32. **[3RD]** Có **đối soát giao dịch** (reconciliation) giữa PayOS và DB không? Ai phát hiện trường hợp "tiền về mà premium không kích hoạt"?

33. **[3RD]** PayOS dashboard chỉ nhận URL **http/https** cho return URL. App dùng `soundspal://`. Hiện đang dùng trực tiếp custom scheme hay có trang trung gian?
    - `↳` Nếu dùng trực tiếp mà PayOS chấp nhận thì đó là may mắn, không phải thiết kế — cần chốt lại.

34. **[SÂU]** Deep link dùng **custom scheme**, không phải App Links có xác minh domain. Bất kỳ app nào cũng đăng ký được `soundspal://` và **cướp callback thanh toán**. Rủi ro thật là gì?
    - `↳` Kẻ tấn công chỉ chặn được **thông báo kết quả**, không lấy được tiền (giao dịch đã hoàn tất ở PayOS, premium do webhook cấp). Nhưng có thể gây hoang mang / phishing. Nên trả lời có phân tầng, đừng phóng đại.

35. **[3RD]** Test PayOS ở dev cần ngrok + sandbox. Có test tự động nào cho luồng thanh toán không, hay 100% thủ công?

---

## E. Đào sâu

36. **[SÂU]** `normalizePaymentStatus()` chấp nhận **7 chuỗi success, 6 pending, 7 failed, 5 cancelled**. Đây là lập trình phòng thủ hay dấu hiệu không nắm được hợp đồng API? Bạn sẽ thu gọn thế nào?

37. **[SÂU]** `getRawPaymentStatus()` dò tới 5 tên trường (`status`, `payment_status`, `paymentStatus`, `transaction_status`, `state`). Cùng câu hỏi trên.

38. **[SÂU]** `parsePaymentHistoryItems()` dò 5 khoá lồng (`items`, `transactions`, `payments`, `records`, `data`). Comment nói rõ "trước đây thiếu 'data' nên danh sách rỗng dù backend có trả về". Bạn rút ra bài học gì về cách làm việc với API chưa ổn định?

39. **[SÂU]** Nếu người dùng thanh toán thành công nhưng **không quay lại app** (đóng trình duyệt), lần sau mở app họ thấy gì? Có được nâng cấp không?
    - `↳` Webhook đã chạy ở backend → `/users/me` trả `is_premium: true` → badge hiện. Luồng poll chỉ để phản hồi **nhanh**, không phải điều kiện để nâng cấp. Đây là điểm thiết kế đúng, nên nêu chủ động.

40. **[SÂU]** Thiết kế lại: nếu được thêm **một** cải tiến duy nhất cho luồng này, bạn chọn gì và vì sao?

---

## F. Điểm yếu nên chủ động thừa nhận

| Vấn đề                               | Hướng trả lời                                                                   |
| ------------------------------------ | ------------------------------------------------------------------------------- |
| Bảng giá hardcode ở client           | Thừa nhận; nêu hướng lấy từ `GET /payments/plans` + force-update                |
| Poll 20 giây rồi bỏ cuộc             | Nêu rõ **không mất tiền** — webhook vẫn chạy; chỉ là phản hồi UI chậm           |
| `orderCode` phải dò từ history       | Nợ backend; nêu race condition 2 giao dịch gần nhau chưa xử lý                  |
| Retry 404 tới 8 lần                  | Vá cho backend chưa write-then-return; nêu cách sửa ở nguồn                     |
| `is_premium` cần kiểm tra kèm hạn    | Thừa nhận là gánh nợ backend; nhưng client làm đúng khi phòng thủ               |
| Đổi giờ máy có thể qua mặt UI        | Chỉ là UI; server mới là nơi chặn. Nếu server không chặn thì đó là lỗ hổng thật |
| Custom scheme thay vì App Links      | Phân tích rủi ro có phân tầng, đừng phóng đại; nêu lộ trình App Links           |
| Không có test tự động cho luồng tiền | Điểm yếu nghiêm trọng nhất; nêu 3 test đầu tiên sẽ viết                         |

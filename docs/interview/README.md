# Bộ câu hỏi phỏng vấn theo chức năng — Soundspal Mobile (TL-Mobile)

Mỗi file = một chức năng. Câu hỏi được soạn bằng cách **đọc trực tiếp source**, không suy đoán từ tài liệu.

## Quy ước dùng chung

| Ký hiệu     | Nghĩa                                                         |
| ----------- | ------------------------------------------------------------- |
| **[KT]**    | Kiến trúc — phân tầng, phụ thuộc, ranh giới module            |
| **[LUỒNG]** | Luồng đi — thứ tự các bước, ai gọi ai, state chuyển thế nào   |
| **[BIZ]**   | Business logic — quy tắc nghiệp vụ, ràng buộc, trạng thái     |
| **[3RD]**   | Bên thứ ba — cách tích hợp, cấu hình, khoá, hợp đồng dữ liệu  |
| **[SÂU]**   | Đào sâu kiến thức nền, trả lời tốt sẽ ghi điểm                |
| `↳`         | **Ý chốt** rút từ code — dùng để tự chấm câu trả lời của mình |

## Danh sách file

| #   | File                                                   | Chức năng                                | Bên thứ ba liên quan                  |
| --- | ------------------------------------------------------ | ---------------------------------------- | ------------------------------------- |
| 00  | [00-core-shared.md](00-core-shared.md)                 | Hạ tầng dùng chung (nền của mọi feature) | Axios, React Query, MMKV, Expo Router |
| 01  | [01-auth.md](01-auth.md)                               | Xác thực & phân quyền                    | Google Sign-In, JWT                   |
| 02  | [02-jobs.md](02-jobs.md)                               | Tuyển dụng / tin đăng                    | —                                     |
| 03  | [03-messaging.md](03-messaging.md)                     | Nhắn tin realtime                        | Socket.IO                             |
| 04  | [04-notifications.md](04-notifications.md)             | Push notification                        | Firebase Cloud Messaging              |
| 05  | [05-payments.md](05-payments.md)                       | Thanh toán & Premium                     | PayOS                                 |
| 06  | [06-blog.md](06-blog.md)                               | Blog & bình luận                         | —                                     |
| 07  | [07-challenge.md](07-challenge.md)                     | Challenge / thu âm / chấm điểm           | expo-av, AI scoring (BE)              |
| 08  | [08-profiles.md](08-profiles.md)                       | Hồ sơ nghệ sĩ & venue                    | —                                     |
| 09  | [09-collab.md](09-collab.md)                           | Cộng tác / quản lý đơn ứng tuyển         | —                                     |
| 10  | [10-explore-home-search.md](10-explore-home-search.md) | Khám phá, Trang chủ, Tìm kiếm            | —                                     |

> File `00` không phải một chức năng nghiệp vụ, nhưng mọi feature đều đứng trên nó
> (`apiClient`, refresh token, upload, React Query, MMKV, route guard). Nên đọc trước tiên.

## Liên quan

- [../CAU_HOI_PHAN_BIEN.md](../CAU_HOI_PHAN_BIEN.md) — bộ câu hỏi **phản biện** theo chủ đề
  cắt ngang (kiến trúc, state, mạng, CI/CD, kiểm thử). Bổ sung cho bộ này, không thay thế.
- [../features/](../features/) — tài liệu mô tả từng feature.
- [../architecture.md](../architecture.md) — sơ đồ phân tầng tổng thể.

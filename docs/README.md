# Documentation

## 📘 Tài liệu HTML (khuyến nghị — bản mới nhất)

Bộ tài liệu đầy đủ dạng HTML, có mục lục tự động, dark mode và điều hướng chéo.
Mở bằng trình duyệt: **[docs/html/index.html](./html/index.html)**

| Document                                                           | Description                                                                                                                   |
| ------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| [html/01-kien-truc-du-an.html](./html/01-kien-truc-du-an.html)     | Cấu trúc thư mục, vai trò từng file, luồng dữ liệu, luồng khởi động, refresh token                                            |
| [html/02-cong-nghe-su-dung.html](./html/02-cong-nghe-su-dung.html) | Mỗi thư viện dùng ở file nào, dùng thế nào, vì sao chọn                                                                       |
| [html/03-setup-ben-thu-ba.html](./html/03-setup-ben-thu-ba.html)   | Google Cloud, FCM, Google Sign-In, PayOS, Socket.IO, EAS, Play Console, Fastlane                                              |
| [html/features/](./html/features/)                                 | 10 tài liệu tính năng: auth, profiles, jobs, collab, messaging, notifications, payments, blog, challenge, explore/home/search |

> Các file `.md` bên dưới là bản cũ; một số đã lỗi thời so với code. Bộ HTML được viết
> lại từ source tại v1.0.28 và là bản được duy trì.

## Bắt đầu

| Document                                             | Description                       |
| ---------------------------------------------------- | --------------------------------- |
| [features/README.md](./features/README.md)           | Index từng feature, thứ tự đọc    |
| [features/00-overview.md](./features/00-overview.md) | Stack, cách đọc source, map 5 tab |
| [onboarding.md](./onboarding.md)                     | Hướng dẫn nắm source tổng quan    |

## Tài liệu từng feature

Mỗi file gồm: business logic, luồng user, giải thích code, API, lý do triển khai.

| Feature                           | File                                             |
| --------------------------------- | ------------------------------------------------ |
| Shared (apiClient, socket, guard) | [features/shared.md](./features/shared.md)       |
| Auth                              | [features/auth.md](./features/auth.md)           |
| Home                              | [features/home.md](./features/home.md)           |
| Explore                           | [features/explore.md](./features/explore.md)     |
| Jobs                              | [features/jobs.md](./features/jobs.md)           |
| Profiles                          | [features/profiles.md](./features/profiles.md)   |
| Collab                            | [features/collab.md](./features/collab.md)       |
| Challenge                         | [features/challenge.md](./features/challenge.md) |
| Blog                              | [features/blog.md](./features/blog.md)           |
| Messaging                         | [features/messaging.md](./features/messaging.md) |
| Payments                          | [features/payments.md](./features/payments.md)   |

## Kiến trúc

| Document                             | Description                                                               |
| ------------------------------------ | ------------------------------------------------------------------------- |
| [architecture.md](./architecture.md) | Clean Architecture overview, folder roles, feature map, sequence diagrams |

Diagrams use [Mermaid](https://mermaid.js.org/). They render in GitHub, GitLab, VS Code (with a Mermaid extension), and Cursor.

# Tài liệu từng Feature — TalentLink Mobile

> Đọc theo thứ tự nếu bạn mới vào dự án. Mỗi file là **một module độc lập** — đủ business logic, giải thích code và cách triển khai.

## Bắt đầu từ đâu?

| Bước | File                               | Thời gian                                     |
| ---- | ---------------------------------- | --------------------------------------------- |
| 1    | [00-overview.md](./00-overview.md) | 10 phút — stack, kiến trúc, cách đọc code     |
| 2    | [shared.md](./shared.md)           | 15 phút — apiClient, auth guard, socket       |
| 3    | [auth.md](./auth.md)               | 25 phút — JWT, login, OAuth, route protection |
| 4    | [jobs.md](./jobs.md)               | 25 phút — **feature mẫu** Clean Architecture  |
| 5    | Các feature còn lại                | Theo nhu cầu làm việc                         |

## Danh sách feature

| #   | Feature            | Route chính                            | File                                       |
| --- | ------------------ | -------------------------------------- | ------------------------------------------ |
| —   | Tổng quan & stack  | —                                      | [00-overview.md](./00-overview.md)         |
| —   | Hạ tầng dùng chung | `app/_layout.tsx`                      | [shared.md](./shared.md)                   |
| 1   | Auth               | `(auth)/*`                             | [auth.md](./auth.md)                       |
| 2   | Home               | `(tabs)/index`                         | [home.md](./home.md)                       |
| 3   | Explore            | `(tabs)/explore`                       | [explore.md](./explore.md)                 |
| 4   | Jobs               | `(tabs)/jobs`, `(jobs)/*`              | [jobs.md](./jobs.md)                       |
| 5   | Profiles           | `(tabs)/personal`, `(profiles)/*`      | [profiles.md](./profiles.md)               |
| 6   | Collab             | `(profiles)/collaboration`             | [collab.md](./collab.md)                   |
| 6b  | Collab Requests    | `(profiles)/collab-requests`           | [collab-requests.md](./collab-requests.md) |
| 7   | Challenge          | `(challenge)/*`                        | [challenge.md](./challenge.md)             |
| 8   | Blog               | `(blog)/*`                             | [blog.md](./blog.md)                       |
| 9   | Messaging          | `(tabs)/notifications`, `(messages)/*` | [messaging.md](./messaging.md)             |
| 10  | Payments           | `(payments)/premium`                   | [payments.md](./payments.md)               |

## Tài liệu liên quan

- [architecture.md](../architecture.md) — Sơ đồ Mermaid, ma trận layer
- [onboarding.md](../onboarding.md) — Hướng dẫn nắm source tổng quan

## Cấu trúc chung mỗi feature

```
features/{name}/
  domain/
    entities/       ← TypeScript types (Job, User, Beat...)
    repositories/   ← Interface I{Name}Repository
    usecases/       ← Business rules (optional)
    constants/      ← Hằng số nghiệp vụ
    utils/          ← Pure helpers
  data/
    datasources/    ← Gọi HTTP (axios)
    repositories/ ← Implement interface
    mappers/        ← API shape → UI shape (blog)
  presentation/
    screens/        ← Màn hình full page
    components/     ← UI nhỏ
    hooks/          ← React Query (useGetXxx)
    store/          ← Zustand client state (nếu có)
```

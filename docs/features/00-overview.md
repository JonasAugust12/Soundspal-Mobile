# 00 — Tổng quan: Cách đọc source TalentLink

## App là gì?

**TalentLink (Soundspal)** là app mobile kết nối tài năng âm nhạc (ca sĩ, producer) với venue và cơ hội việc làm, kèm cộng đồng (blog, beat challenge, chat).

| Vai trò          | Hành vi chính trên app                                |
| ---------------- | ----------------------------------------------------- |
| Ca sĩ / Producer | Profile, apply job, thu âm entry challenge, đăng blog |
| Venue            | Đăng tin tuyển, review đơn ứng tuyển                  |
| User Premium     | Mở khóa apply không giới hạn, filter nâng cao         |

**Backend:** `https://talentlink.io.vn/api/v1`  
**Socket:** `https://talentlink.io.vn` (path `/socket.io`)

---

## Stack & lý do chọn (tóm tắt)

| Công nghệ                              | Vai trò                       | Tại sao không dùng cái khác?                                          |
| -------------------------------------- | ----------------------------- | --------------------------------------------------------------------- |
| **Expo + React Native**                | iOS + Android một codebase    | Team quen TS; MVP nhanh; EAS Build không cần Mac cho Android          |
| **Expo Router**                        | File-based routing, deep link | Chuẩn Expo 50+; URL `/blog/[id]` sẵn                                  |
| **TypeScript strict**                  | Type-safe                     | Giảm bug API contract; align backend                                  |
| **NativeWind**                         | Tailwind trên RN              | Style nhanh, dark mode qua `themeStore`                               |
| **TanStack React Query**               | Server state, cache API       | 90% state là data từ server — không cần Redux cho list/detail         |
| **Zustand**                            | Client state nhỏ              | Auth token, theme, audio player — gọi được ngoài React (`getState()`) |
| **MMKV**                               | Persist token                 | Nhanh + sync read khi khởi động; tránh flash login                    |
| **Axios**                              | HTTP + interceptor refresh    | Interceptor queue 401 mature hơn fetch wrapper tự viết                |
| **Socket.IO**                          | Chat realtime                 | Backend đã có; fallback REST cho history                              |
| **Clean Architecture (feature-based)** | Tách domain/data/presentation | Scale 10 feature; onboard dev; chuẩn bị KMP SDK                       |

---

## Luồng khởi động app

```
index.js → expo-router/entry
  → app/_layout.tsx
      QueryClientProvider
      SafeAreaProvider
      KeyboardProvider
        RootLayoutNav
          useProtectedRoute()     ← redirect login/verify
          Stack (các route group)
          Toast
```

**File bắt buộc đọc trước:** `app/_layout.tsx`, `shared/infrastructure/api/apiClient.ts`, `features/auth/presentation/store/authStore.ts`

---

## Quy tắc tìm code

| Cần sửa              | Vào đâu                                         |
| -------------------- | ----------------------------------------------- |
| Route / URL          | `app/(nhóm)/file.tsx` — thường 1 dòng re-export |
| UI màn hình          | `features/{x}/presentation/screens/`            |
| Gọi API              | `features/{x}/data/datasources/`                |
| Hook cho component   | `features/{x}/presentation/hooks/`              |
| Type dữ liệu         | `features/{x}/domain/entities/`                 |
| Nút/modal dùng chung | `shared/presentation/ui/`                       |

**Ví dụ:** Sửa logic apply job  
→ `features/jobs/presentation/components/JobApplyModal.tsx` (UI)  
→ `features/jobs/presentation/hooks/useJobApi.ts` (hook)  
→ `features/jobs/domain/usecases/SubmitJobApplicationUseCase.ts` (rule)  
→ `features/jobs/data/datasources/jobRemoteDataSource.ts` (HTTP)

---

## Ba layer — nhớ bằng 1 câu hỏi

| Layer            | Câu hỏi                  | Được phép             | Không được                         |
| ---------------- | ------------------------ | --------------------- | ---------------------------------- |
| **domain**       | Quy tắc nghiệp vụ là gì? | Pure TS, validate     | Import React, axios                |
| **data**         | Lấy data từ đâu?         | axios, map DTO        | JSX                                |
| **presentation** | User thấy gì?            | Screen, hook, Zustand | Gọi axios trực tiếp (nên qua repo) |

**UseCase** chỉ thêm khi có rule thật (vd: validate login, validate jobId khi apply). CRUD thuần → repository đủ.

---

## Map 5 tab

| Tab       | Screen                | Feature                     |
| --------- | --------------------- | --------------------------- |
| Trang chủ | `HomeScreen`          | `home` (+ API từ `explore`) |
| Khám phá  | `ExploreScreen`       | `explore`                   |
| Việc làm  | `JobsTabScreen`       | `jobs`                      |
| Tin nhắn  | `NotificationsScreen` | `messaging`                 |
| Cá nhân   | `PersonalScreen`      | `profiles`                  |

---

## Thứ tự đọc doc feature

1. [shared.md](./shared.md) — mọi feature đều phụ thuộc
2. [auth.md](./auth.md) — không auth thì không feature nào chạy
3. [jobs.md](./jobs.md) — mẫu Clean Arch đầy đủ nhất
4. Feature tiếp theo bạn cần làm: profiles / challenge / blog / messaging / payments

---

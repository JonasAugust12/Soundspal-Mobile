# Feature: Home (Trang chủ)

**Route:** `app/(tabs)/index`  
**Module:** `features/home/`  
**Đặc điểm:** **Presentation-only** — không có `domain/` hay `data/`.

---

## 1. Mục đích nghiệp vụ

Màn **landing** khi mở app:

- Hero quảng bá Sonic Pulse / challenge
- Carousel nghệ sĩ nổi bật
- Carousel việc làm hot
- Search bar shortcut sang tab Khám phá

Mục tiêu UX: user thấy ngay giá trị app — không cần search ngay.

---

## 2. Luồng nghiệp vụ

```
HomeScreen
  → Search bar tap → /(tabs)/explore
  → Hero "SONIC PULSE" → /(challenge)/explore
  → Featured artists (horizontal scroll)
      → Tap → artistProfile / venueProfile (theo role)
  → Hot jobs (horizontal scroll)
      → Tap → /(jobs)/detail?id=
      → "Tất cả" → /(tabs)/jobs
```

---

## 3. Cấu trúc code

```
features/home/
└── presentation/
    ├── screens/HomeScreen.tsx
    └── components/
        ├── ArtistCard.tsx, ArtistCardSkeleton.tsx
        ├── JobCard.tsx, JobCardSkeleton.tsx
        └── index.ts
```

**Data:** delegate hoàn toàn sang `features/explore`:

```typescript
useFeaturedUsers(10);
useFeaturedJobs(10);
```

---

## 4. API (qua explore)

| Endpoint                               | Hook               |
| -------------------------------------- | ------------------ |
| `GET /landing/featured-users?limit=10` | `useFeaturedUsers` |
| `GET /landing/featured-jobs?limit=10`  | `useFeaturedJobs`  |

**Response shape:**

- Users: `data.users.users` (nested)
- Jobs: `data.jobs`

---

## 5. Components

### `ArtistCard`

- Avatar (fallback `user_profile.png`)
- Display name, location, genres
- Navigate profile theo `user.role`

### `JobCard`

- Map `FeaturedJob` → display fields (budget, genres, creator)
- Navigate `/(jobs)/detail?id={id}`

Skeleton components cho loading state horizontal list.

---

## 6. Business rules

| Rule          | Chi tiết                                  |
| ------------- | ----------------------------------------- |
| Limit         | 10 items mỗi carousel                     |
| Fallback text | "Chưa cập nhật" cho location/genres thiếu |
| Role routing  | Giống explore — venue vs artist profile   |
| Stale time    | 5 phút (từ explore hook defaults)         |

---

## 7. Phụ thuộc

| Feature       | Cách dùng                                                   |
| ------------- | ----------------------------------------------------------- |
| **explore**   | Data hooks + types (`FeaturedUser`, `FeaturedJob`, `Genre`) |
| **jobs**      | Job detail navigation                                       |
| **challenge** | Hero CTA                                                    |
| **profiles**  | Profile navigation                                          |
| **shared**    | `TabScreenWrapper`                                          |

---

## 8. Tại sao không có data layer?

| Lý do         | Giải thích                                                                 |
| ------------- | -------------------------------------------------------------------------- |
| Thin feature  | Chỉ aggregate + display — không logic nghiệp vụ riêng                      |
| DRY           | Featured API đã có trong explore — tránh duplicate repository              |
| Khi nào tách? | Nếu home có API riêng (personalized feed, A/B banners) → thêm `home/data/` |

Đây là pattern hợp lệ trong Clean Arch: không phải feature nào cũng cần 3 layer đầy đủ.

---

## 9. Câu hỏi thường gặp

**H: Home có vi phạm Clean Architecture không?**  
T: Không — presentation layer được phép gọi hook feature khác. Alternative: `home` inject data qua props từ parent — phức tạp hơn không cần thiết.

**H: Sao không gọi API trực tiếp trong HomeScreen?**  
T: Reuse `useFeaturedUsers` — một query key, cache shared với nơi khác dùng featured.

**H: Personalized feed có plan không?**  
T: Hiện static landing — mở rộng: `GET /landing/home` + `homeRemoteDataSource`.

---

## 10. Debug

| Triệu chứng         | File                                               |
| ------------------- | -------------------------------------------------- |
| Carousel trống      | `HomeScreen.tsx` + `useSearchApi` response parsing |
| Job card sai data   | `JobCard.tsx` mapping `FeaturedJob`                |
| Hero không navigate | `HomeScreen` router push challenge                 |

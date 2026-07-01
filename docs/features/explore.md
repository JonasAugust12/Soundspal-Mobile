# Feature: Explore (Khám phá)

**Route:** `app/(tabs)/explore`  
**Module:** `features/explore/`  
**Lưu ý:** Có **hai khái niệm "explore"** — tab này là **tìm user**; beat browse nằm ở `(challenge)/explore`.

---

## 1. Mục đích nghiệp vụ

Cho phép user **tìm kiếm tài năng** (ca sĩ, producer, venue):

- Search theo tên, role, location, genres, loại hình kinh doanh
- Xem featured users/jobs (API dùng chung với home)
- Shortcut sang blog
- Components beat (BeatList, MiniPlayer) **host ở đây** nhưng data từ **challenge**

---

## 2. Luồng nghiệp vụ

### 2.1 Tìm user (ExploreScreen)

```
ExploreScreen
  → SearchBar (debounce 500ms)
  → Role tabs: Tất cả / Ca sĩ / Producer / Venue
  → FilterSheet (genres, business type, location, capacity)
  → useSearchUsers(searchStore filters)
  → POST /search/users
  → Tap card → artistProfile hoặc venueProfile (theo role)
```

### 2.2 Filter nâng cao

```
FilterSheet (shared UI)
  → useSearchStore (Zustand)
  → useGetGenres() từ profiles
  → Apply → refetch search
```

### 2.3 Shortcut blog

Role tab row → `router.push('/(blog)')`

### 2.4 Beat components (dùng bởi challenge)

```
BeatList → useGetBeats() [challenge]
FilterChips → useGetAllGenres() [profiles]
MiniPlayer, HeroSection → audioStore [challenge]
```

`ChallengeExploreScreen` import các component này — không duplicate UI.

---

## 3. Cấu trúc code

```
features/explore/
├── domain/
│   ├── entities/search.type.ts
│   └── repositories/ISearchRepository.ts
├── data/
│   ├── datasources/searchRemoteDataSource.ts
│   └── repositories/SearchRepositoryImpl.ts
└── presentation/
    ├── screens/ExploreScreen.tsx
    ├── hooks/useSearchApi.ts
    ├── store/searchStore.ts
    └── components/
        ├── BeatCard, BeatList, FilterChips
        ├── HeroSection, MiniPlayer
        └── CustomTabBar (challenge dùng)
```

---

## 4. API endpoints

| Method | Path                             | Hook               |
| ------ | -------------------------------- | ------------------ |
| POST   | `/search/users`                  | `useSearchUsers`   |
| GET    | `/users/genres`                  | `useGetGenres`     |
| GET    | `/landing/featured-users?limit=` | `useFeaturedUsers` |
| GET    | `/landing/featured-jobs?limit=`  | `useFeaturedJobs`  |

**POST /search/users body:** `query`, `role`, `location`, `genres`, `businessTypes`, `capacity` — strip `page`/`pageSize` trước khi gửi (pagination client-side hiện chưa dùng đầy đủ).

---

## 5. `searchStore` — filter state

**File:** `presentation/store/searchStore.ts`

| Field              | Mục đích                                       |
| ------------------ | ---------------------------------------------- |
| `query`            | Text search                                    |
| `role`             | `singer` \| `producer` \| `venue` \| undefined |
| `location`         | Địa điểm                                       |
| `genres`           | string[]                                       |
| `businessTypes`    | venue filter                                   |
| `capacity`         | venue filter                                   |
| `page`, `pageSize` | Pagination (local)                             |

---

## 6. Business rules

| Rule              | Chi tiết                                                                  |
| ----------------- | ------------------------------------------------------------------------- |
| Debounce search   | 500ms — tránh spam API                                                    |
| Role routing      | `venue` → `venueProfile`; còn lại → `artistProfile`                       |
| Stale time        | Users 60s; genres 1h; featured 5min                                       |
| Undefined params  | Loại bỏ trước POST — backend không nhận field rỗng                        |
| BeatList fallback | Dummy data nếu API empty/error (challenge behavior)                       |
| Premium filters   | UI PremiumScreen quảng cáo filter nâng cao — **chưa enforce** client-side |

---

## 7. Phụ thuộc

| Hướng               | Chi tiết                              |
| ------------------- | ------------------------------------- |
| explore → profiles  | Genres API, navigate profile          |
| explore → challenge | Beat components + `useGetBeats`       |
| home → explore      | `useFeaturedUsers`, `useFeaturedJobs` |
| messaging → explore | Empty inbox CTA                       |
| shared → explore    | `FilterSheet` dùng `searchStore`      |

---

## 8. Tại sao triển khai như vậy?

| Quyết định                   | Lý do                                                                               |
| ---------------------------- | ----------------------------------------------------------------------------------- |
| POST search thay GET         | Body phức tạp (nhiều filter) — dễ mở rộng                                           |
| Zustand cho filters          | FilterSheet + ExploreScreen share state không prop-drill                            |
| Beat UI trong explore folder | Historical — components dùng chung challenge tab; có thể move sang `challenge/` sau |
| Featured API tách landing    | Backend optimize endpoint home — reuse cho home tab                                 |

---

## 9. Câu hỏi thường gặp

**H: Tab Khám phá vs (challenge)/explore?**  
T: Tab `(tabs)/explore` = tìm **người**. Route `(challenge)/explore` = duyệt **beat**. Tên trùng nhưng route group khác.

**H: Tại sao BeatList ở explore không phải challenge?**  
T: Beat list xuất hiện trong explore tab layout lịch sử; data layer vẫn `features/challenge`. Refactor có thể co-locate components.

**H: Premium có chặn filter không?**  
T: Hiện **không** — tier chỉ hiển thị; enforcement cần thêm ở `useSearchUsers` hoặc backend.

---

## 10. Debug

| Triệu chứng             | File                                       |
| ----------------------- | ------------------------------------------ |
| Search không ra kết quả | `searchStore`, `useSearchUsers`, POST body |
| Filter không apply      | `FilterSheet.tsx`, `searchStore`           |
| Beat list trống         | `BeatList.tsx` → `useGetBeats` challenge   |
| Featured home trống     | `useSearchApi.ts` response shape           |

# Feature: Profiles (Hồ sơ người dùng)

**Route:** `app/(tabs)/personal`, `app/(profiles)/*`, `app/(editprofile)/*`  
**Module:** `features/profiles/`  
**Vai trò:** Hub tài khoản, public profile, chỉnh sửa thông tin, gallery media, điểm vào collab & premium.

---

## 1. Mục đích nghiệp vụ

Quản lý **danh tính công khai** của từng role:

| Role              | Hồ sơ gồm                                                      |
| ----------------- | -------------------------------------------------------------- |
| Singer / Producer | Bio, genres, services, portfolio ảnh, video, featured releases |
| Venue             | Tên venue, loại hình, capacity, giờ mở cửa, địa chỉ            |

User xem profile người khác → nhắn tin. Owner chỉnh sửa → upload avatar/cover, quản lý gallery.

---

## 2. Luồng nghiệp vụ

### 2.1 Personal hub (tab Cá nhân)

```
PersonalScreen
  → Avatar, tên, tier (free/premium)
  → "Chỉnh sửa" → EditProfileScreen (artist) hoặc VenueEditProfileScreen (venue)
  → "Xem hồ sơ" → ArtistProfile / VenueProfile (own)
  → "Hợp tác" → CollaborationScreen (collab)
  → "Premium" → /(payments)/premium
  → Logout → useLogout()
```

### 2.2 Xem profile công khai

```
/(profiles)/artistProfile?username=xxx
/(profiles)/venueProfile?username=xxx

isMe = !username || username === currentUser.username
  → isMe: hiện nút edit, ẩn "Nhắn tin"
  → !isMe: hiện "Nhắn tin" → useGetOrCreateConversation → detailMessage
```

### 2.3 Chỉnh sửa profile (artist)

```
EditProfileScreen — tabs:
  Basic: display_name, bio, city, country
  Contact: email, phone
  Social: facebook, instagram, youtube
  Genres: multi-select (forArtist)
  Services: danh sách dịch vụ (forArtist)

Avatar/cover: upload ngay khi pick (POST FormData)
Các tab khác: Save → PUT mutation + invalidate cache
```

### 2.4 Gallery

| Màn hình                 | API                     | Nội dung              |
| ------------------------ | ----------------------- | --------------------- |
| `PortfolioGalleryScreen` | `/users/me/media`       | Ảnh portfolio         |
| `VideoGalleryScreen`     | `/users/videos`         | Video YouTube-style   |
| `FeaturedReleasesScreen` | `PUT featured-releases` | Link YouTube releases |
| `MediaGalleryScreen`     | `submissions/me/media`  | Media cho job apply   |

**Hai loại media khác nhau:** portfolio profile vs submission media — đừng nhầm API.

---

## 3. Cấu trúc code

```
features/profiles/
├── domain/
│   ├── entities/user.type.ts, media.type.ts
│   └── repositories/
│       ├── IUserRepository.ts
│       ├── IMediaRepository.ts
│       └── IStorageRepository.ts
├── data/
│   ├── datasources/
│   │   ├── userRemoteDataSource.ts
│   │   ├── mediaRemoteDataSource.ts
│   │   └── storageRemoteDataSource.ts
│   └── repositories/ (3 impl)
└── presentation/
    ├── hooks/
    │   ├── useUserApi.ts      # userKeys
    │   ├── useMediaApi.ts     # mediaKeys
    │   └── useStorageApi.ts
    ├── store/userStore.ts     # stub — authStore là source of truth
    ├── screens/ (11 screens)
    └── components/profile/, editprofile/
```

---

## 4. API endpoints

### User (`userRemoteDataSource.ts`)

| Method | Path                           | Mục đích                |
| ------ | ------------------------------ | ----------------------- |
| GET    | `/users/me`                    | User hiện tại           |
| GET    | `/users/{username}`            | Public profile          |
| GET    | `/users/me/media`              | Portfolio own           |
| GET    | `/users/media/{username}`      | Portfolio public        |
| GET    | `/users/videos/all/{username}` | Videos                  |
| PUT    | `/users/me/basic`              | Tên, bio, địa điểm      |
| PUT    | `/users/me/contact`            | Email, phone            |
| PUT    | `/users/me/social`             | Social links            |
| POST   | `/users/me/avatar`             | Avatar FormData         |
| POST   | `/users/me/cover`              | Cover FormData          |
| POST   | `/users/me/media`              | Upload portfolio        |
| DELETE | `/users/me/media/{id}`         | Xóa portfolio           |
| POST   | `/users/videos`                | Upload video            |
| DELETE | `/users/videos/{id}`           | Xóa video               |
| PUT    | `/users/me/featured-releases`  | YouTube links           |
| GET    | `/users/genres`                | Tất cả genres           |
| GET    | `/users/genres/{username}`     | Genres của user         |
| PUT    | `/users/genres/{username}`     | Cập nhật genres         |
| PUT    | `/users/me/services`           | Dịch vụ artist          |
| PUT    | `/users/me/venue/basic`        | Venue info              |
| PUT    | `/users/me/venue/contact`      | Venue contact           |
| PUT    | `/users/me/venue/additional`   | Giờ, tiện ích, giá thuê |

### Submission media (`mediaRemoteDataSource.ts`)

| Method | Path                        |
| ------ | --------------------------- |
| GET    | `submissions/me/media`      |
| POST   | `submissions/media`         |
| DELETE | `submissions/me/media/{id}` |

### Storage (`storageRemoteDataSource.ts`)

| Method | Path              |
| ------ | ----------------- |
| POST   | `/storage/upload` |

---

## 5. Business rules

| Rule           | Chi tiết                                                                       |
| -------------- | ------------------------------------------------------------------------------ |
| Role branching | `singer`/`producer` → artist UI; `venue` → venue UI                            |
| Own vs other   | `isMe` control edit + message button                                           |
| Genres         | Multi-select tên → `PUT { genre_names: string[] }`                             |
| Services       | Chỉ gửi service có `name` không rỗng                                           |
| Auth sync      | Sau upload avatar/save tên → `authStore.updateAvatarUrl` / `updateDisplayName` |
| User status    | `pending`/`validate`/`rejected` — entity có, UI ít dùng                        |
| Tier           | `free`/`premium` — PersonalScreen đọc cho upsell                               |

---

## 6. Hooks chính (`useUserApi.ts`)

| Hook                   | Query key             | Ghi chú                        |
| ---------------------- | --------------------- | ------------------------------ |
| `useGetCurrentUser`    | `userKeys.current()`  | `/users/me`                    |
| `useGetUserByUsername` | `userKeys.byUsername` | Public profile                 |
| `useUpdateBasic`       | —                     | Invalidate current + username  |
| `useUploadAvatar`      | —                     | + patch authStore              |
| `useGetAllGenres`      | stale 1h              | **Explore + challenge import** |

---

## 7. Phụ thuộc cross-feature

| Hướng                | Chi tiết                                           |
| -------------------- | -------------------------------------------------- |
| profiles → auth      | Identity, logout                                   |
| profiles → messaging | `useGetOrCreateConversation`                       |
| profiles → collab    | Host `CollaborationScreen`, `JobSubmissionsScreen` |
| profiles → payments  | Link premium                                       |
| explore → profiles   | `useGetAllGenres`, navigate profile                |
| challenge → profiles | `useGetAllGenres` trong create form                |
| jobs → profiles      | `useGetMyMedia` cho demo file apply                |

---

## 8. Tại sao triển khai như vậy?

| Quyết định                        | Lý do                                                      |
| --------------------------------- | ---------------------------------------------------------- |
| 3 repository (user/media/storage) | 3 API surface khác nhau — tách interface rõ                |
| `userStore` stub                  | Auth đã có user cơ bản; profile đầy đủ từ React Query      |
| Collab screens trong profiles     | UX: "Hợp tác" từ tab cá nhân — collab chỉ components + API |
| Avatar upload tức thì             | UX tốt hơn "save all tabs"                                 |
| Genres API shared                 | Một nguồn truth cho filter explore + create challenge      |

---

## 9. Câu hỏi thường gặp

**H: userStore vs authStore?**  
T: `authStore` giữ JWT + claims cơ bản. `userStore` gần như không dùng — profile đầy đủ fetch qua `useGetCurrentUser`.

**H: Portfolio vs submission media?**  
T: Portfolio = showcase trên profile (`/users/*`). Submission media = file đính kèm đơn ứng tuyển (`submissions/*`).

**H: Venue edit khác artist thế nào?**  
T: Form fields khác (business type, capacity, opening hours) — `VenueEditProfileScreen` riêng.

---

## 10. Debug

| Triệu chứng                  | File                                                 |
| ---------------------------- | ---------------------------------------------------- |
| Avatar không cập nhật header | `useUserApi` + `authStore.updateAvatarUrl`           |
| Không nhắn tin được          | `ArtistProfileScreen` + `useGetOrCreateConversation` |
| Genres không lưu             | `GenresForm.tsx`, PUT genres endpoint                |
| Upload portfolio fail        | `storageRemoteDataSource`, check FormData + 401      |

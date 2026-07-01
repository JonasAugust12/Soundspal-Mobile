# Feature: Blog (Cộng đồng / Bài viết)

**Route:** `app/(blog)/*`  
**Module:** `features/blog/`  
**Feature Clean Arch đầy đủ nhất** sau jobs — có mappers, utils, use case media.

---

## 1. Mục đích nghiệp vụ

Nền tảng **nội dung cộng đồng** âm nhạc:

- Đọc feed bài viết theo topic
- Tìm kiếm, bookmark
- Tạo bài draft → đính kèm media → publish
- Comment CRUD trên bài viết

---

## 2. Luồng nghiệp vụ

### 2.1 Duyệt feed

```
BlogIndexScreen
  → useBlogFeed() → GET /blogs
  → BlogTabBar: For You | Music Trend | Collaborations | Production
  → Client filter theo topic_id (trừ bookmarks)
  → Featured hero: bài đầu tab "For You" (khi không search)
  → Tap → /(blog)/[id]
```

### 2.2 Tab đặc biệt

| Tab        | Data source                                    |
| ---------- | ---------------------------------------------- |
| For You    | Full feed + hero                               |
| Topic tabs | Client filter `topic_id`                       |
| My posts   | Filter `author_id === user.id` — **cần login** |
| Bookmarks  | `GET /bookmarks` — query riêng                 |

### 2.3 Tìm kiếm

```
BlogSearchBar → submit (không search realtime)
  → q.length > 0 required
  → GET /blogs/search?q=&topic_id=&sort=&tag_ids[]
```

Submit-only tránh keyboard flicker trên mobile.

### 2.4 Tạo bài viết

```
FloatingCreateButton → CreateBlogModal
  1. Validate: title ≥3, content ≥20, topic, ≥1 tag
  2. POST /blogs → draft
  3. Optional cover: upload storage → POST /blogs/:id/media
  4. PATCH /blogs/:id/publish
```

### 2.5 Chi tiết & comment

```
BlogDetailScreen
  → useBlogArticle(id) — tìm trong **feed cache** (không GET /blogs/:id)
  → CommentsModal → CRUD /blogs/:id/comments, /comments/:id
  → Bookmark toggle → POST/DELETE /blogs/:id/bookmark
```

### 2.6 Upload media (điểm đặc biệt)

```
blogMediaUtils.ts
  → fetch() POST /storage/upload  (KHÔNG dùng axios)
  → Lý do: Android multipart + axios 401 refresh không replay body
  → AddBlogPostMediaUseCase → POST /blogs/:id/media { url, media_type }
```

---

## 3. Cấu trúc code

```
features/blog/
├── domain/
│   ├── entities/blog.type.ts
│   ├── constants/blog/tabs.ts, articles.ts
│   ├── repositories/IBlogRepository.ts
│   └── usecases/AddBlogPostMediaUseCase.ts
├── data/
│   ├── datasources/blogRemoteDataSource.ts
│   ├── repositories/BlogRepositoryImpl.ts
│   ├── mappers/
│   │   ├── blogPostMapper.ts
│   │   └── blogCommentMapper.ts
│   └── utils/
│       ├── blogResponseUtils.ts
│       ├── blogUploadUtils.ts
│       └── blogMediaUtils.ts
└── presentation/
    ├── hooks/useBlogApi.ts
    ├── screens/BlogIndexScreen, BlogDetailScreen
    └── components/ (20+): CreateBlogModal, CommentsModal, ...
```

**Refactor lịch sử:** `useBlogApi.ts` từ ~727 dòng → tách datasource + mappers + repository.

---

## 4. API endpoints

| Method | Path                      | Mục đích           |
| ------ | ------------------------- | ------------------ |
| GET    | `/blogs`                  | Feed               |
| POST   | `/blogs`                  | Create draft       |
| PUT    | `/blogs/:id`              | Update             |
| PATCH  | `/blogs/:id/publish`      | Publish            |
| POST   | `/blogs/:id/media`        | Attach media URL   |
| GET    | `/blogs/search`           | Search             |
| GET    | `/bookmarks`              | User bookmarks     |
| POST   | `/blogs/:id/bookmark`     | Add bookmark       |
| DELETE | `/blogs/:id/bookmark`     | Remove bookmark    |
| GET    | `/blogs/:postId/comments` | List comments      |
| POST   | `/blogs/:postId/comments` | Create comment     |
| PUT    | `/comments/:id`           | Update comment     |
| DELETE | `/comments/:id`           | Delete comment     |
| POST   | `/storage/upload`         | Binary (via fetch) |

---

## 5. Tab constants

**File:** `domain/constants/blog/tabs.ts`

| Feed tabs      | topic_id  |
| -------------- | --------- |
| for-you        | (all)     |
| music-trend    | mapped id |
| collaborations | mapped id |
| production     | mapped id |

Create modal: chọn topic từ list (trừ for-you).

---

## 6. Mappers — tại sao cần?

Backend DTO shape ≠ UI model:

```typescript
// blogPostMapper.ts — ví dụ pattern
mapBlogPostFromApi(dto) → BlogPost UI type
mapBlogCommentFromApi(dto) → BlogComment
```

`blogResponseUtils.ts` — unwrap nested `data.data` envelope không nhất quán.

---

## 7. Business rules

| Rule                 | Chi tiết                                                               |
| -------------------- | ---------------------------------------------------------------------- |
| Create validation    | Title ≥3, content ≥20, topic required, ≥1 tag                          |
| Short description    | ≤200 chars; auto từ content nếu trống                                  |
| My posts / bookmarks | Require auth — empty state nếu chưa login                              |
| Article detail       | **Chỉ từ cache** — deep link cold start có thể fail nếu chưa load feed |
| Bookmark             | Invalidate `['bookmarks']` query                                       |
| Deprecated stubs     | `useAddBlogComment`, `useAddCommentLike` — không có API                |

---

## 8. Components quan trọng

| Component              | Vai trò                        |
| ---------------------- | ------------------------------ |
| `BlogTabBar`           | Topic tabs                     |
| `BlogSearchBar`        | Search submit                  |
| `BlogLibraryRow`       | My posts / Bookmarks shortcuts |
| `CreateBlogModal`      | Wizard tạo bài                 |
| `EditBlogModal`        | Sửa bài own                    |
| `CommentsModal`        | Comment thread                 |
| `FloatingCreateButton` | CTA tạo bài                    |

---

## 9. Phụ thuộc

| Hướng          | Chi tiết                                     |
| -------------- | -------------------------------------------- |
| blog → auth    | Gating tabs, bookmarks, author filter        |
| blog → shared  | apiClient, response utils                    |
| explore → blog | Shortcut `/(blog)`                           |
| auth (token)   | `blogMediaUtils` manual Authorization header |

---

## 10. Tại sao triển khai như vậy?

| Quyết định               | Lý do                                                      |
| ------------------------ | ---------------------------------------------------------- |
| fetch cho storage upload | Tránh axios FormData + 401 replay bug Android              |
| Mappers layer            | API blog evolve độc lập UI                                 |
| Client-side topic filter | Một feed fetch — đổi tab instant, giảm API calls           |
| Không GET by id          | Backend chưa có / thiếu — reuse cache; trade-off deep link |
| AddBlogPostMediaUseCase  | Rule: upload xong mới attach — tách khỏi create hook       |

---

## 11. Câu hỏi thường gặp

**H: Mở link /blog/123 trực tiếp có được không?**  
T: Có thể fail nếu feed chưa load — `useBlogArticle` throw khi không tìm thấy cache. Fix: thêm `GET /blogs/:id` hoặc prefetch.

**H: Tại sao không dùng axios cho upload?**  
T: `apiClient` interceptor reject replay FormData sau refresh — `ERR_UPLOAD_AUTH_REFRESH`. Blog dùng fetch + manual token.

**H: Voice comment UI có hoạt động không?**  
T: UI có — create vẫn gửi text `content` field.

---

## 12. Debug

| Triệu chứng       | File                                                |
| ----------------- | --------------------------------------------------- |
| Detail not found  | `useBlogArticle` — load feed trước                  |
| Upload cover fail | `blogMediaUtils.ts`                                 |
| Tab trống         | Check topic_id filter vs feed data                  |
| ESLint warnings   | `react-hooks/exhaustive-deps` trong blog components |

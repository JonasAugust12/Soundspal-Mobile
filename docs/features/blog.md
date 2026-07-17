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

### 2.6 Upload ảnh bìa — có 2 bước, 2 công cụ khác nhau

Khi tạo bài blog có ảnh cover, app làm **2 việc**:

```
Bước 1  Đẩy file ảnh lên server lưu trữ
        → POST /storage/upload
        → Dùng fetch() trong blogMediaUtils.ts
        → Nhận về URL (đường dẫn ảnh trên server)

Bước 2  Gắn URL đó vào bài viết
        → POST /blogs/:id/media { url, media_type }
        → Dùng axios (apiClient) như API bình thường
```

**Tóm lại:** Chỉ **bước 1 (upload file)** dùng `fetch`. **Bước 2 (gắn vào bài)** vẫn dùng axios.

---

## 2.7 Upload ảnh — giải thích dễ hiểu (đọc nếu thắc mắc axios / fetch)

### axios là gì?

**axios** = thư viện JavaScript giúp app **gọi API** (gửi/nhận dữ liệu với server).

Trong project này, hầu hết API (lấy blog, comment, login...) đều đi qua **`apiClient`** — đó là axios đã được cấu hình sẵn:

- Tự gắn token đăng nhập vào mỗi request
- Token hết hạn (lỗi 401) → tự refresh → gọi lại API

Bạn có thể coi `apiClient` = **đường dây chính** để nói chuyện với server.

### fetch là gì?

**fetch** = cách **gốc** của JavaScript/browser để gọi API. Không cần cài thêm thư viện.

Cũng gửi HTTP request được, nhưng **không** có sẵn interceptor refresh token như axios trong project.

### Có nhiều cách upload không?

**Có.** Trên cùng một server, bạn vẫn có thể:

| Cách                    | Dùng ở đâu trong app                            |
| ----------------------- | ----------------------------------------------- |
| **axios** (`apiClient`) | Hầu hết API: blog, job, profile upload media... |
| **fetch**               | Upload ảnh blog cover (`blogMediaUtils.ts`)     |

Cả hai đều gửi file lên `POST /storage/upload`. Khác nhau ở **công cụ gửi** và **xử lý lỗi token**.

### Tại sao blog upload không dùng axios?

Không phải vì axios “xấu”, mà vì **bug kỹ thuật khi upload file + token hết hạn cùng lúc**.

**Tình huống:**

1. User chọn ảnh cover → app gửi upload (body là **FormData** = gói file).
2. Đúng lúc đó **token hết hạn** → server trả **401**.
3. `apiClient` thông minh: tự refresh token, rồi **gửi lại** request cũ.

**Vấn đề:** Request upload dùng FormData — sau lần gửi đầu, **gói file đã bị “tiêu”**, không gửi lại được lần 2. Gửi lại = body rỗng → upload fail.

Code trong `apiClient.ts` đã chặn hẳn việc retry:

```typescript
// FormData chỉ gửi được 1 lần — retry sau refresh sẽ fail
if (isFormDataBody(originalRequest)) {
  return rejectMultipartReplay(...);  // lỗi ERR_UPLOAD_AUTH_REFRESH
}
```

Nghĩa là: _“Đang upload mà hết hạn phiên — không tự thử lại được, user phải upload lại.”_

**Blog chọn `fetch`** cho bước upload file vì:

- Tránh dính interceptor retry FormData của axios (đặc biệt hay lỗi trên **Android**).
- Tự gắn token bằng tay: `Authorization: Bearer ...` từ `authStore`.
- Nếu 401 → báo lỗi rõ; user bấm upload lại (sau khi token đã được refresh ở chỗ khác).

**File:** `features/blog/data/utils/blogMediaUtils.ts` → hàm `postStorageUploadWithFetch`.

### Ví dụ đời thường

- **axios + interceptor** = nhân viên bưu điện tự làm lại phiếu gửi nếu tem hết hạn — **ổn với thư giấy** (JSON).
- **Upload file** = gói hàng đã băng keo gửi đi — **mở ra gửi lại lần 2** thì gói hỏng.
- **fetch cho blog** = gửi gói một lần, thẳng tay; hết hạn thì báo user gửi lại.

### Khi nào dev hỏi câu này?

Thường khi đọc code thấy:

- API khác dùng `createApiCall` / `apiClient`
- Riêng blog upload lại `fetch`

→ Không phải lỗi copy-paste — **cố ý** vì giới hạn FormData + refresh token.

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

| Quyết định                 | Lý do đơn giản                                          |
| -------------------------- | ------------------------------------------------------- |
| fetch cho upload file      | FormData không gửi lại được sau khi axios refresh token |
| axios cho API blog còn lại | JSON bình thường — retry sau refresh hoạt động tốt      |
| Mappers layer              | API blog trả shape khác UI — cần map                    |
| Client-side topic filter   | Một lần tải feed, đổi tab lọc trên máy — nhanh          |
| Không GET by id            | Chi tiết bài lấy từ cache feed đã tải                   |
| AddBlogPostMediaUseCase    | Upload xong mới gắn URL vào bài — tách bước rõ ràng     |

---

## 11. Câu hỏi thường gặp

**H: Mở link /blog/123 trực tiếp có được không?**  
T: Có thể fail nếu feed chưa load — `useBlogArticle` throw khi không tìm thấy cache. Fix: thêm `GET /blogs/:id` hoặc prefetch.

**H: Tại sao upload ảnh blog dùng fetch, còn API khác dùng axios?**

Có **nhiều cách** gọi API trên JavaScript; project dùng chủ yếu **axios** (`apiClient`) vì tự gắn token và refresh khi hết hạn.

Upload file gửi **FormData** (gói ảnh). Nếu đúng lúc upload mà token hết hạn, axios muốn **gửi lại** request — nhưng FormData **chỉ gửi được một lần**, gửi lại sẽ lỗi (`ERR_UPLOAD_AUTH_REFRESH`). Blog upload cover dùng **fetch** riêng để tránh cơ chế retry đó; token gắn tay từ `authStore`. Bước sau (gắn URL vào bài) vẫn dùng axios bình thường.

Chi tiết: mục [2.7 Upload ảnh — giải thích dễ hiểu](#27-upload-ảnh--giải-thích-dễ-hiểu-đọc-nếu-thắc-mắc-axios--fetch).

**H: Voice comment UI có hoạt động không?**  
T: UI có — create vẫn gửi text `content` field.

---

## 12. Debug

| Triệu chứng       | File                                                 |
| ----------------- | ---------------------------------------------------- |
| Detail not found  | `useBlogArticle` — load feed trước                   |
| Upload cover fail | `blogMediaUtils.ts` — xem log; thử login lại nếu 401 |
| Tab trống         | Check topic_id filter vs feed data                   |
| ESLint warnings   | `react-hooks/exhaustive-deps` trong blog components  |

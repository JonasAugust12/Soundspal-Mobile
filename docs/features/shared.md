# Shared — Hạ tầng dùng chung

**Module:** `shared/`  
**Mọi feature đều phụ thuộc** — đọc file này trước khi đụng feature cụ thể.

---

## 1. Mục đích

Gom code **không thuộc một nghiệp vụ** nhưng nhiều feature cần:

- HTTP client + refresh token
- React Query singleton
- MMKV storage adapter
- Socket.IO realtime
- Route guard (auth)
- UI components chat, header, filter
- Theme, toast, error boundary

---

## 2. Cấu trúc thư mục

```
shared/
├── domain/
│   ├── constants/     # colors, businessTypes
│   └── entities/      # ApiResponse<T>
├── infrastructure/
│   ├── api/           # apiClient, queryClient
│   ├── socket/        # socketService
│   └── storage/       # MMKV + Zustand adapter
├── presentation/
│   ├── hooks/         # useProtectedRoute, useToast
│   ├── navigation/    # CustomTabBar, TabScreenWrapper
│   ├── providers/     # SocketProvider
│   ├── store/         # themeStore, settingsStore
│   ├── ui/            # MessageBubble, FilterSheet, ...
│   └── RootErrorBoundary.tsx
└── utils/
    └── jwt.ts
```

---

## 3. `apiClient` — trái tim HTTP

**File:** `shared/infrastructure/api/apiClient.ts`

### Axios instance

```typescript
baseURL: 'https://talentlink.io.vn/api/v1';
```

### Request interceptor

- Đọc `accessToken` từ `useAuthStore.getState()`
- Gắn header `Authorization: Bearer {token}`

### Response interceptor — refresh queue

Khi API trả **401**:

```
1. Nếu request đã _retry → logout, reject
2. Nếu đang refresh → xếp hàng (failedQueue)
3. POST /auth/refresh { refresh_token }
4. Thành công → setCredentials + replay queue
5. Thất bại → logout()
```

**Ngoại lệ FormData:** body multipart không replay được sau refresh → reject `ERR_UPLOAD_AUTH_REFRESH`. Feature blog dùng `fetch` riêng vì lý do này.

### `createApiCall(method, url)`

Helper mọi `*RemoteDataSource` dùng:

```typescript
const getJobs = createApiCall<JobListResponse>('GET', '/posts');
// Gọi: getJobs({ page: 0, page_size: 20 })
```

- GET → `params`; POST/PUT/DELETE → `data`
- FormData → không set Content-Type (axios tự set boundary)
- Trả về `response.data` (unwrap axios)

**Tại sao không gọi axios trực tiếp trong hook?**  
Interceptor refresh chỉ hoạt động trên `apiClient`. Datasource tập trung endpoint — đổi URL một chỗ.

---

## 4. `queryClient`

**File:** `shared/infrastructure/api/queryClient.ts`

| Option                 | Giá trị                 | Ý nghĩa                        |
| ---------------------- | ----------------------- | ------------------------------ |
| `staleTime`            | 5 phút                  | Data coi là "fresh"            |
| `gcTime`               | 10 phút                 | Giữ cache sau unmount          |
| `retry`                | 2 (query), 1 (mutation) | Tự retry lỗi mạng              |
| `refetchOnWindowFocus` | false                   | Mobile không có "window focus" |

Feature hooks override `staleTime` riêng (vd jobs list 60s).

---

## 5. MMKV Storage

**Files:** `storage.ts`, `mmkvStorage.ts`

```typescript
createMMKV({ id: 'soundspal-storage', encryptionKey: '...' });
```

`mmkvStorage` implement `StateStorage` của Zustand persist:

- `setItem` / `getItem` / `removeItem`

**Ai dùng:** `authStore` persist token. `themeStore` / `settingsStore` hiện **tắt** persist (comment trong code).

**Tại sao MMKV thay AsyncStorage?**  
Đọc sync khi app mở → `useAuthHydration` biết ngay có token hay không, tránh flash màn login.

---

## 6. `socketService`

**File:** `shared/infrastructure/socket/socketService.ts`

| Config        | Giá trị                                         |
| ------------- | ----------------------------------------------- |
| URL           | `https://talentlink.io.vn`                      |
| Path          | `/socket.io`                                    |
| Auth          | token trong `auth.token`, `query.token`, header |
| Max reconnect | 5 lần                                           |

### Events nhận → `useMessagingStore`

| Event                 | Hành động                                             |
| --------------------- | ----------------------------------------------------- |
| `message:new`         | `addMessage`, tăng unread nếu không ở conversation đó |
| `message:edited`      | `updateMessage`                                       |
| `message:deleted`     | `removeMessage`                                       |
| `typing:start/stop`   | typing indicator                                      |
| `user:online/offline` | online status                                         |

### Events gửi

`conversation:join`, `conversation:leave`, `typing:start`, `typing:stop`

### `SocketProvider`

**File:** `shared/presentation/providers/SocketProvider.tsx`

Connect khi `user && accessToken`. Export `useSocket()`.

**Lưu ý:** Provider **chưa mount** trong `app/_layout.tsx` — socket connect lazy từ màn messaging. Có thể mount global sau nếu cần unread realtime trên tab bar.

---

## 7. Route guard

### `useProtectedRoute`

**File:** `shared/presentation/hooks/useProtectedRoute.ts`

Gọi trong `app/_layout.tsx` → `RootLayoutNav`.

| Điều kiện                          | Redirect                      |
| ---------------------------------- | ----------------------------- |
| Chưa login + route protected       | `/(auth)/login`               |
| Login + `!is_verified`             | `email-verification-required` |
| Login + verified + đang ở `(auth)` | `/(tabs)`                     |

Protected groups: `(tabs)`, `(profiles)`, `(jobs)`, `(messages)`, `(editprofile)`, `(payments)`.

### `useAuthHydration`

**File:** `features/auth/presentation/hooks/useAuthHydration.ts` (import bởi shared)

Đợi Zustand rehydrate MMKV xong mới redirect — **không flash login**.

---

## 8. Shared UI

**Barrel:** `shared/presentation/ui/index.ts`

| Component                                        | Dùng ở                |
| ------------------------------------------------ | --------------------- |
| `CommonHeader`                                   | Hầu hết stack screens |
| `MessageBubble`, `MessageInput`                  | Messaging             |
| `ChatItem`, `OnlineIndicator`, `TypingIndicator` | Conversation list     |
| `FilterSheet`                                    | Explore search        |
| `ConfirmModal`                                   | Xóa, logout confirm   |
| `SearchBar`                                      | Jobs, explore         |
| `ArtistCardSearch`                               | Explore grid          |
| `CustomTabBar`                                   | Bottom tabs           |
| `TabScreenWrapper`                               | Tab screens layout    |

---

## 9. Theme & settings

### `themeStore`

- `colorScheme`: `'light' | 'dark' | 'auto'`
- `isDark` derived — `'auto'` theo `Appearance.getColorScheme()`
- MMKV persist tắt tạm thời

### `colors.ts`

Design tokens light/dark — NativeWind class + inline style.

---

## 10. JWT utils

**File:** `shared/utils/jwt.ts`

| Hàm                       | Mục đích             |
| ------------------------- | -------------------- |
| `decodeJWT(token)`        | Parse payload base64 |
| `getUserFromToken(token)` | → AuthUser object    |
| `isTokenValid(token)`     | Check `exp`          |

Dùng sau login và sau refresh — không cần gọi `/users/me` ngay.

---

## 11. Phụ thuộc ngược (shared → features)

Shared **không hoàn toàn pure** — import từ features:

| Import từ            | Lý do                            |
| -------------------- | -------------------------------- |
| `features/auth`      | Token, hydration, refresh types  |
| `features/messaging` | messagingStore cho socket events |
| `features/explore`   | genres cho FilterSheet           |

Đây là trade-off thực tế: socket cần biết message shape. Refactor sau có thể đưa messaging store interface vào shared domain.

---

## 12. Câu hỏi thường gặp

**H: Tại sao không dùng Redux Toolkit Query?**  
T: Team chọn TanStack Query — ecosystem lớn, devtools, staleTime linh hoạt. RTK Query gắn Redux — overkill khi chỉ cần server cache.

**H: Interceptor refresh có race condition không?**  
T: Có `isRefreshing` + `failedQueue` — request đồng thời chờ một lần refresh.

**H: Sao theme không persist?**  
T: Comment "Temporarily disable" — có thể bật lại khi ổn định MMKV key migration.

---

## 13. Debug

| Triệu chứng                   | File                                     |
| ----------------------------- | ---------------------------------------- |
| Mọi API 401                   | `apiClient.ts`, `authStore`              |
| Upload fail sau hết hạn token | `rejectMultipartReplay`                  |
| Flash login khi mở app        | `useAuthHydration.ts`                    |
| Chat không realtime           | `socketService.ts`, check Provider mount |
| Tab bar style                 | `CustomTabBar.tsx`                       |

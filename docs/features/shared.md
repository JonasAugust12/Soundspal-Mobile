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

## 6. `socketService` — Setup socket chi tiết

**File:** `shared/infrastructure/socket/socketService.ts`  
**Thư viện:** `socket.io-client` (trong `package.json`)  
**Provider (tùy chọn):** `shared/presentation/providers/SocketProvider.tsx`

---

### 6.1 Kiến trúc tổng quan

```
┌─────────────────────────────────────────────────────────────┐
│  app/_layout.tsx                                             │
│    QueryClientProvider                                       │
│      (SocketProvider)  ← CÓ CODE nhưng CHƯA BỌC vào layout │
│                                                             │
│  NotificationsScreen / DetailMessageScreen                   │
│    socketService.connect()  ← CÁCH ĐANG DÙNG (lazy)         │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
              socketService (singleton)
                          │
          io('https://talentlink.io.vn', { ... })
                          │
                          ▼
              Server Socket.IO (backend)
```

**Singleton** = cả app chỉ có **một** instance `socketService` — mọi màn dùng chung, không tạo socket mới mỗi lần.

---

### 6.2 Bước setup trong code (từng dòng `connect()`)

Khi gọi `socketService.connect()`:

```typescript
// 1. Guard — tránh connect trùng
if (isConnecting) return; // Đang connect dở
if (hasReachedMaxAttempts) return; // Fail 5 lần → dừng hẳn
if (socket?.connected) return; // Đã connect rồi

// 2. Bắt buộc đã login
const { user, accessToken } = useAuthStore.getState();
if (!user || !accessToken) return null;

// 3. Tạo kết nối Socket.IO
this.socket = io('https://talentlink.io.vn', { ...options });

// 4. Đăng ký listeners
this.setupListeners();
```

#### Giải thích từng option `io(...)`

| Option                       | Giá trị                    | Ý nghĩa                                               |
| ---------------------------- | -------------------------- | ----------------------------------------------------- |
| `path`                       | `/socket.io`               | Endpoint Socket.IO trên server (không phải `/api/v1`) |
| `auth.token`                 | JWT access                 | Cách 1 gửi token — chuẩn Socket.IO v4                 |
| `query.token`                | JWT access                 | Cách 2 — một số server đọc từ query string            |
| `extraHeaders.Authorization` | `Bearer ...`               | Cách 3 — giống REST API                               |
| `extraHeaders['x-user-id']`  | user.id                    | Server biết user nào connect                          |
| `transports`                 | `['websocket', 'polling']` | Thử WebSocket trước; fail thì fallback long-polling   |
| `reconnection`               | `true`                     | Socket.IO tự reconnect khi mất mạng                   |
| `reconnectionAttempts`       | `5`                        | Tối đa 5 lần (built-in của thư viện)                  |

**Tại sao gửi token 3 chỗ?** Backend có thể đọc token từ nhiều nơi tùy middleware — gửi đủ để không bị reject auth.

**URL khác `apiClient`:** REST dùng `https://talentlink.io.vn/api/v1`; socket dùng **root** `https://talentlink.io.vn` + path `/socket.io`.

---

### 6.3 Hai cách “bật” socket trong project

#### Cách A — Lazy (đang dùng)

`NotificationsScreen.tsx`:

```typescript
useEffect(() => {
    if (!socketService.isConnected()) {
        socketService.connect();
    }
}, []);
```

- Socket chỉ connect khi user **vào tab Tin nhắn**
- Tiết kiệm pin/băng thông nếu user không chat
- Nhược: đang ở tab Home/Jobs **không** nhận tin realtime trên inbox

#### Cách B — Global qua Provider (có sẵn, chưa bật)

`SocketProvider.tsx` — khi `user && accessToken` thì `connect()`, logout thì `disconnect()`.

Để bật, bọc trong `app/_layout.tsx`:

```tsx
<QueryClientProvider client={queryClient}>
    <SocketProvider>
        <SafeAreaProvider>...</SafeAreaProvider>
    </SocketProvider>
</QueryClientProvider>
```

`SocketProvider` phải **bên trong** `QueryClientProvider` (vì gọi `useQueryClient()`).

Sau khi bật có thể xóa `connect()` thừa ở `NotificationsScreen` (giữ `isConnected` check vẫn an toàn).

---

### 6.4 `setupListeners()` — sau khi connect

Mỗi lần `connect()` gọi `removeAllListeners()` trước — **tránh đăng ký trùng** (connect 2 lần → 1 tin hiện 2 lần).

**Nhóm listener:**

| Nhóm     | Events                                             | Cập nhật                             |
| -------- | -------------------------------------------------- | ------------------------------------ |
| Kết nối  | `connect`, `disconnect`, `connect_error`, `error`  | Log + reconnect logic                |
| Tin nhắn | `message:new`, `message:edited`, `message:deleted` | `messagingStore`                     |
| Typing   | `typing:start`, `typing:stop`                      | `messagingStore` (bỏ qua chính mình) |
| Online   | `user:online`, `user:offline`                      | `messagingStore`                     |

Listeners gọi `useMessagingStore.getState()` — **không cần React hook**, chạy được ngoài component.

---

### 6.5 Reconnect — hai lớp

| Lớp                    | Ai xử lý                          | Khi nào                                                       |
| ---------------------- | --------------------------------- | ------------------------------------------------------------- |
| **Socket.IO built-in** | `reconnection: true` trong `io()` | Mất mạng tạm, server restart                                  |
| **Custom**             | `handleConnectionError()`         | `connect_error` — backoff 1s, 2s, 4s... max 10s, tối đa 5 lần |

Sau 5 lần custom fail → `hasReachedMaxAttempts = true` → `connect()` trả `null` cho đến khi gọi `resetReconnectAttempts()`.

`disconnect` với reason `io server disconnect` → server **chủ động ngắt** (thường auth sai) → `handleDisconnect()` thử disconnect + connect lại sau 1s.

**Lưu ý:** Token hết hạn — socket **không** tự refresh JWT như `apiClient`. Server disconnect → cần login lại hoặc reconnect sau khi token mới (chưa có logic refresh token trong socketService).

---

### 6.6 “Phòng chat” — join / leave conversation

Connect socket ≠ vào được mọi thread. Phải **join phòng**:

```typescript
// Vào DetailMessageScreen
socketService.joinConversation(conversationId);
// emit: conversation:join { conversationId }

// Rời màn
socketService.leaveConversation(conversationId);
// emit: conversation:leave { conversationId }
```

Server thường chỉ push `message:new` cho user **đã join** phòng đó (hoặc push global + client filter — tùy backend).

**Typing** cũng emit riêng:

```typescript
socketService.startTyping(conversationId); // typing:start
socketService.stopTyping(conversationId); // typing:stop
```

`joinConversation` / `startTyping` **không làm gì** nếu `!socket.connected` — nên luôn `connect()` trước.

---

### 6.7 Timeline một phiên socket (debug mental model)

```
T0  User login → authStore có accessToken
T1  Vào tab Tin nhắn → connect()
T2  Event 'connect' → socket.id được cấp
T3  User mở chat với B → joinConversation(conv-123)
T4  B gửi tin → server emit message:new → addMessage store
T5  User gõ → startTyping → B thấy TypingIndicator
T6  User back → leaveConversation(conv-123)
T7  App background lâu → có thể disconnect
T8  App foreground → Socket.IO tự reconnect (nếu chưa max attempts)
T9  Logout → nên disconnect() (Provider hoặc manual)
```

---

### 6.8 API public của `socketService`

| Method                               | Mục đích                                         |
| ------------------------------------ | ------------------------------------------------ |
| `connect()`                          | Mở kết nối (cần auth)                            |
| `disconnect()`                       | Đóng hẳn, xóa listeners                          |
| `isConnected()`                      | Check `socket.connected`                         |
| `joinConversation(id)`               | Vào phòng chat                                   |
| `leaveConversation(id)`              | Rời phòng                                        |
| `startTyping(id)` / `stopTyping(id)` | Báo đang gõ                                      |
| `resetReconnectAttempts()`           | Reset sau khi fix mạng / auth                    |
| `setQueryClient(client)`             | Provider gọi — **hiện chưa dùng** trong handlers |

---

### 6.9 Checklist debug socket

| Triệu chứng                  | Kiểm tra                                            |
| ---------------------------- | --------------------------------------------------- |
| Không connect                | Đã login? `accessToken` trong authStore?            |
| `connect_error`              | Token hết hạn? Server `talentlink.io.vn` reachable? |
| Connect nhưng không nhận tin | Đã `joinConversation`? Đúng `conversationId`?       |
| Tin nhận 2 lần               | `connect()` gọi nhiều lần không qua guard?          |
| Max retry reached            | Gọi `resetReconnectAttempts()` hoặc restart app     |
| Typing không hiện            | Socket connected? `startTyping` có emit?            |

**Log trong dev:** tìm console `🔌`, `✅ Connected`, `📨 New message`, `📥 Joining conversation`.

---

### 6.10 File liên quan

| File                                                              | Vai trò                         |
| ----------------------------------------------------------------- | ------------------------------- |
| `shared/infrastructure/socket/socketService.ts`                   | Core — connect, listeners, emit |
| `shared/presentation/providers/SocketProvider.tsx`                | React wrapper (optional global) |
| `features/messaging/presentation/store/messagingStore.ts`         | State nhận từ socket            |
| `features/messaging/presentation/screens/NotificationsScreen.tsx` | `connect()` lazy                |
| `features/messaging/presentation/screens/DetailMessageScreen.tsx` | join/leave/typing               |
| `app/_layout.tsx`                                                 | Chưa bọc SocketProvider         |

**Legacy (tránh import nhầm):** `services/socketService.ts`, `providers/SocketProvider.tsx` — bản cũ trước refactor; dùng path trong `shared/`.

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

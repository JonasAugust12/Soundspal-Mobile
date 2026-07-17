# Feature: Push Notification cho TIN NHẮN (FCM)

> Tài liệu **các việc cần làm** để "gửi tin nhắn → người nhận có thông báo FCM về máy".
> Viết để **cả người mới lẫn AI agent khác** tiếp nối được: có path file 2 repo, bằng chứng từ source,
> contract dữ liệu, code mẫu và test plan.
>
> Tài liệu anh em:
>
> - [`notifications.md`](./notifications.md) — luồng push **mobile** cho job (đã chạy thật)
> - [`notifications-web.md`](./notifications-web.md) — đăng ký FCM token cho **web**

## 0. Bối cảnh

| Repo           | Thành phần liên quan                                          |
| -------------- | ------------------------------------------------------------- |
| `DATN-Backend` | `messaging-service` (NestJS) → phát push khi có tin nhắn      |
| `DATN-Backend` | `notification-service` (.NET) → tiêu thụ & gọi FCM ✅ đã chạy |
| `TL-Mobile`    | Nhận / hiện / bấm mở màn chat                                 |

---

## 1. Hiện trạng — code push ĐÃ CÓ nhưng nằm ở nhánh CHẾT

> ⚠️ **Đính chính (2026-07-16, xác minh bằng log production):** phiên bản đầu của tài liệu này nói
> "backend đã làm ~90%" — **sai ở điểm mấu chốt**. Code push có tồn tại, nhưng được móc vào handler
> **Socket.IO `message:send`**, trong khi app **gửi tin nhắn qua REST `POST /messages`**. Nhánh socket đó
> **chưa bao giờ chạy** → push tin nhắn **chưa từng hoạt động một lần nào**. Xem §3.0.

**`messaging-service` có code phát `notification-requested`** (nhưng xem §3.0 về việc nó không chạy):

```ts
// messaging-service/src/gateway/chat.gateway.ts:197 — gọi ngay sau khi lưu tin nhắn
this.handleOfflineNotifications(data.conversationId, userId, message);

// chat.gateway.ts:328-365
private async handleOfflineNotifications(conversationId, senderId, message) {
    const conversation = await this.conversationsService.findOne(conversationId, senderId);
    const recipients = conversation.participantIds.filter((id) => id !== senderId);

    for (const recipientId of recipients) {
        if (!this.isUserOnline(recipientId)) {            // ← chỉ gửi khi người nhận OFFLINE
            await this.redisService.emitNotificationRequested({
                user_id: recipientId,
                title: `New message from ${message.sender?.displayName || 'User'}`,
                body: message.content,
                data: {
                    conversationId,
                    messageId: message.id,
                    route: `/(messages)/${conversationId}`,
                },
                timestamp_ms: new Date().getTime(),
            });
            this.logger.log(`Queued notification for offline user ${recipientId}`);
        }
    }
}
```

**✅ Không dính bẫy Redis DB** (bẫy từng làm chết push của job): `messaging-service/src/redis/redis.service.ts:11-13`
chỉ đọc `REDIS_HOST` / `REDIS_PORT` / `REDIS_PASSWORD`, **không đọc `REDIS_DB`** → ioredis mặc định
**db 0** — đúng nơi `notification-service` đọc.

**✅ Chặng phía sau đã chứng minh chạy thật** (log production): `RedisPushNotificationConsumer` →
`FcmService` → `Successfully sent FCM message: projects/talentlink-22clc/messages/...`

---

## 2. Trạng thái tổng quan

| Chặng                                           | Phía                   | Trạng thái                          |
| ----------------------------------------------- | ---------------------- | ----------------------------------- |
| **Push được kích hoạt khi gửi tin nhắn (REST)** | `messaging-service`    | 🔴 **KHÔNG — nhánh chết (§3.0)**    |
| Code `handleOfflineNotifications` tồn tại       | `messaging-service`    | ✅ Có, nhưng không ai gọi           |
| Redis DB trùng với consumer (db 0)              | `messaging-service`    | ✅ Đúng                             |
| Tiêu thụ + gọi FCM                              | `notification-service` | ✅ Đã chạy thật (job)               |
| Đăng ký device + quyền thông báo                | Mobile                 | ✅ Xong                             |
| **Payload `route` khớp route thật của app**     | `messaging-service`    | 🔴 **SAI — CẦN SỬA (§4.1)**         |
| **App ở background được coi là offline**        | Mobile                 | ✅ Xong (SocketProvider + AppState) |
| `resolvePushRoute` xử lý `new_message`          | Mobile                 | ✅ Xong (+3 unit test)              |
| `PushNotificationData` có `conversation_id`     | Mobile                 | ✅ Xong                             |
| Presence đúng ngữ nghĩa + scale được            | `messaging-service`    | 🟠 Cần cải thiện (§4.2)             |
| Tin nhắn ảnh / nhóm / body dài                  | `messaging-service`    | 🟠 Edge case (§7)                   |

**Tóm tắt (cập nhật 2026-07-16, có log production làm bằng chứng):**

- **Mobile đã xong** — `SocketProvider` + AppState ngắt socket khi vào nền, `resolvePushRoute` xử lý
  `new_message`, 36 unit test pass.
- **Backend còn 2 việc 🔴**:
    1. **§4.0 — kích hoạt push từ nhánh REST** (nguyên nhân gốc: push tin nhắn **chưa từng chạy**).
    2. **§4.1 — đổi payload sang data trung lập** (route đang sai → bấm không mở được màn).

---

## 3. Các vấn đề chặn (kèm bằng chứng)

### 3.0 🔴🔴 NGUYÊN NHÂN GỐC — push móc vào nhánh SOCKET, app lại gửi qua REST

**Push tin nhắn chưa từng chạy một lần nào.** Bằng chứng từ log production:

```
POST /api/v1/messages 201 20ms          ← app gửi tin nhắn qua REST
POST /api/v1/messages 201 26ms
POST /api/v1/messages 201 42ms
"Queued notification"                    → 0 lần (grep TOÀN BỘ log messaging-service)
"Error handling offline notifications"   → 0 lần (không phải lỗi — code KHÔNG BAO GIỜ chạy)
sendMessage / message:send (socket)      → 0 lần
notification-requested (redis db0)       → 7 event, TẤT CẢ là type=new_application (job), 0 new_message
```

**Vì sao:**

| Sự thật                                                                  | Vị trí                                                                                                          |
| ------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------- |
| `handleOfflineNotifications` chỉ được gọi ở **đúng 1 chỗ**               | `chat.gateway.ts:197` — bên trong `@SubscribeMessage('message:send')`                                           |
| App gửi tin nhắn bằng **REST**, không dùng socket `message:send`         | `TL-Mobile/features/messaging/presentation/screens/DetailMessageScreen.tsx:171` → `apiClient.post('/messages')` |
| REST `POST /messages` chỉ **broadcast** vào room, không gọi notification | `messages.controller.ts:63-65`                                                                                  |

→ Handler socket `message:send` là **code chết**. Mọi tin nhắn đi REST → `handleOfflineNotifications`
không bao giờ được gọi → **không event push nào được phát**.

> Đây là lý do §3.1 (route sai) và §3.2 (background) **chưa bao giờ lộ ra** — luồng còn chưa chạy tới đó.

### 3.1 🔴 Route SAI — bấm thông báo không mở được màn chat

|                    | Giá trị                                                          |
| ------------------ | ---------------------------------------------------------------- |
| Backend gửi        | `route: "/(messages)/${conversationId}"` → `/(messages)/abc-123` |
| Route thật của app | `/(messages)/detailMessage?conversationId=abc-123`               |

Bằng chứng route thật:

- `features/messaging/presentation/screens/DetailMessageScreen.tsx:37` →
  `useLocalSearchParams<{ conversationId: string }>()`
- Mọi nơi trong app đều điều hướng kiểu này: `JobDetailScreen.tsx:159`,
  `NotificationsScreen.tsx:68`, `ArtistProfileScreen.tsx:119`, `VenueProfileScreen.tsx:89`
- Thư mục `app/(messages)/` **chỉ có** `_layout.tsx`, `contactMessage.tsx`, `detailMessage.tsx`
  → **không có `[id].tsx`**, nên `/(messages)/abc-123` **không tồn tại**

Và `features/notifications/domain/utils/resolvePushRoute.ts:18-21` **ưu tiên `data.route`**:

```ts
const explicit = data.route ?? data.path;
if (typeof explicit === 'string' && explicit.length > 0) return explicit; // ← lấy route SAI này
```

→ `router.push('/(messages)/abc-123')` → **điều hướng thất bại**.

> Ngoài ra `route` là cú pháp **expo-router**, hardcode trong backend → **web sau này không dùng được**
> (xem `notifications-web.md` §6.3).

### 3.2 🔴 App ở background vẫn bị coi là "online" → KHÔNG có push

`isUserOnline()` dựa vào socket còn kết nối:

```ts
// chat.gateway.ts:46
private userSockets: Map<string, Set<string>> = new Map();
// chat.gateway.ts:310-312
isUserOnline(userId: string): boolean { return this.userSockets.has(userId); }
```

Mà **mobile không hề ngắt socket khi app xuống nền** — grep toàn repo: `AppState` chỉ xuất hiện ở
`features/payments/presentation/screens/PremiumScreen.tsx`, **không liên quan socket**.

→ App xuống background nhưng socket vẫn sống → backend tưởng user online → **bỏ qua push**.
→ **Chỉ khi app bị kill hẳn** (socket chết) mới có thông báo.

**Đây là kịch bản người dùng mong đợi nhất (app chạy nền → có thông báo) lại không hoạt động.**

### 3.3 🟠 Vòng đời socket lộn xộn + presence sai ngữ nghĩa

1. **`SocketProvider` là dead code**: `shared/presentation/providers/SocketProvider.tsx` tồn tại nhưng
   **không được mount ở đâu cả** (không có trong `app/_layout.tsx`). Socket đang được connect **ad-hoc**
   từ `features/messaging/presentation/screens/NotificationsScreen.tsx:62`.
   → Presence hiện phụ thuộc **"user đã mở tab Tin nhắn lần nào chưa"** — rất khó đoán.

2. **"Online" ≠ "đang xem cuộc trò chuyện đó"**: user mở app ở tab Jobs → có tin nhắn → socket đang
   kết nối → **không push**, mà user cũng không nhìn màn chat → **miss tin nhắn**.

3. **Có sẵn hàm chính xác hơn nhưng không dùng**: `chat.gateway.ts:315-326`

    ```ts
    async getOnlineUsers(conversationId: string): Promise<string[]> {
        const sockets = await this.server.in(`conversation:${conversationId}`).fetchSockets();
        ...
    }
    ```

    → đọc **room** `conversation:${id}` = đúng những người **đang mở cuộc trò chuyện đó**.

4. **`userSockets` là Map in-memory của 1 instance** → scale >1 replica là presence sai
   (instance A không biết user đang nối vào instance B).

---

## 4. Việc cần làm — BACKEND (`messaging-service`)

### 4.0 🔴🔴 Kích hoạt push từ nhánh REST (**việc quan trọng nhất**)

Không có việc này thì **mọi thứ khác vô nghĩa** — push tin nhắn không bao giờ được phát.

**Bước 1** — mở `handleOfflineNotifications` cho controller gọi được (`chat.gateway.ts:328`):

```ts
// private async handleOfflineNotifications(   ← bỏ 'private'
async handleOfflineNotifications(
    conversationId: string,
    senderId: string,
    message: any,
) { ... }
```

**Bước 2** — gọi từ REST (`messages.controller.ts:54-68`). Controller **đã inject sẵn `chatGateway`**:

```ts
async create(@Body() createMessageDto: CreateMessageDto, @Headers() headers: any) {
    const userId = this.getUserIdFromHeaders(headers);
    const message = await this.messagesService.create(createMessageDto, userId);

    this.chatGateway.server
        .to(`conversation:${message.conversationId}`)
        .emit('message:new', message);

    // App gửi tin nhắn qua REST này (không dùng socket 'message:send'), nên push phải
    // được kích hoạt ở đây — nếu không sẽ không ai nhận được thông báo.
    await this.chatGateway.handleOfflineNotifications(message.conversationId, userId, message);

    return message;
}
```

> **Lưu ý:** hàm này đã tự bọc `try/catch` nên không làm hỏng response nếu push lỗi.
> Cân nhắc **bỏ hẳn** handler socket `message:send` (`chat.gateway.ts:178-198`) vì nó là code chết —
> để lại sẽ có 2 đường gửi tin nhắn, dễ lệch nhau về sau.

### 4.1 🔴 Đổi payload sang **data trung lập** (bỏ `route` hardcode)

Sửa `chat.gateway.ts:347-357`:

```ts
await this.redisService.emitNotificationRequested({
    user_id: recipientId,
    title: senderName, // xem §7.2
    body: previewBody, // xem §7.1, §7.3
    data: {
        type: 'new_message', // ← client tự map ra route
        conversation_id: conversationId,
        message_id: message.id,
    },
    timestamp_ms: Date.now(),
});
```

**Vì sao bỏ `route`:** nó (a) đang sai (§3.1), (b) là cú pháp expo-router nên web không dùng được.
Cách này khớp với `job-post-service` (đang gửi `{ type, job_id }`) và với `notifications-web.md`.

> **Vá nhanh nếu chưa muốn đổi contract** (chỉ cứu được mobile, web vẫn hỏng):
> `route: "/(messages)/detailMessage?conversationId=${conversationId}"`

### 4.2 🟠 Presence room-based (khuyến nghị mạnh)

Thay `isUserOnline(recipientId)` bằng room của đúng conversation:

```ts
const activeInConvo = await this.getOnlineUsers(conversationId);   // đã có sẵn, dòng 315
for (const recipientId of recipients) {
    if (activeInConvo.includes(recipientId)) continue;             // đang mở đúng chat → im lặng
    await this.redisService.emitNotificationRequested({ ... });
}
```

→ Giải quyết luôn phần lớn §3.2 và §3.3.2: chỉ im lặng khi user **thực sự đang xem cuộc trò chuyện đó**.
Mobile đã `joinConversation` / `leaveConversation` sẵn (`DetailMessageScreen.tsx:123,131`) nên room
đã đúng, **không cần sửa mobile cho phần này**.

### 4.3 🟠 (Khi scale) presence sang Redis

`userSockets` in-memory chỉ đúng khi **1 replica**. Nếu scale: lưu presence vào Redis
(`SET user:online:{userId}` khi connect, `DEL` khi disconnect, có TTL + heartbeat), hoặc dùng
Socket.IO Redis adapter để `fetchSockets()` hoạt động xuyên instance.

---

## 5. Việc cần làm — MOBILE (`TL-Mobile`)

### 5.1 🔴 AppState → ngắt socket khi app xuống nền (**mấu chốt**)

Đây là thứ khiến push tin nhắn hoạt động. Kèm theo dọn luôn §3.3.1.

**Bước 1 — mount `SocketProvider`** (đang là dead code) vào `app/_layout.tsx`:

```tsx
<QueryClientProvider client={queryClient}>
    <SafeAreaProvider>
        <KeyboardProvider>
            <SocketProvider>
                {' '}
                {/* ← thêm */}
                <RootLayoutNav />
            </SocketProvider>
        </KeyboardProvider>
    </SafeAreaProvider>
</QueryClientProvider>
```

**Bước 2 — thêm AppState vào `SocketProvider.tsx`**:

```tsx
import { AppState } from 'react-native';

useEffect(() => {
    if (!user || !accessToken) return;

    // Socket còn sống = backend coi là "online" = KHÔNG gửi push.
    // App xuống nền thì phải ngắt để người dùng nhận được thông báo tin nhắn.
    const sub = AppState.addEventListener('change', (state) => {
        if (state === 'background' || state === 'inactive') {
            socketService.disconnect();
        } else if (state === 'active') {
            socketService.connect();
        }
    });
    return () => sub.remove();
}, [user, accessToken]);
```

**Bước 3 — bỏ connect ad-hoc** ở `NotificationsScreen.tsx:60-64` (đã có provider lo).

> **Đánh đổi:** ở nền không còn cập nhật realtime — nhưng đó **đúng là việc của push**.
> Khi quay lại `active`, socket reconnect và màn hình fetch lại tin nhắn.

> **Lưu ý:** nếu backend đã làm §4.2 (presence room-based) thì bước này **vẫn cần** — vì user có thể
> đang mở đúng màn chat rồi bấm Home; lúc đó room vẫn còn họ nếu socket chưa ngắt.

### 5.2 🔴 `resolvePushRoute` — thêm nhánh `new_message`

`features/notifications/domain/utils/resolvePushRoute.ts`:

```ts
switch (data.type) {
    case 'new_application':
        return data.job_id ? `/(jobs)/applicants?id=${data.job_id}` : null;
    case 'application_status_changed':
        return '/(jobs)/my-applications';
    case 'new_message': // ← thêm
        return data.conversation_id
            ? `/(messages)/detailMessage?conversationId=${data.conversation_id}`
            : null;
    default:
        return null;
}
```

### 5.3 🔴 `PushNotificationData` — thêm field

`features/notifications/domain/entities/notification.type.ts`:

```ts
export interface PushNotificationData {
    type?: string; // 'new_application' | 'application_status_changed' | 'new_message'
    job_id?: string;
    submission_id?: string;
    new_status?: string;
    conversation_id?: string; // ← thêm (messaging-service)
    message_id?: string; // ← thêm
    route?: string;
    path?: string;
}
```

### 5.4 Unit test (pattern đã có sẵn)

`features/notifications/domain/utils/__tests__/resolvePushRoute.test.ts` — thêm:

- `new_message` + `conversation_id` → `/(messages)/detailMessage?conversationId=<id>`
- `new_message` thiếu `conversation_id` → `null`

---

## 6. Contract dữ liệu (sau khi làm §4.1)

Stream `notification-requested` (Redis **db 0**), wire: `XADD notification-requested * data '<json>'`

```jsonc
{
    "user_id": "<recipient uuid>",
    "title": "Tên người gửi / tên nhóm",
    "body": "Nội dung xem trước (đã cắt ngắn)",
    "data": {
        "type": "new_message",
        "conversation_id": "<uuid>",
        "message_id": "<uuid>",
    },
    "timestamp_ms": 1784199566431,
}
```

Mobile map: `new_message` → `/(messages)/detailMessage?conversationId=<conversation_id>`
Web map (tương lai): `new_message` → `/messages/<conversation_id>`

---

## 7. Edge case cần xử lý (backend)

### 7.1 🟠 Tin nhắn chỉ có ảnh → body RỖNG

`body: message.content` — với tin nhắn chỉ đính ảnh, `content` là `''` → **thông báo trống trơn**.
(`DetailMessageScreen.tsx:221` gửi `content: messageText.trim() || ''` khi upload ảnh.)

```ts
const previewBody = message.content?.trim()
    ? message.content.trim()
    : message.attachmentUrl
      ? '📷 Đã gửi một ảnh'
      : 'Tin nhắn mới';
```

### 7.2 🟠 Title đang là tiếng Anh + không xử lý nhóm

`New message from ${displayName}` — app toàn tiếng Việt. Chat nhóm cũng nên hiện tên nhóm:

```ts
const senderName = message.sender?.displayName || 'Người dùng';
const title = conversation.isGroup ? conversation.name : senderName;
const body = conversation.isGroup ? `${senderName}: ${previewBody}` : previewBody;
```

### 7.3 🟠 Body dài → cắt ngắn

Payload FCM tối đa **4KB**. Tin nhắn dài nên cắt:

```ts
const MAX = 120;
const preview = raw.length > MAX ? raw.slice(0, MAX) + '…' : raw;
```

### 7.4 🟡 Chưa có

- **Tắt thông báo theo cuộc trò chuyện** (mute) — chưa có bảng/API.
- **Badge count** — chưa đồng bộ.
- **Gộp thông báo** (nhiều tin từ cùng 1 người) — hiện mỗi tin là 1 banner.

---

## 8. Test plan

**Điều kiện tiên quyết:** đã cấp quyền thông báo trên máy (`POST_NOTIFICATIONS` — xem
`notifications.md`), device có trong `device_registrations`.

| #   | Kịch bản                                            | Kỳ vọng                                                               |
| --- | --------------------------------------------------- | --------------------------------------------------------------------- |
| 1   | Máy A **bấm Home** (app ở nền) → máy B gửi tin nhắn | 🔔 Máy A hiện banner tên người gửi + nội dung                         |
| 2   | Bấm vào banner                                      | Mở **đúng cuộc trò chuyện** (không phải màn trắng / không điều hướng) |
| 3   | Máy A **đang mở đúng** cuộc trò chuyện đó → B gửi   | **KHÔNG** push; tin nhắn về qua socket ✅ đúng thiết kế               |
| 4   | Máy A mở app nhưng **ở tab Jobs** → B gửi           | 🔔 Có push (sau khi làm §4.2)                                         |
| 5   | Máy A **kill app** → B gửi                          | 🔔 Có push; bấm vào mở app đúng màn (`getInitialNotification`)        |
| 6   | B gửi **chỉ ảnh**                                   | Banner hiện "📷 Đã gửi một ảnh", không trống (§7.1)                   |
| 7   | Chat **nhóm**                                       | Title = tên nhóm, body = "Tên: nội dung" (§7.2)                       |

**Log cần thấy (theo thứ tự đường ống):**

```
messaging-service   : "Queued notification for offline user <recipientId>"
messaging-service   : "Published notification request to stream notification-requested with ID: ..."
notification-service: "Processing NotificationRequestedEvent for user <id> (title: ...)"
notification-service: "Successfully sent FCM message: projects/talentlink-22clc/messages/..."
notification-service: "Successfully sent push notification to user <id> on device <deviceId>"
mobile (FE)         : "[FCM] background message: <messageId>"
```

**Nếu tắc, soi theo thứ tự:**

```
Không thấy "Queued notification"  → recipient đang bị coi là ONLINE (§3.2) hoặc socket chưa ngắt
Không thấy "Processing..."        → sai Redis DB (kiểm tra: docker exec redis redis-cli -n 0 XLEN notification-requested)
Thấy "No active devices..."       → device chưa đăng ký (xem notifications.md)
Thấy "Successfully sent" mà máy im→ quyền thông báo chưa cấp (bài học POST_NOTIFICATIONS)
Có banner mà bấm không mở màn     → route sai (§3.1 / §5.2)
```

---

## 9. Bản đồ file

**Backend (`DATN-Backend`)**

```
messaging-service/src/gateway/chat.gateway.ts:197        ← gọi handleOfflineNotifications ✅
messaging-service/src/gateway/chat.gateway.ts:328-365    ← 🔴 sửa payload (§4.1) + presence (§4.2)
messaging-service/src/gateway/chat.gateway.ts:310-326    ← isUserOnline / getOnlineUsers
messaging-service/src/redis/redis.service.ts:59-87       ← XADD notification-requested ✅ (db 0)
notification-service/.../RedisPushNotificationConsumer.cs← tiêu thụ ✅ không cần sửa
notification-service/.../FcmService.cs                   ← gửi FCM ✅ không cần sửa
```

**Mobile (`TL-Mobile`)**

```
app/_layout.tsx                                          ← 🔴 mount SocketProvider (§5.1)
shared/presentation/providers/SocketProvider.tsx         ← 🔴 dead code + thêm AppState (§5.1)
shared/infrastructure/socket/socketService.ts            ← connect()/disconnect() đã có
features/messaging/presentation/screens/NotificationsScreen.tsx:60-64 ← bỏ connect ad-hoc (§5.1)
features/messaging/presentation/screens/DetailMessageScreen.tsx:123,131 ← join/leave room ✅ đã đúng
features/notifications/domain/utils/resolvePushRoute.ts  ← 🔴 thêm 'new_message' (§5.2)
features/notifications/domain/entities/notification.type.ts ← 🔴 thêm conversation_id (§5.3)
features/notifications/presentation/hooks/usePushNotifications.ts ← nhận/tap ✅ không cần sửa
```

---

## 10. Thứ tự về đích

1. ✅ ~~**Mobile §5.2 + §5.3**~~ — đã thêm `new_message` vào `resolvePushRoute` + type (+3 test).
2. ✅ ~~**Mobile §5.1**~~ — đã mount `SocketProvider` + AppState ngắt socket khi app vào nền.
3. 🔴🔴 **Backend §4.0** — gọi `handleOfflineNotifications` từ REST. ← **không có bước này thì mọi thứ khác vô nghĩa**
   → _Mốc kiểm tra:_ log `messaging-service` xuất hiện `Queued notification for offline user ...`
   (hiện tại: **0 lần trong toàn bộ log**), và redis db0 có event `type=new_message`.
4. 🔴 **Backend §4.1** — đổi payload sang data trung lập.
   → _Mốc kiểm tra:_ máy A **bấm Home**, B gửi tin → có banner, **bấm vào mở đúng chat**.
5. 🟠 **Backend §4.2** — presence room-based.
   → _Mốc kiểm tra:_ máy A mở app ở tab Jobs → vẫn có push; đang mở đúng chat → im lặng.
6. 🟠 **Backend §7** — ảnh / nhóm / cắt body.
7. 🟠 **Backend §4.3** — presence qua Redis (khi scale >1 replica).

> **⚠️ Làm §4.0 mà chưa làm §4.1:** sẽ có banner nhưng **bấm vào không mở được màn** — vì
> `resolvePushRoute` ưu tiên `data.route` (đang sai) hơn `data.type`. Nên làm **§4.0 + §4.1 cùng lúc**.
> Mobile đã sẵn sàng cho `type: 'new_message'`.

**Khối lượng còn lại:** backend ~15 dòng (§4.0 + §4.1). Phía mobile đã xong, không cần rebuild native.

---

## Phụ lục — Bài học từ luồng push job (đừng lặp lại)

Push job từng "im lặng" vì 4 lỗi độc lập, mọi lớp đều _trông như_ thành công:

| #   | Lỗi                                                  | Áp dụng cho tin nhắn?                        |
| --- | ---------------------------------------------------- | -------------------------------------------- |
| 1   | Bảng `device_registrations` chưa tạo                 | ✅ Đã fix, dùng chung                        |
| 2   | Thiếu `firebase.json` trong container                | ✅ Đã fix, dùng chung                        |
| 3   | **Redis DB lệch** (job-post db2 vs notification db0) | ✅ **messaging-service dùng db 0 — an toàn** |
| 4   | **Android không xin `POST_NOTIFICATIONS`**           | ✅ Đã fix, dùng chung                        |

→ Tin nhắn **thừa hưởng toàn bộ hạ tầng đã thông**. Chỉ còn 2 lỗi riêng của nó: **route sai** và
**app nền vẫn bị coi là online**.

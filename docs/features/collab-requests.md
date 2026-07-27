# Collab Requests (Đề nghị hợp tác 1-1)

**Khác với** [`features/collab`](./collab.md) (“Quản lý hợp tác” = job submissions / ứng tuyển).

Module này port tính năng **đề nghị hợp tác 1-1** từ Soundspal Web (`/collaborations`, `/calendar`).

## Entry points

| Nơi                          | Hành vi                                                            |
| ---------------------------- | ------------------------------------------------------------------ |
| `PersonalScreen` → Công việc | “Đề nghị hợp tác” / “Lịch hợp tác” → `/(profiles)/collab-requests` |
| Hub screen                   | 2 tab: **Đề nghị** \| **Lịch**                                     |
| Artist profile (`!isMe`)     | CTA “Đề nghị” cạnh Nhắn tin                                        |
| Artist + Venue profile       | Section “Đã hợp tác với” (public)                                  |
| Push FCM                     | `collaboration_*` → hub tab manage                                 |

## API

- `POST/GET /collaborations`, `PATCH /collaborations/:id/status`
- `GET /users/:id/public-collaborators`
- Request dates: `dd-MM-yyyy`; response: `yyyy-MM-dd`
- Multipart attachment: `postMultipartWithFetch` (không dùng axios FormData)

## Status

`PENDING → ACCEPTED|REJECTED|CANCELLED`; `ACCEPTED → CANCELLED`.  
Calendar chỉ `ACCEPTED`. Public partners: `ACCEPTED` + `is_public`.

## Code

`features/collabRequests/` — domain / data / presentation (Clean Architecture giống jobs/collab).

Tham chiếu web: `Soundspal/soundspal/docs/mobile-team/collaboration-fe-sync.md`  
Tham chiếu BE: `DATN-Backend/job-post-service/docs/COLLABORATION_API.md`

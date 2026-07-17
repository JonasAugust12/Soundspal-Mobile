# Feature: Collab (Hợp tác / Quản lý đơn ứng tuyển)

**Route:** `app/(profiles)/collaboration`, `app/(profiles)/jobSubmissions`  
**Module:** `features/collab/` (components + API) — **screens host trong profiles**

---

## 1. Mục đích nghiệp vụ

Quản lý **vòng đời submission** sau khi user apply job hoặc đăng tin tuyển:

| Tab           | Ai dùng        | Hành động                                  |
| ------------- | -------------- | ------------------------------------------ |
| **Đã gửi**    | Applicant      | Xem đơn đã gửi, rút đơn, xem job detail    |
| **Nhận được** | Venue / poster | Xem job đã đăng, vào review từng applicant |

Jobs feature xử lý **đăng + apply**; collab xử lý **theo dõi + review + withdraw**.

---

## 2. Luồng nghiệp vụ

### 2.1 Hub hợp tác

```
PersonalScreen → "Hợp tác"
  → CollaborationScreen
  → CollabTabs: "Đã gửi" | "Nhận được"
```

### 2.2 Tab Đã gửi

```
useGetMySubmissions()
  → MySubmissionCard
  → Xem job → /(jobs)/detail?id=
  → Rút đơn (nếu can_withdraw && pending_review)
      → useWithdrawSubmission()
      → PUT /submissions/:id/withdraw { reason: 'Tôi muốn rút đơn' }
```

### 2.3 Tab Nhận được

```
useGetMyPosts()   // jobs user đã đăng
  → JobPostCard
  → Tap → /(profiles)/jobSubmissions?jobId=&jobTitle=
```

### 2.4 Review applicants

```
JobSubmissionsScreen
  → useGetOpportunitySubmissions(jobId)
  → OpportunitySubmissionCard
  → Accept → useReviewSubmission({ action: 'accept' })
  → Reject → useReviewSubmission({ action: 'reject', review_notes? })
  → PUT /submissions/:id/review
```

---

## 3. Cấu trúc code

```
features/collab/
├── domain/
│   ├── entities/collaboration.type.ts
│   └── repositories/ICollabRepository.ts
├── data/
│   ├── datasources/collabRemoteDataSource.ts
│   └── repositories/CollabRepositoryImpl.ts
└── presentation/
    ├── hooks/useCollabApi.ts
    └── components/
        ├── CollabList, CollabTabs
        ├── MySubmissionCard, OpportunitySubmissionCard
        ├── JobPostCard, CollabStatusBadge

# Screens (profiles):
features/profiles/presentation/screens/
  ├── CollaborationScreen.tsx
  └── JobSubmissionsScreen.tsx
```

---

## 4. API endpoints

| Method | Path                                | Hook                                          |
| ------ | ----------------------------------- | --------------------------------------------- |
| GET    | `/my-submissions`                   | `useGetMySubmissions`                         |
| GET    | `/posts/me`                         | `useGetMyPosts`                               |
| GET    | `/posts/:opportunityId/submissions` | `useGetOpportunitySubmissions`                |
| GET    | `/my-posts/submissions`             | `useGetMyPostedJobsSubmissions` (**ít dùng**) |
| PUT    | `/submissions/:id/withdraw`         | `useWithdrawSubmission`                       |
| PUT    | `/submissions/:id/review`           | `useReviewSubmission`                         |

**Review actions:** `accept` | `reject` | `skip` — UI chỉ expose accept/reject.

---

## 5. Submission status

```typescript
type SubmissionStatus = 'pending_review' | 'accepted' | 'rejected' | 'withdrawn';
```

`CollabStatusBadge` — label tiếng Việt theo status.

---

## 6. Business rules

| Rule            | Chi tiết                                                                              |
| --------------- | ------------------------------------------------------------------------------------- |
| Withdraw        | Chỉ khi `can_withdraw && status === 'pending_review'`                                 |
| Withdraw reason | Hardcoded `'Tôi muốn rút đơn'`                                                        |
| Review buttons  | Chỉ khi `can_be_reviewed && status === 'pending_review'`                              |
| Pagination      | Default page=1, page_size=20                                                          |
| **Quirk**       | `useGetMyPostedJobsSubmissions` chỉ fetch submissions của **job đầu tiên** trong list |

---

## 7. Components

| Component                   | Vai trò                        |
| --------------------------- | ------------------------------ |
| `CollabTabs`                | Switch Đã gửi / Nhận được      |
| `CollabList`                | List wrapper + empty state     |
| `MySubmissionCard`          | Card đơn đã gửi + withdraw     |
| `JobPostCard`               | Card job đã đăng → drill down  |
| `OpportunitySubmissionCard` | Applicant info + accept/reject |
| `CollabStatusBadge`         | Status chip                    |

Import `formatDate` từ `features/jobs/domain/utils/jobFormatters`.

---

## 8. Phụ thuộc

| Hướng             | Chi tiết                                      |
| ----------------- | --------------------------------------------- |
| collab → jobs     | `JobListResponse`, formatters, job detail nav |
| profiles → collab | Host screens, entry từ Personal               |
| collab ↔ payments | Premium marketing "unlimited applications"    |

---

## 9. Tại sao tách khỏi jobs?

| Lý do                  | Giải thích                                                    |
| ---------------------- | ------------------------------------------------------------- |
| Persona khác           | Applicant vs recruiter — 2 tab UX riêng                       |
| API surface khác       | `/submissions/*` vs `/posts/*`                                |
| Reuse                  | Collab type có thể mở rộng cho opportunity không phải job     |
| Screens trong profiles | UX "quản lý tài khoản" — collab là extension của personal hub |

---

## 10. Câu hỏi thường gặp

**H: Duplicate type với jobs?**  
T: `MySubmission` có trong cả `job.type.ts` và `collaboration.type.ts` — tech debt; nên merge domain entity sau.

**H: Skip review có dùng không?**  
T: API hỗ trợ `action: 'skip'` — UI chưa expose.

**H: useGetMyPostedJobsSubmissions bug?**  
T: Chỉ query `posts[0]` — nếu user có nhiều job, aggregate endpoint `/my-posts/submissions` nên dùng thay.

---

## 11. Debug

| Triệu chứng         | File                                     |
| ------------------- | ---------------------------------------- |
| Không rút được đơn  | `MySubmissionCard` + `can_withdraw`      |
| Review không hiện   | `OpportunitySubmissionCard` status check |
| Tab nhận được trống | `useGetMyPosts` — user chưa đăng job     |

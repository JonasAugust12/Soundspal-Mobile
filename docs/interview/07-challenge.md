# 07 — Challenge / Thu âm / Chấm điểm AI

> Feature "khó" nhất về mặt kỹ thuật nền tảng: audio recording, phát đè beat, chấm điểm bất đồng bộ.
> Cũng là feature có nhiều lỗi chưa vá nhất — nên chuẩn bị kỹ phần thừa nhận.

## 0. Bản đồ file

| File                                                                                                                                                             | Vai trò                                |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- |
| [features/challenge/data/datasources/challengeRemoteDataSource.ts](../../features/challenge/data/datasources/challengeRemoteDataSource.ts)                       | 14 endpoint `/beats/*`                 |
| [features/challenge/presentation/store/audioStore.ts](../../features/challenge/presentation/store/audioStore.ts)                                                 | Player toàn cục (beat + entry preview) |
| [features/challenge/presentation/components/recordStudio/StudioDashboard.tsx](../../features/challenge/presentation/components/recordStudio/StudioDashboard.tsx) | Phòng thu (594 dòng)                   |
| [features/challenge/domain/utils/recording.ts](../../features/challenge/domain/utils/recording.ts)                                                               | Định dạng, tên file, validate đuôi     |
| [features/challenge/presentation/screens/MyContentScreen.tsx](../../features/challenge/presentation/screens/MyContentScreen.tsx)                                 | 981 dòng — file dài nhất dự án         |
| [features/challenge/presentation/components/leaderboard/](../../features/challenge/presentation/components/leaderboard/)                                         | Podium, RankList, ScoreDetailModal     |

---

## A. Kiến trúc

1. **[KT]** "Challenge chính là Beat" — không có entity `Challenge` riêng. **[SÂU]** Nếu sau này một beat có **nhiều** challenge (khác luật, khác thời gian), model hiện tại chịu được không? Chi phí đổi là bao nhiêu?

2. **[KT]** `audioStore` quản lý **hai** đối tượng phát: `soundObject` (beat) và `entrySound` (bản dự thi). Vì sao tách? Điều gì đảm bảo không phát chồng?
    - `↳` `playBeat()` gọi `stopEntry()` trước; `playEntry()` cũng dừng beat. Nhưng đây là ràng buộc bằng quy ước, không có state machine.

3. **[KT]** Component beat (`BeatCard`, `BeatList`, `MiniPlayer`) nằm trong `features/explore/` nhưng chỉ `ChallengeExploreScreen` dùng. Vì sao không di chuyển sang `features/challenge`?

4. **[KT]** Có **ba** file `CustomTabBar.tsx` khác nhau trong challenge (`recordStudio/`, `leaderboard/`, `beatDetail/`), mỗi file 81 dòng. Trùng lặp có chủ đích hay copy-paste?

5. **[SÂU]** `MyContentScreen.tsx` dài **981 dòng** và dùng toàn `StyleSheet` trong khi cả app dùng NativeWind. Vì sao tồn tại ngoại lệ này?

---

## B. Luồng đi

### B1. Nghe beat

6. **[LUỒNG]** `playBeat()` xử lý mấy nhánh?
    - `↳` (1) dừng entry đang phát; (2) nếu đúng beat đang phát → `togglePlay()`; (3) khác beat → dừng cái cũ, load mới, `setAudioModeAsync`, play.

7. **[SÂU]** `MyContentScreen` gọi `useAudioStore.getState()` **ngay trong thân render** (dòng 88 và 254). Sai ở đâu?
    - `↳` `getState()` là đọc **không phản ứng** — component không re-render khi `currentEntry` đổi. Phải dùng selector `useAudioStore(s => s.currentEntry)`.

### B2. Thu âm (StudioDashboard)

8. **[LUỒNG]** Kể tuần tự luồng thu âm hát đè lên beat.
    - `↳` `setAudioModeAsync({allowsRecordingIOS: true, ...})` → phát beat + bắt đầu `Audio.Recording` → dừng → `setAudioModeAsync({allowsRecordingIOS: false})` → có file `.m4a` → dựng FormData → `POST /beats/{id}/entries`.

9. **[SÂU]** Có **3 lần** `setAudioModeAsync` với cấu hình khác nhau trong dự án (StudioDashboard ×2, audioStore ×2). Nếu **quên khôi phục** `allowsRecordingIOS: false` sau khi thu thì chuyện gì xảy ra trên iOS?
    - `↳` Âm lượng phát bị hạ xuống mức "ứng dụng gọi điện" — âm thanh nhỏ bất thường, người dùng tưởng app hỏng.

10. **[SÂU]** **Không có bù trễ (latency compensation)** khi thu giọng đè lên beat. Trên Android độ trễ audio 100–300 ms là bình thường ⇒ bản thu **lệch nhịp**. Với một app âm nhạc, đây là lỗi chí mạng — bạn giải quyết thế nào?
    - `↳` Trả lời tốt: đo latency bằng `AudioManager.PROPERTY_OUTPUT_FRAMES_PER_BUFFER` / round-trip test, rồi dịch track khi mix. Hoặc thừa nhận cần native module (Oboe/AAudio) — vượt phạm vi expo-av.

11. **[SÂU]** Dạng sóng (`WaveformCanvas`) là **mảng 25 giá trị hardcode** (`STATIC_BARS`), chỉ animate chứ không dùng metering thật. Người dùng có bị đánh lừa không? Chi phí làm thật là bao nhiêu?
    - `↳` `expo-av` có `setProgressUpdateInterval` + `metering` trong `RecordingStatus` — làm thật là khả thi, không phải bất khả.

12. **[BIZ]** Hai chế độ thu: `with-beat` và `vocal-only`. Chúng khác nhau ở đâu về mặt kỹ thuật và về mặt chấm điểm?

13. **[BIZ]** Vì sao **không port** phần convert sang WAV từ bản web?
    - `↳` Comment `recording.ts:4-7`: web dùng Web Audio API để convert; mobile expo-av xuất `.m4a` vốn đã nằm trong danh sách backend chấp nhận.

### B3. Nộp bài & chấm điểm

14. **[LUỒNG]** `submitEntry` đi đường nào và vì sao?
    - `↳` `postMultipartWithFetch` — vì axios 1.x trên RN gửi FormData rỗng.

15. **[SÂU]** Datasource challenge gọi `postMultipartWithFetch` nhưng **không** gọi `unwrapUploadPayload()`, khác với profiles. Nếu backend đổi sang trả envelope `{code,message,data}` thì chuyện gì xảy ra?
    - `↳` `BeatEntry` nhận về là envelope → mọi field điểm `undefined` → UI hiện `0`/`NaN`. Đây là quả bom hẹn giờ.

16. **[BIZ]** `scoring_status` có 4 giá trị: `pending | completed | failed | scored`. **Hai giá trị `completed` và `scored` cùng nghĩa?** Ai định nghĩa enum này?

17. **[SÂU]** **Không có polling cho `scoring_status === 'pending'`**. Người dùng nộp bài xong phải tự thoát ra vào lại mới thấy điểm. Vì sao chưa làm? Thiết kế cách vá (so sánh với cách payments poll).

18. **[SÂU]** `submitEntry` và `createBeat` được gọi **trực tiếp qua `challengeApi`** trong component (`StudioDashboard.tsx:348`, `CreateChallengeForm.tsx:85`), **không qua mutation hook** ⇒ **không invalidate cache**. Hệ quả: nộp bài xong danh sách không cập nhật. Vì sao lệch chuẩn so với phần còn lại của dự án?

19. **[BIZ]** 6 tiêu chí chấm điểm: `pitch`, `rhythm`, `tone`, `expression`, `stability`, `normalized` → `total_score`. **App không tham gia chấm**. Nếu hội đồng hỏi "AI chấm bằng gì", bạn trả lời thế nào?
    - `↳` Trả lời trung thực: đây là trách nhiệm backend; nêu những gì bạn **biết chắc** (6 chiều, chấm bất đồng bộ sau upload) và những gì bạn không nắm (mô hình, ngưỡng).

### B4. Bảng xếp hạng & vote

20. **[LUỒNG]** `getLeaderboard` nhận `limit`, `offset`, `includeUnscored`. Tham số cuối để làm gì?

21. **[SÂU]** `useDeleteEntry` chỉ invalidate `['my-entries']`, **không** invalidate `['beat-leaderboard']`. Người dùng xoá bài dự thi rồi mở bảng xếp hạng đang xem thì thấy gì?

22. **[SÂU]** Logic vote bị **viết hai lần** (`useEntryVotes.ts` và một bản khác); `getHeroBeat` cũng bị viết lại ở 2 nơi. Vì sao trùng lặp và bạn gom về đâu?

23. **[BIZ]** `voteEntry` chỉ nhận `vote_type: 'up'` — không có downvote. Quyết định nghiệp vụ hay chưa làm?

### B5. Bookmark beat

24. **[LUỒNG]** `useToggleBeatBookmark` gọi API **trước**, thành công mới cập nhật local — ngược với optimistic UI thông thường. Vì sao?
    - `↳` Comment `useChallengeApi.ts:97-101`: theo recipe của web. Đổi lại: phản hồi chậm hơn nhưng không bao giờ hiển thị sai trạng thái.

25. **[SÂU]** Nó invalidate **4 query key** cùng lúc (`bookmarked-beats`, `beats`, `beat`, `my-beats`). Có thừa không? Chi phí mạng khi người dùng bấm bookmark liên tục?

---

## C. Business logic

26. **[BIZ]** Định dạng audio backend chấp nhận: `mp3, wav, flac, m4a, ogg, aac`. Validate ở đâu?
    - `↳` `isAcceptedUploadAudioFile()` kiểm tra **đuôi file**, không kiểm tra MIME thật hay magic bytes. Đổi tên `.exe` → `.mp3` thì lọt.

27. **[SÂU]** **Không kiểm tra dung lượng file** dù UI có ghi giới hạn. Bản thu 10 phút ở chất lượng cao là bao nhiêu MB? Chuyện gì xảy ra khi upload vượt giới hạn server?

28. **[BIZ]** `getBeatDownloadFileName()` slugify tiêu đề tiếng Việt qua NFD rồi bỏ dấu. Trường hợp tiêu đề toàn ký tự đặc biệt thì sao?
    - `↳` `baseName` rỗng → fallback `beat-<id>`. Có phòng thủ.

29. **[BIZ]** `beatDetail/HeroSection` hiển thị `duration_seconds` dưới nhãn **"LƯỢT NGHE"** (`HeroSection.tsx:68`). Nhãn sai hoàn toàn — đây là copy-paste hay thiếu field từ backend?

30. **[BIZ]** Nút "Chia sẻ" ở màn kết quả **chưa gắn hành động**. Tính năng dở dang hay ngoài phạm vi?

---

## D. Bên thứ ba & thư viện

31. **[3RD]** `expo-av` đã bị Expo **deprecate** (thay bằng `expo-audio` / `expo-video`). Kế hoạch migrate? Chi phí ước tính?

32. **[3RD]** `app.json` **không khai `expo-av` trong `plugins`** và **không có `NSMicrophoneUsageDescription`**. Hệ quả trên iOS là gì?
    - `↳` App Store từ chối hoặc app crash khi xin quyền micro. Trên Android thì `expo-av` tự thêm `RECORD_AUDIO` qua autolinking nên chưa lộ.

33. **[3RD]** `expo-video` và `expo-video-player` có trong `package.json` nhưng **không được import ở đâu**. Ảnh hưởng bundle size?

34. **[SÂU]** Nếu phải chuyển sang thu âm chất lượng studio (48 kHz, low-latency), expo-av có đủ không? Bạn cần gì thêm?

---

## E. Đào sâu

35. **[SÂU]** `audioStore` giữ `Audio.Sound` object trong Zustand state. Có vấn đề gì khi lưu **object native không serializable** vào store? Điều gì xảy ra nếu ai đó bật persist cho store này?

36. **[SÂU]** Người dùng rời màn hình khi đang phát — âm thanh có tiếp tục không? Ai chịu trách nhiệm `unloadAsync()`? Có memory leak không?

37. **[SÂU]** Nếu phải hỗ trợ **phát nền + điều khiển từ notification** (như Spotify), kiến trúc hiện tại đổi thế nào?

38. **[SÂU]** Thiết kế test cho feature này: cái gì test được bằng Jest, cái gì bắt buộc phải test trên thiết bị thật?

---

## F. Điểm yếu nên chủ động thừa nhận

| Vấn đề                                            | Hướng trả lời                                                               |
| ------------------------------------------------- | --------------------------------------------------------------------------- |
| Không bù trễ khi thu đè beat                      | Lỗi nặng nhất; thừa nhận, nêu hướng đo latency, thừa nhận cần native module |
| Waveform là giả (25 giá trị hardcode)             | Thừa nhận là placeholder UI; nêu `metering` của expo-av làm hướng vá        |
| `submitEntry`/`createBeat` không invalidate cache | Bug thật, sửa nhanh bằng cách bọc vào mutation hook                         |
| Không poll `scoring_status`                       | Thừa nhận; nêu mẫu poll đã có sẵn ở payments để tái dùng                    |
| Không gọi `unwrapUploadPayload()`                 | Bom hẹn giờ; sửa 2 dòng                                                     |
| `useAudioStore.getState()` trong render           | Dùng sai Zustand; thừa nhận thẳng                                           |
| Nhãn "LƯỢT NGHE" hiển thị `duration_seconds`      | Bug hiển thị, thừa nhận                                                     |
| Không kiểm tra dung lượng file                    | Thừa nhận; validate ở client là UX, server vẫn phải chặn                    |
| `MyContentScreen` 981 dòng, dùng StyleSheet       | Thừa nhận nợ kỹ thuật, không bào chữa                                       |
| `expo-av` deprecated                              | Nêu kế hoạch migrate cụ thể, không nói "sẽ làm sau"                         |

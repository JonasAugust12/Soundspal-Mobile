# TalentLink

React Native Expo app with TypeScript, NativeWind, and **feature-based Clean Architecture**.

## Quick start

```bash
npm install
cp .env.example .env   # required — then fill in the real values
npm start              # Expo dev server
npm run android
npm run ios
npm run typecheck
npm test
```

> Requires a development build — Expo Go won't work (Firebase, MMKV, Google Sign-In
> are native modules). See [HuongDanSuDung.txt](./HuongDanSuDung.txt).

## Environment variables

All runtime config lives in `.env` at the repo root. There are **no defaults in the
source** — a missing variable means the app builds but can't reach the backend.
Copy `.env.example` and fill it in.

| Variable                             | Used in                                               |
| ------------------------------------ | ----------------------------------------------------- |
| `EXPO_PUBLIC_API_BASE_URL`           | `shared/infrastructure/api/apiClient.ts`              |
| `EXPO_PUBLIC_AUTH_REFRESH_URL`       | `shared/infrastructure/api/apiClient.ts`              |
| `EXPO_PUBLIC_SOCKET_URL`             | `shared/infrastructure/socket/socketService.ts`       |
| `EXPO_PUBLIC_SOCKET_PATH`            | `shared/infrastructure/socket/socketService.ts`       |
| `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`   | `features/auth/presentation/hooks/useGoogleSignIn.ts` |
| `EXPO_PUBLIC_STORAGE_ID`             | `shared/infrastructure/storage/storage.ts`            |
| `EXPO_PUBLIC_STORAGE_ENCRYPTION_KEY` | `shared/infrastructure/storage/storage.ts`            |

Notes:

- Expo reads `.env` at bundle time. **Restart with `npm run start:clear` after every
  edit**, otherwise the old values stay cached.
- The `EXPO_PUBLIC_` prefix inlines values into the shipped `.apk`/`.ipa` — anyone can
  read them. This separates environments, it is **not** a secret store. Never put
  passwords, `client_secret`, or private keys here.
- Changing `EXPO_PUBLIC_STORAGE_*` on a released build makes previously stored MMKV
  data undecryptable, logging every user out.
- Jest does **not** read `.env` (that's an Expo bundler feature), so test results don't
  depend on it.

## Project structure

```
app/                    # Thin Expo Router layer (re-exports screens from features)
features/
  auth/                 # domain | data | presentation
  jobs/
  challenge/
  blog/
  messaging/
  profiles/
  collab/
  payments/
  explore/
  home/
shared/
  domain/               # Cross-cutting types & constants
  infrastructure/       # apiClient, storage, socket
  presentation/         # Shared UI, hooks, navigation, providers
  utils/
```

### Layer rules

| Layer           | Responsibility                                                |
| --------------- | ------------------------------------------------------------- |
| `domain/`       | Entities, repository interfaces, use cases (pure TS)          |
| `data/`         | Remote datasources, repository implementations, mappers       |
| `presentation/` | Screens, components, React Query hooks, Zustand stores        |
| `app/`          | Route files only — `export { default } from '@/features/...'` |

## Tech stack

- React Native + Expo Router
- TypeScript (strict)
- NativeWind / Tailwind CSS
- TanStack React Query + Zustand
- Axios + Socket.IO

## Documentation

| Doc                                                  | Description                                      |
| ---------------------------------------------------- | ------------------------------------------------ |
| [docs/features/README.md](./docs/features/README.md) | Tài liệu từng feature (business + code)          |
| [docs/architecture.md](./docs/architecture.md)       | Sơ đồ Clean Architecture, Mermaid diagrams       |
| [docs/onboarding.md](./docs/onboarding.md)           | Hướng dẫn nắm source tổng quan                   |
| [HuongDanCaiDat.txt](./HuongDanCaiDat.txt)           | Cài đặt công cụ, môi trường, `.env` (nộp đề tài) |
| [HuongDanSuDung.txt](./HuongDanSuDung.txt)           | Biên dịch, chạy và sử dụng ứng dụng (nộp đề tài) |

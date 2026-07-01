# TalentLink

React Native Expo app with TypeScript, NativeWind, and **feature-based Clean Architecture**.

## Quick start

```bash
npm install
npm start          # Expo dev server
npm run android
npm run ios
npm run typecheck
npm test
```

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

| Doc                                                  | Description                                |
| ---------------------------------------------------- | ------------------------------------------ |
| [docs/features/README.md](./docs/features/README.md) | Tài liệu từng feature (business + code)    |
| [docs/architecture.md](./docs/architecture.md)       | Sơ đồ Clean Architecture, Mermaid diagrams |
| [docs/onboarding.md](./docs/onboarding.md)           | Hướng dẫn nắm source tổng quan             |

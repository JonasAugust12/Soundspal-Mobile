# TalentLink

Dự án React Native Expo với TypeScript và NativeWind (Tailwind CSS) version 1.0.1.

## Cài đặt

```bash
npm install
```

## Chạy ứng dụng

```bash
# Chạy trên Android
npm run android

# Chạy trên iOS (cần macOS)
npm run ios

# Chạy trên web
npm run web

# Chạy Expo dev server
npm start
```

## Công nghệ sử dụng

- **React Native** - Framework phát triển mobile
- **Expo** - Công cụ phát triển và build
- **TypeScript** - Hỗ trợ type-safe
- **NativeWind** - Tailwind CSS cho React Native
- **Tailwind CSS** - Framework CSS utility-first

## Cấu trúc dự án

```
.
├── App.tsx             # Component chính (TypeScript)
├── assets/             # Hình ảnh và tài nguyên
├── babel.config.js     # Cấu hình Babel
├── tailwind.config.js  # Cấu hình Tailwind CSS
├── tsconfig.json       # Cấu hình TypeScript
├── nativewind-env.d.ts # Type definitions cho NativeWind
└── package.json        # Dependencies
```

## Sử dụng NativeWind với TypeScript

NativeWind cho phép bạn sử dụng Tailwind CSS classes trong React Native:

```tsx
import React from 'react';
import { View, Text } from 'react-native';

export default function MyComponent(): React.JSX.Element {
    return (
        <View className="flex-1 bg-blue-500 items-center justify-center">
            <Text className="text-white text-2xl font-bold">Hello TalentLink!</Text>
        </View>
    );
}
```

## Tài liệu tham khảo

- [Expo Documentation](https://docs.expo.dev/)
- [React Native TypeScript](https://reactnative.dev/docs/typescript)
- [NativeWind Documentation](https://www.nativewind.dev/)
- [Tailwind CSS](https://tailwindcss.com/)

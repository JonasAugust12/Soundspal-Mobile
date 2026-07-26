import type { ComponentType } from 'react';
import type { DatePickerProps } from 'react-native-date-picker';

/**
 * Bọc `react-native-date-picker` (bánh xe kiểu iOS, native, mượt & đẹp) với require an toàn:
 * nếu native module chưa được build vào app → trả null để màn hình tự fallback sang ô nhập tay
 * thay vì crash. Nhớ BUILD LẠI dev client sau khi cài (đây là native module).
 */
let PrettyDatePicker: ComponentType<DatePickerProps> | null = null;

try {
    const mod = require('react-native-date-picker');
    const picker = mod?.default ?? mod;
    if (picker) {
        PrettyDatePicker = picker as ComponentType<DatePickerProps>;
    }
} catch {
    PrettyDatePicker = null;
}

export function isPrettyDatePickerSupported(): boolean {
    return PrettyDatePicker != null;
}

export { PrettyDatePicker };
export type { DatePickerProps };

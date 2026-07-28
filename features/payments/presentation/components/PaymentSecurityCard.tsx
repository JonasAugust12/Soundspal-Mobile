import React from 'react';
import { Text, View } from 'react-native';
import { ShieldCheck } from 'lucide-react-native';
import { premiumStyles } from './premiumStyles';

export function PaymentSecurityCard() {
    return (
        <View
            className="mx-5 mt-5 mb-10 bg-white rounded-2xl p-5"
            style={premiumStyles.sectionCard}
        >
            <View className="flex-row items-center gap-3">
                <View className="w-10 h-10 rounded-xl bg-emerald-50 items-center justify-center">
                    <ShieldCheck size={20} color="#059669" />
                </View>
                <View className="flex-1">
                    <Text className="text-base font-black text-gray-900">Bảo mật thanh toán</Text>
                    <Text className="text-sm text-gray-600 mt-1 leading-5">
                        Ứng dụng chỉ tạo phiên thanh toán. Việc nhập thông tin và xác nhận giao dịch
                        được thực hiện trên PayOS.
                    </Text>
                </View>
            </View>
        </View>
    );
}

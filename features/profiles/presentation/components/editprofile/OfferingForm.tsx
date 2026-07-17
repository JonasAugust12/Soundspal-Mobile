import React, { useEffect, useState } from 'react';
import { View, Text, Switch, TouchableOpacity, ActivityIndicator } from 'react-native';
import Toast from 'react-native-toast-message';
import { CalendarCheck, Sparkles, Wallet } from 'lucide-react-native';

import {
    useGetCurrentUser,
    useUpdateMyProfile,
} from '@/features/profiles/presentation/hooks/useUserApi';
import { GradientPill } from '@/shared/presentation/ui';
import { SERVICE_TYPES, FEE_TIERS } from '@/features/profiles/domain/constants/profileConstants';

interface OfferingFormProps {
    onSaveSuccess?: () => void;
}

export function OfferingForm({ onSaveSuccess }: OfferingFormProps) {
    const { data: user } = useGetCurrentUser();
    const updateMyProfile = useUpdateMyProfile();

    const [isAvailable, setIsAvailable] = useState(false);
    const [serviceTypes, setServiceTypes] = useState<string[]>([]);
    const [feeMin, setFeeMin] = useState<number | null>(null);
    const [feeMax, setFeeMax] = useState<number | null>(null);
    const [savingAvailability, setSavingAvailability] = useState(false);

    useEffect(() => {
        if (user) {
            setIsAvailable(!!user.is_available);
            setServiceTypes(user.service_types || []);
            setFeeMin(user.fee_min ?? null);
            setFeeMax(user.fee_max ?? null);
        }
    }, [user]);

    const toggleAvailability = async (val: boolean) => {
        setIsAvailable(val);
        setSavingAvailability(true);
        try {
            await updateMyProfile.mutateAsync({ is_available: val });
            Toast.show({
                type: 'success',
                text1: val ? 'Đang nhận show' : 'Tạm ngưng nhận show',
            });
        } catch (e) {
            console.error('Update availability failed:', e);
            setIsAvailable(!val); // rollback
            Toast.show({ type: 'error', text1: 'Không thể cập nhật trạng thái' });
        } finally {
            setSavingAvailability(false);
        }
    };

    const toggleServiceType = (value: string) => {
        setServiceTypes((prev) =>
            prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
        );
    };

    const handleSave = async () => {
        try {
            await updateMyProfile.mutateAsync({
                service_types: serviceTypes,
                fee_min: feeMin,
                fee_max: feeMax,
            });
            onSaveSuccess?.();
        } catch (e) {
            console.error('Update offering failed:', e);
            Toast.show({ type: 'error', text1: 'Không thể lưu' });
        }
    };

    return (
        <View className="gap-6">
            {/* Availability toggle */}
            <View className="flex-row items-center gap-3 p-4 rounded-2xl bg-secondary/40 dark:bg-gray-800/40 border border-border">
                <View className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 items-center justify-center">
                    <CalendarCheck size={20} color="#22C55E" />
                </View>
                <View className="flex-1">
                    <Text className="text-base font-bold text-foreground">
                        Trạng thái nhận show
                    </Text>
                    <Text className="text-xs text-muted-foreground">
                        {isAvailable ? 'Đang nhận show' : 'Tạm nghỉ'}
                    </Text>
                </View>
                {savingAvailability && (
                    <ActivityIndicator size="small" color="#7C3AED" style={{ marginRight: 4 }} />
                )}
                <Switch
                    value={isAvailable}
                    onValueChange={toggleAvailability}
                    disabled={savingAvailability}
                    trackColor={{ false: '#D1D5DB', true: '#A855F7' }}
                    thumbColor={isAvailable ? '#7C3BED' : '#F3F4F6'}
                />
            </View>

            {/* Service types */}
            <View className="gap-3">
                <View className="flex-row items-center gap-2">
                    <Sparkles size={18} color="#7C3AED" />
                    <Text className="text-base font-bold text-foreground">Loại hình nhận</Text>
                </View>
                <View className="flex-row flex-wrap gap-2">
                    {SERVICE_TYPES.map((st) => {
                        const selected = serviceTypes.includes(st.value);
                        return (
                            <GradientPill
                                key={st.value}
                                active={selected}
                                onPress={() => toggleServiceType(st.value)}
                                className="px-3.5 py-2 rounded-full"
                                inactiveClassName="border bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700"
                            >
                                <Text
                                    className={`text-xs font-semibold ${selected ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}
                                >
                                    {st.label}
                                </Text>
                            </GradientPill>
                        );
                    })}
                </View>
            </View>

            {/* Fee range */}
            <View className="gap-3">
                <View className="flex-row items-center gap-2">
                    <Wallet size={18} color="#7C3AED" />
                    <Text className="text-base font-bold text-foreground">Khoảng giá (cát-xê)</Text>
                </View>

                <Text className="text-xs font-semibold text-gray-500">Từ</Text>
                <View className="flex-row flex-wrap gap-2">
                    {FEE_TIERS.map((tier) => {
                        const selected = feeMin === tier.value;
                        return (
                            <GradientPill
                                key={`min-${tier.value}`}
                                active={selected}
                                onPress={() => setFeeMin(selected ? null : tier.value)}
                                className="px-3.5 py-2 rounded-full"
                                inactiveClassName="border bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700"
                            >
                                <Text
                                    className={`text-xs font-semibold ${selected ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}
                                >
                                    {tier.label}
                                </Text>
                            </GradientPill>
                        );
                    })}
                </View>

                <Text className="text-xs font-semibold text-gray-500 mt-1">Đến</Text>
                <View className="flex-row flex-wrap gap-2">
                    {FEE_TIERS.map((tier) => {
                        const selected = feeMax === tier.value;
                        return (
                            <GradientPill
                                key={`max-${tier.value}`}
                                active={selected}
                                onPress={() => setFeeMax(selected ? null : tier.value)}
                                className="px-3.5 py-2 rounded-full"
                                inactiveClassName="border bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700"
                            >
                                <Text
                                    className={`text-xs font-semibold ${selected ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}
                                >
                                    {tier.label}
                                </Text>
                            </GradientPill>
                        );
                    })}
                </View>
            </View>

            {/* Save button */}
            <TouchableOpacity
                onPress={handleSave}
                disabled={updateMyProfile.isPending}
                className={`py-4 rounded-xl bg-purple-600 items-center ${updateMyProfile.isPending ? 'opacity-50' : ''}`}
                activeOpacity={0.8}
            >
                <Text className="text-base font-bold text-white">
                    {updateMyProfile.isPending ? 'Đang lưu...' : 'Lưu loại hình & giá'}
                </Text>
            </TouchableOpacity>
        </View>
    );
}

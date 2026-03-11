import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Switch,
    Platform,
    StyleSheet,
} from 'react-native';
import { Plus, Trash2, Tag, DollarSign, Check, Sparkles } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useUpdateUserServices, useGetCurrentUser } from '@/hooks/useUserApi';
import { UserService } from '@/types/user.type';

const CURRENCIES = ['VND', 'USD', 'EUR', 'JPY'];

export function ServicesForm({ onSaveSuccess }: { onSaveSuccess?: () => void }) {
    const { data: userData } = useGetCurrentUser();
    const updateServices = useUpdateUserServices();

    const [services, setServices] = useState<UserService[]>(
        userData?.services?.length
            ? userData.services
            : [{ name: '', price: 0, currency: 'VND', is_negotiable: true }],
    );

    useEffect(() => {
        if (userData?.services?.length && services.length === 1 && services[0].name === '') {
            setServices(userData.services);
        }
    }, [userData?.services, services]);

    const handleAddService = () => {
        setServices([...services, { name: '', price: 0, currency: 'VND', is_negotiable: true }]);
    };

    const handleRemoveService = (index: number) => {
        const newServices = services.filter((_, i) => i !== index);
        setServices(
            newServices.length > 0
                ? newServices
                : [{ name: '', price: 0, currency: 'VND', is_negotiable: true }],
        );
    };

    const handleUpdateService = (
        index: number,
        field: keyof UserService,
        value: string | number | boolean,
    ) => {
        const newServices = [...services];
        newServices[index] = { ...newServices[index], [field]: value };
        setServices(newServices);
    };

    const handleSubmit = async () => {
        const validServices = services.filter((s) => s.name.trim() !== '');
        try {
            await updateServices.mutateAsync(validServices);
            onSaveSuccess?.();
        } catch (error) {
            console.error('Update services failed:', error);
        }
    };

    return (
        <View className="gap-5">
            {/* Header Info */}
            <LinearGradient
                colors={['#7C3AED', '#A855F7']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.headerGradient}
                className="p-4 rounded-2xl"
            >
                <View className="flex-row items-center gap-3">
                    <View className="w-10 h-10 rounded-xl bg-white/20 items-center justify-center">
                        <Sparkles size={20} color="#FFFFFF" />
                    </View>
                    <View className="flex-1">
                        <Text className="text-white font-bold text-sm">Dịch vụ của bạn</Text>
                        <Text className="text-white/70 text-xs mt-0.5">
                            Thêm dịch vụ để thu hút khách hàng
                        </Text>
                    </View>
                </View>
            </LinearGradient>

            {/* Services List */}
            {services.map((service, index) => (
                <View
                    key={index}
                    className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800"
                    style={styles.serviceCard}
                >
                    {/* Card Header */}
                    <View className="flex-row justify-between items-center px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-700">
                        <View className="flex-row items-center gap-2">
                            <View className="w-6 h-6 rounded-lg bg-purple-600 items-center justify-center">
                                <Text className="text-white text-xs font-bold">{index + 1}</Text>
                            </View>
                            <Text className="text-sm font-bold text-gray-700 dark:text-gray-300">
                                Dịch vụ
                            </Text>
                        </View>
                        {services.length > 1 && (
                            <TouchableOpacity
                                onPress={() => handleRemoveService(index)}
                                className="w-8 h-8 bg-red-50 dark:bg-red-900/20 rounded-lg items-center justify-center"
                            >
                                <Trash2 size={16} color="#EF4444" />
                            </TouchableOpacity>
                        )}
                    </View>

                    <View className="p-4 gap-4">
                        {/* Service Name */}
                        <View className="gap-1.5">
                            <Text className="text-xs font-semibold text-gray-500 dark:text-gray-400 ml-1">
                                Tên dịch vụ
                            </Text>
                            <View className="flex-row items-center bg-gray-50 dark:bg-gray-800 rounded-xl px-3 border border-gray-200 dark:border-gray-700">
                                <Tag size={16} color="#9CA3AF" />
                                <TextInput
                                    className="flex-1 py-3 px-2 text-sm text-gray-900 dark:text-white"
                                    placeholder="VD: MC sự kiện 3 tiếng"
                                    placeholderTextColor="#9CA3AF"
                                    value={service.name}
                                    onChangeText={(text) =>
                                        handleUpdateService(index, 'name', text)
                                    }
                                />
                            </View>
                        </View>

                        {/* Price & Currency */}
                        <View className="flex-row gap-3">
                            <View className="flex-1 gap-1.5">
                                <Text className="text-xs font-semibold text-gray-500 dark:text-gray-400 ml-1">
                                    Giá (để 0 nếu thỏa thuận)
                                </Text>
                                <View className="flex-row items-center bg-gray-50 dark:bg-gray-800 rounded-xl px-3 border border-gray-200 dark:border-gray-700">
                                    <DollarSign size={16} color="#9CA3AF" />
                                    <TextInput
                                        className="flex-1 py-3 px-2 text-sm font-semibold text-gray-900 dark:text-white"
                                        placeholder="0"
                                        placeholderTextColor="#9CA3AF"
                                        keyboardType="number-pad"
                                        value={service.price === 0 ? '' : service.price.toString()}
                                        onChangeText={(text) =>
                                            handleUpdateService(
                                                index,
                                                'price',
                                                parseInt(text.replace(/,/g, '')) || 0,
                                            )
                                        }
                                    />
                                </View>
                            </View>
                            <View className="w-24 gap-1.5">
                                <Text className="text-xs font-semibold text-gray-500 dark:text-gray-400 ml-1">
                                    Tiền tệ
                                </Text>
                                <TouchableOpacity
                                    className="bg-purple-600 rounded-xl py-3 items-center justify-center"
                                    activeOpacity={0.8}
                                >
                                    <Text className="text-white font-bold text-sm">
                                        {service.currency}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Currency Selector */}
                        <View className="flex-row gap-2">
                            {CURRENCIES.map((curr) => (
                                <TouchableOpacity
                                    key={curr}
                                    onPress={() => handleUpdateService(index, 'currency', curr)}
                                    className={`flex-1 py-2 rounded-lg items-center ${
                                        service.currency === curr
                                            ? 'bg-purple-100 dark:bg-purple-900/30 border border-purple-300 dark:border-purple-700'
                                            : 'bg-gray-100 dark:bg-gray-800 border border-transparent'
                                    }`}
                                    activeOpacity={0.7}
                                >
                                    <Text
                                        className={`text-xs font-bold ${
                                            service.currency === curr
                                                ? 'text-purple-600 dark:text-purple-400'
                                                : 'text-gray-500 dark:text-gray-400'
                                        }`}
                                    >
                                        {curr}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Negotiable Toggle */}
                        <TouchableOpacity
                            onPress={() =>
                                handleUpdateService(index, 'is_negotiable', !service.is_negotiable)
                            }
                            className={`flex-row items-center justify-between p-3 rounded-xl ${
                                service.is_negotiable
                                    ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                                    : 'bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
                            }`}
                            activeOpacity={0.7}
                        >
                            <View className="flex-row items-center gap-2">
                                <View
                                    className={`w-6 h-6 rounded-md items-center justify-center ${
                                        service.is_negotiable
                                            ? 'bg-green-500'
                                            : 'bg-gray-300 dark:bg-gray-600'
                                    }`}
                                >
                                    {service.is_negotiable && (
                                        <Check size={14} color="#FFFFFF" strokeWidth={3} />
                                    )}
                                </View>
                                <Text
                                    className={`text-sm font-semibold ${
                                        service.is_negotiable
                                            ? 'text-green-700 dark:text-green-400'
                                            : 'text-gray-600 dark:text-gray-400'
                                    }`}
                                >
                                    Có thể thương lượng
                                </Text>
                            </View>
                            <Switch
                                value={service.is_negotiable}
                                onValueChange={(val) =>
                                    handleUpdateService(index, 'is_negotiable', val)
                                }
                                trackColor={{ false: '#D1D5DB', true: '#22C55E' }}
                                thumbColor="#FFFFFF"
                            />
                        </TouchableOpacity>
                    </View>
                </View>
            ))}

            {/* Add Button */}
            <TouchableOpacity
                onPress={handleAddService}
                className="flex-row items-center justify-center gap-2 py-4 border-2 border-dashed border-purple-300 dark:border-purple-700 bg-purple-50 dark:bg-purple-900/20 rounded-xl"
                activeOpacity={0.7}
            >
                <Plus size={20} color="#7C3AED" />
                <Text className="text-purple-600 font-semibold">Thêm dịch vụ</Text>
            </TouchableOpacity>

            {/* Save Button */}
            <TouchableOpacity
                onPress={handleSubmit}
                disabled={updateServices.isPending}
                className={`py-4 rounded-xl bg-purple-600 items-center ${updateServices.isPending ? 'opacity-50' : ''}`}
                activeOpacity={0.8}
            >
                <Text className="text-white font-bold text-base">
                    {updateServices.isPending ? 'Đang lưu...' : 'Lưu dịch vụ'}
                </Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    headerGradient: {
        ...Platform.select({
            ios: {
                shadowColor: '#7C3AED',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
            },
            android: {
                elevation: 6,
            },
        }),
    },
    serviceCard: {
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.06,
                shadowRadius: 8,
            },
            android: {
                elevation: 2,
            },
        }),
    },
});

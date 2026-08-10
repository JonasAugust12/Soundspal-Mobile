import React from 'react';
import {
    View,
    Text,
    Modal,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    Platform,
    Switch,
    ActivityIndicator,
} from 'react-native';
import {
    X,
    MapPin,
    Music,
    Building2,
    Check,
    RotateCcw,
    SlidersHorizontal,
    Briefcase,
    Wallet,
    Store,
    CircleCheck,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
    useSearchStore,
    countActiveFilters,
    isArtistRole,
    UserRole,
} from '@/features/explore/presentation/store/searchStore';
import { useGetGenres } from '@/features/explore/presentation/hooks/useSearchApi';
import { businessTypes } from '@/shared/domain/constants/businessTypes';
import { serviceTypes } from '@/shared/domain/constants/serviceTypes';
import { venueTypes } from '@/shared/domain/constants/venueTypes';
import { provinces } from '@/shared/domain/constants/provinces';
import { FEE_MIN_OPTIONS, FEE_MAX_OPTIONS } from '@/shared/domain/constants/feeTiers';

export interface FilterSheetProps {
    visible: boolean;
    onClose: () => void;
    currentRole?: UserRole;
}

type PillTone = 'purple' | 'pink' | 'amber' | 'blue';

const TONE_ACTIVE: Record<PillTone, { bg: string; border: string }> = {
    purple: { bg: 'bg-purple-600', border: 'border-purple-600' },
    pink: { bg: 'bg-pink-600', border: 'border-pink-600' },
    amber: { bg: 'bg-amber-500', border: 'border-amber-500' },
    blue: { bg: 'bg-blue-600', border: 'border-blue-600' },
};

/** Pill chọn/bỏ chọn dùng chung cho mọi nhóm bộ lọc. */
function FilterPill({
    label,
    selected,
    onPress,
    tone = 'purple',
}: {
    label: string;
    selected: boolean;
    onPress: () => void;
    tone?: PillTone;
}) {
    const active = TONE_ACTIVE[tone];
    return (
        <TouchableOpacity
            onPress={onPress}
            className={`flex-row items-center px-4 py-2.5 rounded-full border ${
                selected
                    ? `${active.bg} ${active.border}`
                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
            }`}
        >
            {selected && <Check size={14} color="#FFFFFF" style={{ marginRight: 6 }} />}
            <Text
                className={`text-sm font-semibold ${
                    selected ? 'text-white' : 'text-gray-700 dark:text-gray-300'
                }`}
            >
                {label}
            </Text>
        </TouchableOpacity>
    );
}

function SectionHeader({
    icon,
    title,
    count,
    countTone = 'purple',
}: {
    icon: React.ReactNode;
    title: string;
    count?: number;
    countTone?: PillTone;
}) {
    const badgeBg: Record<PillTone, string> = {
        purple: 'bg-purple-100 dark:bg-purple-900/30',
        pink: 'bg-pink-100 dark:bg-pink-900/30',
        amber: 'bg-amber-100 dark:bg-amber-900/30',
        blue: 'bg-blue-100 dark:bg-blue-900/30',
    };
    const badgeText: Record<PillTone, string> = {
        purple: 'text-purple-600 dark:text-purple-400',
        pink: 'text-pink-600 dark:text-pink-400',
        amber: 'text-amber-600 dark:text-amber-400',
        blue: 'text-blue-600 dark:text-blue-400',
    };
    return (
        <View className="flex-row items-center gap-2 mb-3">
            {icon}
            <Text className="text-base font-bold text-gray-900 dark:text-white">{title}</Text>
            {count ? (
                <View className={`${badgeBg[countTone]} px-2 py-0.5 rounded-full`}>
                    <Text className={`text-xs font-semibold ${badgeText[countTone]}`}>{count}</Text>
                </View>
            ) : null}
        </View>
    );
}

export function FilterSheet({ visible, onClose, currentRole }: FilterSheetProps) {
    const insets = useSafeAreaInsets();
    const {
        filters,
        toggleGenre,
        toggleBusinessType,
        toggleServiceType,
        setFeeMin,
        setFeeMax,
        setIsAvailable,
        setStateProvince,
        setVenueType,
        resetFilters,
    } = useSearchStore();

    const { data: genresData, isLoading: isLoadingGenres } = useGetGenres();
    const genres = genresData?.data?.genres || [];

    const isArtist = isArtistRole(currentRole);
    const isVenue = currentRole === 'venue';
    // Thể loại chỉ áp dụng cho nghệ sĩ — backend bỏ qua khi tìm địa điểm
    // (xem `discovery-search-fixes-mobile-api.md`, mục 3).
    const showGenres = isArtist || !currentRole;

    const selectedGenresCount = filters.genres.length;
    const selectedBusinessTypesCount = filters.businessTypes.length;
    const selectedServiceTypesCount = filters.serviceTypes.length;

    const activeCount = countActiveFilters(filters);

    return (
        <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
            <View className="flex-1 bg-black/50 justify-end">
                <View
                    className="bg-white dark:bg-gray-900 rounded-t-3xl h-[90%]"
                    style={styles.sheet}
                >
                    {/* Handle */}
                    <View className="items-center pt-3 pb-2">
                        <View className="w-10 h-1 rounded-full bg-gray-300 dark:bg-gray-700" />
                    </View>

                    {/* Header */}
                    <View className="flex-row items-center justify-between px-5 pb-4 border-b border-gray-100 dark:border-gray-800">
                        <View className="flex-row items-center gap-2">
                            <View className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 items-center justify-center">
                                <SlidersHorizontal size={20} color="#7C3AED" />
                            </View>
                            <View>
                                <Text className="text-lg font-bold text-gray-900 dark:text-white">
                                    Bộ lọc
                                </Text>
                                {activeCount > 0 && (
                                    <Text className="text-xs text-purple-600 dark:text-purple-400">
                                        {activeCount} đã chọn
                                    </Text>
                                )}
                            </View>
                        </View>
                        <TouchableOpacity
                            onPress={onClose}
                            className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 items-center justify-center"
                        >
                            <X size={20} color="#6B7280" />
                        </TouchableOpacity>
                    </View>

                    {/* Content */}
                    <ScrollView
                        className="flex-1 px-5"
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingVertical: 24 }}
                    >
                        <View className="gap-6">
                            {/* Location — Tỉnh/Thành */}
                            <View>
                                <SectionHeader
                                    icon={<MapPin size={18} color="#7C3AED" />}
                                    title="Tỉnh / Thành"
                                    count={filters.stateProvince ? 1 : 0}
                                />
                                <View className="flex-row flex-wrap gap-2">
                                    {provinces.map((p) => (
                                        <FilterPill
                                            key={p.iso}
                                            label={p.name}
                                            selected={filters.stateProvince === p.iso}
                                            onPress={() =>
                                                setStateProvince(
                                                    filters.stateProvince === p.iso
                                                        ? undefined
                                                        : p.iso,
                                                )
                                            }
                                        />
                                    ))}
                                </View>
                            </View>

                            {/* Genres - singer/producer/all */}
                            {showGenres && (
                                <View>
                                    <SectionHeader
                                        icon={<Music size={18} color="#EC4899" />}
                                        title="Thể loại"
                                        count={selectedGenresCount}
                                        countTone="pink"
                                    />
                                    {isLoadingGenres ? (
                                        <View className="py-8 items-center">
                                            <ActivityIndicator color="#7C3AED" />
                                        </View>
                                    ) : (
                                        <View className="flex-row flex-wrap gap-2">
                                            {genres.map((genre) => (
                                                <FilterPill
                                                    key={genre.id}
                                                    label={genre.name}
                                                    tone="pink"
                                                    selected={filters.genres.includes(genre.name)}
                                                    onPress={() => toggleGenre(genre.name)}
                                                />
                                            ))}
                                        </View>
                                    )}
                                </View>
                            )}

                            {/* Artist-only: Service types */}
                            {isArtist && (
                                <View>
                                    <SectionHeader
                                        icon={<Briefcase size={18} color="#7C3AED" />}
                                        title="Loại dịch vụ"
                                        count={selectedServiceTypesCount}
                                    />
                                    <View className="flex-row flex-wrap gap-2">
                                        {serviceTypes.map((s) => (
                                            <FilterPill
                                                key={s.value}
                                                label={s.label}
                                                selected={filters.serviceTypes.includes(s.value)}
                                                onPress={() => toggleServiceType(s.value)}
                                            />
                                        ))}
                                    </View>
                                </View>
                            )}

                            {/* Artist-only: Fee range */}
                            {isArtist && (
                                <View>
                                    <SectionHeader
                                        icon={<Wallet size={18} color="#7C3AED" />}
                                        title="Khoảng thù lao"
                                        count={
                                            (filters.feeMin != null ? 1 : 0) +
                                            (filters.feeMax != null ? 1 : 0)
                                        }
                                    />
                                    <Text className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                                        Từ
                                    </Text>
                                    <View className="flex-row flex-wrap gap-2 mb-3">
                                        {FEE_MIN_OPTIONS.map((opt) => (
                                            <FilterPill
                                                key={`min-${opt.value}`}
                                                label={opt.label}
                                                selected={filters.feeMin === opt.value}
                                                onPress={() =>
                                                    setFeeMin(
                                                        filters.feeMin === opt.value
                                                            ? undefined
                                                            : opt.value,
                                                    )
                                                }
                                            />
                                        ))}
                                    </View>
                                    <Text className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                                        Đến
                                    </Text>
                                    <View className="flex-row flex-wrap gap-2">
                                        {FEE_MAX_OPTIONS.map((opt) => (
                                            <FilterPill
                                                key={`max-${opt.value}`}
                                                label={opt.label}
                                                selected={filters.feeMax === opt.value}
                                                onPress={() =>
                                                    setFeeMax(
                                                        filters.feeMax === opt.value
                                                            ? undefined
                                                            : opt.value,
                                                    )
                                                }
                                            />
                                        ))}
                                    </View>
                                </View>
                            )}

                            {/* Venue-only: Venue type */}
                            {isVenue && (
                                <View>
                                    <SectionHeader
                                        icon={<Store size={18} color="#F59E0B" />}
                                        title="Loại địa điểm"
                                        count={filters.venueType ? 1 : 0}
                                        countTone="amber"
                                    />
                                    <View className="flex-row flex-wrap gap-2">
                                        {venueTypes.map((v) => (
                                            <FilterPill
                                                key={v.value}
                                                label={v.label}
                                                tone="amber"
                                                selected={filters.venueType === v.value}
                                                onPress={() =>
                                                    setVenueType(
                                                        filters.venueType === v.value
                                                            ? undefined
                                                            : v.value,
                                                    )
                                                }
                                            />
                                        ))}
                                    </View>
                                </View>
                            )}

                            {/* Venue-only: Business types (giữ lại filter sẵn có của mobile) */}
                            {isVenue && (
                                <View>
                                    <SectionHeader
                                        icon={<Building2 size={18} color="#F59E0B" />}
                                        title="Loại hình kinh doanh"
                                        count={selectedBusinessTypesCount}
                                        countTone="amber"
                                    />
                                    <View className="flex-row flex-wrap gap-2">
                                        {businessTypes.map((type) => (
                                            <FilterPill
                                                key={type.value}
                                                label={type.label}
                                                tone="amber"
                                                selected={filters.businessTypes.includes(
                                                    type.value,
                                                )}
                                                onPress={() => toggleBusinessType(type.value)}
                                            />
                                        ))}
                                    </View>
                                </View>
                            )}

                            {/* Availability / Hiring toggle */}
                            {(isArtist || isVenue) && (
                                <View className="flex-row items-center justify-between py-1">
                                    <View className="flex-row items-center gap-2 flex-1 pr-3">
                                        <CircleCheck size={18} color="#10B981" />
                                        <Text className="text-base font-semibold text-gray-900 dark:text-white">
                                            {isVenue
                                                ? 'Chỉ nơi đang tuyển'
                                                : 'Chỉ nghệ sĩ đang nhận show'}
                                        </Text>
                                    </View>
                                    <Switch
                                        value={!!filters.isAvailable}
                                        onValueChange={(v) => setIsAvailable(v || undefined)}
                                        trackColor={{ false: '#D1D5DB', true: '#A855F7' }}
                                        thumbColor="#FFFFFF"
                                    />
                                </View>
                            )}
                        </View>
                    </ScrollView>

                    {/* Actions */}
                    <View
                        style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 20) }]}
                        className="flex-row gap-3 px-5 pt-5 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800"
                    >
                        <TouchableOpacity
                            onPress={resetFilters}
                            className="flex-1 flex-row items-center justify-center gap-2 py-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                        >
                            <RotateCcw size={18} color="#6B7280" />
                            <Text className="text-base font-bold text-gray-700 dark:text-gray-300">
                                Đặt lại
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={onClose}
                            className="flex-1 rounded-xl overflow-hidden"
                            activeOpacity={0.8}
                        >
                            <LinearGradient
                                colors={['#7C3AED', '#9333EA']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                className="flex-row items-center justify-center gap-2 py-4"
                            >
                                <Check size={18} color="#FFFFFF" strokeWidth={3} />
                                <Text className="text-base font-bold text-white">Áp dụng</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    sheet: {
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: -4 },
                shadowOpacity: 0.1,
                shadowRadius: 12,
            },
            android: {
                elevation: 16,
            },
        }),
    },
    footer: {
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: -2 },
                shadowOpacity: 0.05,
                shadowRadius: 8,
            },
            android: {
                elevation: 4,
            },
        }),
    },
});

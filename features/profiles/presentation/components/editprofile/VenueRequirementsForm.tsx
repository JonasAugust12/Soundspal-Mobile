import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Check, Music, FileText } from 'lucide-react-native';

import {
    useGetCurrentUser,
    useGetAllGenres,
    useUpdateVenueRequirements,
} from '@/features/profiles/presentation/hooks/useUserApi';
import type { Genre } from '@/features/profiles/domain/entities/user.type';

interface VenueRequirementsFormProps {
    onSaveSuccess?: () => void;
}

export function VenueRequirementsForm({ onSaveSuccess }: VenueRequirementsFormProps) {
    const { data: user } = useGetCurrentUser();
    const { data: allGenresData, isLoading: isLoadingGenres } = useGetAllGenres();
    const allGenres = allGenresData?.genres || [];
    const updateRequirements = useUpdateVenueRequirements();

    const [genreIds, setGenreIds] = useState<string[]>([]);
    const [note, setNote] = useState('');

    useEffect(() => {
        if (user) {
            setGenreIds(user.preferred_genre_ids || []);
            setNote(user.artist_requirements_note || '');
        }
    }, [user]);

    const toggleGenre = (id: string) => {
        setGenreIds((prev) => (prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]));
    };

    const handleSave = async () => {
        try {
            await updateRequirements.mutateAsync({
                preferred_genre_ids: genreIds,
                artist_requirements_note: note.trim(),
            });
            onSaveSuccess?.();
        } catch (e) {
            console.error('Update venue requirements failed:', e);
        }
    };

    return (
        <View className="gap-6">
            {/* Preferred genres */}
            <View className="gap-3">
                <View className="flex-row items-center gap-2">
                    <View className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 items-center justify-center">
                        <Music size={20} color="#3B82F6" />
                    </View>
                    <View className="flex-1">
                        <Text className="text-base font-bold text-foreground">
                            Thể loại nghệ sĩ ưu tiên
                        </Text>
                        <Text className="text-xs text-muted-foreground">
                            Chọn thể loại phù hợp với địa điểm
                        </Text>
                    </View>
                </View>

                {isLoadingGenres ? (
                    <View className="py-6 items-center">
                        <ActivityIndicator size="small" color="#3B82F6" />
                    </View>
                ) : (
                    <View className="flex-row flex-wrap gap-2">
                        {allGenres.map((genre: Genre) => {
                            const selected = genreIds.includes(genre.id);
                            return (
                                <TouchableOpacity
                                    key={genre.id}
                                    onPress={() => toggleGenre(genre.id)}
                                    activeOpacity={0.7}
                                    className={`flex-row items-center px-3.5 py-2 rounded-full border ${
                                        selected
                                            ? 'bg-blue-600 border-blue-600'
                                            : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700'
                                    }`}
                                >
                                    {selected && (
                                        <Check
                                            size={12}
                                            color="#FFFFFF"
                                            style={{ marginRight: 4 }}
                                        />
                                    )}
                                    <Text
                                        className={`text-xs font-semibold ${selected ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}
                                    >
                                        {genre.name}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                )}
            </View>

            {/* Note */}
            <View className="gap-2">
                <View className="flex-row items-center gap-2">
                    <FileText size={18} color="#3B82F6" />
                    <Text className="text-base font-bold text-foreground">Ghi chú yêu cầu</Text>
                </View>
                <TextInput
                    value={note}
                    onChangeText={setNote}
                    placeholder="VD: Ưu tiên nghệ sĩ có kinh nghiệm biểu diễn acoustic, set 60 phút..."
                    placeholderTextColor="#9CA3AF"
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                    className="px-4 py-4 bg-gray-50 dark:bg-gray-800 rounded-xl text-foreground text-base min-h-[110px] border border-gray-200 dark:border-gray-700"
                />
            </View>

            {/* Save */}
            <TouchableOpacity
                onPress={handleSave}
                disabled={updateRequirements.isPending}
                className={`py-4 rounded-xl bg-blue-600 items-center ${updateRequirements.isPending ? 'opacity-50' : ''}`}
                activeOpacity={0.8}
            >
                <Text className="text-base font-bold text-white">
                    {updateRequirements.isPending ? 'Đang lưu...' : 'Lưu yêu cầu'}
                </Text>
            </TouchableOpacity>
        </View>
    );
}

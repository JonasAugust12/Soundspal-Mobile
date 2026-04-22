import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useColorScheme } from 'nativewind';
import { Bookmark, FileEdit } from 'lucide-react-native';

const MY_POSTS = 'my-posts';
const BOOKMARKS = 'bookmarks';

interface BlogLibraryRowProps {
    activeTab: string;
    onTabChange: (value: string) => void;
}

/**
 * “My posts” and “Bookmarks” — separate from the feed/topic chip row
 * so they read as your library, not as another topic tag.
 */
export function BlogLibraryRow({ activeTab, onTabChange }: BlogLibraryRowProps) {
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === 'dark';

    const isMy = activeTab === MY_POSTS;
    const isBm = activeTab === BOOKMARKS;
    const baseBorder = isDark ? 'border-slate-600' : 'border-slate-200';
    const baseBg = isDark ? 'bg-slate-800/80' : 'bg-slate-50';
    const activeBorder = 'border-violet-500';
    const activeBg = isDark ? 'bg-violet-950/50' : 'bg-violet-50';

    return (
        <View
            className={`px-4 pt-3 pb-3 border-b ${isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-100 bg-white'}`}
        >
            <Text
                className={`text-[11px] font-bold uppercase tracking-widest mb-2 ${
                    isDark ? 'text-slate-500' : 'text-slate-400'
                }`}
            >
                Your library
            </Text>
            <View className="flex-row gap-3">
                <TouchableOpacity
                    onPress={() => onTabChange(MY_POSTS)}
                    activeOpacity={0.8}
                    className={`flex-1 flex-row items-center justify-center gap-2 py-3.5 rounded-2xl border-2 ${
                        isMy ? `${activeBorder} ${activeBg}` : `${baseBorder} ${baseBg}`
                    }`}
                >
                    <FileEdit
                        size={20}
                        color={
                            isMy ? (isDark ? '#C4B5FD' : '#5B21B6') : isDark ? '#94A3B8' : '#64748B'
                        }
                        strokeWidth={2}
                    />
                    <Text
                        className={`font-semibold text-sm ${
                            isMy
                                ? isDark
                                    ? 'text-violet-200'
                                    : 'text-violet-900'
                                : isDark
                                  ? 'text-slate-300'
                                  : 'text-slate-700'
                        }`}
                    >
                        My posts
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => onTabChange(BOOKMARKS)}
                    activeOpacity={0.8}
                    className={`flex-1 flex-row items-center justify-center gap-2 py-3.5 rounded-2xl border-2 ${
                        isBm ? `${activeBorder} ${activeBg}` : `${baseBorder} ${baseBg}`
                    }`}
                >
                    <Bookmark
                        size={20}
                        color={
                            isBm ? (isDark ? '#C4B5FD' : '#5B21B6') : isDark ? '#94A3B8' : '#64748B'
                        }
                        fill={isBm ? (isDark ? '#6D28D9' : '#7C3AED') : 'none'}
                        strokeWidth={2}
                    />
                    <Text
                        className={`font-semibold text-sm ${
                            isBm
                                ? isDark
                                    ? 'text-violet-200'
                                    : 'text-violet-900'
                                : isDark
                                  ? 'text-slate-300'
                                  : 'text-slate-700'
                        }`}
                    >
                        Bookmarks
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    Modal,
    Platform,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
} from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { X, Sparkles, TrendingUp, Bot, ThumbsUp, Gauge, CalendarClock } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import { useAuthStore } from '@/features/auth/presentation/store/authStore';
import { challengeApi } from '@/features/challenge/presentation/hooks/useChallengeApi';
import { applyEntryLikeToggle, isEntryLiked } from '@/features/challenge/domain/utils/challenge';
import type {
    BeatEntry,
    GetLeaderboardResponse,
} from '@/features/challenge/domain/entities/challenge.type';

interface ScoreDetailModalProps {
    visible: boolean;
    entry: BeatEntry | null;
    onClose: () => void;
}

const RING_SIZE = 280;
const RADIUS = 54; // trong hệ toạ độ viewBox 128
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/** Hiển thị % gọn: tối đa 2 chữ số thập phân, bỏ số 0 thừa (23.90 → 23.9). */
function formatPercent(value?: number): string {
    const n = Number(value) || 0;
    return `${Math.round(n * 100) / 100}%`;
}

function formatScoredAt(value?: string): string | null {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    return date.toLocaleDateString('vi-VN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function ScoreDetailModal({ visible, entry, onClose }: ScoreDetailModalProps) {
    const router = useRouter();
    const queryClient = useQueryClient();
    const { user } = useAuthStore();

    // Trạng thái vote hiển thị trong modal (đồng bộ cache bảng xếp hạng khi bấm).
    const [liked, setLiked] = useState(false);
    const [voteCount, setVoteCount] = useState(0);
    const [voting, setVoting] = useState(false);

    useEffect(() => {
        if (entry) {
            setLiked(isEntryLiked(entry));
            setVoteCount(entry.vote_count);
        }
    }, [entry]);

    if (!entry) return null;

    const totalScore = Number(entry.normalized_score || entry.total_score || 0);
    const rawScore = Number(entry.total_score || 0);
    const clamped = Math.min(Math.max(totalScore, 0), 100);
    const dashOffset = CIRCUMFERENCE - (clamped / 100) * CIRCUMFERENCE;
    const statusLabel = (entry.scoring_status || '').replace(/_/g, ' ');
    const scoredAtLabel = formatScoredAt(entry.scored_at);

    // Vị trí 5 bong bóng quanh vòng tròn — bám theo bố cục bên web.
    const metrics: {
        label: string;
        value?: number;
        pos: { top?: number; bottom?: number; left?: number; right?: number };
    }[] = [
        { label: 'Cao độ', value: entry.pitch_score, pos: { top: 10, left: 4 } },
        { label: 'Nhịp', value: entry.rhythm_score, pos: { top: 34, right: 4 } },
        { label: 'Chất giọng', value: entry.tone_score, pos: { bottom: 34, right: 4 } },
        { label: 'Độ ổn định', value: entry.stability_score, pos: { bottom: 10, left: 12 } },
        {
            label: 'Biểu cảm',
            value: entry.expression_score,
            pos: { top: RING_SIZE / 2 - 32, left: 0 },
        },
    ];

    const patchLeaderboardCache = (entryId: string, likedNow: boolean) => {
        queryClient.setQueriesData<GetLeaderboardResponse>(
            {
                predicate: (query) =>
                    Array.isArray(query.queryKey) && query.queryKey[0] === 'beat-leaderboard',
            },
            (old) => {
                if (!old || !Array.isArray(old.entries)) return old;
                return { ...old, entries: applyEntryLikeToggle(old.entries, entryId, likedNow) };
            },
        );
    };

    const handleVote = async () => {
        if (!user) {
            router.push('/(auth)/login');
            return;
        }
        if (voting) return;

        const next = !liked;
        setLiked(next);
        setVoteCount((c) => Math.max(0, c + (next ? 1 : -1)));
        patchLeaderboardCache(entry.id, next);
        setVoting(true);
        try {
            if (next) {
                await challengeApi.voteEntry(entry.id, 'up');
            } else {
                await challengeApi.removeVote(entry.id);
            }
        } catch {
            setLiked(!next);
            setVoteCount((c) => Math.max(0, c + (next ? -1 : 1)));
            patchLeaderboardCache(entry.id, !next);
            Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Không thể bình chọn.' });
        } finally {
            setVoting(false);
        }
    };

    return (
        <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
            <SafeAreaView className="flex-1 bg-white" edges={['top', 'bottom', 'left', 'right']}>
                {/* Header: badge + tiêu đề + tên • trạng thái */}
                <View className="px-6 pb-3 pt-2">
                    <View className="flex-row items-start justify-between">
                        <View className="flex-row items-center gap-1.5 self-start rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5">
                            <Sparkles size={14} color="#7d3bed" />
                            <Text className="text-xs font-bold text-primary">Phân tích điểm</Text>
                        </View>
                        <TouchableOpacity
                            onPress={onClose}
                            className="h-9 w-9 items-center justify-center rounded-full bg-gray-100"
                        >
                            <X size={18} color="#6b7280" />
                        </TouchableOpacity>
                    </View>
                    <Text className="mt-3 font-heading text-3xl font-black text-gray-900">
                        Báo cáo thể hiện
                    </Text>
                    <Text className="mt-1 text-sm text-gray-500" numberOfLines={1}>
                        <Text className="font-semibold text-primary">
                            {entry.display_name || entry.username}
                        </Text>
                        {statusLabel ? ` • ${statusLabel}` : ''}
                    </Text>
                </View>

                <ScrollView
                    className="flex-1"
                    contentContainerStyle={{ paddingBottom: 20 }}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Vòng tròn tổng điểm + bong bóng chỉ số */}
                    <View className="items-center py-2">
                        <View
                            style={{ width: RING_SIZE, height: RING_SIZE }}
                            className="items-center justify-center"
                        >
                            {/* Nền tròn trong */}
                            <View
                                style={styles.innerCircle}
                                className="border border-gray-100 bg-white"
                            />

                            {/* Vòng tiến trình */}
                            <Svg
                                width={RING_SIZE}
                                height={RING_SIZE}
                                viewBox="0 0 128 128"
                                style={StyleSheet.absoluteFill}
                            >
                                <Circle
                                    cx={64}
                                    cy={64}
                                    r={RADIUS}
                                    stroke="#EDE9FE"
                                    strokeWidth={8}
                                    fill="none"
                                />
                                <G rotation={-90} origin="64, 64">
                                    <Circle
                                        cx={64}
                                        cy={64}
                                        r={RADIUS}
                                        stroke="#7d3bed"
                                        strokeWidth={8}
                                        fill="none"
                                        strokeLinecap="round"
                                        strokeDasharray={CIRCUMFERENCE}
                                        strokeDashoffset={dashOffset}
                                    />
                                </G>
                            </Svg>

                            {/* Tâm: tổng điểm */}
                            <View className="items-center">
                                <Text className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                                    Tổng điểm
                                </Text>
                                <Text className="font-heading text-6xl font-black text-gray-900">
                                    {totalScore.toFixed(1)}
                                </Text>
                                <View className="mt-1 flex-row items-center gap-1">
                                    <TrendingUp size={14} color="#7d3bed" />
                                    <Text className="text-xs font-bold text-primary">
                                        {rawScore.toFixed(1)} điểm gốc
                                    </Text>
                                </View>
                            </View>

                            {/* Bong bóng chỉ số */}
                            {metrics.map((m) => (
                                <View
                                    key={m.label}
                                    style={[styles.bubble, m.pos]}
                                    className="items-center justify-center border border-gray-100 bg-white"
                                >
                                    <Text
                                        className="px-1 text-center text-[8px] font-bold uppercase leading-tight text-gray-400"
                                        numberOfLines={2}
                                    >
                                        {m.label}
                                    </Text>
                                    <Text className="text-sm font-black text-primary">
                                        {formatPercent(m.value)}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    </View>

                    {/* Nhận xét AI */}
                    {entry.explanation ? (
                        <View
                            style={styles.card}
                            className="mx-6 overflow-hidden rounded-3xl border border-gray-100 bg-white"
                        >
                            <LinearGradient
                                colors={['#7d3bed', '#f471b7', '#7d3bed']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.cardTopBar}
                            />
                            <View className="p-5">
                                <View className="mb-3 flex-row items-center gap-2">
                                    <View className="h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
                                        <Bot size={18} color="#7d3bed" />
                                    </View>
                                    <Text className="font-heading text-lg font-bold text-gray-900">
                                        Nhận xét AI
                                    </Text>
                                </View>
                                <Text className="font-body text-sm leading-6 text-gray-600">
                                    {entry.explanation}
                                </Text>
                            </View>
                        </View>
                    ) : null}

                    {/* Thẻ thống kê */}
                    <View className="mx-6 mt-4 flex-row gap-3">
                        <StatCard
                            icon={<ThumbsUp size={18} color="#7d3bed" />}
                            label="Lượt vote"
                            value={String(voteCount)}
                        />
                        <StatCard
                            icon={<Gauge size={18} color="#7d3bed" />}
                            label="Trạng thái"
                            value={statusLabel || '—'}
                        />
                        {scoredAtLabel ? (
                            <StatCard
                                icon={<CalendarClock size={18} color="#7d3bed" />}
                                label="Chấm lúc"
                                value={scoredAtLabel}
                            />
                        ) : null}
                    </View>
                </ScrollView>

                {/* Nút hành động — footer cố định, padding 2 bên, nằm trong safe area */}
                <View className="flex-row gap-3 border-t border-gray-100 px-5 pb-1 pt-3">
                    <TouchableOpacity
                        onPress={handleVote}
                        disabled={voting}
                        activeOpacity={0.85}
                        className={`flex-1 flex-row items-center justify-center gap-2 rounded-2xl py-4 ${
                            liked ? 'border border-pink-200 bg-pink-50' : 'bg-primary'
                        }`}
                    >
                        {voting ? (
                            <ActivityIndicator size="small" color={liked ? '#f471b7' : '#ffffff'} />
                        ) : (
                            <ThumbsUp
                                size={18}
                                color={liked ? '#f471b7' : '#ffffff'}
                                fill={liked ? '#f471b7' : 'transparent'}
                            />
                        )}
                        <Text className={`font-bold ${liked ? 'text-[#f471b7]' : 'text-white'}`}>
                            {liked ? 'Bỏ vote' : 'Vote bài dự thi'}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={onClose}
                        activeOpacity={0.85}
                        className="flex-1 flex-row items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white py-4"
                    >
                        <Gauge size={18} color="#374151" />
                        <Text className="font-bold text-gray-800">Quay lại</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </Modal>
    );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
    return (
        <View className="flex-1 rounded-2xl border border-gray-100 bg-gray-50 p-3">
            <View className="h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                {icon}
            </View>
            <Text className="mt-2 text-[10px] font-bold uppercase tracking-wide text-gray-400">
                {label}
            </Text>
            <Text className="mt-0.5 text-sm font-black text-gray-900" numberOfLines={1}>
                {value}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    innerCircle: {
        position: 'absolute',
        top: 24,
        left: 24,
        width: RING_SIZE - 48,
        height: RING_SIZE - 48,
        borderRadius: (RING_SIZE - 48) / 2,
        ...Platform.select({
            ios: {
                shadowColor: '#7d3bed',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.12,
                shadowRadius: 16,
            },
            android: { elevation: 6 },
        }),
    },
    bubble: {
        position: 'absolute',
        width: 64,
        height: 64,
        borderRadius: 32,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: 0.1,
                shadowRadius: 6,
            },
            android: { elevation: 4 },
        }),
    },
    card: {
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.06,
                shadowRadius: 12,
            },
            android: { elevation: 3 },
        }),
    },
    cardTopBar: {
        height: 4,
        width: '100%',
    },
});

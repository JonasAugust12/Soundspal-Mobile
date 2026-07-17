import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    StatusBar,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    RefreshControl,
    StyleSheet,
    Platform,
} from 'react-native';
import { showAppDialog } from '@/shared/presentation/ui';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
    ChevronLeft,
    Music2,
    Mic2,
    Trash2,
    Music4,
    MicVocal,
    Clock,
    Star,
    TrendingUp,
    Play,
    Pause,
} from 'lucide-react-native';
import { useAuthStore } from '@/features/auth/presentation/store/authStore';
import { useAudioStore } from '@/features/challenge/presentation/store/audioStore';
import {
    useGetMyBeats,
    useGetMyEntries,
    useDeleteBeat,
    useDeleteEntry,
} from '@/features/challenge/presentation/hooks/useChallengeApi';
import type { Beat, BeatEntry } from '@/features/challenge/domain/entities/challenge.type';
import { ScoreDetailModal } from '@/features/challenge/presentation/components/leaderboard';
import { MiniPlayer } from '@/features/explore/presentation/components';

type Tab = 'beats' | 'entries';

// ── Helpers ────────────────────────────────────────────────────────────────────

function formatDuration(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
}

function formatDate(dateStr: string): string {
    try {
        const d = new Date(dateStr);
        return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch {
        return dateStr;
    }
}

function scoringStatusLabel(status?: string): { label: string; color: string; bg: string } {
    switch (status) {
        case 'scored':
            return { label: 'Đã chấm', color: '#16A34A', bg: '#DCFCE7' };
        case 'pending':
            return { label: 'Đang chờ', color: '#D97706', bg: '#FEF3C7' };
        case 'failed':
            return { label: 'Thất bại', color: '#DC2626', bg: '#FEE2E2' };
        default:
            return { label: 'Đang xử lý', color: '#6B7280', bg: '#F3F4F6' };
    }
}

// ── Beat Card ──────────────────────────────────────────────────────────────────

interface BeatCardProps {
    beat: Beat;
    onDelete: (beat: Beat) => void;
    deleting: boolean;
}

function BeatCard({ beat, onDelete, deleting }: BeatCardProps) {
    const playBeat = useAudioStore((s) => s.playBeat);
    const togglePlay = useAudioStore((s) => s.togglePlay);
    const currentBeat = useAudioStore((s) => s.currentBeat);
    const isPlaying = useAudioStore((s) => s.isPlaying);
    const isLoading = useAudioStore((s) => s.isLoading);

    const isCurrent = currentBeat?.id === beat.id && !useAudioStore.getState().currentEntry;

    const handlePlay = () => {
        if (isCurrent) {
            togglePlay();
        } else {
            playBeat(beat);
        }
    };

    return (
        <TouchableOpacity style={styles.card} activeOpacity={0.8} onPress={handlePlay}>
            {/* Cover */}
            <View style={styles.cardCover}>
                {beat.cover_image_url ? (
                    <Image source={{ uri: beat.cover_image_url }} style={styles.coverImage} />
                ) : (
                    <View style={styles.coverFallback}>
                        <Music4 size={28} color="#7C3AED" />
                    </View>
                )}

                <View style={styles.playOverlay}>
                    {isCurrent && isLoading ? (
                        <ActivityIndicator size="small" color="#fff" />
                    ) : isCurrent && isPlaying ? (
                        <Pause size={18} color="#fff" fill="#fff" />
                    ) : (
                        <Play size={18} color="#fff" fill="#fff" style={{ marginLeft: 2 }} />
                    )}
                </View>

                {/* Genre badge */}
                {beat.genre ? (
                    <View style={styles.genreBadge}>
                        <Text style={styles.genreBadgeText}>{beat.genre}</Text>
                    </View>
                ) : null}
            </View>

            {/* Info */}
            <View style={styles.cardBody}>
                <Text style={styles.cardTitle} numberOfLines={1}>
                    {beat.title}
                </Text>
                <View style={styles.cardMeta}>
                    <View style={styles.metaChip}>
                        <TrendingUp size={12} color="#7C3AED" />
                        <Text style={styles.metaChipText}>{beat.bpm} BPM</Text>
                    </View>
                    <View style={styles.metaChip}>
                        <Clock size={12} color="#6B7280" />
                        <Text style={[styles.metaChipText, { color: '#6B7280' }]}>
                            {formatDuration(beat.duration_seconds)}
                        </Text>
                    </View>
                </View>
                <View style={styles.cardFooter}>
                    <View style={styles.entryCountBadge}>
                        <Mic2 size={11} color="#7C3AED" />
                        <Text style={styles.entryCountText}>{beat.entry_count} bản thu</Text>
                    </View>
                    <Text style={styles.dateText}>{formatDate(beat.created_at)}</Text>
                </View>
            </View>

            {/* Delete button */}
            <TouchableOpacity
                style={styles.deleteBtn}
                onPress={(e) => {
                    e.stopPropagation?.();
                    onDelete(beat);
                }}
                disabled={deleting}
                activeOpacity={0.7}
            >
                {deleting ? (
                    <ActivityIndicator size="small" color="#EF4444" />
                ) : (
                    <Trash2 size={18} color="#EF4444" />
                )}
            </TouchableOpacity>
        </TouchableOpacity>
    );
}

// ── Entry Card ─────────────────────────────────────────────────────────────────

interface EntryCardProps {
    entry: BeatEntry;
    onDelete: (entry: BeatEntry) => void;
    onPress: (entry: BeatEntry) => void;
    deleting: boolean;
}

function EntryCard({ entry, onDelete, onPress, deleting }: EntryCardProps) {
    const status = scoringStatusLabel(entry.scoring_status);
    const hasScore = entry.scoring_status === 'scored' && entry.total_score > 0;

    return (
        <TouchableOpacity style={styles.card} activeOpacity={0.8} onPress={() => onPress(entry)}>
            {/* Icon area */}
            <View style={[styles.cardCover, styles.entryIconBg]}>
                <MicVocal size={28} color="#7C3AED" />

                {/* Status badge */}
                <View style={[styles.genreBadge, { backgroundColor: status.bg }]}>
                    <Text style={[styles.genreBadgeText, { color: status.color }]}>
                        {status.label}
                    </Text>
                </View>
            </View>

            {/* Info */}
            <View style={styles.cardBody}>
                <Text style={styles.cardTitle} numberOfLines={1}>
                    {entry.display_name || entry.username}
                </Text>
                {hasScore ? (
                    <View style={styles.scoreRow}>
                        <Star size={13} color="#F59E0B" fill="#F59E0B" />
                        <Text style={styles.scoreText}>{entry.total_score.toFixed(1)} điểm</Text>
                    </View>
                ) : (
                    <Text style={styles.pendingText}>Chưa có điểm</Text>
                )}
                <View style={styles.cardFooter}>
                    <View style={styles.metaChip}>
                        <TrendingUp size={11} color="#7C3AED" />
                        <Text style={styles.metaChipText}>{entry.vote_count} bình chọn</Text>
                    </View>
                    <Text style={styles.dateText}>{formatDate(entry.created_at)}</Text>
                </View>
            </View>

            {/* Delete button */}
            <TouchableOpacity
                style={styles.deleteBtn}
                onPress={(e) => {
                    e.stopPropagation?.();
                    onDelete(entry);
                }}
                disabled={deleting}
                activeOpacity={0.7}
            >
                {deleting ? (
                    <ActivityIndicator size="small" color="#EF4444" />
                ) : (
                    <Trash2 size={18} color="#EF4444" />
                )}
            </TouchableOpacity>
        </TouchableOpacity>
    );
}

// ── Empty State ────────────────────────────────────────────────────────────────

function EmptyState({ tab }: { tab: Tab }) {
    return (
        <View style={styles.emptyContainer}>
            <View style={styles.emptyIconWrap}>
                {tab === 'beats' ? (
                    <Music4 size={36} color="#C4B5FD" />
                ) : (
                    <MicVocal size={36} color="#C4B5FD" />
                )}
            </View>
            <Text style={styles.emptyTitle}>
                {tab === 'beats' ? 'Chưa có beat nào' : 'Chưa có entry nào'}
            </Text>
            <Text style={styles.emptySubtitle}>
                {tab === 'beats'
                    ? 'Tạo beat đầu tiên của bạn để bắt đầu!'
                    : 'Tham gia thử thách để ghi lại entry đầu tiên!'}
            </Text>
        </View>
    );
}

// ── Skeleton ────────────────────────────────────────────────────────────────────

function SkeletonCard() {
    return (
        <View style={[styles.card, { opacity: 0.5 }]}>
            <View style={[styles.cardCover, { backgroundColor: '#E5E7EB' }]} />
            <View style={styles.cardBody}>
                <View
                    style={{
                        height: 14,
                        backgroundColor: '#E5E7EB',
                        borderRadius: 6,
                        marginBottom: 8,
                    }}
                />
                <View
                    style={{
                        height: 10,
                        backgroundColor: '#F3F4F6',
                        borderRadius: 6,
                        width: '60%',
                        marginBottom: 8,
                    }}
                />
                <View
                    style={{
                        height: 10,
                        backgroundColor: '#F3F4F6',
                        borderRadius: 6,
                        width: '40%',
                    }}
                />
            </View>
        </View>
    );
}

// ── Main Screen ────────────────────────────────────────────────────────────────

export default function MyContentScreen() {
    const router = useRouter();
    const { user } = useAuthStore();
    const [activeTab, setActiveTab] = useState<Tab>('beats');
    const [deletingBeatId, setDeletingBeatId] = useState<string | null>(null);
    const [deletingEntryId, setDeletingEntryId] = useState<string | null>(null);
    const [selectedEntry, setSelectedEntry] = useState<BeatEntry | null>(null);

    const {
        data: myBeatsData,
        isLoading: loadingBeats,
        refetch: refetchBeats,
        isRefetching: refetchingBeats,
    } = useGetMyBeats({ page_size: 50 });

    const {
        data: myEntriesData,
        isLoading: loadingEntries,
        refetch: refetchEntries,
        isRefetching: refetchingEntries,
    } = useGetMyEntries({ page_size: 50 });

    const deleteBeatMutation = useDeleteBeat();
    const deleteEntryMutation = useDeleteEntry();

    const beats = myBeatsData?.beats || [];
    const entries = myEntriesData?.entries || [];

    const avatarUrl = user?.avatar_url;
    const displayName = user?.display_name || user?.username || 'Người dùng';

    // ── Delete handlers ──────────────────────────────────────────────────────────

    const handleDeleteBeat = (beat: Beat) => {
        showAppDialog(
            'Xóa beat',
            `Bạn có chắc chắn muốn xóa beat "${beat.title}" không? Hành động này không thể hoàn tác.`,
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'Xóa',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            setDeletingBeatId(beat.id);
                            await deleteBeatMutation.mutateAsync(beat.id);
                        } catch {
                            showAppDialog('Lỗi', 'Không thể xóa beat. Vui lòng thử lại.');
                        } finally {
                            setDeletingBeatId(null);
                        }
                    },
                },
            ],
        );
    };

    const handleDeleteEntry = (entry: BeatEntry) => {
        showAppDialog(
            'Xóa entry',
            'Bạn có chắc chắn muốn xóa entry này không? Hành động này không thể hoàn tác.',
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'Xóa',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            setDeletingEntryId(entry.id);
                            await deleteEntryMutation.mutateAsync(entry.id);
                        } catch {
                            showAppDialog('Lỗi', 'Không thể xóa entry. Vui lòng thử lại.');
                        } finally {
                            setDeletingEntryId(null);
                        }
                    },
                },
            ],
        );
    };

    const isLoading = activeTab === 'beats' ? loadingBeats : loadingEntries;
    const isRefreshing = activeTab === 'beats' ? refetchingBeats : refetchingEntries;
    const onRefresh = activeTab === 'beats' ? refetchBeats : refetchEntries;

    return (
        <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
            <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

            {/* ── Header ────────────────────────────────────────────────────────── */}
            <SafeAreaView edges={['top']} style={styles.header}>
                <View style={styles.headerInner}>
                    <TouchableOpacity
                        onPress={() => router.back()}
                        style={styles.backBtn}
                        activeOpacity={0.7}
                    >
                        <ChevronLeft size={26} color="#111827" />
                    </TouchableOpacity>

                    {/* User info */}
                    <View style={styles.headerUser}>
                        {avatarUrl ? (
                            <Image source={{ uri: avatarUrl }} style={styles.headerAvatar} />
                        ) : (
                            <View style={styles.headerAvatarFallback}>
                                <Text style={styles.headerAvatarInitials}>
                                    {(displayName[0] || '?').toUpperCase()}
                                </Text>
                            </View>
                        )}
                        <View>
                            <Text style={styles.headerName} numberOfLines={1}>
                                {displayName}
                            </Text>
                            <Text style={styles.headerSub}>Nội dung của tôi</Text>
                        </View>
                    </View>
                </View>

                {/* ── Stats strip ───────────────────────────────────────────────── */}
                <View style={styles.statsStrip}>
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>{beats.length}</Text>
                        <Text style={styles.statLabel}>Beat</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>{entries.length}</Text>
                        <Text style={styles.statLabel}>Bản thu</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>
                            {
                                entries.filter(
                                    (e) => e.scoring_status === 'scored' && e.total_score > 0,
                                ).length
                            }
                        </Text>
                        <Text style={styles.statLabel}>Đã chấm</Text>
                    </View>
                </View>

                {/* ── Tabs ──────────────────────────────────────────────────────── */}
                <View style={styles.tabRow}>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'beats' && styles.tabActive]}
                        onPress={() => setActiveTab('beats')}
                        activeOpacity={0.8}
                    >
                        <Music2 size={16} color={activeTab === 'beats' ? '#7C3AED' : '#9CA3AF'} />
                        <Text
                            style={[styles.tabText, activeTab === 'beats' && styles.tabTextActive]}
                        >
                            Beat của tôi
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'entries' && styles.tabActive]}
                        onPress={() => setActiveTab('entries')}
                        activeOpacity={0.8}
                    >
                        <MicVocal
                            size={16}
                            color={activeTab === 'entries' ? '#7C3AED' : '#9CA3AF'}
                        />
                        <Text
                            style={[
                                styles.tabText,
                                activeTab === 'entries' && styles.tabTextActive,
                            ]}
                        >
                            Bản thu của tôi
                        </Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>

            {/* ── Content ───────────────────────────────────────────────────────── */}
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefreshing}
                        onRefresh={onRefresh}
                        colors={['#7C3AED']}
                        tintColor="#7C3AED"
                    />
                }
            >
                {isLoading ? (
                    <>
                        <SkeletonCard />
                        <SkeletonCard />
                        <SkeletonCard />
                    </>
                ) : activeTab === 'beats' ? (
                    beats.length === 0 ? (
                        <EmptyState tab="beats" />
                    ) : (
                        beats.map((beat) => (
                            <BeatCard
                                key={beat.id}
                                beat={beat}
                                onDelete={handleDeleteBeat}
                                deleting={deletingBeatId === beat.id}
                            />
                        ))
                    )
                ) : entries.length === 0 ? (
                    <EmptyState tab="entries" />
                ) : (
                    entries.map((entry) => (
                        <EntryCard
                            key={entry.id}
                            entry={entry}
                            onDelete={handleDeleteEntry}
                            onPress={setSelectedEntry}
                            deleting={deletingEntryId === entry.id}
                        />
                    ))
                )}
            </ScrollView>

            <ScoreDetailModal
                visible={!!selectedEntry}
                entry={selectedEntry}
                onClose={() => setSelectedEntry(null)}
            />

            <MiniPlayer />
        </View>
    );
}

// ── Styles ─────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    // Header
    header: {
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.06,
                shadowRadius: 8,
            },
            android: { elevation: 3 },
        }),
    },
    headerInner: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 12,
    },
    backBtn: {
        width: 38,
        height: 38,
        borderRadius: 19,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F9FAFB',
    },
    headerUser: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        flex: 1,
    },
    headerAvatar: {
        width: 42,
        height: 42,
        borderRadius: 21,
        borderWidth: 2,
        borderColor: '#EDE9FE',
    },
    headerAvatarFallback: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: '#EDE9FE',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#DDD6FE',
    },
    headerAvatarInitials: {
        fontSize: 16,
        fontWeight: '700',
        color: '#7C3AED',
    },
    headerName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111827',
        maxWidth: 200,
    },
    headerSub: {
        fontSize: 12,
        color: '#9CA3AF',
        marginTop: 1,
    },

    // Stats strip
    statsStrip: {
        flexDirection: 'row',
        paddingHorizontal: 24,
        paddingVertical: 12,
        backgroundColor: '#FAFAFA',
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statNumber: {
        fontSize: 20,
        fontWeight: '800',
        color: '#7C3AED',
        letterSpacing: -0.5,
    },
    statLabel: {
        fontSize: 11,
        color: '#9CA3AF',
        marginTop: 2,
        fontWeight: '500',
    },
    statDivider: {
        width: 1,
        backgroundColor: '#E5E7EB',
        marginVertical: 4,
    },

    // Tabs
    tabRow: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingTop: 4,
        paddingBottom: 0,
        gap: 4,
    },
    tab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: 10,
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    tabActive: {
        borderBottomColor: '#7C3AED',
    },
    tabText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#9CA3AF',
    },
    tabTextActive: {
        color: '#7C3AED',
    },

    // Scroll
    scrollContent: {
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 100,
        gap: 12,
    },

    // Card
    card: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#F3F4F6',
        overflow: 'hidden',
        alignItems: 'center',
        ...Platform.select({
            ios: {
                shadowColor: '#7C3AED',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.07,
                shadowRadius: 8,
            },
            android: { elevation: 2 },
        }),
    },
    cardCover: {
        width: 80,
        height: 80,
        backgroundColor: '#F3F4F6',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    coverImage: {
        width: '100%',
        height: '100%',
    },
    coverFallback: {
        width: '100%',
        height: '100%',
        backgroundColor: '#EDE9FE',
        alignItems: 'center',
        justifyContent: 'center',
    },
    playOverlay: {
        position: 'absolute',
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(0,0,0,0.4)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    entryIconBg: {
        backgroundColor: '#EDE9FE',
    },
    genreBadge: {
        position: 'absolute',
        bottom: 4,
        left: 4,
        backgroundColor: 'rgba(124, 58, 237, 0.85)',
        borderRadius: 6,
        paddingHorizontal: 5,
        paddingVertical: 2,
    },
    genreBadgeText: {
        fontSize: 9,
        fontWeight: '700',
        color: '#FFFFFF',
        textTransform: 'uppercase',
        letterSpacing: 0.4,
    },
    cardBody: {
        flex: 1,
        paddingHorizontal: 12,
        paddingVertical: 10,
        gap: 4,
    },
    cardTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#111827',
        letterSpacing: -0.2,
    },
    cardMeta: {
        flexDirection: 'row',
        gap: 8,
        alignItems: 'center',
    },
    metaChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
    },
    metaChipText: {
        fontSize: 11,
        color: '#7C3AED',
        fontWeight: '600',
    },
    cardFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 2,
    },
    entryCountBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
        backgroundColor: '#EDE9FE',
        borderRadius: 6,
        paddingHorizontal: 6,
        paddingVertical: 2,
    },
    entryCountText: {
        fontSize: 10,
        color: '#7C3AED',
        fontWeight: '600',
    },
    dateText: {
        fontSize: 10,
        color: '#9CA3AF',
    },
    scoreRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    scoreText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#D97706',
    },
    pendingText: {
        fontSize: 12,
        color: '#9CA3AF',
    },
    // Delete
    deleteBtn: {
        width: 44,
        height: 80,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFF5F5',
        borderLeftWidth: 1,
        borderLeftColor: '#FEE2E2',
    },

    // Empty
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
        gap: 12,
    },
    emptyIconWrap: {
        width: 80,
        height: 80,
        borderRadius: 24,
        backgroundColor: '#EDE9FE',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 4,
    },
    emptyTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: '#374151',
    },
    emptySubtitle: {
        fontSize: 13,
        color: '#9CA3AF',
        textAlign: 'center',
        paddingHorizontal: 32,
        lineHeight: 20,
    },
});

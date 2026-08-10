import { create } from 'zustand';

/**
 * `artist` là bí danh phía FE cho nhóm biểu diễn (singer + producer) — backend
 * `user_repository.applySearchFilters` map sang `role IN ('singer','producer')`.
 * Chọn `singer` / `producer` là lọc sâu hơn trong nhóm này (khớp sub-role bên web).
 */
export type UserRole = 'artist' | 'singer' | 'producer' | 'venue';

/** Nhóm nghệ sĩ — quyết định các mục lọc chỉ dành cho nghệ sĩ hiển thị hay không. */
export function isArtistRole(role?: UserRole): boolean {
    return role === 'artist' || role === 'singer' || role === 'producer';
}

export interface SearchFilters {
    query: string;
    role?: UserRole;
    location?: string;
    /** TÊN thể loại (không phải id) — backend so khớp `genres.name IN (?)`. */
    genres: string[];
    businessTypes: string[];
    capacity?: string;
    // Bộ lọc nâng cao — đồng bộ với web discovery
    serviceTypes: string[];
    feeMin?: number;
    feeMax?: number;
    isAvailable?: boolean;
    stateProvince?: string;
    venueType?: string;
    page: number;
    pageSize: number;
}

interface SearchState {
    filters: SearchFilters;
    setQuery: (query: string) => void;
    setRole: (role: UserRole | undefined) => void;
    setLocation: (location: string | undefined) => void;
    toggleGenre: (genreName: string) => void;
    toggleBusinessType: (businessType: string) => void;
    setCapacity: (capacity: string | undefined) => void;
    toggleServiceType: (serviceType: string) => void;
    setFeeMin: (feeMin: number | undefined) => void;
    setFeeMax: (feeMax: number | undefined) => void;
    setIsAvailable: (isAvailable: boolean | undefined) => void;
    setStateProvince: (stateProvince: string | undefined) => void;
    setVenueType: (venueType: string | undefined) => void;
    resetFilters: () => void;
    applyFilters: (filters: Partial<SearchFilters>) => void;
}

const initialFilters: SearchFilters = {
    query: '',
    role: undefined,
    location: undefined,
    genres: [],
    businessTypes: [],
    capacity: undefined,
    serviceTypes: [],
    feeMin: undefined,
    feeMax: undefined,
    isAvailable: undefined,
    stateProvince: undefined,
    venueType: undefined,
    page: 1,
    pageSize: 20,
};

/**
 * Số bộ lọc đang bật (không tính ô tìm kiếm và tab vai trò — hai thứ đó đã hiển thị sẵn
 * trên header). Dùng chung cho badge nút lọc và tiêu đề của `FilterSheet`.
 */
export function countActiveFilters(filters: SearchFilters): number {
    return (
        filters.genres.length +
        filters.businessTypes.length +
        filters.serviceTypes.length +
        (filters.stateProvince ? 1 : 0) +
        (filters.venueType ? 1 : 0) +
        (filters.feeMin != null ? 1 : 0) +
        (filters.feeMax != null ? 1 : 0) +
        (filters.isAvailable ? 1 : 0)
    );
}

export const useSearchStore = create<SearchState>()((set) => ({
    filters: initialFilters,

    setQuery: (query) =>
        set((state) => ({
            filters: { ...state.filters, query, page: 1 },
        })),

    setRole: (role) =>
        // Chỉ dọn filter khi ĐỔI NHÓM nghệ sĩ ↔ địa điểm (khớp `handleRoleChange` bên web).
        // Chuyển giữa các sub-role nghệ sĩ (nghệ sĩ ↔ ca sĩ ↔ nhà sản xuất) giữ nguyên bộ lọc,
        // nếu không người dùng phải chọn lại thể loại/dịch vụ mỗi lần đổi tab.
        set((state) => {
            const wasArtist = isArtistRole(state.filters.role);
            const nowArtist = isArtistRole(role);
            if (wasArtist === nowArtist && state.filters.role !== undefined) {
                return { filters: { ...state.filters, role, page: 1 } };
            }
            return {
                filters: {
                    ...state.filters,
                    role,
                    genres: [],
                    serviceTypes: [],
                    businessTypes: [],
                    feeMin: undefined,
                    feeMax: undefined,
                    venueType: undefined,
                    isAvailable: undefined,
                    page: 1,
                },
            };
        }),

    setLocation: (location) =>
        set((state) => ({
            filters: { ...state.filters, location, page: 1 },
        })),

    toggleGenre: (genreName) =>
        set((state) => {
            const genres = state.filters.genres.includes(genreName)
                ? state.filters.genres.filter((name) => name !== genreName)
                : [...state.filters.genres, genreName];
            return {
                filters: { ...state.filters, genres, page: 1 },
            };
        }),

    toggleBusinessType: (businessType) =>
        set((state) => {
            const businessTypes = state.filters.businessTypes.includes(businessType)
                ? state.filters.businessTypes.filter((type) => type !== businessType)
                : [...state.filters.businessTypes, businessType];
            return {
                filters: { ...state.filters, businessTypes, page: 1 },
            };
        }),

    setCapacity: (capacity) =>
        set((state) => ({
            filters: { ...state.filters, capacity, page: 1 },
        })),

    toggleServiceType: (serviceType) =>
        set((state) => {
            const serviceTypes = state.filters.serviceTypes.includes(serviceType)
                ? state.filters.serviceTypes.filter((type) => type !== serviceType)
                : [...state.filters.serviceTypes, serviceType];
            return {
                filters: { ...state.filters, serviceTypes, page: 1 },
            };
        }),

    // Hai mốc thù lao phải hợp lệ với nhau: chọn cận dưới ≥ cận trên (hoặc ngược lại) sẽ ra
    // khoảng rỗng và luôn 0 kết quả → bỏ mốc còn lại thay vì để người dùng tự mò (khớp web).
    setFeeMin: (feeMin) =>
        set((state) => ({
            filters: {
                ...state.filters,
                feeMin,
                feeMax:
                    feeMin != null && state.filters.feeMax != null && feeMin >= state.filters.feeMax
                        ? undefined
                        : state.filters.feeMax,
                page: 1,
            },
        })),

    setFeeMax: (feeMax) =>
        set((state) => ({
            filters: {
                ...state.filters,
                feeMin:
                    feeMax != null && state.filters.feeMin != null && state.filters.feeMin >= feeMax
                        ? undefined
                        : state.filters.feeMin,
                feeMax,
                page: 1,
            },
        })),

    setIsAvailable: (isAvailable) =>
        set((state) => ({
            filters: { ...state.filters, isAvailable, page: 1 },
        })),

    setStateProvince: (stateProvince) =>
        set((state) => ({
            filters: { ...state.filters, stateProvince, page: 1 },
        })),

    setVenueType: (venueType) =>
        set((state) => ({
            filters: { ...state.filters, venueType, page: 1 },
        })),

    // Giữ lại `role` và `query`: hai thứ này do tab vai trò và ô tìm kiếm ngoài sheet nắm giữ
    // (state cục bộ của màn hình). Xoá chúng ở đây sẽ lệch với UI đang hiển thị.
    resetFilters: () =>
        set((state) => ({
            filters: { ...initialFilters, role: state.filters.role, query: state.filters.query },
        })),

    applyFilters: (newFilters) =>
        set((state) => ({
            filters: { ...state.filters, ...newFilters, page: 1 },
        })),
}));

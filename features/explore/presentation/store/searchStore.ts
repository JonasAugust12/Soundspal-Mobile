import { create } from 'zustand';

export type UserRole = 'singer' | 'producer' | 'venue';

export interface SearchFilters {
    query: string;
    role?: UserRole;
    location?: string;
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
    toggleGenre: (genreId: string) => void;
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

export const useSearchStore = create<SearchState>()((set) => ({
    filters: initialFilters,

    setQuery: (query) =>
        set((state) => ({
            filters: { ...state.filters, query, page: 1 },
        })),

    setRole: (role) =>
        // Đổi role thì dọn các filter đặc thù role kia (khớp web) — giữ lại query + tỉnh/thành.
        set((state) => ({
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
        })),

    setLocation: (location) =>
        set((state) => ({
            filters: { ...state.filters, location, page: 1 },
        })),

    toggleGenre: (genreId) =>
        set((state) => {
            const genres = state.filters.genres.includes(genreId)
                ? state.filters.genres.filter((id) => id !== genreId)
                : [...state.filters.genres, genreId];
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

    setFeeMin: (feeMin) =>
        set((state) => ({
            filters: { ...state.filters, feeMin, page: 1 },
        })),

    setFeeMax: (feeMax) =>
        set((state) => ({
            filters: { ...state.filters, feeMax, page: 1 },
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

    resetFilters: () =>
        set({
            filters: initialFilters,
        }),

    applyFilters: (newFilters) =>
        set((state) => ({
            filters: { ...state.filters, ...newFilters, page: 1 },
        })),
}));

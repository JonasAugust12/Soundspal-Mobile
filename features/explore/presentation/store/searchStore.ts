import { create } from 'zustand';

export type UserRole = 'singer' | 'producer' | 'venue';

export interface SearchFilters {
    query: string;
    role?: UserRole;
    location?: string;
    genres: string[];
    businessTypes: string[];
    capacity?: string;
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
        set((state) => ({
            filters: { ...state.filters, role, page: 1 },
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

    resetFilters: () =>
        set({
            filters: initialFilters,
        }),

    applyFilters: (newFilters) =>
        set((state) => ({
            filters: { ...state.filters, ...newFilters, page: 1 },
        })),
}));

import {
    countActiveFilters,
    isArtistRole,
    useSearchStore,
} from '@/features/explore/presentation/store/searchStore';

const reset = () => {
    useSearchStore.getState().resetFilters();
    useSearchStore.getState().setRole(undefined);
    useSearchStore.getState().setQuery('');
};

const filters = () => useSearchStore.getState().filters;

beforeEach(reset);

describe('isArtistRole', () => {
    it('covers the alias and both sub-roles, but not venue', () => {
        expect(isArtistRole('artist')).toBe(true);
        expect(isArtistRole('singer')).toBe(true);
        expect(isArtistRole('producer')).toBe(true);
        expect(isArtistRole('venue')).toBe(false);
        expect(isArtistRole(undefined)).toBe(false);
    });
});

describe('genre filter', () => {
    it('stores genre names, since the backend matches genres.name', () => {
        useSearchStore.getState().toggleGenre('Acoustic');
        expect(filters().genres).toEqual(['Acoustic']);

        useSearchStore.getState().toggleGenre('Acoustic');
        expect(filters().genres).toEqual([]);
    });
});

describe('setRole', () => {
    it('keeps filters when moving between artist sub-roles', () => {
        const store = useSearchStore.getState();
        store.setRole('artist');
        store.toggleGenre('Jazz');
        store.toggleServiceType('wedding');

        useSearchStore.getState().setRole('singer');

        expect(filters().role).toBe('singer');
        expect(filters().genres).toEqual(['Jazz']);
        expect(filters().serviceTypes).toEqual(['wedding']);
    });

    it('clears artist-only filters when switching to venue', () => {
        const store = useSearchStore.getState();
        store.setRole('artist');
        store.toggleGenre('Jazz');
        store.setFeeMin(1_000_000);

        useSearchStore.getState().setRole('venue');

        expect(filters().genres).toEqual([]);
        expect(filters().feeMin).toBeUndefined();
    });
});

describe('fee range', () => {
    it('drops feeMax when the new feeMin would make the range empty', () => {
        useSearchStore.getState().setFeeMax(2_000_000);
        useSearchStore.getState().setFeeMin(5_000_000);

        expect(filters().feeMin).toBe(5_000_000);
        expect(filters().feeMax).toBeUndefined();
    });

    it('drops feeMin when the new feeMax would make the range empty', () => {
        useSearchStore.getState().setFeeMin(5_000_000);
        useSearchStore.getState().setFeeMax(2_000_000);

        expect(filters().feeMax).toBe(2_000_000);
        expect(filters().feeMin).toBeUndefined();
    });

    it('keeps a valid range', () => {
        useSearchStore.getState().setFeeMin(1_000_000);
        useSearchStore.getState().setFeeMax(5_000_000);

        expect(filters().feeMin).toBe(1_000_000);
        expect(filters().feeMax).toBe(5_000_000);
    });
});

describe('resetFilters', () => {
    it('clears filters but keeps role and query, which live outside the sheet', () => {
        const store = useSearchStore.getState();
        store.setRole('artist');
        store.setQuery('linh');
        store.toggleGenre('Jazz');
        store.setStateProvince('SG');

        useSearchStore.getState().resetFilters();

        expect(filters().role).toBe('artist');
        expect(filters().query).toBe('linh');
        expect(filters().genres).toEqual([]);
        expect(filters().stateProvince).toBeUndefined();
    });
});

describe('countActiveFilters', () => {
    it('ignores role and query', () => {
        const store = useSearchStore.getState();
        store.setRole('artist');
        store.setQuery('linh');
        expect(countActiveFilters(filters())).toBe(0);

        useSearchStore.getState().toggleGenre('Jazz');
        useSearchStore.getState().setStateProvince('SG');
        useSearchStore.getState().setIsAvailable(true);
        expect(countActiveFilters(filters())).toBe(3);
    });
});

import React from 'react';
import { render } from '@testing-library/react-native';
import { ExploreUserCard } from '@/features/explore/presentation/components/ExploreUserCard';
import {
    DEFAULT_EXPLORE_COVERS,
    getDefaultCoverUrl,
} from '@/features/explore/domain/constants/defaultCoverImages';
import type { UserProfile } from '@/features/explore/domain/entities/search.type';

const buildUser = (overrides: Partial<UserProfile> = {}): UserProfile =>
    ({
        id: 'user-1',
        username: 'bonpaul',
        display_name: 'Huy Gia Le',
        role: 'producer',
        is_verified: true,
        ...overrides,
    }) as UserProfile;

describe('getDefaultCoverUrl', () => {
    it('picks a cover matching the role', () => {
        expect(DEFAULT_EXPLORE_COVERS.singer).toContain(getDefaultCoverUrl('seed-a', 'singer'));
        expect(DEFAULT_EXPLORE_COVERS.producer).toContain(getDefaultCoverUrl('seed-a', 'producer'));
        expect(DEFAULT_EXPLORE_COVERS.venue).toContain(getDefaultCoverUrl('seed-a', 'venue'));
    });

    it('falls back to the artist set when the role is unknown', () => {
        expect(DEFAULT_EXPLORE_COVERS.artist).toContain(getDefaultCoverUrl('seed-a', undefined));
    });

    it('is deterministic for the same seed', () => {
        expect(getDefaultCoverUrl('bonpaul', 'producer')).toBe(
            getDefaultCoverUrl('bonpaul', 'producer'),
        );
    });

    it('spreads different seeds across the set', () => {
        const seeds = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
        const picked = new Set(seeds.map((seed) => getDefaultCoverUrl(seed, 'venue')));
        expect(picked.size).toBeGreaterThan(1);
    });
});

describe('ExploreUserCard cover', () => {
    it('uses the real cover_url when the user has one', () => {
        const { UNSAFE_getAllByType } = render(
            <ExploreUserCard
                item={buildUser({ cover_url: 'https://cdn.example.com/real-cover.jpg' })}
                onPress={jest.fn()}
            />,
        );

        const uris = UNSAFE_getAllByType(require('react-native').Image)
            .map((node) => node.props.source?.uri)
            .filter(Boolean);

        expect(uris).toContain('https://cdn.example.com/real-cover.jpg');
    });

    it('falls back to a role-matched mock cover when cover_url is missing', () => {
        const { UNSAFE_getAllByType } = render(
            <ExploreUserCard item={buildUser({ cover_url: undefined })} onPress={jest.fn()} />,
        );

        const uris = UNSAFE_getAllByType(require('react-native').Image)
            .map((node) => node.props.source?.uri)
            .filter(Boolean);

        expect(uris).toContain(getDefaultCoverUrl('user-1', 'producer'));
        expect(DEFAULT_EXPLORE_COVERS.producer).toContain(uris[0]);
    });

    it('treats a blank cover_url as missing', () => {
        const { UNSAFE_getAllByType } = render(
            <ExploreUserCard item={buildUser({ cover_url: '   ' })} onPress={jest.fn()} />,
        );

        const uris = UNSAFE_getAllByType(require('react-native').Image)
            .map((node) => node.props.source?.uri)
            .filter(Boolean);

        expect(uris).toContain(getDefaultCoverUrl('user-1', 'producer'));
    });
});

import type {
    User,
    MediaItem,
    MediaResponse,
    VideoItem,
    VideoResponse,
    GenresResponse,
    Experience,
    ExperienceCreatePayload,
    ExperienceUpdatePayload,
    UpdateMyProfilePayload,
    UpdateVenueRequirementsPayload,
    UpdateBasicInfoPayload,
    UpdateContactInfoPayload,
    UpdateSocialLinksPayload,
    UpdateVenueBasicPayload,
    UpdateVenueContactPayload,
    UpdateVenueAdditionalPayload,
} from '@/features/profiles/domain/entities/user.type';

export interface IUserRepository {
    // Reads
    getCurrentUser(): Promise<User>;
    getUserByUsername(username: string): Promise<User>;
    getCurrentUserMedia(): Promise<MediaResponse>;
    getUserMedia(username: string): Promise<MediaResponse>;
    getUserVideos(username: string): Promise<VideoResponse>;
    getAllGenres(): Promise<GenresResponse>;
    getUserGenres(username: string): Promise<GenresResponse>;
    getUserExperiences(username: string): Promise<Experience[]>;

    // Profile updates (artist)
    updateBasicInfo(body?: UpdateBasicInfoPayload): Promise<User>;
    updateContactInfo(body?: UpdateContactInfoPayload): Promise<User>;
    updateSocialLinks(body?: UpdateSocialLinksPayload): Promise<User>;
    updateMyProfile(body?: UpdateMyProfilePayload): Promise<User>;
    updateFeaturedReleases(body?: { featured_release_links: string[] }): Promise<User>;
    updateUserGenres(username: string, genreNames: string[]): Promise<unknown>;
    updateUserServices(services: unknown[]): Promise<unknown>;

    // Profile updates (venue)
    updateVenueBasic(body?: UpdateVenueBasicPayload): Promise<User>;
    updateVenueContact(body?: UpdateVenueContactPayload): Promise<User>;
    updateVenueAdditional(body?: UpdateVenueAdditionalPayload): Promise<User>;
    updateVenueRequirements(body?: UpdateVenueRequirementsPayload): Promise<User>;

    // Media & video uploads
    uploadUserAvatar(formData: FormData): Promise<MediaItem>;
    uploadUserCover(formData: FormData): Promise<MediaItem>;
    uploadUserMedia(formData: FormData): Promise<MediaItem>;
    deleteUserMedia(mediaId: string): Promise<void>;
    uploadUserVideo(formData: FormData): Promise<VideoItem>;
    deleteUserVideo(videoId: string): Promise<void>;

    // Experience (work history)
    createExperience(payload: ExperienceCreatePayload): Promise<Experience>;
    updateExperience(id: string, payload: ExperienceUpdatePayload): Promise<Experience>;
    deleteExperience(id: string): Promise<void>;
    updateExperienceGenres(id: string, genreNames: string[]): Promise<unknown>;
}

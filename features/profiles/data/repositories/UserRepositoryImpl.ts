import type { IUserRepository } from '@/features/profiles/domain/repositories/IUserRepository';
import { userRemoteDataSource } from '@/features/profiles/data/datasources/userRemoteDataSource';

export class UserRepositoryImpl implements IUserRepository {
    getCurrentUser = userRemoteDataSource.getCurrentUser;
    getUserByUsername = userRemoteDataSource.getUserByUsername;
    getCurrentUserMedia = userRemoteDataSource.getCurrentUserMedia;
    getUserMedia = userRemoteDataSource.getUserMedia;
    getUserVideos = userRemoteDataSource.getUserVideos;
    updateBasicInfo = userRemoteDataSource.updateBasicInfo;
    updateContactInfo = userRemoteDataSource.updateContactInfo;
    updateSocialLinks = userRemoteDataSource.updateSocialLinks;
    uploadUserAvatar = userRemoteDataSource.uploadUserAvatar;
    uploadUserCover = userRemoteDataSource.uploadUserCover;
    uploadUserMedia = userRemoteDataSource.uploadUserMedia;
    deleteUserMedia = userRemoteDataSource.deleteUserMedia;
    uploadUserVideo = userRemoteDataSource.uploadUserVideo;
    deleteUserVideo = userRemoteDataSource.deleteUserVideo;
    updateFeaturedReleases = userRemoteDataSource.updateFeaturedReleases;
    getAllGenres = userRemoteDataSource.getAllGenres;
    getUserGenres = userRemoteDataSource.getUserGenres;
    updateUserGenres = userRemoteDataSource.updateUserGenres;
    updateUserServices = userRemoteDataSource.updateUserServices;
    updateVenueBasic = userRemoteDataSource.updateVenueBasic;
    updateVenueContact = userRemoteDataSource.updateVenueContact;
    updateVenueAdditional = userRemoteDataSource.updateVenueAdditional;
}

export const userRepository = new UserRepositoryImpl();

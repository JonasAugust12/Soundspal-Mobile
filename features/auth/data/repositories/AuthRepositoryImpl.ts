import type { IAuthRepository } from '@/features/auth/domain/repositories/IAuthRepository';
import { authRemoteDataSource } from '@/features/auth/data/datasources/authRemoteDataSource';

export class AuthRepositoryImpl implements IAuthRepository {
    login = authRemoteDataSource.login;
    signup = authRemoteDataSource.signup;
    logout = authRemoteDataSource.logout;
    verifyEmail = authRemoteDataSource.verifyEmail;
    resendVerification = authRemoteDataSource.resendVerification;
    requestPasswordReset = authRemoteDataSource.requestPasswordReset;
    confirmResetPassword = authRemoteDataSource.confirmResetPassword;
    resendResetPasswordCode = authRemoteDataSource.resendResetPasswordCode;
    resetPassword = authRemoteDataSource.resetPassword;
    mobileOAuth = authRemoteDataSource.mobileOAuth;
    completeOAuth = authRemoteDataSource.completeOAuth;
}

export const authRepository = new AuthRepositoryImpl();

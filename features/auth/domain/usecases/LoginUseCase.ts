import type { IAuthRepository } from '@/features/auth/domain/repositories/IAuthRepository';
import type { LoginRequest, LoginResponse } from '@/features/auth/domain/entities/auth.type';
import { AuthValidationMessage } from '@/features/auth/domain/constants/authValidation';

export class LoginUseCase {
    constructor(private readonly repository: IAuthRepository) {}

    execute(body: LoginRequest): Promise<LoginResponse> {
        if (!body.identifier?.trim() || !body.password) {
            return Promise.reject(new Error(AuthValidationMessage.CredentialsRequired));
        }
        return this.repository.login(body);
    }
}

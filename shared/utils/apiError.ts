import type { AxiosError } from 'axios';

export function isApiNotFound(error: unknown): boolean {
    return (error as AxiosError)?.response?.status === 404;
}

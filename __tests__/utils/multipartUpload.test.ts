import {
    postMultipartWithFetch,
    unwrapUploadPayload,
} from '@/shared/infrastructure/api/multipartUpload';
import { useAuthStore } from '@/features/auth/presentation/store/authStore';

describe('unwrapUploadPayload', () => {
    it('bóc lớp { data } của envelope', () => {
        const item = { id: '1', file_url: 'https://cdn/x.jpg' };
        expect(unwrapUploadPayload({ code: 0, message: 'ok', data: item })).toEqual(item);
    });

    it('giữ nguyên khi server trả thẳng object', () => {
        const item = { id: '1', file_url: 'https://cdn/x.jpg' };
        expect(unwrapUploadPayload(item)).toEqual(item);
    });

    it('giữ nguyên payload khi data không phải object', () => {
        const payload = { data: null };
        expect(unwrapUploadPayload(payload)).toBe(payload);
    });
});

describe('postMultipartWithFetch', () => {
    const realFetch = global.fetch;

    afterEach(() => {
        global.fetch = realFetch;
        useAuthStore.setState({ accessToken: null });
    });

    it('gửi POST fetch với body FormData và kèm token', async () => {
        useAuthStore.setState({ accessToken: 'tok-123' });
        const form = new FormData();
        const fetchMock = jest.fn().mockResolvedValue({
            ok: true,
            status: 200,
            statusText: 'OK',
            text: async () => JSON.stringify({ data: { file_url: 'https://cdn/a.jpg' } }),
        });
        global.fetch = fetchMock as unknown as typeof fetch;

        const result = await postMultipartWithFetch<{ data: { file_url: string } }>(
            '/users/me/avatar',
            form,
        );

        expect(result).toEqual({ data: { file_url: 'https://cdn/a.jpg' } });
        const [calledUrl, init] = fetchMock.mock.calls[0];
        expect(calledUrl).toBe('https://talentlink.io.vn/api/v1/users/me/avatar');
        expect(init.method).toBe('POST');
        expect(init.body).toBe(form);
        expect(init.headers.Authorization).toBe('Bearer tok-123');
        // Không được set Content-Type thủ công — để fetch tự thêm boundary.
        expect(init.headers['Content-Type']).toBeUndefined();
    });

    it('không thêm Authorization khi chưa đăng nhập', async () => {
        const fetchMock = jest.fn().mockResolvedValue({
            ok: true,
            status: 200,
            statusText: 'OK',
            text: async () => '{}',
        });
        global.fetch = fetchMock as unknown as typeof fetch;

        await postMultipartWithFetch('/users/me/avatar', new FormData());
        expect(fetchMock.mock.calls[0][1].headers.Authorization).toBeUndefined();
    });

    it('ném lỗi kèm status khi server trả HTTP lỗi', async () => {
        global.fetch = jest.fn().mockResolvedValue({
            ok: false,
            status: 413,
            statusText: 'Payload Too Large',
            text: async () => 'file too big',
        }) as unknown as typeof fetch;

        await expect(postMultipartWithFetch('/users/me/avatar', new FormData())).rejects.toThrow(
            /HTTP 413/,
        );
    });

    it('ném lỗi khi body không phải JSON', async () => {
        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            status: 200,
            statusText: 'OK',
            text: async () => '<html>oops</html>',
        }) as unknown as typeof fetch;

        await expect(postMultipartWithFetch('/users/me/avatar', new FormData())).rejects.toThrow(
            /expected JSON/,
        );
    });
});

import type { IBlogRepository } from '@/features/blog/domain/repositories/IBlogRepository';
import type { LocalImageAsset, BlogItem } from '@/features/blog/domain/entities/blog.type';

export class AddBlogPostMediaUseCase {
    constructor(private readonly repository: IBlogRepository) {}

    execute(postId: string, asset: LocalImageAsset): Promise<BlogItem> {
        if (!postId?.trim()) {
            return Promise.reject(new Error('Post ID is required'));
        }
        if (!asset.uri?.trim()) {
            return Promise.reject(new Error('Image URI is required'));
        }
        return this.repository.addPostMedia(postId, asset);
    }
}

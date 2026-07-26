import type { IBlogRepository } from '@/features/blog/domain/repositories/IBlogRepository';
import { blogRemoteDataSource } from '@/features/blog/data/datasources/blogRemoteDataSource';

export class BlogRepositoryImpl implements IBlogRepository {
    fetchBlogPosts = blogRemoteDataSource.fetchBlogPosts;
    fetchTopics = blogRemoteDataSource.fetchTopics;
    createPost = blogRemoteDataSource.createPost;
    updatePost = blogRemoteDataSource.updatePost;
    publishPost = blogRemoteDataSource.publishPost;
    addPostMedia = blogRemoteDataSource.addPostMedia;
    searchPosts = blogRemoteDataSource.searchPosts;
    fetchBookmarks = blogRemoteDataSource.fetchBookmarks;
    bookmarkPost = blogRemoteDataSource.bookmarkPost;
    unbookmarkPost = blogRemoteDataSource.unbookmarkPost;
    fetchComments = blogRemoteDataSource.fetchComments;
    createComment = blogRemoteDataSource.createComment;
    updateComment = blogRemoteDataSource.updateComment;
    deleteComment = blogRemoteDataSource.deleteComment;
}

export const blogRepository = new BlogRepositoryImpl();

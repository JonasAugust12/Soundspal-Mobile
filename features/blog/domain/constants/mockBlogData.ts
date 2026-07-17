/**
 * @deprecated Use imports from @/features/blog/domain/constants/blog instead
 * This file is kept for backward compatibility only.
 *
 * New code should import directly from:
 * - @/features/blog/domain/constants/blog/tabs (BLOG_TABS)
 * - @/features/blog/domain/constants/blog/articles (MOCK_BLOG_ARTICLES)
 *
 * Or use the centralized export:
 * - @/features/blog/domain/constants/blog
 *
 * For API integration, use hooks from @/features/blog/presentation/hooks/useBlogApi:
 * - useBlogTabs()
 * - useBlogArticles(options)
 * - useBlogArticle(id)
 * - useBlogComments(articleId)
 * - useAddBlogComment()
 * - useAddCommentLike()
 */

export { BLOG_TABS, MOCK_BLOG_ARTICLES } from '@/features/blog/domain/constants/blog';

// The old data definitions below are kept for reference only
// DO NOT USE - All data should come from @/features/blog/domain/constants/blog or @/features/blog/presentation/hooks/useBlogApi

/*
import type { BlogArticle, BlogTab, BlogComment } from '@/features/blog/domain/entities/blog.type';

export const BLOG_TABS: BlogTab[] = [
    { id: '1', label: 'For You', value: 'for-you' },
    { id: '2', label: 'Mobile Dev', value: 'mobile-dev' },
    { id: '3', label: 'AEO Platform', value: 'aeo-platform' },
];

export const MOCK_BLOG_ARTICLES: BlogArticle[] = [
    {
        id: '1',
        title: "Mastering the TOEIC Writing Test: A Developer's Guide to 170/200",
        excerpt:
            "Most developers dread the writing portion of English proficiency tests. We are used to syntax, logic, and brevity. However, the TOEIC Writing test isn't just about grammar—it's about structured communication.",
        content: `Most developers dread the writing portion of English proficiency tests. We are used to syntax, logic, and brevity. However, the TOEIC Writing test isn't just about grammar—it's about structured communication, much like writing a clean technical specification.

In this guide, I will break down the three sections of the test through the lens of a programmer. We will treat Question 1-5 (Write a Sentence) like designing a minimal API, Question 6 (Write an Opinion Essay) like designing a scalable system architecture.

The key to a high score isn't complex vocabulary; it's the architectural integrity of your arguments. When I first approached the essay section, I over-engineered my responses. I tried to use flowery language that would never use in a PR review. Once I shifted to the "DRY" (Don't Repeat Yourself) principle and focused on connective tissue, my practice scores jumped from 140 to 180.

Remember, the examiners are looking for clarity. They want to see if you can effectively communicate a decision in a globalized tech environment; this is perhaps the most critical soft skill you can develop.`,
        author: {
            id: 'author-1',
            name: 'Alex Rivera',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
        },
        category: 'CAREER',
        thumbnail:
            'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500&h=300&fit=crop',
        publishedAt: 'Oct 26, 2023',
        readTime: 8,
        likes: 842,
        comments: 56,
        isFeatured: true,
    },
    {
        id: '2',
        title: 'The Evolution of Answer Engine Optimization',
        excerpt:
            'Discover how AEO is changing the way we think about search and content optimization.',
        content:
            'The landscape of digital marketing is evolving rapidly. Answer Engine Optimization (AEO) represents the next frontier of content strategy. As AI systems become more sophisticated, the need to optimize for semantic understanding rather than keyword matching becomes increasingly important. This shift represents a fundamental change in how we approach content creation and distribution in the digital age.',
        author: {
            id: 'author-2',
            name: 'Sarah J.',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
        },
        category: 'AEO MARKETING',
        thumbnail:
            'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=500&h=300&fit=crop',
        publishedAt: 'March 10, 2026',
        readTime: 4,
        likes: 215,
        comments: 12,
    },
    {
        id: '3',
        title: 'Curating Your Digital Soul: A Guide',
        excerpt:
            'A comprehensive guide to personal branding and digital identity in the modern age.',
        content:
            'In the digital age, your online presence is your personal brand. Learn how to curate...',
        author: {
            id: 'author-3',
            name: 'Marcus T.',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus',
        },
        category: 'PRODUCTIVITY',
        thumbnail: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=500&h=300&fit=crop',
        publishedAt: 'March 5, 2026',
        readTime: 7,
        likes: 512,
        comments: 34,
    },
    {
        id: '4',
        title: 'Is Web3 Dead? Or Just Growing Up?',
        excerpt: 'An honest take on the current state and future of Web3 technology.',
        content:
            'The narrative around Web3 has shifted dramatically in recent years. Instead of the utopian vision...',
        author: {
            id: 'author-4',
            name: 'Elena R.',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Elena',
        },
        category: 'TECH TRENDS',
        thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500&h=300&fit=crop',
        publishedAt: 'Feb 28, 2026',
        readTime: 5,
        likes: 1200,
        comments: 89,
    },
    {
        id: '5',
        title: 'The Return of the Physical Magazine',
        excerpt: 'Why printed media is making a surprising comeback in the digital age.',
        content:
            'While digital has dominated the media landscape for years, there is a growing movement...',
        author: {
            id: 'author-5',
            name: 'James Wilson',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=James',
        },
        category: 'CULTURE',
        thumbnail:
            'https://images.unsplash.com/photo-1507842217343-583f20270319?w=500&h=300&fit=crop',
        publishedAt: 'Feb 20, 2026',
        readTime: 12,
        likes: 340,
        comments: 18,
    },
    {
        id: '6',
        title: 'Advanced TypeScript Patterns for Large-Scale Apps',
        excerpt:
            'Master advanced TypeScript patterns that will take your application architecture to the next level.',
        content:
            'TypeScript has become the standard for building large-scale applications. Learn about advanced patterns...',
        author: {
            id: 'author-1',
            name: 'Dien Nguyen',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Dien',
        },
        category: 'MOBILE DEV',
        thumbnail:
            'https://images.unsplash.com/photo-1516321318423-f06f70a504f9?w=500&h=300&fit=crop',
        publishedAt: 'Feb 15, 2026',
        readTime: 9,
        likes: 456,
        comments: 28,
    },
];

export const MOCK_BLOG_COMMENTS: BlogComment[] = [
    {
        id: 'comment-1',
        author: {
            id: 'user-1',
            name: 'Michael',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael',
        },
        text: "Great insights on the CI/CD pipeline setup! The focus on ephemeral environments really addresses the bottleneck we've been facing lately.",
        timestamp: '2 HOURS AGO',
        likes: 12,
        isVoiceMessage: false,
    },
    {
        id: 'comment-2',
        author: {
            id: 'user-2',
            name: 'Alex',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
        },
        voiceUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
        voiceDuration: 45,
        timestamp: '45 MIN AGO',
        likes: 4,
        isVoiceMessage: true,
    },
];
*/

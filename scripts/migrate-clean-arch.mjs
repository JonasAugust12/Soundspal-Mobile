#!/usr/bin/env node
/**
 * One-time migration script: layer-based → feature-based Clean Architecture
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function globSync(prefix) {
  const results = [];
  function walk(dir) {
    if (!fs.existsSync(dir)) return;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (/\.(ts|tsx)$/.test(entry.name))
        results.push(full.replace(ROOT + path.sep, '').replace(/\\/g, '/'));
    }
  }
  walk(path.join(ROOT, prefix));
  return results;
}

const FILE_MOVES = [
  // shared infrastructure
  ['lib/apiClient.ts', 'shared/infrastructure/api/apiClient.ts'],
  ['lib/queryClient.ts', 'shared/infrastructure/api/queryClient.ts'],
  ['lib/storage.ts', 'shared/infrastructure/storage/storage.ts'],
  ['lib/mmkvStorage.ts', 'shared/infrastructure/storage/mmkvStorage.ts'],
  ['services/socketService.ts', 'shared/infrastructure/socket/socketService.ts'],
  ['providers/SocketProvider.tsx', 'shared/presentation/providers/SocketProvider.tsx'],
  ['components/RootErrorBoundary.tsx', 'shared/presentation/RootErrorBoundary.tsx'],
  ['utils/jwt.ts', 'shared/utils/jwt.ts'],
  ['types/apiresponse.type.ts', 'shared/domain/entities/apiresponse.type.ts'],
  ['constants/colors.ts', 'shared/domain/constants/colors.ts'],
  ['constants/businessTypes.ts', 'shared/domain/constants/businessTypes.ts'],
  ['stores/themeStore.ts', 'shared/presentation/store/themeStore.ts'],
  ['stores/settingsStore.ts', 'shared/presentation/store/settingsStore.ts'],

  // shared presentation
  ['hooks/useToast.ts', 'shared/presentation/hooks/useToast.ts'],
  ['hooks/useProtectedRoute.ts', 'shared/presentation/hooks/useProtectedRoute.ts'],
  ['components/navigation/CustomTabBar.tsx', 'shared/presentation/navigation/CustomTabBar.tsx'],
  ['components/navigation/TabScreenWrapper.tsx', 'shared/presentation/navigation/TabScreenWrapper.tsx'],

  // common UI
  ...globSync('components/common').map((f) => [
    f,
    f.replace('components/common', 'shared/presentation/ui'),
  ]),

  // auth feature
  ['types/auth.type.ts', 'features/auth/domain/entities/auth.type.ts'],
  ['stores/authStore.ts', 'features/auth/presentation/store/authStore.ts'],
  ['hooks/useAuthApi.ts', 'features/auth/presentation/hooks/useAuthApi.ts'],
  ['hooks/useAuthHydration.ts', 'features/auth/presentation/hooks/useAuthHydration.ts'],
  ['hooks/useGoogleSignIn.ts', 'features/auth/presentation/hooks/useGoogleSignIn.ts'],
  ...globSync('components/auth').map((f) => [
    f,
    f.replace('components/auth', 'features/auth/presentation/components'),
  ]),

  // jobs feature
  ['types/job.type.ts', 'features/jobs/domain/entities/job.type.ts'],
  ['utils/jobFormatters.ts', 'features/jobs/domain/utils/jobFormatters.ts'],
  ['hooks/useJobApi.ts', 'features/jobs/presentation/hooks/useJobApi.ts'],
  ...globSync('components/jobs').map((f) => [
    f,
    f.replace('components/jobs', 'features/jobs/presentation/components'),
  ]),

  // challenge feature
  ['types/challenge.type.ts', 'features/challenge/domain/entities/challenge.type.ts'],
  ['hooks/useChallengeApi.ts', 'features/challenge/presentation/hooks/useChallengeApi.ts'],
  ['stores/audioStore.ts', 'features/challenge/presentation/store/audioStore.ts'],
  ...globSync('components/beatDetail').map((f) => [
    f,
    f.replace('components/beatDetail', 'features/challenge/presentation/components/beatDetail'),
  ]),
  ...globSync('components/leaderboard').map((f) => [
    f,
    f.replace('components/leaderboard', 'features/challenge/presentation/components/leaderboard'),
  ]),
  ...globSync('components/recordStudio').map((f) => [
    f,
    f.replace('components/recordStudio', 'features/challenge/presentation/components/recordStudio'),
  ]),
  ...globSync('components/createChallenge').map((f) => [
    f,
    f.replace('components/createChallenge', 'features/challenge/presentation/components/createChallenge'),
  ]),

  // blog feature
  ['types/blog.type.ts', 'features/blog/domain/entities/blog.type.ts'],
  ['constants/mockBlogData.ts', 'features/blog/domain/constants/mockBlogData.ts'],
  ['hooks/useBlogApi.ts', 'features/blog/presentation/hooks/useBlogApi.ts'],
  ...globSync('constants/blog').map((f) => [
    f,
    f.replace('constants/blog', 'features/blog/domain/constants/blog'),
  ]),
  ...globSync('components/blog').map((f) => [
    f,
    f.replace('components/blog', 'features/blog/presentation/components'),
  ]),

  // messaging feature
  ['types/messaging.type.ts', 'features/messaging/domain/entities/messaging.type.ts'],
  ['hooks/useMessagingApi.ts', 'features/messaging/presentation/hooks/useMessagingApi.ts'],
  ['stores/messagingStore.ts', 'features/messaging/presentation/store/messagingStore.ts'],

  // profiles feature
  ['types/user.type.ts', 'features/profiles/domain/entities/user.type.ts'],
  ['types/media.type.ts', 'features/profiles/domain/entities/media.type.ts'],
  ['hooks/useUserApi.ts', 'features/profiles/presentation/hooks/useUserApi.ts'],
  ['hooks/useMediaApi.ts', 'features/profiles/presentation/hooks/useMediaApi.ts'],
  ['hooks/useStorageApi.ts', 'features/profiles/presentation/hooks/useStorageApi.ts'],
  ['stores/userStore.ts', 'features/profiles/presentation/store/userStore.ts'],
  ...globSync('components/profile').map((f) => [
    f,
    f.replace('components/profile', 'features/profiles/presentation/components/profile'),
  ]),
  ...globSync('components/editprofile').map((f) => [
    f,
    f.replace('components/editprofile', 'features/profiles/presentation/components/editprofile'),
  ]),

  // collab feature
  ['types/collaboration.type.ts', 'features/collab/domain/entities/collaboration.type.ts'],
  ['hooks/useCollabApi.ts', 'features/collab/presentation/hooks/useCollabApi.ts'],
  ...globSync('components/collab').map((f) => [
    f,
    f.replace('components/collab', 'features/collab/presentation/components'),
  ]),

  // payments feature
  ['types/payment.type.ts', 'features/payments/domain/entities/payment.type.ts'],
  ['constants/payment.ts', 'features/payments/domain/constants/payment.ts'],
  ['utils/payment.ts', 'features/payments/domain/utils/payment.ts'],
  ['hooks/usePaymentApi.ts', 'features/payments/presentation/hooks/usePaymentApi.ts'],

  // explore feature
  ['types/search.type.ts', 'features/explore/domain/entities/search.type.ts'],
  ['hooks/useSearchApi.ts', 'features/explore/presentation/hooks/useSearchApi.ts'],
  ['stores/searchStore.ts', 'features/explore/presentation/store/searchStore.ts'],
  ...globSync('components/explore').map((f) => [
    f,
    f.replace('components/explore', 'features/explore/presentation/components'),
  ]),

  // home feature
  ...globSync('components/home').map((f) => [
    f,
    f.replace('components/home', 'features/home/presentation/components'),
  ]),
];

const SCREEN_MOVES = [
  // auth screens
  ['app/(auth)/login.tsx', 'features/auth/presentation/screens/LoginScreen.tsx'],
  ['app/(auth)/register.tsx', 'features/auth/presentation/screens/RegisterScreen.tsx'],
  ['app/(auth)/forgot-password.tsx', 'features/auth/presentation/screens/ForgotPasswordScreen.tsx'],
  ['app/(auth)/reset-password.tsx', 'features/auth/presentation/screens/ResetPasswordScreen.tsx'],
  ['app/(auth)/verify-email.tsx', 'features/auth/presentation/screens/VerifyEmailScreen.tsx'],
  ['app/(auth)/verify-reset-code.tsx', 'features/auth/presentation/screens/VerifyResetCodeScreen.tsx'],
  ['app/(auth)/email-verification-required.tsx', 'features/auth/presentation/screens/EmailVerificationRequiredScreen.tsx'],
  ['app/(auth)/complete-oauth-profile.tsx', 'features/auth/presentation/screens/CompleteOAuthProfileScreen.tsx'],

  // jobs screens
  ['app/(jobs)/detail.tsx', 'features/jobs/presentation/screens/JobDetailScreen.tsx'],
  ['app/(jobs)/edit-job.tsx', 'features/jobs/presentation/screens/EditJobScreen.tsx'],
  ['app/(jobs)/recruitment-form.tsx', 'features/jobs/presentation/screens/RecruitmentFormScreen.tsx'],

  // blog screens
  ['app/(blog)/index.tsx', 'features/blog/presentation/screens/BlogIndexScreen.tsx'],
  ['app/(blog)/[id].tsx', 'features/blog/presentation/screens/BlogDetailScreen.tsx'],

  // challenge screens
  ['app/(challenge)/beat-detail.tsx', 'features/challenge/presentation/screens/BeatDetailScreen.tsx'],
  ['app/(challenge)/create.tsx', 'features/challenge/presentation/screens/CreateChallengeScreen.tsx'],
  ['app/(challenge)/explore.tsx', 'features/challenge/presentation/screens/ChallengeExploreScreen.tsx'],
  ['app/(challenge)/leaderboard.tsx', 'features/challenge/presentation/screens/LeaderboardScreen.tsx'],
  ['app/(challenge)/myContent.tsx', 'features/challenge/presentation/screens/MyContentScreen.tsx'],
  ['app/(challenge)/record.tsx', 'features/challenge/presentation/screens/RecordScreen.tsx'],
  ['app/(challenge)/result.tsx', 'features/challenge/presentation/screens/ResultScreen.tsx'],

  // profiles screens
  ['app/(editprofile)/editProfile.tsx', 'features/profiles/presentation/screens/EditProfileScreen.tsx'],
  ['app/(editprofile)/venueEditProfile.tsx', 'features/profiles/presentation/screens/VenueEditProfileScreen.tsx'],
  ['app/(profiles)/artistProfile.tsx', 'features/profiles/presentation/screens/ArtistProfileScreen.tsx'],
  ['app/(profiles)/venueProfile.tsx', 'features/profiles/presentation/screens/VenueProfileScreen.tsx'],
  ['app/(profiles)/collaboration.tsx', 'features/profiles/presentation/screens/CollaborationScreen.tsx'],
  ['app/(profiles)/featuredReleases.tsx', 'features/profiles/presentation/screens/FeaturedReleasesScreen.tsx'],
  ['app/(profiles)/jobSubmissions.tsx', 'features/profiles/presentation/screens/JobSubmissionsScreen.tsx'],
  ['app/(profiles)/mediaGallery.tsx', 'features/profiles/presentation/screens/MediaGalleryScreen.tsx'],
  ['app/(profiles)/portfolioGallery.tsx', 'features/profiles/presentation/screens/PortfolioGalleryScreen.tsx'],
  ['app/(profiles)/videoGallery.tsx', 'features/profiles/presentation/screens/VideoGalleryScreen.tsx'],

  // messaging screens
  ['app/(messages)/contactMessage.tsx', 'features/messaging/presentation/screens/ContactMessageScreen.tsx'],
  ['app/(messages)/detailMessage.tsx', 'features/messaging/presentation/screens/DetailMessageScreen.tsx'],

  // payments screens
  ['app/(payments)/premium.tsx', 'features/payments/presentation/screens/PremiumScreen.tsx'],

  // tab screens
  ['app/(tabs)/index.tsx', 'features/home/presentation/screens/HomeScreen.tsx'],
  ['app/(tabs)/explore.tsx', 'features/explore/presentation/screens/ExploreScreen.tsx'],
  ['app/(tabs)/jobs.tsx', 'features/jobs/presentation/screens/JobsTabScreen.tsx'],
  ['app/(tabs)/personal.tsx', 'features/profiles/presentation/screens/PersonalScreen.tsx'],
  ['app/(tabs)/notifications.tsx', 'features/messaging/presentation/screens/NotificationsScreen.tsx'],
];

const IMPORT_REPLACEMENTS = [
  ['@/shared/infrastructure/api/apiClient', '@/shared/infrastructure/api/apiClient'],
  ['@/shared/infrastructure/api/queryClient', '@/shared/infrastructure/api/queryClient'],
  ['@/shared/infrastructure/storage/storage', '@/shared/infrastructure/storage/storage'],
  ['@/shared/infrastructure/storage/mmkvStorage', '@/shared/infrastructure/storage/mmkvStorage'],
  ['@/shared/infrastructure/socket/socketService', '@/shared/infrastructure/socket/socketService'],
  ['@/shared/presentation/providers/SocketProvider', '@/shared/presentation/providers/SocketProvider'],
  ['@/shared/presentation/RootErrorBoundary', '@/shared/presentation/RootErrorBoundary'],
  ['@/shared/utils/jwt', '@/shared/utils/jwt'],
  ['@/features/jobs/domain/utils/jobFormatters', '@/features/jobs/domain/utils/jobFormatters'],
  ['@/features/payments/domain/utils/payment', '@/features/payments/domain/utils/payment'],
  ['@/shared/domain/entities/apiresponse.type', '@/shared/domain/entities/apiresponse.type'],
  ['@/features/auth/domain/entities/auth.type', '@/features/auth/domain/entities/auth.type'],
  ['@/features/jobs/domain/entities/job.type', '@/features/jobs/domain/entities/job.type'],
  ['@/features/challenge/domain/entities/challenge.type', '@/features/challenge/domain/entities/challenge.type'],
  ['@/features/blog/domain/entities/blog.type', '@/features/blog/domain/entities/blog.type'],
  ['@/features/messaging/domain/entities/messaging.type', '@/features/messaging/domain/entities/messaging.type'],
  ['@/features/profiles/domain/entities/user.type', '@/features/profiles/domain/entities/user.type'],
  ['@/features/profiles/domain/entities/media.type', '@/features/profiles/domain/entities/media.type'],
  ['@/features/collab/domain/entities/collaboration.type', '@/features/collab/domain/entities/collaboration.type'],
  ['@/features/payments/domain/entities/payment.type', '@/features/payments/domain/entities/payment.type'],
  ['@/features/explore/domain/entities/search.type', '@/features/explore/domain/entities/search.type'],
  ['@/features/auth/presentation/store/authStore', '@/features/auth/presentation/store/authStore'],
  ['@/shared/presentation/store/themeStore', '@/shared/presentation/store/themeStore'],
  ['@/shared/presentation/store/settingsStore', '@/shared/presentation/store/settingsStore'],
  ['@/features/profiles/presentation/store/userStore', '@/features/profiles/presentation/store/userStore'],
  ['@/features/messaging/presentation/store/messagingStore', '@/features/messaging/presentation/store/messagingStore'],
  ['@/features/explore/presentation/store/searchStore', '@/features/explore/presentation/store/searchStore'],
  ['@/features/challenge/presentation/store/audioStore', '@/features/challenge/presentation/store/audioStore'],
  ['@/shared/presentation/hooks/useToast', '@/shared/presentation/hooks/useToast'],
  ['@/shared/presentation/hooks/useProtectedRoute', '@/shared/presentation/hooks/useProtectedRoute'],
  ['@/features/auth/presentation/hooks/useAuthApi', '@/features/auth/presentation/hooks/useAuthApi'],
  ['@/features/auth/presentation/hooks/useAuthHydration', '@/features/auth/presentation/hooks/useAuthHydration'],
  ['@/features/auth/presentation/hooks/useGoogleSignIn', '@/features/auth/presentation/hooks/useGoogleSignIn'],
  ['@/features/jobs/presentation/hooks/useJobApi', '@/features/jobs/presentation/hooks/useJobApi'],
  ['@/features/blog/presentation/hooks/useBlogApi', '@/features/blog/presentation/hooks/useBlogApi'],
  ['@/features/challenge/presentation/hooks/useChallengeApi', '@/features/challenge/presentation/hooks/useChallengeApi'],
  ['@/features/messaging/presentation/hooks/useMessagingApi', '@/features/messaging/presentation/hooks/useMessagingApi'],
  ['@/features/profiles/presentation/hooks/useUserApi', '@/features/profiles/presentation/hooks/useUserApi'],
  ['@/features/profiles/presentation/hooks/useMediaApi', '@/features/profiles/presentation/hooks/useMediaApi'],
  ['@/features/profiles/presentation/hooks/useStorageApi', '@/features/profiles/presentation/hooks/useStorageApi'],
  ['@/features/collab/presentation/hooks/useCollabApi', '@/features/collab/presentation/hooks/useCollabApi'],
  ['@/features/payments/presentation/hooks/usePaymentApi', '@/features/payments/presentation/hooks/usePaymentApi'],
  ['@/features/explore/presentation/hooks/useSearchApi', '@/features/explore/presentation/hooks/useSearchApi'],
  ['@/shared/presentation/ui', '@/shared/presentation/ui'],
  ['@/shared/presentation/navigation/TabScreenWrapper', '@/shared/presentation/navigation/TabScreenWrapper'],
  ['@/shared/presentation/navigation/CustomTabBar', '@/shared/presentation/navigation/CustomTabBar'],
  ['@/features/auth/presentation/components', '@/features/auth/presentation/components'],
  ['@/features/jobs/presentation/components', '@/features/jobs/presentation/components'],
  ['@/features/blog/presentation/components', '@/features/blog/presentation/components'],
  ['@/features/collab/presentation/components', '@/features/collab/presentation/components'],
  ['@/features/profiles/presentation/components/profile', '@/features/profiles/presentation/components/profile'],
  ['@/features/profiles/presentation/components/editprofile', '@/features/profiles/presentation/components/editprofile'],
  ['@/features/home/presentation/components', '@/features/home/presentation/components'],
  ['@/features/explore/presentation/components', '@/features/explore/presentation/components'],
  ['@/features/challenge/presentation/components/beatDetail', '@/features/challenge/presentation/components/beatDetail'],
  ['@/features/challenge/presentation/components/leaderboard', '@/features/challenge/presentation/components/leaderboard'],
  ['@/features/challenge/presentation/components/recordStudio', '@/features/challenge/presentation/components/recordStudio'],
  ['@/features/challenge/presentation/components/createChallenge', '@/features/challenge/presentation/components/createChallenge'],
  ['@/shared/domain/constants/colors', '@/shared/domain/constants/colors'],
  ['@/shared/domain/constants/businessTypes', '@/shared/domain/constants/businessTypes'],
  ['@/features/payments/domain/constants/payment', '@/features/payments/domain/constants/payment'],
  ['@/features/blog/domain/constants/mockBlogData', '@/features/blog/domain/constants/mockBlogData'],
  ['@/features/blog/domain/constants/blog', '@/features/blog/domain/constants/blog'],
];

function ensureDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function moveFile(fromRel, toRel) {
  const from = path.join(ROOT, fromRel);
  const to = path.join(ROOT, toRel);
  if (!fs.existsSync(from)) {
    console.warn(`SKIP (missing): ${fromRel}`);
    return;
  }
  ensureDir(to);
  fs.renameSync(from, to);
  console.log(`MOVED: ${fromRel} → ${toRel}`);
}

function rewriteImportsInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;
  for (const [from, to] of IMPORT_REPLACEMENTS) {
    if (content.includes(from)) {
      content = content.split(from).join(to);
      changed = true;
    }
  }
  if (changed) fs.writeFileSync(filePath, content);
}

function walkAndRewrite(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walkAndRewrite(full);
    else if (/\.(ts|tsx|mjs|js)$/.test(entry.name)) rewriteImportsInFile(full);
  }
}

function createThinReexport(appRel, screenImportPath) {
  const appPath = path.join(ROOT, appRel);
  ensureDir(appPath);
  fs.writeFileSync(
    appPath,
    `export { default } from '${screenImportPath}';\n`,
  );
  console.log(`REEXPORT: ${appRel}`);
}

// Execute moves
for (const [from, to] of FILE_MOVES) moveFile(from, to);
for (const [from, to] of SCREEN_MOVES) moveFile(from, to);

// Thin re-exports for moved screens
const reexports = [
  ['app/(auth)/login.tsx', '@/features/auth/presentation/screens/LoginScreen'],
  ['app/(auth)/register.tsx', '@/features/auth/presentation/screens/RegisterScreen'],
  ['app/(auth)/forgot-password.tsx', '@/features/auth/presentation/screens/ForgotPasswordScreen'],
  ['app/(auth)/reset-password.tsx', '@/features/auth/presentation/screens/ResetPasswordScreen'],
  ['app/(auth)/verify-email.tsx', '@/features/auth/presentation/screens/VerifyEmailScreen'],
  ['app/(auth)/verify-reset-code.tsx', '@/features/auth/presentation/screens/VerifyResetCodeScreen'],
  ['app/(auth)/email-verification-required.tsx', '@/features/auth/presentation/screens/EmailVerificationRequiredScreen'],
  ['app/(auth)/complete-oauth-profile.tsx', '@/features/auth/presentation/screens/CompleteOAuthProfileScreen'],
  ['app/(jobs)/detail.tsx', '@/features/jobs/presentation/screens/JobDetailScreen'],
  ['app/(jobs)/edit-job.tsx', '@/features/jobs/presentation/screens/EditJobScreen'],
  ['app/(jobs)/recruitment-form.tsx', '@/features/jobs/presentation/screens/RecruitmentFormScreen'],
  ['app/(blog)/index.tsx', '@/features/blog/presentation/screens/BlogIndexScreen'],
  ['app/(blog)/[id].tsx', '@/features/blog/presentation/screens/BlogDetailScreen'],
  ['app/(challenge)/beat-detail.tsx', '@/features/challenge/presentation/screens/BeatDetailScreen'],
  ['app/(challenge)/create.tsx', '@/features/challenge/presentation/screens/CreateChallengeScreen'],
  ['app/(challenge)/explore.tsx', '@/features/challenge/presentation/screens/ChallengeExploreScreen'],
  ['app/(challenge)/leaderboard.tsx', '@/features/challenge/presentation/screens/LeaderboardScreen'],
  ['app/(challenge)/myContent.tsx', '@/features/challenge/presentation/screens/MyContentScreen'],
  ['app/(challenge)/record.tsx', '@/features/challenge/presentation/screens/RecordScreen'],
  ['app/(challenge)/result.tsx', '@/features/challenge/presentation/screens/ResultScreen'],
  ['app/(editprofile)/editProfile.tsx', '@/features/profiles/presentation/screens/EditProfileScreen'],
  ['app/(editprofile)/venueEditProfile.tsx', '@/features/profiles/presentation/screens/VenueEditProfileScreen'],
  ['app/(profiles)/artistProfile.tsx', '@/features/profiles/presentation/screens/ArtistProfileScreen'],
  ['app/(profiles)/venueProfile.tsx', '@/features/profiles/presentation/screens/VenueProfileScreen'],
  ['app/(profiles)/collaboration.tsx', '@/features/profiles/presentation/screens/CollaborationScreen'],
  ['app/(profiles)/featuredReleases.tsx', '@/features/profiles/presentation/screens/FeaturedReleasesScreen'],
  ['app/(profiles)/jobSubmissions.tsx', '@/features/profiles/presentation/screens/JobSubmissionsScreen'],
  ['app/(profiles)/mediaGallery.tsx', '@/features/profiles/presentation/screens/MediaGalleryScreen'],
  ['app/(profiles)/portfolioGallery.tsx', '@/features/profiles/presentation/screens/PortfolioGalleryScreen'],
  ['app/(profiles)/videoGallery.tsx', '@/features/profiles/presentation/screens/VideoGalleryScreen'],
  ['app/(messages)/contactMessage.tsx', '@/features/messaging/presentation/screens/ContactMessageScreen'],
  ['app/(messages)/detailMessage.tsx', '@/features/messaging/presentation/screens/DetailMessageScreen'],
  ['app/(payments)/premium.tsx', '@/features/payments/presentation/screens/PremiumScreen'],
  ['app/(tabs)/index.tsx', '@/features/home/presentation/screens/HomeScreen'],
  ['app/(tabs)/explore.tsx', '@/features/explore/presentation/screens/ExploreScreen'],
  ['app/(tabs)/jobs.tsx', '@/features/jobs/presentation/screens/JobsTabScreen'],
  ['app/(tabs)/personal.tsx', '@/features/profiles/presentation/screens/PersonalScreen'],
  ['app/(tabs)/notifications.tsx', '@/features/messaging/presentation/screens/NotificationsScreen'],
];
for (const [appRel, importPath] of reexports) createThinReexport(appRel, importPath);

// Rewrite imports everywhere
walkAndRewrite(ROOT);

console.log('\nMigration file moves complete.');

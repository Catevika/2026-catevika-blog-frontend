import type { useCreateComment } from "@/api/commentHooks";
import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  DragEventHandler,
} from "react";
import type { IconType } from "react-icons/lib";

//------------------------------------------------------------
// Auth - User
//------------------------------------------------------------

export interface User {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  createdAt: string;
  updatedAt: string;
}

// --------------------------------------------------
// Auth - Zustand AuthStore
// --------------------------------------------------
export interface AuthStore {
  // State
  user: SerializedUser | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  persistLogin: boolean;

  // Actions
  setUser: (user: SerializedUser | null) => void;
  setInitialized: (value: boolean) => void;
  setPersistLogin: (value: boolean) => void;
}

// --------------------------------------------------
// Auth - AuthResponse for authApi
// --------------------------------------------------
export interface AuthResponse {
  user: SerializedUser;
}

// --------------------------------------------------
// Auth - Payloads
// --------------------------------------------------
export interface LoginPayload {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface SignupPayload {
  name: string;
  email: string;
  password: string;
}

// ------------------------------------------------------------
// USER - SerializedUser
// ------------------------------------------------------------

export interface SerializedUser {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  createdAt: string;
  updatedAt: string;
}

//------------------------------------------------------------
// Posts - Post Form
//------------------------------------------------------------
export interface PostFormValues {
  id?: string;
  title: string;
  slug: string;
  locked?: boolean;
  content: string;
  status: "draft" | "published";
  errors?: Record<string, string>;
  authorId: string;
}

export interface PostEditHeaderProps {
  isNew: boolean;
  status: "draft" | "published";
}

export interface PostFormProps {
  slug: string;
  locked: boolean;
  theme?: "light" | "dark";
  draft?: SerializedPost | undefined;
  originalTitle?: string;
  originalContent?: string;
  originalStatus?: "published" | "draft";
  isNew: boolean;
  isSaving?: boolean;
  postId?: string;
  saveError?: string | null;
  onTitleChange: (title: string) => void;
  onStatusChange: (status: "draft" | "published") => void;
  onSlugInput: (slug: string) => void;
  onSlugChange: (slug: string) => void;
  onToggleLocked: () => void;
  onResetAuto: () => void;
  onContentChange?: (content: string) => void;
  onReset: () => void;
  onCancel: () => void;
  onSubmit: (e: React.SyntheticEvent<HTMLFormElement, Event>) => Promise<void>;
  backendSuggestion?: string | null;
}

export interface PostActionsProps {
  hasUnsavedChanges: boolean;
  pendingUploads: number;
  isSaving: boolean;
  onSave: () => void;
  onReset: () => void;
  onCancel: () => void;
}

//------------------------------------------------------------
// Post - postApi
//------------------------------------------------------------
export interface GetPostsParams {
  page?: number;
  limit?: number;
  search?: string;
}

export type PostStatus = "draft" | "published";

export interface Post {
  id: string;
  title: string;
  slug: string;
  locked: boolean;
  content: string;
  authorId: string;
  author?: {
    id: string;
    name?: string;
    email: string;
  };
  status: PostStatus;
  liked: boolean;
  likedBy: string[];
  likeCount: number;
  deleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export type GetPostsFilters = GetPostsParams & {
  status?: PostStatus;
  deleted?: string;
  author?: string;
  [key: string]: string | number | boolean | undefined;
};

export type Draft = Post | undefined;

export interface SerializedPost {
  id: string;
  title: string;
  slug: string;
  locked: boolean;
  content: string;
  author: { id: string; name: string; email: string };
  status: "draft" | "published";
  deleted: boolean;
  likeCount: number;
  liked: boolean;
  likedBy: string[];
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface Pagination {
  totalDocs: number;
  limit: number;
  page: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  nextPage: number | null;
  prevPage: number | null;
}

export interface PaginatedPost {
  docs: SerializedPost[];
  pagination: Pagination;
}

export type PostsResponse = PaginatedPost | { error: string };

export interface LikeResponse {
  success: boolean;
  userId: string;
  liked: boolean;
  likedBy: string[];
  likeCount: number;
}

export interface LikeMutationContext {
  previousPost?: SerializedPost;
}

export type PostCreateResponse =
  | SerializedPost
  | {
      message: string;
      suggestion?: string;
      errors?: Record<string, string>;
    };

//------------------------------------------------------------
// Pagination components
//------------------------------------------------------------
export interface PaginationProps {
  page: number;
  perPage: number;
  maxPages: number;
  data: {
    total_pages: number;
    total_results: number | undefined;
  };
  handlePrevPage: () => void;
  handleNextPage: () => void;
}

export interface PostPaginationProps extends Pick<
  Pagination,
  "page" | "limit" | "totalPages" | "totalDocs"
> {
  onPrevPage: () => void;
  onNextPage: () => void;
}

//------------------------------------------------------------
// Comments
//------------------------------------------------------------

export interface Comment {
  id: string;
  postId: string;

  authorId: string | null;
  author: {
    id: string;
    name?: string;
    email: string;
  } | null;

  content: string;
  liked: boolean;
  likedBy: string[];
  likeCount: number;

  parentId: string | null;
  depth: number;
  deleted: boolean;

  replyCount: number;
  hasReplies: boolean;

  createdAt: string; // ISO string from backend
  updatedAt: string; // ISO string from backend
}

export interface SerializedComment {
  id: string;
  content: string;
  postId: string;
  authorId: string;
  author: {
    id: string;
    name: string;
    email: string;
  };
  liked: boolean;
  likedBy: string[];
  likeCount: number;
  status: string;
  parentId: string | null;
  depth: number;
  replies?: SerializedComment[];
  deleted: boolean;
  createdAt: string; // ISO string from backend
  updatedAt: string; // ISO string from backend
}

export interface CommentsResponse {
  success: boolean;
  comments: SerializedComment[];
  total: number;
}

export interface CommentsHeaderProps {
  totalComments: number;
}

export interface LikeResponse {
  success: boolean;
  liked: boolean;
  likedBy: string[];
  likeCount: number;
  comment: SerializedComment;
}

export interface PaginatedCommentsResponse {
  success: boolean;
  comments: SerializedComment[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
  pages: number;
}

export interface InfiniteCommentsData {
  pages: PaginatedCommentsResponse[];
  pageParams: number[];
  total: number;
}

export interface CommentFormSectionProps {
  isPostAuthor: boolean;
  createCommentMutation: ReturnType<typeof useCreateComment>;
}

export interface CommentFormProps {
  initialContent?: string;
  parentId?: string;
  onSubmit: (data: { content: string; parentId?: string }) => void;
  isLoading: boolean;
  placeholder?: string;
  onClose?: () => void;
}

export interface CommentItemProps {
  comment: SerializedComment;
  postId: string;
  parent?: SerializedComment | null;
}

export interface CommentListProps {
  comments: SerializedComment[];
  postId: string;
}

export interface CommentsErrorBoundaryProps {
  error: FetchError | null;
  onRetry: () => void;
}

export interface CommentsSectionProps {
  postId: string;
  postAuthorId: string | undefined;
}

export interface CommentLikeButtonProps {
  comment: SerializedComment;
  postId: string;
  parent?: SerializedComment | null;
  className?: string;
}

export interface CommentTreeProps {
  comments: SerializedComment[];
  postId: string;
}

export interface CommentNodeProps {
  comment: SerializedComment;
  postId: string;
  parent?: SerializedComment | null;
}

export interface LikeButtonProps {
  postId: string;
  postAuthorId: string | undefined;
  likedBy: string[];
  likeCount: string[] | number;
  isAuthenticated: boolean;
}

export interface CustomPdfButtonProps {
  postId: string;
  postTitle: string;
}

export interface CustomDeleteButtonProps {
  postId: string;
  postTitle: string;
  postStatus: string;
  authorId: string | undefined;
  userId: string | undefined;
}

export interface PostContentProps {
  content: string;
  className?: string;
}

// ---------------------------------------------------------
// Error type
// ---------------------------------------------------------

export interface FetchError extends Error {
  status?: number;
  headers?: Headers;
}

//------------------------------------------------------------
// Custom Buttons
//------------------------------------------------------------
export interface CustomButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: IconType;
  text?: string;
  disabled?: boolean;
}

export interface CustomPdfButtonProps {
  postId: string;
  postTitle: string;
}

export interface PostContentProps {
  content: string;
  className?: string;
}

export type MarkdownLinkProps = AnchorHTMLAttributes<HTMLAnchorElement>;

//------------------------------------------------------------
// Pexels
//------------------------------------------------------------

export interface PexelsSearchState {
  query: string;
  setQuery: (q: string) => void;
  page: number;
  setPage: (p: number) => void;
}

export interface PexelsSrc {
  original: string;
  large?: string;
  medium?: string;
}

export interface PexelsPhoto {
  id: number;
  url: string;
  alt?: string;
  photographer: string;
  photographer_url: string;
  src: PexelsSrc;
}

export interface PexelsResponse {
  page: number;
  per_page: number;
  total_results?: number;
  total_pages?: number;
  photos: PexelsPhoto[];
  next_page?: string;
  prev_page?: string;
}

// ---------------------------------------------------------
// Image uploader
// ---------------------------------------------------------

export interface UseImageUploadProps {
  onSuccess?: (imageUrl: string, fileName: string) => void;
  onError?: () => void;
}

export interface ImageUploadResponse {
  success: boolean;
  message?: string;
  data?: {
    url: string;
    duplicate: boolean;
    filename?: string;
  };
}

export interface ImageUploaderProps {
  onEnlarge?: (imageUrl: string, alt?: string) => void;
  onInsert: (markdown: string) => void;
  onDragEnter?: () => void;
  onDragLeave?: () => void;
  maxSizeMB?: number;
  className?: string;
}

//------------------------------------------------------------
// Pixel Sidebar
//------------------------------------------------------------
export interface PexelsSidebarProps {
  onInsert?: (markdown: string) => void;
}

//------------------------------------------------------------
// Pexels Photo Card
//------------------------------------------------------------
export interface PexelsPhotoCardProps {
  photo: PexelsPhoto;
  handleDragStart: (photo: PexelsPhoto) => DragEventHandler<HTMLDivElement>;
  handleClickInsert: (photo: PexelsPhoto) => void;
  handleOpenEnlarge: (photo: PexelsPhoto) => void;
}

//------------------------------------------------------------
// Lightbox
//------------------------------------------------------------
export interface LightBoxProps {
  enlargedPhoto: PexelsPhoto | null;
  handleCloseEnlarge: () => void;
}

//------------------------------------------------------------
// Slug control hook
//------------------------------------------------------------
export interface UseSlugControlProps {
  postId: string;
  draft: SerializedPost | undefined;
  updateDraft: (
    draft: (draft: SerializedPost) => Partial<SerializedPost>,
  ) => void;
}

//------------------------------------------------------------
// Slug availability hook
//------------------------------------------------------------
export interface SlugAvailability {
  loading: boolean;
  available: boolean | null;
  suggestion: string | null;
  error: string | null;
}

//------------------------------------------------------------
// SlugField
//------------------------------------------------------------
export interface SlugFieldProps {
  title: string;
  slug: string;
  locked: boolean;
  disabled?: boolean;
  error?: string | null;
  postId?: string;
  isNew: boolean;

  onSlugInput: (value: string) => void;
  onSlugChange: (value: string) => void;
  onToggleLocked: () => void;
  onResetAuto: () => void;
  backendSuggestion?: string | null;
}

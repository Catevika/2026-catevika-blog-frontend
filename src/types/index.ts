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
  logout: () => void;
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
  remember?: boolean;
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
  createdAt: Date;
  updatedAt: Date;
}

//------------------------------------------------------------
// Posts - Post Form
//------------------------------------------------------------
export interface PostFormValues {
  title: string;
  slug: string;
  locked?: boolean;
  content: string;
  status: "draft" | "published";
  errors?: Record<string, string>;
  authorId: string;
}

export interface UseSlugControlProps {
  postId: string;
  draft: Post | undefined;
  updateDraft: (draft: (draft: Post) => Partial<Post>) => void;
}

export interface PostFormProps {
  slug: string;
  locked: boolean;
  theme?: "light" | "dark";
  draft?: Post | undefined;
  originalTitle?: string;
  originalContent?: string;
  originalStatus?: "published" | "draft";
  isNew: boolean;
  isSaving?: boolean;
  postId?: string;
  saveError?: string;
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
  createdAt?: Date;
  updatedAt?: Date;
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

export interface LikePostResponse {
  success: boolean;
  userId: string;
  liked: boolean;
  likedBy: string[];
  likeCount: number;
}

export interface LikeMutationContext {
  previousPost?: Post;
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

export interface LikeButtonProps {
  postId: string;
  postAuthorId: string;
  liked: boolean;
  likeCount: string[] | number;
  isAuthenticated: boolean;
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
  draft: Post | undefined;
  updateDraft: (draft: (draft: Post) => Partial<Post>) => void;
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

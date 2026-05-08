import type { AnchorHTMLAttributes, ButtonHTMLAttributes } from "react";
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
}

export interface UseSlugControlProps {
  postId: string;
  post: Post | undefined;
  updatePost: (post: (post: Post) => Partial<Post>) => void;
}

export interface PostFormProps {
  onSubmit: (values: PostFormValues) => void;
  initialValues: PostFormValues;
  isSaving: boolean;
  saveError: string | null;
  onTitleChange: (title: string) => void;
  onSlugInput: (slug: string) => void;
  onSlugChange: (slug: string) => void;
  onToggleLocked: () => void;
  onResetAuto: () => void;
  onCancel: () => void;
  slug: string;
  locked: boolean;
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

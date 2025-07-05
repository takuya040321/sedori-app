// src/lib/types.ts
// 型定義を集約・整理

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  details?: string;
}

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

export interface SortConfig<T = string> {
  field: T;
  direction: 'asc' | 'desc';
}

export interface TableColumn {
  key: string;
  label: string;
  sortable: boolean;
  width?: number;
  minWidth?: number;
  resizable: boolean;
}

export interface LoadingState {
  isLoading: boolean;
  loadingItems: Set<string | number>;
}

export interface ErrorState {
  hasError: boolean;
  errorMessage?: string;
  errorDetails?: string;
}
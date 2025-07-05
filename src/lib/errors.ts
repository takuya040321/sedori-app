// src/lib/errors.ts
// エラーハンドリングを統一化

export class AppError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number,
    public details?: any
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class ValidationError extends AppError {
  constructor(message: string, field?: string) {
    super(message, "VALIDATION_ERROR", 400, { field });
    this.name = "ValidationError";
  }
}

export class NetworkError extends AppError {
  constructor(message: string = "ネットワークエラーが発生しました") {
    super(message, "NETWORK_ERROR", 0);
    this.name = "NetworkError";
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = "データ") {
    super(`${resource}が見つかりません`, "NOT_FOUND", 404);
    this.name = "NotFoundError";
  }
}

export class ServerError extends AppError {
  constructor(message: string = "サーバーエラーが発生しました") {
    super(message, "SERVER_ERROR", 500);
    this.name = "ServerError";
  }
}

/**
 * エラーを適切な型に変換
 */
export function normalizeError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error;
  }
  
  if (error instanceof Error) {
    return new AppError(error.message);
  }
  
  return new AppError("不明なエラーが発生しました");
}

/**
 * エラーメッセージをユーザー向けに変換
 */
export function getUserFriendlyErrorMessage(error: unknown): string {
  const normalizedError = normalizeError(error);
  
  switch (normalizedError.code) {
    case "VALIDATION_ERROR":
      return normalizedError.message;
    case "NETWORK_ERROR":
      return "ネットワーク接続を確認してください";
    case "NOT_FOUND":
      return normalizedError.message;
    case "SERVER_ERROR":
      return "一時的なエラーが発生しました。しばらく待ってから再試行してください";
    default:
      return normalizedError.message || "エラーが発生しました";
  }
}

/**
 * エラーログを出力
 */
export function logError(error: unknown, context?: string): void {
  const normalizedError = normalizeError(error);
  
  console.error(`[${context || "ERROR"}]`, {
    message: normalizedError.message,
    code: normalizedError.code,
    statusCode: normalizedError.statusCode,
    details: normalizedError.details,
    stack: normalizedError.stack,
  });
}
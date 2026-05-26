import {
  buildProblemDetails,
  PROBLEM_TYPE_MAP,
  type ProblemDetails,
} from "./problem-details";


export class AppError extends Error {
  
  public type: string;
  
  public title: string;
  
  public status: number;

  constructor(
    public message: string,
    public statusCode: number = 500,
    public errors: Record<string, unknown> | null = null,
    typeOverride?: string,
    titleOverride?: string,
  ) {
    super(message);
    this.name = this.constructor.name;
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }

    const defaults = PROBLEM_TYPE_MAP[statusCode] ?? {
      type: "about:blank",
      title: "Unknown Error",
    };
    this.status = statusCode;
    this.type = typeOverride ?? defaults.type;
    this.title = titleOverride ?? defaults.title;
  }

  
  toProblemDetails(instance: string = "unknown"): ProblemDetails {
    return buildProblemDetails(
      this.statusCode,
      this.message,
      instance,
      this.errors,
      { type: this.type, title: this.title },
    );
  }
}


export class ValidationError extends AppError {
  constructor(
    message: string = "Validation failed",
    errors: Record<string, unknown> | null = null,
  ) {
    super(
      message,
      400,
      errors,
      "/problems/validation-error",
      "Validation Error",
    );
  }
}


export class BadRequestError extends AppError {
  constructor(
    message: string = "Bad request",
    errors: Record<string, unknown> | null = null,
  ) {
    super(message, 400, errors);
  }
}


export class UnauthorizedError extends AppError {
  constructor(message: string = "Authentication required") {
    super(message, 401);
  }
}


export class OAuthError extends AppError {
  constructor(
    message: string = "OAuth authentication failed",
    errors: Record<string, unknown> | null = null,
  ) {
    super(message, 401, errors, "/problems/oauth-error", "OAuth Error");
  }
}


export class TokenExpiredError extends AppError {
  constructor(message: string = "Token has expired") {
    super(message, 401, null, "/problems/token-expired", "Token Expired");
  }
}


export class InvalidTokenError extends AppError {
  constructor(message: string = "Invalid token") {
    super(message, 401, null, "/problems/invalid-token", "Invalid Token");
  }
}


export class AudienceMismatchError extends OAuthError {
  constructor(message: string = "Token audience mismatch") {
    super(message);
    this.type = "/problems/audience-mismatch";
    this.title = "Audience Mismatch";
  }
}


export class IssuerMismatchError extends OAuthError {
  constructor(message: string = "Token issuer mismatch") {
    super(message);
    this.type = "/problems/issuer-mismatch";
    this.title = "Issuer Mismatch";
  }
}


export class ForbiddenError extends AppError {
  constructor(message: string = "Access forbidden") {
    super(message, 403);
  }
}


export class NotFoundError extends AppError {
  constructor(message: string = "Resource not found") {
    super(message, 404);
  }
}


export class ConflictError extends AppError {
  constructor(message: string = "Resource already exists") {
    super(message, 409);
  }
}


export class TooManyRequestsError extends AppError {
  constructor(
    message: string = "Too many requests",
    public retryAfter?: number,
  ) {
    super(message, 429);
  }
}


export class InternalServerError extends AppError {
  constructor(message: string = "Internal server error") {
    super(message, 500);
  }
}

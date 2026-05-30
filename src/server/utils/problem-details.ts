


export interface ProblemDetails {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance: string;
  errors?: Record<string, unknown> | null;
}


export const PROBLEM_TYPE_MAP: Record<
  number,
  { type: string; title: string }
> = {
  400: {
    type: "/problems/bad-request",
    title: "Bad Request",
  },
  401: {
    type: "/problems/unauthorized",
    title: "Unauthorized",
  },
  403: {
    type: "/problems/forbidden",
    title: "Forbidden",
  },
  404: {
    type: "/problems/not-found",
    title: "Not Found",
  },
  409: {
    type: "/problems/conflict",
    title: "Conflict",
  },
  422: {
    type: "/problems/unprocessable-entity",
    title: "Unprocessable Entity",
  },
  429: {
    type: "/problems/too-many-requests",
    title: "Too Many Requests",
  },
  500: {
    type: "/problems/internal-server-error",
    title: "Internal Server Error",
  },
  503: {
    type: "/problems/service-unavailable",
    title: "Service Unavailable",
  },
};


export function buildProblemDetails(
  status: number,
  detail: string,
  instance: string,
  errors?: Record<string, unknown> | null,
  overrides?: Partial<Pick<ProblemDetails, "type" | "title">>,
): ProblemDetails {
  const defaults = PROBLEM_TYPE_MAP[status] ?? {
    type: "about:blank",
    title: "Unknown Error",
  };

  return {
    type: overrides?.type ?? defaults.type,
    title: overrides?.title ?? defaults.title,
    status,
    detail,
    instance,
    ...(errors !== undefined && errors !== null ? { errors } : {}),
  };
}

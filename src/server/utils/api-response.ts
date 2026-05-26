import { NextRequest, NextResponse } from "next/server";
import { buildProblemDetails, type ProblemDetails } from "./problem-details";



type SuccessResponse<T> = {
  success: true;
  message: string;
  data: T;
};




export class ApiResponse {
  

  static success<T>(
    data: T,
    message: string = "Success",
    status: number = 200,
    headers?: HeadersInit
  ): NextResponse<SuccessResponse<T>> {
    return NextResponse.json(
      {
        success: true,
        message,
        data,
      },
      { 
        status,
        headers 
      }
    );
  }

  

  
  static error(
    detail: string = "Internal Server Error",
    status: number = 500,
    errors: Record<string, unknown> | null = null,
    req?: NextRequest,
    headers?: HeadersInit
  ): NextResponse<ProblemDetails & { success: false; message: string }> {
    const instance = req?.nextUrl?.pathname ?? "unknown";

    const body = buildProblemDetails(status, detail, instance, errors);
    const compatBody = {
      ...body,
      success: false as const,
      message: detail,
    };

    return NextResponse.json(compatBody, {
      status,
      headers: {
        "Content-Type": "application/problem+json",
        ...Object.fromEntries(new Headers(headers).entries()),
      },
    });
  }

  
  static problemDetails(
    problem: ProblemDetails,
    headers?: HeadersInit
  ): NextResponse<ProblemDetails> {
    return NextResponse.json(problem, {
      status: problem.status,
      headers: {
        "Content-Type": "application/problem+json",
        ...Object.fromEntries(new Headers(headers).entries()),
      },
    });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { brotliCompress, gzip } from "zlib";
import { promisify } from "util";

const gzipAsync = promisify(gzip);
const brotliAsync = promisify(brotliCompress);

const COMPRESSION_THRESHOLD = 1024; 


export async function compressResponse(
  response: NextResponse,
  req: NextRequest,
): Promise<NextResponse> {
  const acceptEncoding = req.headers.get("accept-encoding") ?? "";
  const body = await response.clone().text();

  if (Buffer.byteLength(body, "utf-8") < COMPRESSION_THRESHOLD) {
    return response;
  }

  let compressed: Buffer;
  let encoding: string;

  if (acceptEncoding.includes("br")) {
    compressed = await brotliAsync(body);
    encoding = "br";
  } else if (acceptEncoding.includes("gzip")) {
    compressed = await gzipAsync(body);
    encoding = "gzip";
  } else {
    return response;
  }

  const headers = new Headers(response.headers);
  headers.set("Content-Encoding", encoding);
  headers.set("Content-Length", compressed.length.toString());
  headers.set("Vary", "Accept-Encoding");

  return new NextResponse(new Uint8Array(compressed), { status: response.status, headers });
}

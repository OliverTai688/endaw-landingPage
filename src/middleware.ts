import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { contactRateLimit } from "@/lib/ratelimit";

export async function middleware(request: NextRequest) {
    // Only apply to the contact form submission
    if (
        request.nextUrl.pathname === "/contact" &&
        request.method === "POST"
    ) {
        const forwarded = request.headers.get("x-forwarded-for");
        const ip = forwarded ? forwarded.split(",")[0] : (request.headers.get("x-real-ip") || "127.0.0.1");
        const { success, limit, reset, remaining } = await contactRateLimit.limit(ip);

        if (!success) {
            return new NextResponse("Too Many Requests", {
                status: 429,
                headers: {
                    "X-RateLimit-Limit": limit.toString(),
                    "X-RateLimit-Remaining": remaining.toString(),
                    "X-RateLimit-Reset": reset.toString(),
                },
            });
        }

        // Origin/Referer Validation (Basic)
        const origin = request.headers.get("origin");
        const referer = request.headers.get("referer");
        const host = request.headers.get("host");

        if (origin && !origin.includes(host || "")) {
            return new NextResponse("Invalid Origin", { status: 403 });
        }

        if (referer && !referer.includes("/contact")) {
            // Allow if it's the home page or contact page
            if (!referer.includes(host || "")) {
                return new NextResponse("Invalid Referer", { status: 403 });
            }
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/contact"],
};

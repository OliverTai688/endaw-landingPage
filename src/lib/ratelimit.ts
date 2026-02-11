import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

// Create a new Redis instance
const redis = new Redis({
    url: process.env.UPSTASH_REDIS_KV_REST_API_URL!,
    token: process.env.UPSTASH_REDIS_KV_REST_API_TOKEN!,
});

// Create a new Ratelimit instance
export const contactRateLimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, "10 m"), // 5 requests per 10 minutes
    analytics: true,
    prefix: "ratelimit:contact",
});

export { redis };

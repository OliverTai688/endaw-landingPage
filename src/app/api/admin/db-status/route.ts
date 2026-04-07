import { NextResponse } from "next/server";
import { RepositoryFactory } from "@/infrastructure/RepositoryFactory";

export async function GET() {
    try {
        const connected = await RepositoryFactory.isDatabaseConnected();
        return NextResponse.json({ connected });
    } catch (error) {
        return NextResponse.json({ connected: false });
    }
}

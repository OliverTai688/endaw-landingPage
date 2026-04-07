import { NextResponse } from "next/server";
import { RepositoryFactory } from "@/infrastructure/RepositoryFactory";
import { AnnouncementService } from "@/application/use-cases/AnnouncementUseCases";

export async function GET() {
    const repo = await RepositoryFactory.getAnnouncementRepository();
    const service = new AnnouncementService(repo);
    const announcements = await service.getAllAnnouncements();
    return NextResponse.json(announcements);
}

export async function POST(req: Request) {
    const data = await req.json();
    const repo = await RepositoryFactory.getAnnouncementRepository();
    const service = new AnnouncementService(repo);
    const { month, ...rest } = data;
    const result = await service.createOrUpdateAnnouncement(month, rest);
    return NextResponse.json(result);
}

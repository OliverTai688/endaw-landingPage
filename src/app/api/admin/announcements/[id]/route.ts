import { NextResponse } from "next/server";
import { RepositoryFactory } from "@/infrastructure/RepositoryFactory";
import { AnnouncementService } from "@/application/use-cases/AnnouncementUseCases";

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const repo = await RepositoryFactory.getAnnouncementRepository();
    const service = new AnnouncementService(repo);
    await service.deleteAnnouncement(id);
    return NextResponse.json({ success: true });
}

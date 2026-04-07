import { MonthlyAnnouncement } from "@prisma/client";
import { IAnnouncementRepository } from "../../infrastructure/repositories/IAnnouncementRepository";

export class AnnouncementService {
    constructor(private repository: IAnnouncementRepository) {}

    async getAllAnnouncements(): Promise<MonthlyAnnouncement[]> {
        return this.repository.getAllAnnouncements();
    }

    async getAnnouncementByMonth(month: string): Promise<MonthlyAnnouncement | null> {
        return this.repository.getAnnouncementByMonth(month);
    }

    async createOrUpdateAnnouncement(month: string, data: Partial<MonthlyAnnouncement>): Promise<MonthlyAnnouncement> {
        const existing = await this.repository.getAnnouncementByMonth(month);
        if (existing) {
            return this.repository.updateAnnouncement(existing.id, data);
        } else {
            return this.repository.createAnnouncement({ ...data, month });
        }
    }

    async deleteAnnouncement(id: string): Promise<void> {
        return this.repository.deleteAnnouncement(id);
    }
}

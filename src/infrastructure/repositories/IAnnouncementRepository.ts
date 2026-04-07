import { MonthlyAnnouncement } from "@prisma/client";

export interface IAnnouncementRepository {
    getAllAnnouncements(): Promise<MonthlyAnnouncement[]>;
    getAnnouncementById(id: string): Promise<MonthlyAnnouncement | null>;
    getAnnouncementByMonth(month: string): Promise<MonthlyAnnouncement | null>;
    createAnnouncement(data: Partial<MonthlyAnnouncement>): Promise<MonthlyAnnouncement>;
    updateAnnouncement(id: string, data: Partial<MonthlyAnnouncement>): Promise<MonthlyAnnouncement>;
    deleteAnnouncement(id: string): Promise<void>;
    isDatabaseConnected(): Promise<boolean>;
}

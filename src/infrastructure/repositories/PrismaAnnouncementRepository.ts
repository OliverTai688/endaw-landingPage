import { MonthlyAnnouncement } from "@prisma/client";
import { IAnnouncementRepository } from "./IAnnouncementRepository";
import prisma from "../../lib/prisma";

export class PrismaAnnouncementRepository implements IAnnouncementRepository {
    async getAllAnnouncements(): Promise<MonthlyAnnouncement[]> {
        return prisma.monthlyAnnouncement.findMany({
            orderBy: { month: 'desc' }
        });
    }

    async getAnnouncementById(id: string): Promise<MonthlyAnnouncement | null> {
        return prisma.monthlyAnnouncement.findUnique({
            where: { id }
        });
    }

    async getAnnouncementByMonth(month: string): Promise<MonthlyAnnouncement | null> {
        return prisma.monthlyAnnouncement.findUnique({
            where: { month }
        });
    }

    async createAnnouncement(data: Partial<MonthlyAnnouncement>): Promise<MonthlyAnnouncement> {
        if (!data.month) throw new Error("Month is required");
        return prisma.monthlyAnnouncement.create({
            data: {
                month: data.month,
                instrumentIds: data.instrumentIds || [],
                schedule: data.schedule || {},
                announcements: data.announcements || [],
            }
        });
    }

    async updateAnnouncement(id: string, data: Partial<MonthlyAnnouncement>): Promise<MonthlyAnnouncement> {
        return prisma.monthlyAnnouncement.update({
            where: { id },
            data: {
                month: data.month,
                instrumentIds: data.instrumentIds,
                schedule: data.schedule || undefined,
                announcements: data.announcements,
            }
        });
    }

    async deleteAnnouncement(id: string): Promise<void> {
        await prisma.monthlyAnnouncement.delete({
            where: { id }
        });
    }

    async isDatabaseConnected(): Promise<boolean> {
        try {
            await prisma.$queryRaw`SELECT 1`;
            return true;
        } catch (e) {
            return false;
        }
    }
}

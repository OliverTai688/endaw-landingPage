import { IContentRepository } from "./repositories/IContentRepository";
import { WebContentRepository } from "./repositories/WebContentRepository";

export class RepositoryFactory {
    private static inMemoryInstance: IContentRepository | null = null;
    private static prismaInstance: IContentRepository | null = null;
    private static webInstance: WebContentRepository | null = null;

    static async isDatabaseConnected(): Promise<boolean> {
        // Safe check for both client and server
        if (typeof window !== 'undefined') {
            return !!process.env.NEXT_PUBLIC_DATABASE_URL;
        }
        // Basic check for environment variable existence
        return !!process.env.DATABASE_URL;
    }

    static async getRepository(): Promise<IContentRepository> {
        // If on the client, always use the Web (API) repository
        if (typeof window !== 'undefined') {
            if (!this.webInstance) {
                console.log('Using WebContentRepository on client');
                this.webInstance = new WebContentRepository();
            }
            return this.webInstance;
        }

        // On the server, decide between Prisma and InMemory
        const isConnected = await this.isDatabaseConnected();
        console.log('RepositoryFactory: isDatabaseConnected =', isConnected);

        if (isConnected) {
            try {
                if (!this.prismaInstance) {
                    console.log('Attempting to load PrismaContentRepository...');
                    const { PrismaContentRepository } = await import("./repositories/PrismaContentRepository");
                    this.prismaInstance = new PrismaContentRepository();
                    console.log('PrismaContentRepository loaded');
                }
                return this.prismaInstance;
            } catch (error) {
                console.error('Failed to load PrismaContentRepository, falling back to InMemory:', error);
            }
        }

        if (!this.inMemoryInstance) {
            console.log('Using InMemoryContentRepository');
            const { InMemoryContentRepository } = await import("./repositories/InMemoryContentRepository");
            this.inMemoryInstance = new InMemoryContentRepository();
        }
        return this.inMemoryInstance;
    }
}

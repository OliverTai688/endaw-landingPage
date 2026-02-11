import { ContentEntity, ContentType } from "../../domain/models/Content";
import { IContentRepository } from "./IContentRepository";

/**
 * Stub implementation for Database repository.
 * In a real scenario, this would use Prisma or another ORM.
 */
export class DatabaseContentRepository implements IContentRepository {
    async create(content: Omit<ContentEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<ContentEntity> {
        console.log("DB: Creating content", content);
        throw new Error("Database not configured");
    }

    async update(id: string, content: Partial<ContentEntity>): Promise<ContentEntity> {
        console.log("DB: Updating content", id, content);
        throw new Error("Database not configured");
    }

    async delete(id: string): Promise<void> {
        console.log("DB: Deleting content", id);
        throw new Error("Database not configured");
    }

    async findAllByType(type: ContentType): Promise<ContentEntity[]> {
        console.log("DB: Fetching all by type", type);
        return []; // Return empty for stub
    }

    async findById(id: string): Promise<ContentEntity | null> {
        console.log("DB: Finding by ID", id);
        return null;
    }
}

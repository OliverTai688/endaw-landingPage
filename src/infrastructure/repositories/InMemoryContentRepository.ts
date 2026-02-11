import { ContentEntity, ContentType } from "../../domain/models/Content";
import { IContentRepository } from "./IContentRepository";

export class InMemoryContentRepository implements IContentRepository {
    private contents: ContentEntity[] = [];

    async create(content: Omit<ContentEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<ContentEntity> {
        const newContent: ContentEntity = {
            ...content,
            id: Math.random().toString(36).substr(2, 9),
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        this.contents.push(newContent);
        return newContent;
    }

    async update(id: string, content: Partial<ContentEntity>): Promise<ContentEntity> {
        const index = this.contents.findIndex((c) => c.id === id);
        if (index === -1) throw new Error("Content not found");

        const updatedContent = {
            ...this.contents[index],
            ...content,
            updatedAt: new Date(),
        };
        this.contents[index] = updatedContent;
        return updatedContent;
    }

    async delete(id: string): Promise<void> {
        this.contents = this.contents.filter((c) => c.id !== id);
    }

    async findAllByType(type: ContentType): Promise<ContentEntity[]> {
        return this.contents.filter((c) => c.contentType === type);
    }

    async findById(id: string): Promise<ContentEntity | null> {
        return this.contents.find((c) => c.id === id) || null;
    }
}

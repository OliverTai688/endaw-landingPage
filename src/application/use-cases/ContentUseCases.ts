import { ContentEntity, ContentType, PublishStatus } from "../../domain/models/Content";
import { IContentRepository } from "../../infrastructure/repositories/IContentRepository";

export class ContentService {
    constructor(private repository: IContentRepository) { }

    async getContentsByType(type: ContentType): Promise<ContentEntity[]> {
        return this.repository.findAllByType(type);
    }

    async createContent(data: Omit<ContentEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<ContentEntity> {
        return this.repository.create(data);
    }

    async updateContent(id: string, data: Partial<ContentEntity>): Promise<ContentEntity> {
        return this.repository.update(id, data);
    }

    async deleteContent(id: string): Promise<void> {
        return this.repository.delete(id);
    }

    async setStatus(id: string, status: PublishStatus): Promise<ContentEntity> {
        return this.repository.update(id, { publishStatus: status });
    }

    async togglePublishStatus(id: string): Promise<ContentEntity> {
        const content = await this.repository.findById(id);
        if (!content) throw new Error("Content not found");

        const newStatus = content.publishStatus === PublishStatus.PUBLISHED
            ? PublishStatus.DRAFT
            : PublishStatus.PUBLISHED;

        return this.setStatus(id, newStatus);
    }

    async findById(id: string): Promise<ContentEntity | null> {
        return this.repository.findById(id);
    }
}

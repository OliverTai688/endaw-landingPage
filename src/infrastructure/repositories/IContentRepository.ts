import { ContentEntity, ContentType } from "../../domain/models/Content";

export interface IContentRepository {
    create(content: Omit<ContentEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<ContentEntity>;
    update(id: string, content: Partial<ContentEntity>): Promise<ContentEntity>;
    delete(id: string): Promise<void>;
    findAllByType(type: ContentType): Promise<ContentEntity[]>;
    findById(id: string): Promise<ContentEntity | null>;
}

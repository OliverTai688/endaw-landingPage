import { ContentEntity, ContentType } from "../../domain/models/Content";
import { IContentRepository } from "./IContentRepository";

export class WebContentRepository implements IContentRepository {
    private async handleResponse<T>(res: Response): Promise<T> {
        const text = await res.text();
        if (!res.ok) {
            console.error(`API Error (${res.status}): ${text}`);
            throw new Error(`API Error: ${res.status} - ${text}`);
        }
        try {
            return text ? JSON.parse(text) : {} as T;
        } catch (e) {
            console.error("Failed to parse JSON. Raw response:", text);
            throw e;
        }
    }

    async create(content: Omit<ContentEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<ContentEntity> {
        const res = await fetch('/api/content', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(content)
        });
        return this.handleResponse<ContentEntity>(res);
    }

    async update(id: string, content: Partial<ContentEntity>): Promise<ContentEntity> {
        const res = await fetch('/api/content', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, ...content })
        });
        return this.handleResponse<ContentEntity>(res);
    }

    async delete(id: string): Promise<void> {
        const res = await fetch(`/api/content?id=${id}`, { method: 'DELETE' });
        await this.handleResponse<void>(res);
    }

    async findAllByType(type: ContentType): Promise<ContentEntity[]> {
        const res = await fetch(`/api/content?type=${type}`);
        return this.handleResponse<ContentEntity[]>(res);
    }

    async findById(id: string): Promise<ContentEntity | null> {
        const res = await fetch(`/api/content?id=${id}`);
        const data = await this.handleResponse<any>(res);
        return Array.isArray(data) ? data[0] : data;
    }

    async togglePublishStatus(id: string): Promise<ContentEntity> {
        const res = await fetch(`/api/content?id=${id}&action=togglePublish`, { method: 'PATCH' });
        return this.handleResponse<ContentEntity>(res);
    }

    async setStatus(id: string, status: string): Promise<ContentEntity> {
        const res = await fetch(`/api/content?id=${id}&action=setStatus`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
        });
        return this.handleResponse<ContentEntity>(res);
    }
}

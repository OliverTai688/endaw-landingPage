import { NextRequest, NextResponse } from "next/server";
import { RepositoryFactory } from "@/infrastructure/RepositoryFactory";
import { ContentService } from "@/application/use-cases/ContentUseCases";
import { ContentMapper } from "@/application/mappers/ContentMapper";
import { ContentType, ContentDomain } from "@/domain/models/Content";
import { CreateContentInput } from "@/domain/schemas/ContentSchema";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const type = searchParams.get("type") as ContentType;
        const id = searchParams.get("id");

        const repository = await RepositoryFactory.getRepository();
        const service = new ContentService(repository);

        if (id) {
            const content = await service.findById(id);
            if (!content) {
                return NextResponse.json({ error: "Content not found" }, { status: 404 });
            }
            return NextResponse.json(ContentMapper.toDTO(content));
        }

        if (type) {
            const contents = await service.getContentsByType(type);
            return NextResponse.json(contents.map(ContentMapper.toDTO));
        }

        return NextResponse.json({ error: "Missing type or id parameter" }, { status: 400 });
    } catch (error: any) {
        console.error("BFF Error:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        
        // 1. Domain Validation
        const validatedData = ContentDomain.validate(body);
        
        // 2. Domain Creation (Business Rules)
        const contentToCreate = ContentDomain.create(validatedData);

        const repository = await RepositoryFactory.getRepository();
        const service = new ContentService(repository);

        const content = await service.createContent(contentToCreate);
        return NextResponse.json(ContentMapper.toDTO(content), { status: 201 });
    } catch (error: any) {
        console.error("BFF Error:", error);
        if (error.name === "ZodError") {
            return NextResponse.json({ error: "Validation Failed", details: error.errors }, { status: 400 });
        }
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}

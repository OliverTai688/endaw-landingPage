import 'dotenv/config';
import { PrismaClient, ContentType, PublishStatus } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import { workshops } from '../data/workshops';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding workshops from static data...');

  for (const w of workshops) {
    // Check if already exists by title
    const existing = await prisma.content.findFirst({
      where: { title: w.title, type: ContentType.WORKSHOP },
    });

    if (existing) {
      console.log(`  Skipping "${w.title}" (already exists)`);
      continue;
    }

    const status =
      w.status === 'published'
        ? PublishStatus.PUBLISHED
        : w.status === 'closed'
          ? PublishStatus.ARCHIVED
          : PublishStatus.DRAFT;

    // Store rich data in metadata JSON — use JSON roundtrip to strip interface types
    const metadata = JSON.parse(JSON.stringify({
      instructor: w.instructor,
      schedule: {
        date: w.schedule.date.toISOString(),
        location: w.schedule.location,
        duration: w.schedule.duration,
      },
      capacity: w.capacity,
      registrationDeadline: w.registrationDeadline.toISOString(),
      policies: w.policies,
      seo: w.seo,
      galleryImages: w.galleryImages,
      originalId: w.id,
    }));

    await prisma.content.create({
      data: {
        title: w.title,
        subtitle: w.subtitle,
        description: w.description,
        coverImage: w.coverImage,
        price: w.price,
        type: ContentType.WORKSHOP,
        status,
        tags: w.tags,
        metadata,
        workshop: {
          create: {
            location: w.schedule.location,
            duration: w.schedule.duration,
            totalCap: w.capacity.total,
            remCap: w.capacity.remaining,
          },
        },
      },
    });

    console.log(`  Created workshop "${w.title}"`);
  }

  console.log('Done seeding workshops!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

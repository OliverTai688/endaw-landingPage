import 'dotenv/config';
import { PrismaClient, PublishStatus } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import { instruments, monthlyAnnouncements } from '../data/music';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding music instruments from static data...');

  for (const inst of instruments) {
    const existing = await prisma.musicInstrument.findUnique({
      where: { nameEn: inst.nameEn },
    });

    if (existing) {
      console.log(`  Skipping "${inst.name}" (already exists)`);
      continue;
    }

    await prisma.musicInstrument.create({
      data: {
        name: inst.name,
        nameEn: inst.nameEn,
        coverImage: inst.coverImage,
        description: inst.description,
        containsEquipment: inst.containsEquipment,
        equipmentDescription: inst.equipmentDescription || null,
        rentalAvailable: inst.rentalAvailable,
        rentalOffsetAllowed: inst.rentalOffsetAllowed,
        levels: {
          create: inst.levels.map((level, li) => ({
            name: level.name,
            sortOrder: li,
            packages: {
              create: level.packages.map((pkg) => ({
                name: pkg.name,
                lessonCount: pkg.lessonCount,
                bonusLessons: pkg.bonusLessons,
                validDuration: pkg.validDuration,
                firstClassDate: pkg.firstClassDate,
                registrationStartDates: pkg.registrationStartDates,
                formationRequired: pkg.formationRequired,
                formationDecisionDays: pkg.formationDecisionDays,
                refundPolicy: pkg.refundPolicy,
                price: pkg.price,
                status:
                  pkg.status === 'published'
                    ? PublishStatus.PUBLISHED
                    : PublishStatus.DRAFT,
                includedEquipment: pkg.includedEquipment || [],
                highlights: pkg.highlights || [],
              })),
            },
          })),
        },
        faqs: {
          create: inst.faqs.map((faq, fi) => ({
            question: faq.question,
            answer: faq.answer,
            sortOrder: fi,
          })),
        },
      },
    });

    console.log(
      `  Created "${inst.name}" (${inst.levels.length} levels, ${inst.faqs.length} FAQs)`
    );
  }

  // Seed monthly announcements
  console.log('Seeding monthly announcements...');
  for (const ann of monthlyAnnouncements) {
    const existing = await prisma.monthlyAnnouncement.findUnique({
      where: { month: ann.month },
    });

    if (existing) {
      console.log(`  Skipping announcement for ${ann.month} (already exists)`);
      continue;
    }

    // Convert schedule to JSON-serializable format
    const scheduleJson = ann.schedule.map((s) => ({
      date: s.date.toISOString(),
      time: s.time,
      instructor: s.instructor,
      type: s.type,
    }));

    await prisma.monthlyAnnouncement.create({
      data: {
        month: ann.month,
        instrumentIds: ann.instruments,
        schedule: scheduleJson,
        announcements: ann.announcements,
      },
    });

    console.log(`  Created announcement for ${ann.month}`);
  }

  console.log('Done seeding music data!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

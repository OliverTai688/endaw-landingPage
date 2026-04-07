import 'dotenv/config';
import { PrismaClient, ProductStatus } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import { products } from '../data/products';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

function parsePrice(priceStr: string): { price: number; currency: string } {
  // "$129 USD" → { price: 129, currency: "USD" }
  const match = priceStr.match(/\$(\d+)\s+(\w+)/);
  if (!match) return { price: 0, currency: 'USD' };
  return { price: parseInt(match[1], 10), currency: match[2] };
}

async function main() {
  console.log('Seeding products from static data...');

  for (const p of products) {
    const { price, currency } = parsePrice(p.price);

    // Build variants array from object format { colors: [], kits: [] }
    const variants: { type: string; value: string; priceAdj: number }[] = [];
    if (p.variants) {
      for (const [type, values] of Object.entries(p.variants)) {
        for (const value of values as string[]) {
          variants.push({ type, value, priceAdj: 0 });
        }
      }
    }

    // Build specs - static data has string[], DB wants label+value
    // Use full string as value, derive label from first part before " — " if present
    const specs = p.specs.map((s: string, i: number) => {
      const dashIdx = s.indexOf(' — ');
      if (dashIdx > 0) {
        return { label: s.substring(0, dashIdx), value: s.substring(dashIdx + 3), sortOrder: i };
      }
      return { label: '', value: s, sortOrder: i };
    });

    // Build images
    const images = p.images.map((url: string, i: number) => ({
      url,
      alt: `${p.name} image ${i + 1}`,
      sortOrder: i,
      isPrimary: i === 0,
    }));

    const existing = await prisma.product.findUnique({ where: { slug: p.id } });

    if (existing) {
      console.log(`  Skipping "${p.name}" (already exists)`);
      continue;
    }

    await prisma.product.create({
      data: {
        slug: p.id,
        name: p.name,
        slogan: p.slogan,
        shortDescription: p.shortDescription,
        description: p.description,
        price,
        currency,
        status: ProductStatus.PUBLISHED,
        images: { create: images },
        variants: { create: variants },
        specs: { create: specs },
        inventory: { create: { currentStock: 0, lowThreshold: 5 } },
      },
    });

    console.log(`  Created "${p.name}" (${images.length} images, ${specs.length} specs, ${variants.length} variants)`);
  }

  console.log('Done!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

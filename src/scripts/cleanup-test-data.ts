import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import * as dotenv from "dotenv";
import { join } from "path";

// Load environment variables
dotenv.config({ path: join(process.cwd(), ".env.local") });
dotenv.config({ path: join(process.cwd(), ".env") });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    console.error("DATABASE_URL is not defined.");
    process.exit(1);
}

const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log("Starting data cleanup...");
    console.log("Connecting to database...");

    try {
        // Models to clear
        const tables = [
            'monthlyAnnouncement',
            'orderItem',
            'refund',
            'order',
            'customer',
            'stockAdjustment',
            'productInventory',
            'productVariant',
            'productImage',
            'productSpec',
            'product',
            'workshop',
            'musicMetadata',
            'contentRevision',
            'content',
            'banner',
            'musicFAQ',
            'musicPackage',
            'musicLevel',
            'musicInstrument',
            'instructor'
        ];

        for (const table of tables) {
            try {
                // @ts-ignore
                const result = await prisma[table].deleteMany({});
                console.log(`Deleted ${result.count} from ${table}.`);
            } catch (e: any) {
                console.warn(`Could not clear table ${table}: ${e.message}`);
            }
        }

        console.log("Cleanup completed successfully.");
    } catch (error) {
        console.error("Error during cleanup:", error);
    } finally {
        await prisma.$disconnect();
        await pool.end();
    }
}

main();

import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import Navbar from "@/components/navbar";
import MusicCheckoutFlow from "./MusicCheckoutFlow";

interface Props {
  params: Promise<{ instrument: string }>;
  searchParams: Promise<{ packageId?: string }>;
}

export default async function MusicCheckoutPage({ params, searchParams }: Props) {
  const { instrument } = await params;
  const { packageId } = await searchParams;

  if (!packageId) notFound();

  const pkg = await prisma.musicPackage.findUnique({
    where: { id: packageId },
    include: {
      level: {
        include: {
          instrument: { select: { name: true, nameEn: true, rentalAvailable: true, rentalPrice: true } },
        },
      },
    },
  });

  if (!pkg || pkg.status !== "PUBLISHED") notFound();

  return (
    <>
      <Navbar />
      <MusicCheckoutFlow
        pkg={{
          id: pkg.id,
          name: pkg.name,
          price: pkg.price,
          lessonCount: pkg.lessonCount,
          bonusLessons: pkg.bonusLessons,
          validDuration: pkg.validDuration,
          instrumentName: pkg.level.instrument.name,
          levelName: pkg.level.name,
          rentalAvailable: pkg.level.instrument.rentalAvailable,
          rentalPrice: pkg.level.instrument.rentalPrice,
        }}
        instrument={instrument}
      />
    </>
  );
}

export async function generateMetadata({ searchParams }: Props) {
  const { packageId } = await searchParams;
  if (!packageId) return { title: "結帳 | ENDAW" };
  const pkg = await prisma.musicPackage.findUnique({
    where: { id: packageId },
    select: { name: true },
  });
  return { title: `報名 — ${pkg?.name ?? "課程"} | ENDAW` };
}

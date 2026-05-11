import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import CheckoutFlow from "./CheckoutFlow";
import Navbar from "@/components/navbar";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function WorkshopCheckoutPage({ params }: Props) {
  const { id } = await params;

  const content = await prisma.content.findUnique({
    where: { id },
    include: { workshop: true },
  });

  if (!content || content.type !== "WORKSHOP" || content.status !== "PUBLISHED") {
    notFound();
  }

  const remCap = content.workshop?.remCap ?? 20;

  if (remCap <= 0) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-black text-white flex items-center justify-center">
          <div className="text-center">
            <p className="text-2xl font-light mb-2">已額滿</p>
            <p className="text-gray-400 text-sm">此工作坊名額已全數報滿</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <CheckoutFlow
        workshop={{
          id: content.id,
          title: content.title,
          price: content.price,
          remCap,
        }}
      />
    </>
  );
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const content = await prisma.content.findUnique({ where: { id }, select: { title: true } });
  return { title: `報名 — ${content?.title ?? "工作坊"} | ENDAW` };
}

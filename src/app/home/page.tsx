import Navbar from "@/components/navbar";
import { BannerCarousel } from "@/components/banner-carousel";
import ProductGrid from "@/components/product-grid";
import Footer from "@/components/footer";

export default function HomePage() {
  return (
    <main className="bg-black text-white min-h-screen">
      <Navbar />

      <BannerCarousel />

      <ProductGrid />

      <Footer />
    </main>
  );
}

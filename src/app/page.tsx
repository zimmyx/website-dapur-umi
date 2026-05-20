import { Navbar } from "@/components/navbar";
import {
  HeroSection,
  AboutSection,
  CategoriesSection,
  ProductsSection,
  GallerySection,
  TestimonialsSection,
  FAQSection,
  ContactSection,
  Footer,
} from "@/components/sections";
import { loadSiteData } from "@/lib/site-data";

// Revalidate the public site every 60s so admin edits show up promptly
// while still benefiting from edge caching.
export const revalidate = 60;

export default async function Home() {
  const { categories, products, gallery, testimonials, faqs, settings } =
    await loadSiteData();

  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <AboutSection />
        <CategoriesSection categories={categories} />
        <ProductsSection
          products={products}
          categories={categories}
          settings={settings}
        />
        <GallerySection items={gallery} />
        <TestimonialsSection testimonials={testimonials} />
        <FAQSection faqs={faqs} settings={settings} />
        <ContactSection settings={settings} />
      </main>
      <Footer settings={settings} />
    </>
  );
}

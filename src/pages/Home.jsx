import AnnouncementBar from "../components/home/AnnouncementBar";
import Navbar from "../components/layouts/Navbar";
import Hero from "../components/home/Hero";
import NewArrivals from "../components/home/NewArrivals";
import Philosophy from "../components/home/Philosophy";
import FeaturedCategories from "../components/home/FeaturedCategories";
import HijabEdit from "../components/home/HijabEdit";
import BestSellers from "../components/home/BestSellers";
import Testimonials from "../components/home/Testimonials";
import BenefitsStrip from "../components/home/BenefitsStrip";
import NewsletterSignup from "../components/home/NewsletterSignup";
import Footer from "../components/home/Footer";

export default function Home() {
  return (
    <main className="overflow-x-hidden bg-[#f5f1ec] text-[#171412]">
      <AnnouncementBar />
      <Navbar />
      <Hero />

      <div id="new-in">
        <NewArrivals />
      </div>

      <Philosophy />

      <div id="collections">
        <FeaturedCategories />
      </div>

      <HijabEdit />
      <BestSellers />
      <Testimonials />
      <BenefitsStrip />
      <NewsletterSignup />
      <Footer />
    </main>
  );
}
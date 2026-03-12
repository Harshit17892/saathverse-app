import Navbar from "@/components/Navbar";
import DiscoverHeroBanner from "@/components/DiscoverHeroBanner";
import ShowcaseCarousel from "@/components/ShowcaseCarousel";
import FeaturesSection from "@/components/FeaturesSection";
import DiscoverHub from "@/components/discover/DiscoverHub";
import SpotlightCarousel from "@/components/discover/SpotlightCarousel";
import GamificationWidget from "@/components/discover/GamificationWidget";
import Footer from "@/components/Footer";

const Discover = () => {
  return (
    <div className="min-h-screen bg-background pt-20">
      <Navbar />
      <DiscoverHeroBanner />
      <GamificationWidget />
      <ShowcaseCarousel />
      <FeaturesSection />
      <DiscoverHub />
      <SpotlightCarousel />
      <Footer />
    </div>
  );
};

export default Discover;

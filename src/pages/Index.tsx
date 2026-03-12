import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import LandingHero from "@/components/landing/LandingHero";
import LandingFeatures from "@/components/landing/LandingFeatures";
import LandingHowItWorks from "@/components/landing/LandingHowItWorks";
import LandingSafety from "@/components/landing/LandingSafety";
import LandingCTA from "@/components/landing/LandingCTA";
import Footer from "@/components/Footer";

const Index = () => {
  const { user, loading } = useAuth();

  if (!loading && user) {
    return <Navigate to="/discover" replace />;
  }

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Navbar />
      <LandingHero />
      <LandingFeatures />
      <LandingHowItWorks />
      <LandingSafety />
      <LandingCTA />
      <Footer />
    </div>
  );
};

export default Index;

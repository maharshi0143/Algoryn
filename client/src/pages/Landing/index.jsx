import Hero from "../../components/landing/Hero";
import Features from "../../components/landing/Features";
import HowItWorks from "../../components/landing/HowItWorks";
import Stats from "../../components/landing/Stats";
import CTA from "../../components/landing/CTA";
import Footer from "../../components/landing/Footer";
import usePageTitle from "../../hooks/usePageTitle";

function Landing() {
  usePageTitle("Algoryn");
  return (
    <div>
      <Hero />
      <Features />
      <HowItWorks />
      <Stats />
      <CTA />
      <Footer />
    </div>
  );
}

export default Landing;

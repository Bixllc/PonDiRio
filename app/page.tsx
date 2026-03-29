import NavBar from "../components/NavBar";
import HeroSection from "../components/HeroSection";
import AboutSection from "../components/AboutSection";
import OurCabinsSection from "../components/OurCabins";
import AmenitiesSection from "../components/AmenitiesSection";
// import GuidebookSection from "../components/GuidebookSection";
import ContactSection from "../components/ContactSection";
import FAQSection from "../components/FAQSection";
import Footer from "../components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen">

      {/* Hero section with background + nav */}
      <NavBar />
      <HeroSection />
      <AboutSection />
      <OurCabinsSection/>
      {/* <GuidebookSection /> */}
      <FAQSection />
      <Footer />

    </main>
  );
}

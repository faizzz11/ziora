import Hero from "@/components/landing/Hero";
import Navbar from "@/components/animate-ui/Navbar";
import WebsiteTour from "@/components/landing/WebsiteTour";
import Bento from "@/components/landing/Bento";
import PlatformInAction from "@/components/landing/PlatformInAction";
import FAQ from "@/components/landing/FAQ";
import Footer from "@/components/landing/Footer";
import PageTracker from "@/components/PageTracker";

export default function Home() {
  return (
  <div className="min-h-screen bg-background dark:bg-black">
      <PageTracker pageName="Home" />
      <Navbar />
      <Hero />
      <WebsiteTour />
      <Bento />
      <PlatformInAction />
      <FAQ />
      <Footer />
  </div>
  );
}

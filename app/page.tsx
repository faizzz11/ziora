import Image from "next/image";
import Hero from "@/components/landing/Hero";
import Navbar from "@/components/animate-ui/Navbar";
import WebsiteTour from "@/components/landing/WebsiteTour";
import Bento from "@/components/landing/Bento";
import PlatformInAction from "@/components/landing/PlatformInAction";
import FAQ from "@/components/landing/FAQ";
import Footer from "@/components/landing/Footer";

export default function Home() {
  return (
  <div>
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

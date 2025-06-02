import Image from "next/image";
import Hero from "@/components/landing/Hero";
import HeroVideoDialog from "@/components/magicui/hero-video-dialog"
import Navbar from "@/components/animate-ui/Navbar";

export default function Home() {
  return (
  <div>
      <Navbar />
      <Hero />
      <HeroVideoDialog 
        videoSrc="/pokemon.mp4" 
        thumbnailSrc="/pic.png"
        className="max-w-2xl mx-auto mb-5"
      />
  </div>
  );
}

import Image from "next/image";
import Hero from "@/components/landing/Hero";
import Navbar from "@/components/animate-ui/Navbar";
import WebsiteTour from "@/components/landing/WebsiteTour";
import Bento from "@/components/landing/Bento";
import PlatformInAction from "@/components/landing/PlatformInAction";

export default function Home() {
  return (
  <div>
      <Navbar />
      <Hero />
      <WebsiteTour />
      <Bento />
      <PlatformInAction />
  </div>
  );
}

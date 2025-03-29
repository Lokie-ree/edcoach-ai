import HeroSection from "@/components/HeroSection";
import HeroVideoDialog from "@/components/magicui/hero-video-dialog";
import MaxWidthWrapper from "@/components/MaxWidthWrapper";
import ProblemStatement from "@/components/Problem-Statement";

export default function Home() {
  return (
    <div className="flex flex-col justify-center items-center gap-4">
      <MaxWidthWrapper>
        {/* Hero with Video Dialog */}
        <HeroSection />
        <HeroVideoDialog
          videoSrc="https://www.youtube.com/embed/0pZjy2prNPM?si=m_U9a4iDPpndaZeR"
          thumbnailSrc="/receipt-thumbnail.png"
        />
        <ProblemStatement />
        {/* Solutions with Content */}
        {/* How it Works with Steps */}
        {/* CTA Section*/}
        {/* Features with Cards */}
        {/* Testimonials with Logo Cloud or Carousel */}
        {/* FAQ with Accordion */}
        {/* CTA Banner */}
        {/* Footer with Logo and Socials */}
      </MaxWidthWrapper>
    </div>
  );
}

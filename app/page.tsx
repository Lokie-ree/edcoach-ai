import HeroSection from "@/components/HeroSection";
import HeroVideoDialog from "@/components/magicui/hero-video-dialog";
import MaxWidthWrapper from "@/components/MaxWidthWrapper";
import ProblemStatement from "@/components/ProblemStatement";
import Solution from "@/components/Solution";

export default function Home() {
  return (
    <div className="flex flex-col justify-center items-center gap-4">
      <MaxWidthWrapper>
        {/* Hero with Video Dialog */}
        <HeroSection />
        <div className="mx-auto max-w-3xl">
          <HeroVideoDialog
            videoSrc="https://www.youtube.com/embed/0pZjy2prNPM?si=m_U9a4iDPpndaZeR"
            thumbnailSrc="/app-thumbnail.png"
            animationStyle="from-bottom"
          />
        </div>

        {/* Problem and Solution Content */}
        <ProblemStatement />
        <Solution />
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

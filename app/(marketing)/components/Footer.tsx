 "use client"

import Link from "next/link"
import { Section } from "@/components/ui/section"
import landingContent from "@/data/landing-content.json"


type FooterContent = {
  navigation: Array<{ label: string; href: string }>;
  copyright: string;
}


export default function Footer() {
  const { footer } = landingContent as { footer: FooterContent };
  const currentYear = new Date().getFullYear();

  return (
    <Section 
      id="footer"
      spacing="compact"
      className="relative before:absolute before:top-0 before:left-0 before:right-0 before:h-[1px] before:bg-gradient-to-r before:from-blue-500/50 before:via-purple-500/50 before:to-pink-500/50"
    >
      <div className="mx-auto max-w-7xl px-6 py-12 md:flex md:items-center md:justify-between">
        <div className="mt-8 md:order-1 md:mt-0">
          <div className="flex flex-wrap justify-center gap-6 md:justify-start">
            {footer.navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm text-foreground hover:text-primary transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </div>
          <p className="mt-4 text-center text-sm text-foreground md:text-left">
            {footer.copyright.replace("2024", currentYear.toString())}
          </p>
        </div>
      </div>
    </Section>
  );
} 
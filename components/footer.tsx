"use client"

import Link from "next/link"
import { Section } from "@/components/ui/section"
import { Github, Twitter, Linkedin, Instagram, LucideIcon } from "lucide-react"
import landingContent from "@/data/landing-content.json"

type SocialLink = {
  platform: string;
  icon: 'github' | 'twitter' | 'linkedin' | 'instagram';
  href: string;
  label: string;
}

type FooterContent = {
  social_links: SocialLink[];
  navigation: Array<{ label: string; href: string }>;
  copyright: string;
}

const iconMap: Record<SocialLink['icon'], LucideIcon> = {
  github: Github,
  twitter: Twitter,
  linkedin: Linkedin,
  instagram: Instagram,
};

export default function Footer() {
  const { footer } = landingContent as { footer: FooterContent };

  return (
    <Section 
      id="footer"
      spacing="compact"
      className="bg-muted/50 relative before:absolute before:top-0 before:left-0 before:right-0 before:h-[1px] before:bg-gradient-to-r before:from-blue-500/50 before:via-purple-500/50 before:to-pink-500/50"
    >
      <div className="mx-auto max-w-7xl px-6 py-12 md:flex md:items-center md:justify-between">
        <div className="flex justify-center space-x-6 md:order-2">
          {footer.social_links.map((link) => {
            const Icon = iconMap[link.icon];

            return (
              <Link
                key={link.href}
                href={link.href}
                className="text-muted-foreground hover:text-foreground transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="sr-only">{link.label}</span>
                <Icon className="h-6 w-6" />
              </Link>
            );
          })}
        </div>
        <div className="mt-8 md:order-1 md:mt-0">
          <div className="flex flex-wrap justify-center gap-6 md:justify-start">
            {footer.navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </div>
          <p className="mt-4 text-center text-sm text-muted-foreground md:text-left">
            {footer.copyright}
          </p>
        </div>
      </div>
    </Section>
  );
} 
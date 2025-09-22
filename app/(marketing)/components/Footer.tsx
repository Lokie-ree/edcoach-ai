 "use client"

import Link from "next/link"
import { Container } from "@/components/ui/container"
import landingContent from "@/data/landing-content.json"


type FooterContent = {
  columns: Array<{
    title: string;
    links: Array<{ label: string; href: string }>;
  }>;
  copyright: string;
}


export default function Footer() {
  const { footer } = landingContent as { footer: FooterContent };
  const currentYear = new Date().getFullYear();

  return (
    <footer 
      id="footer"
      className="relative py-12 md:py-16 before:absolute before:top-0 before:left-0 before:right-0 before:h-[1px] before:bg-gradient-to-r before:from-primary/50 before:to-secondary/50"
    >
      <Container size="xl" padding="normal">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {footer.columns.map((column, columnIndex) => (
            <div key={columnIndex} className="text-center md:text-left">
              <h3 className="font-semibold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-4">{column.title}</h3>
              <div className="space-y-2">
                {column.links.map((link, linkIndex) => (
                  <Link
                    key={linkIndex}
                    href={link.href}
                    className="block text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="border-t border-border pt-8 text-center space-y-4">
          <div className="flex items-center justify-center gap-2 text-md font-medium">
            <span>❤️</span>
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Made with love by an educator for educators</span>
            <span>👩‍🏫</span>
          </div>
          <p className="text-sm text-muted-foreground">
            {footer.copyright.replace("2025", currentYear.toString())}
          </p>
        </div>
      </Container>
    </footer>
  );
} 
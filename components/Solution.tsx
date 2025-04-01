import { Cpu, Zap } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import solutionContent from "@/data/solutionContent.json";

interface Feature {
  id: string;
  icon: string;
  title: string;
  description: string;
}

interface SolutionContent {
  metadata: {
    version: string;
    section: string;
    lastUpdated: string;
  };
  theme: {
    spacing: {
      desktop: string;
      mobile: string;
    };
    maxWidth: string;
  };
  heading: {
    title: string;
    highlight: string;
  };
  content: {
    mainText: string;
    highlightedText: string;
    description: string;
  };
  image: {
    dark: {
      src: string;
      alt: string;
    };
    light: {
      src: string;
      alt: string;
    };
    style: {
      className: string;
    };
  };
  features: Feature[];
}

const IconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Zap,
  Cpu,
};

export default function Solution() {
  const content = solutionContent as SolutionContent;

  return (
    <section
      className={cn(
        content.theme.spacing.mobile,
        "md:" + content.theme.spacing.desktop,
      )}
    >
      <div
        className={cn(
          "mx-auto max-w-" + content.theme.maxWidth,
          "space-y-8 px-6 md:space-y-16",
        )}
      >
        {/* Title and Description */}
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-balance text-4xl font-medium lg:text-5xl">
            {content.heading.title}{" "}
            <span className="text-[#7928CA]">{content.heading.highlight}</span>
          </h2>
          <p className="mt-4 text-body">
            {content.content.mainText}{" "}
            <span className="text-title font-medium">
              {content.content.highlightedText}
            </span>
          </p>
          <p className="mt-2">{content.content.description}</p>
        </div>

        {/* Image Section */}
        <div className="mx-auto max-w-lg">
          <div className="border-border/50 relative rounded-2xl border border-dotted p-2">
            <Image
              src={content.image.dark.src}
              className={cn(content.image.style.className, "hidden dark:block")}
              alt={content.image.dark.alt}
              width={600}
              height={400}
              priority
            />
            <Image
              src={content.image.light.src}
              className={cn(content.image.style.className, "dark:hidden")}
              alt={content.image.light.alt}
              width={600}
              height={400}
              priority
            />
          </div>
        </div>

        {/* Features Grid */}
        <div className="mx-auto max-w-4xl">
          <div className="grid grid-cols-2 gap-6 sm:gap-8 lg:grid-cols-2">
            {content.features.map((feature) => {
              const Icon = IconMap[feature.icon];
              return (
                <div key={feature.id} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Icon className="size-4 text-[#7928CA]" />
                    <h3 className="text-sm font-medium">{feature.title}</h3>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

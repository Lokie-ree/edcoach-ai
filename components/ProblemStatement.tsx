import { Cpu, Lock, Sparkles, Zap } from "lucide-react";
import problemContent from "@/data/problemContent.json";
import { cn } from "@/lib/utils";

interface Feature {
  id: string;
  icon: string;
  title: string;
  description: string;
}

interface ProblemContent {
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
    description: string;
  };
  image: {
    src: string;
    alt: string;
    style: {
      className: string;
    };
  };
  features: Feature[];
}

const IconMap: Record<string, React.ComponentType<any>> = {
  Zap,
  Cpu,
  Lock,
  Sparkles,
};

export default function ProblemStatement() {
  const content = problemContent as ProblemContent;

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
          "space-y-8 px-6 md:space-y-12",
        )}
      >
        <div className="mx-auto max-w-xl space-y-6 text-center md:space-y-12">
          <h2 className="text-balance text-4xl font-medium lg:text-5xl">
            {content.heading.title}
          </h2>
          <p>{content.heading.description}</p>
        </div>

        <div className="w-full sm:w-2/3 mx-auto">
          <img
            className={content.image.style.className}
            src={content.image.src}
            alt={content.image.alt}
            width={1200}
            height={675}
            loading="lazy"
          />
        </div>

        <div className="relative mx-auto grid grid-cols-2 gap-x-3 gap-y-6 sm:gap-8 lg:grid-cols-4">
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
    </section>
  );
}

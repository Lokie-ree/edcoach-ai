import { Container } from "@/components/ui/container";
import { cn } from "@/lib/utils";

interface MaxWidthWrapperProps {
  className?: string;
  children: React.ReactNode;
}

/**
 * @deprecated Use Container or ContainerVariants.App instead
 * This component now uses the unified Container system for consistency
 */
const MaxWidthWrapper = ({ className, children }: MaxWidthWrapperProps) => {
  return (
    <Container
      size="full"
      padding="compact"
      className={cn(className)}
    >
      {children}
    </Container>
  );
};

export default MaxWidthWrapper;

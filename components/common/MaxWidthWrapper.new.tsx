// MIGRATION: This file shows how to replace MaxWidthWrapper with the new Container component
// 
// OLD USAGE:
// import MaxWidthWrapper from "@/components/common/MaxWidthWrapper";
// <MaxWidthWrapper className="custom-class">
//   <DashboardContent />
// </MaxWidthWrapper>
//
// NEW USAGE:
// import { Container, ContainerVariants } from "@/components/ui/container";
// <ContainerVariants.App className="custom-class">
//   <DashboardContent />
// </ContainerVariants.App>
//
// OR for more control:
// <Container size="full" padding="compact" className="custom-class">
//   <DashboardContent />
// </Container>

import { Container } from "@/components/ui/container";
import { cn } from "@/lib/utils";

interface MaxWidthWrapperProps {
  className?: string;
  children: React.ReactNode;
}

/**
 * @deprecated Use Container or ContainerVariants.App instead
 * This component is kept for backwards compatibility during migration
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
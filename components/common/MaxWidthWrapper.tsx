import { cn } from "@/lib/utils";

interface MaxWidthWrapperProps {
  className?: string;
  children: React.ReactNode;
}

const MaxWidthWrapper = ({ className, children }: MaxWidthWrapperProps) => {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-[1400px] px-3 sm:px-4 lg:px-6", // Increased max-width, reduced padding
        className,
      )}
    >
      {children}
    </div>
  );
};

export default MaxWidthWrapper;

import { cn } from "@/lib/utils";
import { ReactNode } from "react";

/**
 * Interface for component properties.
 * Following the pattern of explicit typing.
 */
interface ComponentTemplateProps {
  children: ReactNode;
  className?: string;
  variant?: "default" | "outline" | "ghost";
  // React 19: ref is now a common prop
  ref?: React.Ref<HTMLDivElement>;
}

/**
 * Pure Functional Component Template (React 19 + Tailwind)
 * 
 * @example
 * <ComponentTemplate variant="outline">Content</ComponentTemplate>
 */
export const ComponentTemplate = ({
  children,
  className,
  variant = "default",
  ref,
}: ComponentTemplateProps) => {
  // Variant mapping using Tailwind
  const variants = {
    default: "bg-primary text-primary-foreground",
    outline: "border border-input bg-background hover:bg-accent",
    ghost: "hover:bg-accent hover:text-accent-foreground",
  };

  return (
    <div
      ref={ref}
      className={cn(
        "rounded-lg p-4 transition-colors duration-200",
        variants[variant],
        className
      )}
    >
      {children}
    </div>
  );
};

ComponentTemplate.displayName = "ComponentTemplate";

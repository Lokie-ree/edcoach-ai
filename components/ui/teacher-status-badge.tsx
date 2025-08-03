import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Clock, CheckCircle, Mail, AlertCircle, UserPlus } from "lucide-react";
import { Teacher } from "@/types/teacher";
import { ICONS, SPACING, getStatusClasses, getAnimationClass } from "@/lib/design-tokens";

// Simplified status types based on audit recommendations
export type SimplifiedTeacherStatus = "invited" | "active" | "expired";

interface TeacherStatusBadgeProps {
  teacher: Teacher;
  /** Show additional action buttons */
  showActions?: boolean;
  /** Callback for resending invitation */
  onResendInvite?: () => void;
  /** Callback for editing teacher details */
  onEdit?: () => void;
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Compact mode for mobile */
  compact?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Simplified Teacher Status UI Component
 * 
 * Replaces the complex "pending", "active", "needs_details" workflow
 * with a clear "invited" → "active" progression
 * 
 * Features:
 * - Clear visual status indicators
 * - Accessible with proper ARIA labels
 * - Touch-friendly action buttons (44px minimum)
 * - Mobile-responsive design
 * - Time-based status updates (invitation expiry)
 */
export function TeacherStatusBadge({
  teacher,
  showActions = false,
  onResendInvite,
  onEdit,
  size = "md",
  compact = false,
  className
}: TeacherStatusBadgeProps) {
  // Map legacy status to simplified status
  const getSimplifiedStatus = (teacher: Teacher): SimplifiedTeacherStatus => {
    if (teacher.status === "active") return "active";
    
    // Check if invitation is expired (assuming 7 days expiry)
    const createdAt = new Date(teacher.createdAt);
    const expiryDate = new Date(createdAt.getTime() + 7 * 24 * 60 * 60 * 1000);
    const isExpired = new Date() > expiryDate;
    
    if (teacher.status === "pending" || teacher.status === "needs_details") {
      return isExpired ? "expired" : "invited";
    }
    
    return "invited";
  };

  const status = getSimplifiedStatus(teacher);
  
  // Calculate time remaining for invitations
  const getTimeRemaining = (teacher: Teacher): string | null => {
    if (status === "active") return null;
    
    const createdAt = new Date(teacher.createdAt);
    const expiryDate = new Date(createdAt.getTime() + 7 * 24 * 60 * 60 * 1000);
    const now = new Date();
    
    if (now > expiryDate) return "Expired";
    
    const timeLeft = expiryDate.getTime() - now.getTime();
    const daysLeft = Math.ceil(timeLeft / (24 * 60 * 60 * 1000));
    
    if (daysLeft === 1) return "Expires today";
    return `${daysLeft} days left`;
  };

  const timeRemaining = getTimeRemaining(teacher);

  // Status configuration using design tokens
  const statusConfig = {
    invited: {
      label: "Invited",
      icon: Mail,
      variant: "secondary" as const,
      className: getStatusClasses("info"),
      description: "Invitation sent, waiting for response"
    },
    active: {
      label: "Active",
      icon: CheckCircle,
      variant: "default" as const,
      className: getStatusClasses("success"),
      description: "Teacher is active and can access the platform"
    },
    expired: {
      label: "Expired",
      icon: AlertCircle,
      variant: "destructive" as const,
      className: getStatusClasses("error"),
      description: "Invitation has expired, needs to be resent"
    }
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <Badge 
          className={cn(
            "flex items-center gap-1.5 text-xs font-medium",
            config.className,
            getAnimationClass("fast")
          )}
          aria-label={`Teacher status: ${config.label}. ${config.description}`}
        >
          <Icon className={ICONS.sizes.xs} aria-hidden="true" />
          {config.label}
        </Badge>
        
        {showActions && status === "expired" && onResendInvite && (
          <Button
            size="sm"
            variant="outline"
            onClick={onResendInvite}
            className={cn(
              "h-7 px-2 text-xs",
              `min-h-[${SPACING.touchTarget.minimum}]`,
              "touch-manipulation",
              getAnimationClass("fast")
            )}
            aria-label="Resend invitation to teacher"
          >
            <UserPlus className={cn(ICONS.sizes.xs, "mr-1")} />
            Resend
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      {/* Status Badge with Icon */}
      <div className="flex items-center gap-2">
        <Badge 
          className={cn(
            "flex items-center gap-2 text-sm font-medium px-3 py-1.5",
            size === "sm" && "text-xs px-2 py-1",
            size === "lg" && "text-base px-4 py-2",
            config.className,
            getAnimationClass("fast")
          )}
          aria-label={`Teacher status: ${config.label}`}
        >
          <Icon 
            className={cn(
              ICONS.sizes.sm,
              size === "sm" && ICONS.sizes.xs,
              size === "lg" && ICONS.sizes.md
            )} 
            aria-hidden="true" 
          />
          {config.label}
        </Badge>
        
        {/* Time remaining for invitations */}
        {timeRemaining && status !== "active" && (
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Clock className={ICONS.sizes.xs} aria-hidden="true" />
            <span>{timeRemaining}</span>
          </div>
        )}
      </div>

      {/* Description */}
      <p className="text-sm text-muted-foreground">
        {config.description}
      </p>

      {/* Action Buttons */}
      {showActions && (
        <div className="flex gap-2 pt-1">
          {status === "expired" && onResendInvite && (
            <Button
              size="sm"
              onClick={onResendInvite}
              className={cn(
                `min-h-[${SPACING.touchTarget.minimum}]`,
                "touch-manipulation",
                getAnimationClass("fast")
              )}
              aria-label="Resend invitation to teacher"
            >
              <UserPlus className={cn(ICONS.semantic.button, "mr-2")} />
              Resend Invite
            </Button>
          )}
          
          {status === "active" && onEdit && (
            <Button
              size="sm"
              variant="outline"
              onClick={onEdit}
              className={cn(
                `min-h-[${SPACING.touchTarget.minimum}]`,
                "touch-manipulation",
                getAnimationClass("fast")
              )}
              aria-label="Edit teacher details"
            >
              Edit Details
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Status indicator for use in lists and tables
 */
export function TeacherStatusIndicator({ 
  teacher, 
  className 
}: { 
  teacher: Teacher; 
  className?: string; 
}) {
  return (
    <TeacherStatusBadge
      teacher={teacher}
      size="sm"
      compact={true}
      className={className}
    />
  );
}
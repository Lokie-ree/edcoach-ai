import { NAV_ITEMS, NavItem, UserRole } from "@/lib/navigation"

export function useNavItems(userRole: UserRole): NavItem[] {
  return NAV_ITEMS.filter(item => item.roles.includes(userRole))
} 
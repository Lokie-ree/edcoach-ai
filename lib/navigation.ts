import { IconDashboard, IconUsers, IconFileDescription, IconChartBar, IconSettings } from "@tabler/icons-react"
import { Icon } from "@tabler/icons-react"

export type UserRole = "principal" | "coach" | "teacher"

export type NavItem = {
  title: string
  url: string
  icon: Icon
  roles: UserRole[]
  section?: string
}

export const NAV_ITEMS: NavItem[] = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: IconDashboard,
    roles: ["principal", "coach", "teacher"],
  },
  {
    title: "Observations",
    url: "/observations",
    icon: IconFileDescription,
    roles: ["principal", "coach"],
  },
  {
    title: "Analytics",
    url: "/analytics",
    icon: IconChartBar,
    roles: ["principal"],
  },
  {
    title: "Team",
    url: "/team",
    icon: IconUsers,
    roles: ["principal", "coach"],
  },
  {
    title: "Settings",
    url: "/settings",
    icon: IconSettings,
    roles: ["principal", "coach", "teacher"],
  },
] 
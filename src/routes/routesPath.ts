export const RoutePaths = {
  
  INVOICES: "/invoices",
  
  
  DASHBOARD: "/dashboard",
  SETTINGS: "/settings",
  PERMISSIONS: "/settings/permissions",
  ADDRESS_BOOK: "/settings/address-book",
  HIRING_TEMPLATES: "/settings/hiring-templates",
  
  
  LOGIN: "/auth/login",
  REGISTER: "/auth/register",
  FORGOT_PASSWORD: "/auth/forgot-password",
  
  
  PROFILE: "/profile",
} as const;

export type RoutePathType = typeof RoutePaths[keyof typeof RoutePaths];
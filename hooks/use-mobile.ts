import { useMediaQuery } from "usehooks-ts";

/**
 * Hook to detect if the user is on a mobile device
 * @returns boolean - true if mobile, false if desktop
 */
export function useMobile(): boolean {
  return useMediaQuery("(max-width: 768px)");
}

/**
 * Hook to detect if the user is on a tablet device
 * @returns boolean - true if tablet, false otherwise
 */
export function useTablet(): boolean {
  return useMediaQuery("(min-width: 769px) and (max-width: 1024px)");
}

/**
 * Hook to detect if the user is on a desktop device
 * @returns boolean - true if desktop, false otherwise
 */
export function useDesktop(): boolean {
  return useMediaQuery("(min-width: 1025px)");
}

/**
 * Hook to get the current device type
 * @returns 'mobile' | 'tablet' | 'desktop'
 */
export function useDeviceType(): 'mobile' | 'tablet' | 'desktop' {
  const isMobile = useMobile();
  const isTablet = useTablet();
  const isDesktop = useDesktop();

  if (isMobile) return 'mobile';
  if (isTablet) return 'tablet';
  if (isDesktop) return 'desktop';
  
  // Fallback to mobile for SSR
  return 'mobile';
}

/**
 * Hook to detect if the user is on a small mobile device (phones)
 * @returns boolean - true if small mobile, false otherwise
 */
export function useSmallMobile(): boolean {
  return useMediaQuery("(max-width: 480px)");
}

/**
 * Hook to detect if the user is on a large mobile device (large phones)
 * @returns boolean - true if large mobile, false otherwise
 */
export function useLargeMobile(): boolean {
  return useMediaQuery("(min-width: 481px) and (max-width: 768px)");
}

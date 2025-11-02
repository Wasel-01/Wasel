export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface NavigationProps {
  onNavigate: (page: string) => void;
}

export interface UserStats {
  totalTrips: number;
  totalEarnings: number;
  averageRating: number;
  preferredRoutes: string[];
  travelPatterns: unknown[];
}

export interface PersonalizedInsightsProps {
  userId: string;
  userStats?: UserStats;
}

export interface RealTimeWidgetsProps {
  userId: string;
}
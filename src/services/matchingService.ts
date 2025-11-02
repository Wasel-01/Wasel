export interface MatchingCriteria {
  origin: [number, number];
  destination: [number, number];
  departureTime: string;
  seats: number;
  maxPrice?: number;
  // AI-powered matching preferences
  personality?: 'quiet' | 'chatty' | 'moderate';
  musicPreference?: 'none' | 'arabic' | 'western' | 'any';
  language?: string;
  gender?: 'male' | 'female' | 'any';
  smoking?: boolean;
  pets?: boolean;
  professionalNetworking?: boolean;
}

export interface MatchResult {
  tripId: string;
  driverId: string;
  matchScore: number;
  estimatedPrice: number;
  estimatedDuration: number;
  // Enhanced matching details
  compatibilityScore: number;
  personalityMatch: number;
  preferencesMatch: number;
  driverRating: number;
  driverName: string;
  vehicleType: string;
  co2Savings: number;
}

export interface DriverProfile {
  id: string;
  name: string;
  rating: number;
  personality: 'quiet' | 'chatty' | 'moderate';
  musicPreference: 'none' | 'arabic' | 'western' | 'any';
  language: string;
  gender: 'male' | 'female';
  smoking: boolean;
  pets: boolean;
  professionalNetworking: boolean;
  vehicleType: string;
  co2Efficiency: number; // kg CO2 per km
}

export const matchingService = {
  // AI-powered matching algorithm
  findMatches: async (criteria: MatchingCriteria): Promise<MatchResult[]> => {
    // Mock driver profiles for demonstration
    const mockDrivers: DriverProfile[] = [
      {
        id: 'driver-1',
        name: 'Ahmed K.',
        rating: 4.9,
        personality: 'moderate',
        musicPreference: 'arabic',
        language: 'ar',
        gender: 'male',
        smoking: false,
        pets: true,
        professionalNetworking: true,
        vehicleType: 'sedan',
        co2Efficiency: 0.12
      },
      {
        id: 'driver-2',
        name: 'Sarah M.',
        rating: 4.8,
        personality: 'chatty',
        musicPreference: 'western',
        language: 'en',
        gender: 'female',
        smoking: false,
        pets: false,
        professionalNetworking: false,
        vehicleType: 'suv',
        co2Efficiency: 0.15
      },
      {
        id: 'driver-3',
        name: 'Omar A.',
        rating: 4.7,
        personality: 'quiet',
        musicPreference: 'none',
        language: 'ar',
        gender: 'male',
        smoking: true,
        pets: true,
        professionalNetworking: true,
        vehicleType: 'hatchback',
        co2Efficiency: 0.10
      }
    ];

    // Calculate matches with AI scoring
    const matches = mockDrivers.map(driver => {
      const compatibilityScore = calculateCompatibilityScore(criteria, driver);
      const personalityMatch = calculatePersonalityMatch(criteria.personality, driver.personality);
      const preferencesMatch = calculatePreferencesMatch(criteria, driver);
      const overallScore = (compatibilityScore * 0.4) + (personalityMatch * 0.3) + (preferencesMatch * 0.3);

      // Calculate distance and CO2 savings (mock)
      const distance = calculateDistance(criteria.origin, criteria.destination);
      const co2Savings = distance * driver.co2Efficiency;

      return {
        tripId: `trip-${driver.id}`,
        driverId: driver.id,
        matchScore: overallScore,
        estimatedPrice: calculatePrice(distance, criteria.seats),
        estimatedDuration: Math.round(distance / 80 * 60), // 80 km/h average
        compatibilityScore,
        personalityMatch,
        preferencesMatch,
        driverRating: driver.rating,
        driverName: driver.name,
        vehicleType: driver.vehicleType,
        co2Savings: Math.round(co2Savings * 100) / 100
      };
    });

    // Sort by match score and return top matches
    return matches
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 5);
  },

  // Advanced compatibility scoring
  calculateMatchScore: (trip: any, criteria: MatchingCriteria): number => {
    // Enhanced scoring with multiple factors
    const baseScore = Math.random() * 0.3 + 0.7; // 70-100% base
    const personalityBonus = criteria.personality ? 0.1 : 0;
    const preferencesBonus = (criteria.musicPreference || criteria.language || criteria.smoking !== undefined) ? 0.1 : 0;

    return Math.min(1.0, baseScore + personalityBonus + preferencesBonus);
  },

  // Route optimization with multiple stops
  optimizeRoute: (waypoints: [number, number][]): [number, number][] => {
    if (waypoints.length <= 2) return waypoints;

    // Simple nearest neighbor algorithm for route optimization
    const optimized: [number, number][] = [waypoints[0]]; // Start with origin
    const remaining = waypoints.slice(1, -1); // Middle points
    const end = waypoints[waypoints.length - 1]; // Destination

    while (remaining.length > 0) {
      const lastPoint = optimized[optimized.length - 1];
      let nearestIndex = 0;
      let minDistance = calculateDistance(lastPoint, remaining[0]);

      for (let i = 1; i < remaining.length; i++) {
        const distance = calculateDistance(lastPoint, remaining[i]);
        if (distance < minDistance) {
          minDistance = distance;
          nearestIndex = i;
        }
      }

      optimized.push(remaining[nearestIndex]);
      remaining.splice(nearestIndex, 1);
    }

    optimized.push(end); // Add destination
    return optimized;
  },

  // Smart pricing based on demand, time, and distance
  calculateDynamicPrice: (basePrice: number, demand: number, timeOfDay: number): number => {
    const demandMultiplier = 1 + (demand - 0.5) * 0.3; // ±30% based on demand
    const timeMultiplier = timeOfDay >= 17 && timeOfDay <= 19 ? 1.2 : 1.0; // Peak hours

    return Math.round(basePrice * demandMultiplier * timeMultiplier);
  },

  // Predictive demand forecasting
  predictDemand: (route: string, time: string, dayOfWeek: number): number => {
    // Mock demand prediction based on historical data
    const baseDemand = 0.6;
    const weekendBonus = dayOfWeek >= 5 ? 0.2 : 0;
    const peakHourBonus = (time >= '17:00' && time <= '19:00') ? 0.3 : 0;

    return Math.min(1.0, baseDemand + weekendBonus + peakHourBonus);
  }
};

// Helper functions for AI matching
function calculateCompatibilityScore(criteria: MatchingCriteria, driver: DriverProfile): number {
  let score = 0.8; // Base compatibility

  // Gender preference matching
  if (criteria.gender && criteria.gender !== 'any') {
    score += driver.gender === criteria.gender ? 0.1 : -0.2;
  }

  // Language matching
  if (criteria.language) {
    score += driver.language.includes(criteria.language) ? 0.1 : -0.1;
  }

  return Math.max(0, Math.min(1, score));
}

function calculatePersonalityMatch(userPersonality?: string, driverPersonality?: string): number {
  if (!userPersonality || !driverPersonality) return 0.5;

  type PersonalityType = 'quiet' | 'moderate' | 'chatty';
  const compatibilityMatrix: Record<PersonalityType, Record<PersonalityType, number>> = {
    'quiet': { 'quiet': 1.0, 'moderate': 0.7, 'chatty': 0.3 },
    'moderate': { 'quiet': 0.7, 'moderate': 1.0, 'chatty': 0.7 },
    'chatty': { 'quiet': 0.3, 'moderate': 0.7, 'chatty': 1.0 }
  };

  return compatibilityMatrix[userPersonality as PersonalityType]?.[driverPersonality as PersonalityType] || 0.5;
}

function calculatePreferencesMatch(criteria: MatchingCriteria, driver: DriverProfile): number {
  let score = 0;
  let totalChecks = 0;

  // Music preference
  if (criteria.musicPreference) {
    totalChecks++;
    if (criteria.musicPreference === 'any' || driver.musicPreference === criteria.musicPreference) {
      score += 1;
    }
  }

  // Smoking preference
  if (criteria.smoking !== undefined) {
    totalChecks++;
    if (criteria.smoking === driver.smoking) {
      score += 1;
    } else if (!criteria.smoking && driver.smoking) {
      score -= 0.5; // Strong negative for non-smoker with smoker
    }
  }

  // Pets preference
  if (criteria.pets !== undefined) {
    totalChecks++;
    if (criteria.pets === driver.pets) {
      score += 1;
    }
  }

  // Professional networking
  if (criteria.professionalNetworking !== undefined) {
    totalChecks++;
    if (criteria.professionalNetworking === driver.professionalNetworking) {
      score += 1;
    }
  }

  return totalChecks > 0 ? score / totalChecks : 0.5;
}

function calculateDistance(point1: [number, number], point2: [number, number]): number {
  // Haversine formula for distance calculation
  const [lat1, lon1] = point1;
  const [lat2, lon2] = point2;

  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function calculatePrice(distance: number, seats: number): number {
  const baseRate = 2.5; // AED per km
  const seatDiscount = seats > 1 ? 0.8 : 1.0; // 20% discount for multiple passengers
  return Math.round(distance * baseRate * seatDiscount);
}
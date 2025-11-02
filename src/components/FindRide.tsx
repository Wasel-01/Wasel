import { useState, useEffect } from 'react';
import { MapPin, Calendar, Users, DollarSign, Star, ArrowRight, SlidersHorizontal, X, Sparkles, Shield, Heart, Music, Cigarette, PawPrint, Briefcase } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import { Slider } from './ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { TripDetailsDialog } from './TripDetailsDialog';
import { toast } from 'sonner';
import { matchingService, type MatchingCriteria, type MatchResult } from '../services/matchingService';

export function FindRide() {
  const [searchFrom, setSearchFrom] = useState('');
  const [searchTo, setSearchTo] = useState('');
  const [searchDate, setSearchDate] = useState('');
  const [passengers, setPassengers] = useState('1');
  const [selectedTrip, setSelectedTrip] = useState<typeof availableRides[0] | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('match');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<MatchResult[]>([]);

  // Advanced AI-powered filters
  const [filters, setFilters] = useState({
    priceRange: [0, 200],
    minRating: 4.0,
    verifiedOnly: false,
    instantBook: false,
    // AI matching preferences
    personality: 'moderate' as 'quiet' | 'chatty' | 'moderate',
    musicPreference: 'any' as 'none' | 'arabic' | 'western' | 'any',
    language: 'en',
    gender: 'any' as 'male' | 'female' | 'any',
    smoking: false,
    pets: false,
    professionalNetworking: false
  });

  const handleViewDetails = (ride: typeof availableRides[0]) => {
    setSelectedTrip(ride);
    setDialogOpen(true);
  };

  const handleBookTrip = (tripId: number) => {
    toast.success('Trip booked successfully! Check "My Trips" for details.');
  };

  const handleSearch = async () => {
    if (!searchFrom || !searchTo || !searchDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSearching(true);

    try {
      // Mock coordinates for demo (in real app, use geocoding service)
      const mockCoordinates = {
        'Dubai': [25.2048, 55.2708],
        'Abu Dhabi': [24.4539, 54.3773],
        'Riyadh': [24.7136, 46.6753],
        'Jeddah': [21.4858, 39.1925],
        'Cairo': [30.0444, 31.2357],
        'Alexandria': [31.2001, 29.9187],
        'Doha': [25.2854, 51.5310],
        'Al Khor': [25.6810, 51.4969]
      };

      const origin = mockCoordinates[searchFrom as keyof typeof mockCoordinates] || [25.2048, 55.2708];
      const destination = mockCoordinates[searchTo as keyof typeof mockCoordinates] || [24.4539, 54.3773];

      const criteria: MatchingCriteria = {
        origin: origin as [number, number],
        destination: destination as [number, number],
        departureTime: searchDate + 'T08:00:00',
        seats: parseInt(passengers),
        maxPrice: filters.priceRange[1],
        personality: filters.personality,
        musicPreference: filters.musicPreference,
        language: filters.language,
        gender: filters.gender,
        smoking: filters.smoking,
        pets: filters.pets,
        professionalNetworking: filters.professionalNetworking
      };

      const results = await matchingService.findMatches(criteria);
      setSearchResults(results);

      toast.success(`Found ${results.length} AI-matched rides!`);
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Failed to search rides. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Search Section */}
      <Card>
        <CardHeader>
          <CardTitle>Find a Ride</CardTitle>
          <CardDescription>Search for available rides across the Middle East</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>From</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Starting location"
                  value={searchFrom}
                  onChange={(e) => setSearchFrom(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>To</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Destination"
                  value={searchTo}
                  onChange={(e) => setSearchTo(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Date</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="date"
                  value={searchDate}
                  onChange={(e) => setSearchDate(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Passengers</Label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="number"
                  min="1"
                  max="8"
                  value={passengers}
                  onChange={(e) => setPassengers(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          <Button
            className="w-full md:w-auto mt-4 bg-primary hover:bg-primary/90 text-primary-foreground"
            onClick={handleSearch}
            disabled={isSearching}
          >
            {isSearching ? 'Finding AI Matches...' : 'Search Rides'}
          </Button>
        </CardContent>
      </Card>

      {/* AI-Matched Results */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2">
            {searchResults.length > 0 ? (
              <>
                <Sparkles className="w-5 h-5 text-primary" />
                AI-Matched Rides ({searchResults.length})
              </>
            ) : (
              'Available Rides'
            )}
          </h2>
          {searchResults.length > 0 && (
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              Smart Matching Active
            </Badge>
          )}
        </div>

        <div className="space-y-4">
          {searchResults.length > 0 ? (
            searchResults.map((result) => (
              <Card key={result.tripId} className="hover:shadow-md transition-shadow border-l-4 border-l-primary">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Driver Info with AI Match Score */}
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white font-semibold">
                          {result.driverName.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                          <span className="text-xs font-bold text-white">{Math.round(result.matchScore * 100)}%</span>
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{result.driverName}</p>
                          <Badge variant="outline" className="text-xs">
                            AI Match
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span>{result.driverRating}</span>
                          <span>•</span>
                          <span>{result.vehicleType}</span>
                          <span>•</span>
                          <span className="text-green-600">💚 {result.co2Savings}kg CO₂ saved</span>
                        </div>
                      </div>
                    </div>

                    {/* Match Details */}
                    <div className="flex-1">
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div className="text-center">
                          <div className="font-semibold text-primary">{Math.round(result.compatibilityScore * 100)}%</div>
                          <div className="text-gray-600">Compatibility</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold text-secondary">{Math.round(result.personalityMatch * 100)}%</div>
                          <div className="text-gray-600">Personality</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold text-accent">{Math.round(result.preferencesMatch * 100)}%</div>
                          <div className="text-gray-600">Preferences</div>
                        </div>
                      </div>
                    </div>

                    {/* Price & Action */}
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-2xl text-primary font-bold">${result.estimatedPrice}</div>
                        <p className="text-sm text-gray-500">{result.estimatedDuration}min trip</p>
                      </div>
                      <Button
                        className="bg-primary hover:bg-primary/90 text-primary-foreground"
                        onClick={() => handleViewDetails(availableRides.find(r => r.id === parseInt(result.tripId.split('-')[1])) || availableRides[0])}
                      >
                        Book Now
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            availableRides.map((ride) => (
              <Card key={ride.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Driver Info */}
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                        <span>{ride.driver.initials}</span>
                      </div>
                      <div>
                        <p className="font-medium">{ride.driver.name}</p>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span>{ride.driver.rating}</span>
                          <span>•</span>
                          <span>{ride.driver.trips} trips</span>
                        </div>
                      </div>
                    </div>

                    {/* Route Info */}
                    <div className="flex-1 flex items-center gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-medium">{ride.from}</span>
                          <ArrowRight className="w-4 h-4 text-gray-400" />
                          <span className="font-medium">{ride.to}</span>
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                          <span>{ride.date}</span>
                          <span>•</span>
                          <span>{ride.time}</span>
                          <span>•</span>
                          <span>{ride.seats} seats left</span>
                        </div>
                      </div>
                    </div>

                    {/* Price & Action */}
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-2xl text-primary">${ride.price}</div>
                        <p className="text-sm text-gray-500">per seat</p>
                      </div>
                      {ride.tripType && (
                        <Badge variant={ride.tripType === 'wasel' ? 'default' : 'secondary'}>
                          {ride.tripType === 'wasel' ? 'Wasel (واصل)' : 'Raje3 (راجع)'}
                        </Badge>
                      )}
                      <Button
                        className="bg-primary hover:bg-primary/90 text-primary-foreground"
                        onClick={() => handleViewDetails(ride)}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Trip Details Dialog with Map */}
      <TripDetailsDialog
        trip={selectedTrip}
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onBook={handleBookTrip}
      />
    </div>
  );
}

const availableRides = [
  {
    id: 1,
    driver: {
      name: 'Ahmed Hassan',
      initials: 'AH',
      rating: 4.8,
      trips: 127,
      phone: '+971 50 123 4567'
    },
    from: 'Dubai',
    to: 'Abu Dhabi',
    stops: [
      { label: 'Dubai Mall', lat: 25.1972, lng: 55.2744 },
      { label: 'Dubai Marina', lat: 25.0805, lng: 55.1396 },
      { label: 'Jebel Ali', lat: 24.9857, lng: 55.0272 },
      { label: 'Abu Dhabi Downtown', lat: 24.4539, lng: 54.3773 }
    ],
    date: 'Oct 3, 2025',
    time: '08:00 AM',
    seats: 3,
    price: 45,
    tripType: 'wasel' as const,
    vehicleModel: 'Toyota Camry 2023',
    notes: 'Air-conditioned vehicle. Please be on time.'
  },
  {
    id: 2,
    driver: {
      name: 'Sarah Mohammed',
      initials: 'SM',
      rating: 4.9,
      trips: 234,
      phone: '+966 50 987 6543'
    },
    from: 'Riyadh',
    to: 'Jeddah',
    stops: [
      { label: 'Riyadh City Center', lat: 24.7136, lng: 46.6753 },
      { label: 'Al Qassim', lat: 26.3260, lng: 43.9750 },
      { label: 'Medina', lat: 24.5247, lng: 39.5692 },
      { label: 'Jeddah Corniche', lat: 21.5433, lng: 39.1728 }
    ],
    date: 'Oct 5, 2025',
    time: '06:00 AM',
    seats: 2,
    price: 120,
    tripType: 'raje3' as const,
    vehicleModel: 'Honda Accord 2024',
    notes: 'Return trip on Oct 7. Family-friendly ride.'
  },
  {
    id: 3,
    driver: {
      name: 'Omar Abdullah',
      initials: 'OA',
      rating: 4.7,
      trips: 98,
      phone: '+20 10 1234 5678'
    },
    from: 'Cairo',
    to: 'Alexandria',
    stops: [
      { label: 'Cairo Downtown', lat: 30.0444, lng: 31.2357 },
      { label: 'Giza Pyramids', lat: 29.9792, lng: 31.1342 },
      { label: 'Wadi El Natrun', lat: 30.3833, lng: 30.3500 },
      { label: 'Alexandria Corniche', lat: 31.2001, lng: 29.9187 }
    ],
    date: 'Oct 4, 2025',
    time: '10:00 AM',
    seats: 4,
    price: 35,
    tripType: 'wasel' as const,
    vehicleModel: 'Hyundai Elantra 2023',
    notes: 'Comfortable ride with refreshments included.'
  },
  {
    id: 4,
    driver: {
      name: 'Fatima Ali',
      initials: 'FA',
      rating: 5.0,
      trips: 156,
      phone: '+974 5555 1234'
    },
    from: 'Doha',
    to: 'Al Khor',
    stops: [
      { label: 'Doha Souq', lat: 25.2867, lng: 51.5310 },
      { label: 'Lusail City', lat: 25.4295, lng: 51.4932 },
      { label: 'Al Khor Mall', lat: 25.6810, lng: 51.4969 }
    ],
    date: 'Oct 3, 2025',
    time: '02:00 PM',
    seats: 3,
    price: 25,
    tripType: 'wasel' as const,
    vehicleModel: 'Nissan Altima 2024',
    notes: 'Women and families only. Quiet and safe ride.'
  }
];

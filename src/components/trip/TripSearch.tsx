import { useState } from 'react';
import { MapPin, Calendar, Users, Search, Filter } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { DatePicker } from '../ui/date-picker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useTrips } from '@/hooks/useTrips';

export interface TripSearchProps {
  onSearch: (criteria: TripSearchCriteria) => void;
}

export interface TripSearchCriteria {
  origin: string;
  destination: string;
  date: Date;
  passengers: number;
  type: 'all' | 'long-distance' | 'fixed-route';
}

export default function TripSearch({ onSearch }: TripSearchProps) {
  const [criteria, setCriteria] = useState<TripSearchCriteria>({
    origin: '',
    destination: '',
    date: new Date(),
    passengers: 1,
    type: 'all'
  });

  const handleSearch = () => {
    onSearch(criteria);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">From</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
                <Input
                  placeholder="Enter pickup location"
                  value={criteria.origin}
                  onChange={(e) => setCriteria({ ...criteria, origin: e.target.value })}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">To</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
                <Input
                  placeholder="Enter destination"
                  value={criteria.destination}
                  onChange={(e) => setCriteria({ ...criteria, destination: e.target.value })}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
                <DatePicker
                  value={criteria.date}
                  onChange={(date) => date && setCriteria({ ...criteria, date })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Passengers</label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
                <Select
                  value={String(criteria.passengers)}
                  onValueChange={(value) => setCriteria({ ...criteria, passengers: parseInt(value) })}
                >
                  <SelectTrigger className="pl-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6].map((num) => (
                      <SelectItem key={num} value={String(num)}>
                        {num} {num === 1 ? 'passenger' : 'passengers'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Trip Type</label>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
                <Select
                  value={criteria.type}
                  onValueChange={(value) => setCriteria({ ...criteria, type: value as TripSearchCriteria['type'] })}
                >
                  <SelectTrigger className="pl-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="long-distance">Long Distance</SelectItem>
                    <SelectItem value="fixed-route">Fixed Route</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Button
            onClick={handleSearch}
            className="w-full md:w-auto md:px-8 bg-primary hover:bg-primary/90"
          >
            <Search className="w-4 h-4 mr-2" />
            Search Trips
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
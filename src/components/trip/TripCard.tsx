simport { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { MapPin, Clock, Users, CreditCard, Info } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Trip } from '@/types/trip';
import { formatCurrency, formatDistance, formatDuration } from '@/utils/format';

interface TripCardProps {
  trip: Trip;
  onBook: (trip: Trip) => void;
}

export default function TripCard({ trip, onBook }: TripCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card className="w-full transition-all duration-200 hover:shadow-lg">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={trip.driver.avatar} />
              <AvatarFallback>{trip.driver.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">{trip.driver.name}</CardTitle>
              <div className="flex items-center text-sm text-muted-foreground">
                <span className="flex items-center">
                  ⭐ {trip.driver.rating}
                </span>
                <span className="mx-2">•</span>
                <span>{trip.driver.tripsCompleted} trips</span>
              </div>
            </div>
          </div>
          <Badge variant={trip.type === 'fixed-route' ? 'secondary' : 'default'}>
            {trip.type === 'fixed-route' ? 'Fixed Route' : 'Long Distance'}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-start gap-4">
          <div className="min-w-[24px] pt-1">
            <MapPin className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 space-y-1">
            <div className="font-medium">
              {trip.origin} → {trip.destination}
            </div>
            <div className="text-sm text-muted-foreground">
              {formatDistance(trip.distance)} • {formatDuration(trip.duration)}
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-semibold text-primary">
              {formatCurrency(trip.pricePerSeat)}
            </div>
            <div className="text-sm text-muted-foreground">per seat</div>
          </div>
        </div>

        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>{new Date(trip.departureTime).toLocaleTimeString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span>{trip.seatsAvailable} seats left</span>
          </div>
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-muted-foreground" />
            <span>{trip.paymentMethods.join(', ')}</span>
          </div>
        </div>

        {isExpanded && (
          <div className="pt-4 border-t space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="font-medium">Vehicle</div>
                <div className="text-muted-foreground">
                  {trip.vehicle.make} {trip.vehicle.model} • {trip.vehicle.color}
                </div>
              </div>
              <div>
                <div className="font-medium">Plate Number</div>
                <div className="text-muted-foreground">{trip.vehicle.plateNumber}</div>
              </div>
              {trip.type === 'fixed-route' && (
                <>
                  <div>
                    <div className="font-medium">Stops</div>
                    <div className="text-muted-foreground">
                      {trip.stops?.length || 0} scheduled stops
                    </div>
                  </div>
                  <div>
                    <div className="font-medium">Frequency</div>
                    <div className="text-muted-foreground">{trip.frequency}</div>
                  </div>
                </>
              )}
            </div>

            {trip.additionalInfo && (
              <div className="flex items-start gap-2 text-sm">
                <Info className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div className="text-muted-foreground">{trip.additionalInfo}</div>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-between pt-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? 'Show less' : 'Show more'}
          </Button>
          <Button onClick={() => onBook(trip)}>
            Book Now
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
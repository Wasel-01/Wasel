import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Users, Plus, Search, MessageSquare, Calendar } from 'lucide-react';
import { socialCirclesService } from '../services/socialCirclesService';
import { toast } from 'sonner';

export function SocialCircles({ userId }: { userId: string }) {
  const [myCircles, setMyCircles] = useState<any[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCircle, setSelectedCircle] = useState<any>(null);

  useEffect(() => {
    loadMyCircles();
  }, [userId]);

  const loadMyCircles = async () => {
    const circles = await socialCirclesService.getUserCircles(userId);
    setMyCircles(circles);
  };

  const handleSearch = async () => {
    const results = await socialCirclesService.searchCircles({ keyword: searchQuery });
    setSearchResults(results);
  };

  const handleJoinCircle = async (circleId: string) => {
    await socialCirclesService.joinCircle(circleId, userId);
    toast.success('Joined circle successfully!');
    loadMyCircles();
  };

  const getCircleIcon = (type: string) => {
    const icons: Record<string, string> = {
      commute: '🚗',
      corporate: '💼',
      university: '🎓',
      women_only: '👩',
      family: '👨‍👩‍👧‍👦',
      professional: '🤝'
    };
    return icons[type] || '👥';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1>Social Circles</h1>
          <p className="text-muted-foreground">Join communities for regular carpooling</p>
        </div>
        <Button>
          <Plus className="size-4 mr-2" />
          Create Circle
        </Button>
      </div>

      {/* My Circles */}
      <Card>
        <CardHeader>
          <CardTitle>My Circles ({myCircles.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {myCircles.map(circle => (
              <Card key={circle.id} className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setSelectedCircle(circle)}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{getCircleIcon(circle.type)}</span>
                      <div>
                        <h3 className="font-semibold">{circle.name}</h3>
                        <p className="text-xs text-muted-foreground">{circle.type}</p>
                      </div>
                    </div>
                    <Badge>{circle.members || 0} members</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{circle.description}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{circle.route_from} → {circle.route_to}</span>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" variant="outline" className="flex-1">
                      <MessageSquare className="size-3 mr-1" />
                      Chat
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      <Calendar className="size-3 mr-1" />
                      Schedule
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {myCircles.length === 0 && (
              <div className="col-span-2 text-center py-8 text-muted-foreground">
                <Users className="size-12 mx-auto mb-3 opacity-50" />
                <p>You haven't joined any circles yet</p>
                <p className="text-sm">Search below to find circles matching your route</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Search Circles */}
      <Card>
        <CardHeader>
          <CardTitle>Discover Circles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Input
              placeholder="Search by name, route, or type..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button onClick={handleSearch}>
              <Search className="size-4" />
            </Button>
          </div>

          <div className="space-y-3">
            {searchResults.map(circle => (
              <div key={circle.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{getCircleIcon(circle.type)}</span>
                  <div>
                    <h4 className="font-semibold">{circle.name}</h4>
                    <p className="text-sm text-muted-foreground">{circle.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {circle.route_from} → {circle.route_to}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline">{circle.members || 0} members</Badge>
                  <Button size="sm" onClick={() => handleJoinCircle(circle.id)}>
                    Join
                  </Button>
                </div>
              </div>
            ))}
            {searchResults.length === 0 && searchQuery && (
              <p className="text-center text-muted-foreground py-8">
                No circles found. Try a different search or create your own!
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Popular Circle Types */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="pt-6 text-center">
            <span className="text-4xl mb-2 block">🚗</span>
            <h3 className="font-semibold mb-1">Daily Commute</h3>
            <p className="text-sm text-muted-foreground">Regular work/school routes</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="pt-6 text-center">
            <span className="text-4xl mb-2 block">👩</span>
            <h3 className="font-semibold mb-1">Women Only</h3>
            <p className="text-sm text-muted-foreground">Safe spaces for women</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="pt-6 text-center">
            <span className="text-4xl mb-2 block">💼</span>
            <h3 className="font-semibold mb-1">Corporate</h3>
            <p className="text-sm text-muted-foreground">Company carpools</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Leaf, Trophy, TrendingUp, Award } from 'lucide-react';
import { carbonGamificationService } from '../services/carbonGamificationService';

export function CarbonDashboard({ userId }: { userId: string }) {
  const [stats, setStats] = useState({
    totalCO2Saved: 0,
    treesPlanted: 0,
    rank: 0,
    level: 1,
    badges: [],
    nextMilestone: 50
  });
  const [leaderboard, setLeaderboard] = useState<any[]>([]);

  useEffect(() => {
    loadStats();
    loadLeaderboard();
  }, [userId]);

  const loadStats = async () => {
    const data = await carbonGamificationService.getUserCarbonStats(userId);
    setStats(data);
  };

  const loadLeaderboard = async () => {
    const data = await carbonGamificationService.getLeaderboard('global', 10);
    setLeaderboard(data);
  };

  const progressToNext = ((stats.totalCO2Saved % 50) / 50) * 100;

  return (
    <div className="space-y-6">
      {/* Hero Stats */}
      <Card className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Total CO₂ Saved</p>
              <h2 className="text-4xl font-bold">{stats.totalCO2Saved.toFixed(1)} kg</h2>
              <p className="text-sm mt-2">Level {stats.level} Eco Warrior</p>
            </div>
            <Leaf className="size-20 opacity-20" />
          </div>
          <Progress value={progressToNext} className="mt-4 bg-white/20" />
          <p className="text-xs mt-2">{(50 - (stats.totalCO2Saved % 50)).toFixed(1)} kg to next level</p>
        </CardContent>
      </Card>

      {/* Impact Grid */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="size-12 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-3">
              <Leaf className="size-6 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold">{stats.treesPlanted}</h3>
            <p className="text-sm text-muted-foreground">Trees Planted</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-center">
            <div className="size-12 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-3">
              <Trophy className="size-6 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold">#{stats.rank || 'N/A'}</h3>
            <p className="text-sm text-muted-foreground">Global Rank</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-center">
            <div className="size-12 mx-auto bg-purple-100 rounded-full flex items-center justify-center mb-3">
              <Award className="size-6 text-purple-600" />
            </div>
            <h3 className="text-2xl font-bold">{stats.badges.length}</h3>
            <p className="text-sm text-muted-foreground">Badges Earned</p>
          </CardContent>
        </Card>
      </div>

      {/* Badges */}
      <Card>
        <CardHeader>
          <CardTitle>Your Badges</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {stats.badges.map(badgeId => {
              const badge = carbonGamificationService.getBadgeInfo(badgeId);
              return (
                <div key={badgeId} className="flex flex-col items-center p-3 border rounded-lg">
                  <span className="text-3xl mb-1">{badge.icon}</span>
                  <p className="text-xs font-medium">{badge.name}</p>
                  <p className="text-xs text-muted-foreground">{badge.description}</p>
                </div>
              );
            })}
            {stats.badges.length === 0 && (
              <p className="text-sm text-muted-foreground">Complete trips to earn badges!</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Leaderboard */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Global Leaderboard</CardTitle>
            <TrendingUp className="size-5 text-green-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {leaderboard.map((entry, index) => (
              <div key={entry.userId} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <Badge variant={index < 3 ? 'default' : 'outline'}>
                    #{entry.rank}
                  </Badge>
                  <div>
                    <p className="font-medium">{entry.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {entry.treesPlanted} trees • Level {entry.level}
                    </p>
                  </div>
                </div>
                <p className="font-bold text-green-600">{entry.co2Saved.toFixed(1)} kg</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { Brain, TrendingUp, Target, Lightbulb, Zap, Award, Calendar, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import type { PersonalizedInsightsProps } from '../types/components';



export default function PersonalizedInsights({ userId, userStats }: PersonalizedInsightsProps) {
  const [insights, setInsights] = useState<unknown[]>([]);
  const [goals, setGoals] = useState<unknown[]>([]);
  const [achievements, setAchievements] = useState<unknown[]>([]);

  useEffect(() => {
    generatePersonalizedInsights();
    generateSmartGoals();
    generateAchievements();
  }, [userStats]);

  const generatePersonalizedInsights = () => {
    const aiInsights = [
      {
        id: 1,
        type: 'earning_optimization',
        title: 'Peak Earning Opportunity',
        description: 'You earn 35% more on weekends. Consider offering more rides on Fri-Sun.',
        impact: 'high',
        potentialIncrease: '+$120/month',
        confidence: 92,
        icon: DollarSign,
        color: 'from-green-500 to-emerald-600',
        actionable: true,
        action: 'Schedule Weekend Rides'
      },
      {
        id: 2,
        type: 'route_optimization',
        title: 'Route Performance Analysis',
        description: 'Dubai-Abu Dhabi route shows 40% higher demand during morning hours.',
        impact: 'medium',
        potentialIncrease: '+15 trips/month',
        confidence: 87,
        icon: TrendingUp,
        color: 'from-blue-500 to-cyan-600',
        actionable: true,
        action: 'Optimize Schedule'
      },
      {
        id: 3,
        type: 'behavioral_pattern',
        title: 'Travel Pattern Insight',
        description: 'Your passengers prefer rides with 4.8+ rated drivers. Maintain excellent service!',
        impact: 'medium',
        potentialIncrease: '+0.2 rating',
        confidence: 95,
        icon: Award,
        color: 'from-purple-500 to-violet-600',
        actionable: false,
        action: 'Keep It Up!'
      },
      {
        id: 4,
        type: 'market_trend',
        title: 'Market Opportunity',
        description: 'Electric vehicle rides are 25% more popular. Consider eco-friendly options.',
        impact: 'high',
        potentialIncrease: '+$80/month',
        confidence: 78,
        icon: Zap,
        color: 'from-yellow-500 to-orange-600',
        actionable: true,
        action: 'Explore EV Options'
      }
    ];

    setInsights(aiInsights);
  };

  const generateSmartGoals = () => {
    const smartGoals = [
      {
        id: 1,
        title: 'Monthly Earnings Target',
        description: 'Reach $800 in monthly earnings',
        current: 650,
        target: 800,
        progress: 81.25,
        timeframe: '12 days left',
        category: 'earnings',
        difficulty: 'achievable',
        reward: '50 bonus points'
      },
      {
        id: 2,
        title: 'Rating Excellence',
        description: 'Maintain 4.9+ rating for 30 days',
        current: 4.87,
        target: 4.9,
        progress: 99.4,
        timeframe: '18 days left',
        category: 'quality',
        difficulty: 'challenging',
        reward: 'Gold badge'
      },
      {
        id: 3,
        title: 'Trip Milestone',
        description: 'Complete 100 total trips',
        current: 87,
        target: 100,
        progress: 87,
        timeframe: '2 weeks',
        category: 'volume',
        difficulty: 'easy',
        reward: 'Achievement unlock'
      }
    ];

    setGoals(smartGoals);
  };

  const generateAchievements = () => {
    const recentAchievements = [
      {
        id: 1,
        title: 'Eco Warrior',
        description: 'Saved 500kg CO₂ through ride sharing',
        icon: '🌱',
        rarity: 'rare',
        unlockedAt: '2 days ago',
        points: 100
      },
      {
        id: 2,
        title: 'Route Master',
        description: 'Completed 50 trips on Dubai-Abu Dhabi route',
        icon: '🛣️',
        rarity: 'common',
        unlockedAt: '1 week ago',
        points: 50
      },
      {
        id: 3,
        title: 'Five Star Hero',
        description: 'Received 25 five-star ratings',
        icon: '⭐',
        rarity: 'epic',
        unlockedAt: '3 days ago',
        points: 200
      }
    ];

    setAchievements(recentAchievements);
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-50';
      case 'achievable': return 'text-blue-600 bg-blue-50';
      case 'challenging': return 'text-orange-600 bg-orange-50';
      case 'hard': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'border-gray-300 bg-gray-50';
      case 'rare': return 'border-blue-300 bg-blue-50';
      case 'epic': return 'border-purple-300 bg-purple-50';
      case 'legendary': return 'border-yellow-300 bg-yellow-50';
      default: return 'border-gray-300 bg-gray-50';
    }
  };

  return (
    <div className="space-y-6">
      {/* AI-Powered Insights */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-indigo-600" />
            AI-Powered Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {insights.map((insight) => (
              <div key={insight.id} className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-6 hover:shadow-lg transition-all duration-300">
                <div className={`absolute inset-0 bg-gradient-to-r ${insight.color} opacity-5 group-hover:opacity-10 transition-opacity`}></div>
                
                <div className="relative flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${insight.color} flex items-center justify-center shadow-lg`}>
                      <insight.icon className="w-6 h-6 text-white" />
                    </div>
                    
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">{insight.title}</h3>
                        <Badge className={getImpactColor(insight.impact)}>
                          {insight.impact} impact
                        </Badge>
                      </div>
                      
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {insight.description}
                      </p>
                      
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-green-600 font-medium">
                          {insight.potentialIncrease}
                        </span>
                        <span className="text-gray-500">
                          {insight.confidence}% confidence
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {insight.actionable && (
                    <Button size="sm" className="ml-4">
                      {insight.action}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Smart Goals */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-600" />
            Smart Goals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {goals.map((goal) => (
              <div key={goal.id} className="p-6 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">{goal.title}</h3>
                    <p className="text-gray-600 text-sm">{goal.description}</p>
                  </div>
                  <Badge className={getDifficultyColor(goal.difficulty)}>
                    {goal.difficulty}
                  </Badge>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Progress</span>
                    <span className="font-medium">
                      {typeof goal.current === 'number' && goal.current < 10 
                        ? goal.current.toFixed(2) 
                        : goal.current} / {goal.target}
                    </span>
                  </div>
                  
                  <Progress value={goal.progress} className="h-2" />
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">{goal.timeframe}</span>
                    <span className="text-blue-600 font-medium">🎁 {goal.reward}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Achievements */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5 text-yellow-600" />
            Recent Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {achievements.map((achievement) => (
              <div key={achievement.id} className={`p-4 rounded-xl border-2 ${getRarityColor(achievement.rarity)} transition-all hover:scale-105`}>
                <div className="flex items-center gap-4">
                  <div className="text-3xl">{achievement.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900">{achievement.title}</h3>
                      <Badge variant="outline" className="text-xs capitalize">
                        {achievement.rarity}
                      </Badge>
                    </div>
                    <p className="text-gray-600 text-sm mb-2">{achievement.description}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>Unlocked {achievement.unlockedAt}</span>
                      <span className="text-blue-600 font-medium">+{achievement.points} XP</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions Based on Insights */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-indigo-50 to-purple-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-indigo-600" />
            Recommended Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                title: 'Schedule Peak Hours',
                description: 'Set up automatic ride offers for high-demand times',
                icon: Calendar,
                color: 'from-blue-500 to-blue-600'
              },
              {
                title: 'Optimize Routes',
                description: 'Focus on your most profitable routes',
                icon: TrendingUp,
                color: 'from-green-500 to-green-600'
              },
              {
                title: 'Boost Rating',
                description: 'Follow personalized tips to improve ratings',
                icon: Award,
                color: 'from-yellow-500 to-yellow-600'
              },
              {
                title: 'Increase Earnings',
                description: 'Apply AI recommendations for higher income',
                icon: DollarSign,
                color: 'from-purple-500 to-purple-600'
              }
            ].map((action, index) => (
              <Button
                key={index}
                variant="outline"
                className="h-auto p-4 bg-white hover:bg-gray-50 border-gray-200 hover:border-gray-300"
              >
                <div className="flex items-center gap-3 w-full">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${action.color} flex items-center justify-center`}>
                    <action.icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-sm">{action.title}</p>
                    <p className="text-xs text-gray-600">{action.description}</p>
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
import { supabase } from '../utils/supabase/client';

interface CarbonStats {
  totalCO2Saved: number;
  treesPlanted: number;
  rank: number;
  level: number;
  badges: string[];
  nextMilestone: number;
}

export const carbonGamificationService = {
  // Calculate CO2 saved for a trip
  calculateCO2Saved(distanceKm: number, passengers: number): number {
    const avgCarEmission = 0.192; // kg CO2 per km
    const carpoolEmission = avgCarEmission / passengers;
    const savedPerPerson = avgCarEmission - carpoolEmission;
    return savedPerPerson * distanceKm;
  },

  // Get user's carbon stats
  async getUserCarbonStats(userId: string): Promise<CarbonStats> {
    if (!supabase) throw new Error('Service not available');

    const { data, error } = await supabase
      .from('carbon_stats')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    const stats = data || {
      total_co2_saved: 0,
      trees_planted: 0,
      rank: 0,
      level: 1,
      badges: []
    };

    return {
      totalCO2Saved: stats.total_co2_saved,
      treesPlanted: Math.floor(stats.total_co2_saved / 100), // 1 tree per 100kg
      rank: stats.rank,
      level: this.calculateLevel(stats.total_co2_saved),
      badges: stats.badges || [],
      nextMilestone: this.getNextMilestone(stats.total_co2_saved)
    };
  },

  // Update carbon stats after trip
  async updateCarbonStats(userId: string, co2Saved: number, distanceKm: number) {
    if (!supabase) return;

    const currentStats = await this.getUserCarbonStats(userId);
    const newTotal = currentStats.totalCO2Saved + co2Saved;
    const newLevel = this.calculateLevel(newTotal);
    const newBadges = this.checkNewBadges(newTotal, distanceKm, currentStats.badges);

    await supabase.from('carbon_stats').upsert({
      user_id: userId,
      total_co2_saved: newTotal,
      level: newLevel,
      badges: newBadges,
      updated_at: new Date().toISOString()
    });

    // Award tokens for milestones
    if (newLevel > currentStats.level) {
      await this.awardTokens(userId, newLevel * 10);
    }
  },

  // Calculate level based on CO2 saved
  calculateLevel(co2Saved: number): number {
    return Math.floor(co2Saved / 50) + 1; // Level up every 50kg
  },

  // Get next milestone
  getNextMilestone(co2Saved: number): number {
    const level = this.calculateLevel(co2Saved);
    return level * 50;
  },

  // Check for new badges
  checkNewBadges(co2Saved: number, distanceKm: number, currentBadges: string[]): string[] {
    const badges = [...currentBadges];
    const milestones = [
      { threshold: 10, badge: 'eco_starter', name: 'Eco Starter' },
      { threshold: 50, badge: 'green_warrior', name: 'Green Warrior' },
      { threshold: 100, badge: 'tree_planter', name: 'Tree Planter' },
      { threshold: 500, badge: 'carbon_hero', name: 'Carbon Hero' },
      { threshold: 1000, badge: 'planet_saver', name: 'Planet Saver' },
      { threshold: 5000, badge: 'eco_legend', name: 'Eco Legend' }
    ];

    milestones.forEach(m => {
      if (co2Saved >= m.threshold && !badges.includes(m.badge)) {
        badges.push(m.badge);
      }
    });

    return badges;
  },

  // Get global leaderboard
  async getLeaderboard(scope: 'global' | 'city' | 'country' = 'global', limit = 100) {
    if (!supabase) return [];

    let query = supabase
      .from('carbon_stats')
      .select('user_id, total_co2_saved, level, profiles(full_name, city, country)')
      .order('total_co2_saved', { ascending: false })
      .limit(limit);

    const { data, error } = await query;
    if (error) throw error;

    return data?.map((entry, index) => ({
      rank: index + 1,
      userId: entry.user_id,
      name: entry.profiles?.full_name || 'Anonymous',
      co2Saved: entry.total_co2_saved,
      level: entry.level,
      treesPlanted: Math.floor(entry.total_co2_saved / 100)
    })) || [];
  },

  // Award tokens
  async awardTokens(userId: string, amount: number) {
    if (!supabase) return;

    await supabase.from('user_tokens').upsert({
      user_id: userId,
      tokens: amount,
      reason: 'carbon_milestone',
      awarded_at: new Date().toISOString()
    });
  },

  // Get badge details
  getBadgeInfo(badgeId: string) {
    const badges: Record<string, { name: string; icon: string; description: string }> = {
      eco_starter: { name: 'Eco Starter', icon: '🌱', description: 'Saved 10kg CO2' },
      green_warrior: { name: 'Green Warrior', icon: '🌿', description: 'Saved 50kg CO2' },
      tree_planter: { name: 'Tree Planter', icon: '🌳', description: 'Planted your first tree!' },
      carbon_hero: { name: 'Carbon Hero', icon: '🦸', description: 'Saved 500kg CO2' },
      planet_saver: { name: 'Planet Saver', icon: '🌍', description: 'Saved 1000kg CO2' },
      eco_legend: { name: 'Eco Legend', icon: '👑', description: 'Saved 5000kg CO2' }
    };
    return badges[badgeId] || { name: badgeId, icon: '🏆', description: 'Achievement unlocked' };
  }
};

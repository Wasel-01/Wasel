import { supabase } from '../utils/supabase/client';

interface PrayerTimes {
  fajr: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
}

export const menaCulturalService = {
  // Get prayer times for location
  async getPrayerTimes(lat: number, lng: number, date: Date = new Date()): Promise<PrayerTimes> {
    // Using Aladhan API for accurate prayer times
    const dateStr = date.toISOString().split('T')[0];
    const response = await fetch(
      `https://api.aladhan.com/v1/timings/${dateStr}?latitude=${lat}&longitude=${lng}&method=4`
    );
    const data = await response.json();
    
    if (data.code === 200) {
      const timings = data.data.timings;
      return {
        fajr: timings.Fajr,
        dhuhr: timings.Dhuhr,
        asr: timings.Asr,
        maghrib: timings.Maghrib,
        isha: timings.Isha
      };
    }
    
    throw new Error('Failed to fetch prayer times');
  },

  // Check if trip conflicts with prayer time
  async checkPrayerConflict(
    departureTime: string,
    arrivalTime: string,
    lat: number,
    lng: number
  ): Promise<{ conflict: boolean; prayerName?: string; prayerTime?: string }> {
    const prayerTimes = await this.getPrayerTimes(lat, lng);
    
    const departure = new Date(`2000-01-01T${departureTime}`);
    const arrival = new Date(`2000-01-01T${arrivalTime}`);
    
    for (const [name, time] of Object.entries(prayerTimes)) {
      const prayerTime = new Date(`2000-01-01T${time}`);
      if (prayerTime >= departure && prayerTime <= arrival) {
        return { conflict: true, prayerName: name, prayerTime: time };
      }
    }
    
    return { conflict: false };
  },

  // Suggest prayer break during trip
  suggestPrayerBreak(prayerTime: string, currentLocation: { lat: number; lng: number }) {
    return {
      suggestedStop: true,
      prayerTime,
      message: 'Prayer time during trip. Would you like to add a stop?',
      nearbyMosques: [] // Can integrate with mosque finder API
    };
  },

  // Check if it's Ramadan
  isRamadan(date: Date = new Date()): boolean {
    // Simplified - in production, use Islamic calendar API
    const hijriMonth = this.getHijriMonth(date);
    return hijriMonth === 9; // Ramadan is 9th month
  },

  // Get Hijri month (simplified)
  getHijriMonth(date: Date): number {
    // In production, use proper Hijri calendar conversion
    // This is a placeholder
    return Math.floor((date.getMonth() + 1) % 12) + 1;
  },

  // Ramadan mode settings
  getRamadanSettings() {
    return {
      noEatingInCar: true,
      noDrinkingInCar: true,
      adjustedSchedule: true,
      iftarReminders: true,
      suhoorReminders: true,
      message: 'Ramadan Kareem! Special rules apply during fasting hours.'
    };
  },

  // Gender preference options
  getGenderPreferences() {
    return [
      { id: 'any', label: 'Any', labelAr: 'أي' },
      { id: 'male_only', label: 'Male Only', labelAr: 'رجال فقط' },
      { id: 'female_only', label: 'Female Only', labelAr: 'نساء فقط' },
      { id: 'family', label: 'Family Friendly', labelAr: 'عائلي' }
    ];
  },

  // Filter trips by gender preference
  async filterByGenderPreference(trips: any[], preference: string, userGender: string) {
    if (preference === 'any') return trips;
    
    return trips.filter(trip => {
      if (preference === 'male_only') return trip.driver_gender === 'male';
      if (preference === 'female_only') return trip.driver_gender === 'female';
      if (preference === 'family') return trip.family_friendly === true;
      return true;
    });
  },

  // Save user cultural preferences
  async saveCulturalPreferences(userId: string, preferences: {
    prayerReminders: boolean;
    ramadanMode: boolean;
    genderPreference: string;
    languagePreference: string;
    halalOnly: boolean;
  }) {
    if (!supabase) return;

    await supabase.from('user_cultural_preferences').upsert({
      user_id: userId,
      prayer_reminders: preferences.prayerReminders,
      ramadan_mode: preferences.ramadanMode,
      gender_preference: preferences.genderPreference,
      language_preference: preferences.languagePreference,
      halal_only: preferences.halalOnly,
      updated_at: new Date().toISOString()
    });
  },

  // Get user cultural preferences
  async getCulturalPreferences(userId: string) {
    if (!supabase) return null;

    const { data, error } = await supabase
      .from('user_cultural_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  // Find nearby mosques
  async findNearbyMosques(lat: number, lng: number, radius = 5) {
    // Using Overpass API for OpenStreetMap data
    const query = `
      [out:json];
      (
        node["amenity"="place_of_worship"]["religion"="muslim"](around:${radius * 1000},${lat},${lng});
        way["amenity"="place_of_worship"]["religion"="muslim"](around:${radius * 1000},${lat},${lng});
      );
      out body;
    `;
    
    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      body: query
    });
    
    const data = await response.json();
    return data.elements.map((mosque: any) => ({
      name: mosque.tags?.name || 'Mosque',
      lat: mosque.lat,
      lng: mosque.lon,
      distance: this.calculateDistance(lat, lng, mosque.lat, mosque.lon)
    }));
  },

  // Calculate distance
  calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  },

  // Get Islamic calendar events
  getIslamicEvents() {
    return [
      { name: 'Ramadan', nameAr: 'رمضان', month: 9 },
      { name: 'Eid al-Fitr', nameAr: 'عيد الفطر', month: 10, day: 1 },
      { name: 'Eid al-Adha', nameAr: 'عيد الأضحى', month: 12, day: 10 },
      { name: 'Hajj', nameAr: 'الحج', month: 12, day: 8 }
    ];
  },

  // Halal restaurant finder
  async findHalalRestaurants(lat: number, lng: number) {
    // Placeholder - integrate with Zomato/Google Places API
    return [
      { name: 'Halal Restaurant 1', distance: 2.5, rating: 4.5 },
      { name: 'Halal Restaurant 2', distance: 3.2, rating: 4.8 }
    ];
  }
};

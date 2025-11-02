import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Moon, MapPin, Users, Utensils } from 'lucide-react';
import { menaCulturalService } from '../services/menaCulturalService';
import { toast } from 'sonner';

export function CulturalSettings({ userId }: { userId: string }) {
  const [preferences, setPreferences] = useState({
    prayerReminders: true,
    ramadanMode: false,
    genderPreference: 'any',
    languagePreference: 'en',
    halalOnly: false
  });

  const [prayerTimes, setPrayerTimes] = useState<any>(null);
  const [isRamadan, setIsRamadan] = useState(false);

  useEffect(() => {
    loadPreferences();
    checkRamadan();
    loadPrayerTimes();
  }, [userId]);

  const loadPreferences = async () => {
    const prefs = await menaCulturalService.getCulturalPreferences(userId);
    if (prefs) {
      setPreferences({
        prayerReminders: prefs.prayer_reminders,
        ramadanMode: prefs.ramadan_mode,
        genderPreference: prefs.gender_preference,
        languagePreference: prefs.language_preference,
        halalOnly: prefs.halal_only
      });
    }
  };

  const checkRamadan = () => {
    setIsRamadan(menaCulturalService.isRamadan());
  };

  const loadPrayerTimes = async () => {
    try {
      // Get user's location (placeholder coordinates - Dubai)
      const times = await menaCulturalService.getPrayerTimes(25.2048, 55.2708);
      setPrayerTimes(times);
    } catch (error) {
      console.error('Failed to load prayer times');
    }
  };

  const handleSave = async () => {
    await menaCulturalService.saveCulturalPreferences(userId, preferences);
    toast.success('Cultural preferences saved');
  };

  const genderOptions = menaCulturalService.getGenderPreferences();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1>Cultural & Religious Settings</h1>
        <p className="text-muted-foreground">Customize your experience based on your preferences</p>
      </div>

      {/* Ramadan Banner */}
      {isRamadan && (
        <Card className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Moon className="size-8" />
              <div>
                <h3 className="font-semibold">Ramadan Kareem</h3>
                <p className="text-sm opacity-90">Special features enabled for the holy month</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Prayer Times */}
      {prayerTimes && (
        <Card>
          <CardHeader>
            <CardTitle>Today's Prayer Times</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-5 gap-3">
              {Object.entries(prayerTimes).map(([name, time]) => (
                <div key={name} className="text-center p-3 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground capitalize">{name}</p>
                  <p className="font-semibold">{time as string}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Prayer Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Prayer Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Prayer Time Reminders</Label>
              <p className="text-sm text-muted-foreground">Get notified before prayer times</p>
            </div>
            <Switch
              checked={preferences.prayerReminders}
              onCheckedChange={(checked) => 
                setPreferences({ ...preferences, prayerReminders: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Auto-suggest Prayer Breaks</Label>
              <p className="text-sm text-muted-foreground">Suggest stops during prayer times</p>
            </div>
            <Switch checked={true} />
          </div>
        </CardContent>
      </Card>

      {/* Ramadan Mode */}
      <Card>
        <CardHeader>
          <CardTitle>Ramadan Mode</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Enable Ramadan Mode</Label>
              <p className="text-sm text-muted-foreground">Special rules during fasting hours</p>
            </div>
            <Switch
              checked={preferences.ramadanMode || isRamadan}
              onCheckedChange={(checked) => 
                setPreferences({ ...preferences, ramadanMode: checked })
              }
            />
          </div>

          {(preferences.ramadanMode || isRamadan) && (
            <div className="p-3 bg-muted rounded-lg space-y-2 text-sm">
              <p>✓ No eating/drinking in car during fasting</p>
              <p>✓ Iftar time reminders</p>
              <p>✓ Suhoor time reminders</p>
              <p>✓ Adjusted trip schedules</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Gender Preferences */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Users className="size-5" />
            <CardTitle>Gender Preferences</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Label>Preferred Ride Type</Label>
            <Select
              value={preferences.genderPreference}
              onValueChange={(value) => 
                setPreferences({ ...preferences, genderPreference: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {genderOptions.map(option => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.label} ({option.labelAr})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Filter rides based on your comfort preferences
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Halal Preferences */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Utensils className="size-5" />
            <CardTitle>Food Preferences</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Halal Restaurants Only</Label>
              <p className="text-sm text-muted-foreground">Show only halal food stops</p>
            </div>
            <Switch
              checked={preferences.halalOnly}
              onCheckedChange={(checked) => 
                setPreferences({ ...preferences, halalOnly: checked })
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Language */}
      <Card>
        <CardHeader>
          <CardTitle>Language Preference</CardTitle>
        </CardHeader>
        <CardContent>
          <Select
            value={preferences.languagePreference}
            onValueChange={(value) => 
              setPreferences({ ...preferences, languagePreference: value })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="ar">العربية (Arabic)</SelectItem>
              <SelectItem value="ur">اردو (Urdu)</SelectItem>
              <SelectItem value="hi">हिन्दी (Hindi)</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Save Button */}
      <Button onClick={handleSave} className="w-full">
        Save Preferences
      </Button>
    </div>
  );
}

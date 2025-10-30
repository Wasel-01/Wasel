# Referral & Incentives Program Guide

## Overview
Complete referral/incentives system with growth metrics tracking for the Wasel ride-sharing platform.

## Features Implemented

### 1. Referral Program
- **Auto-generated referral codes** for all users
- **Dual rewards system**: Referrer gets 50 AED, referred user gets 25 AED
- **Referral tracking**: Monitor pending, completed, and expired referrals
- **Usage limits**: Optional max uses per referral code
- **Expiration dates**: Time-limited referral codes

### 2. Incentive Campaigns
- **Campaign types**: Referral, first ride, milestone, seasonal, surge pricing
- **Target audiences**: Drivers, riders, or both
- **Reward structures**: Fixed amount, percentage, or tiered rewards
- **Budget management**: Total budget tracking and per-user limits
- **Conditions**: Minimum trip value, trip count, specific routes

### 3. Growth Metrics

#### Cost Per Acquisition (CPA)
- Track acquisition cost per user
- Channel attribution (organic, referral, paid ads, social, SEO, partnership)
- Average CPA calculation
- Trend analysis over time

#### Lifetime Value (LTV)
- Total revenue per user
- Average trip value
- Predicted LTV (30d, 90d, 365d)
- Cohort analysis by registration month
- Days/months active tracking

#### Supply/Demand Balance
- Real-time driver availability
- Rider demand tracking
- Supply/demand ratio calculation
- Fulfillment rate (% of bookings accepted)
- Average wait time
- Surge pricing indicators

## Database Schema

### Core Tables
1. **referral_codes** - User referral codes
2. **referrals** - Referral relationships and status
3. **incentive_campaigns** - Marketing campaigns
4. **user_rewards** - Individual user rewards
5. **user_acquisition_metrics** - CPA and acquisition tracking
6. **user_ltv_metrics** - Lifetime value calculations
7. **supply_demand_metrics** - Hourly supply/demand data
8. **daily_growth_metrics** - Daily aggregated metrics

## API Services

### ReferralService
```typescript
// Get user's referral code
getReferralCode(userId: string)

// Apply referral code during signup
applyReferralCode(code: string, newUserId: string)

// Get user's referrals
getUserReferrals(userId: string)

// Get user rewards
getUserRewards(userId: string)

// Get active campaigns
getActiveCampaigns()
```

### GrowthMetricsService
```typescript
// Get daily metrics
getDailyMetrics(startDate: string, endDate: string)

// Get supply/demand balance
getSupplyDemandBalance(city?: string)

// Calculate user LTV
calculateUserLTV(userId: string)

// Get user CPA
getUserCPA(userId: string)

// Get cohort analysis
getCohortAnalysis(cohortMonth: string)

// Track acquisition
trackAcquisition(userId: string, channel: string, cost: number)

// Get metrics summary
getMetricsSummary()
```

## React Components

### ReferralProgram
User-facing component for:
- Viewing and sharing referral code
- Tracking referrals and their status
- Viewing rewards history
- Claiming available rewards

### GrowthMetricsDashboard
Admin dashboard for:
- CPA, LTV, supply/demand overview
- User acquisition trends
- Revenue and LTV charts
- Supply/demand balance visualization

## Custom Hooks

### useReferrals
```typescript
const {
  referralCode,
  referrals,
  rewards,
  stats,
  loading,
  applyReferralCode,
  refresh
} = useReferrals();
```

### useGrowthMetrics
```typescript
const {
  metrics,
  dailyMetrics,
  supplyDemand,
  loading,
  refresh
} = useGrowthMetrics(autoRefresh, refreshInterval);
```

## Automated Processes

### Triggers
1. **Auto-generate referral code** on user signup
2. **Track acquisition metrics** on user registration
3. **Complete referral** on first trip completion
4. **Award rewards** automatically when conditions met

### Scheduled Jobs
Run via Supabase Edge Functions or cron:

```sql
-- Calculate supply/demand metrics (hourly)
SELECT calculate_supply_demand_metrics(CURRENT_DATE, EXTRACT(HOUR FROM NOW()));

-- Calculate daily growth metrics (daily at 2 AM)
SELECT calculate_daily_growth_metrics(CURRENT_DATE);
```

## Usage Examples

### 1. User Signs Up with Referral Code
```typescript
// During signup
await referralService.applyReferralCode('ABC12345', newUser.id);
```

### 2. Display Referral Dashboard
```typescript
import ReferralProgram from './components/ReferralProgram';

function MyProfile() {
  return <ReferralProgram />;
}
```

### 3. Admin Views Growth Metrics
```typescript
import GrowthMetricsDashboard from './components/GrowthMetricsDashboard';

function AdminDashboard() {
  return <GrowthMetricsDashboard />;
}
```

### 4. Track User Acquisition
```typescript
// After user signs up via paid ad
await growthMetricsService.trackAcquisition(
  userId,
  'paid_ads',
  25.50 // Cost in AED
);
```

### 5. Calculate LTV
```typescript
const ltv = await growthMetricsService.calculateUserLTV(userId);
console.log(`User LTV: ${ltv} AED`);
```

## Key Metrics Formulas

### CPA (Cost Per Acquisition)
```
CPA = Total Marketing Spend / Number of New Users
```

### LTV (Lifetime Value)
```
LTV = (Total Revenue / Days Active) × 365
Predicted LTV = Avg Trip Value × Expected Trips
```

### Supply/Demand Ratio
```
S/D Ratio = Available Seats / Requested Seats
- Ratio > 1: Oversupply (more drivers than riders)
- Ratio < 1: High demand (more riders than drivers)
```

### Fulfillment Rate
```
Fulfillment Rate = (Accepted Bookings / Total Bookings) × 100
```

## Reward Configuration

### Default Rewards
- **Referrer**: 50 AED credit
- **Referred**: 25 AED welcome bonus
- **First ride**: Configurable via campaigns
- **Milestone**: Custom amounts per campaign

### Reward Types
- `cash` - Direct payment
- `credit` - Wallet credit
- `discount` - Percentage off next ride
- `free_ride` - Complimentary trip

## Best Practices

1. **Monitor CPA vs LTV**: Ensure LTV > CPA for profitability
2. **Balance supply/demand**: Target ratio around 1.0-1.2
3. **Optimize fulfillment**: Aim for >80% fulfillment rate
4. **Cohort analysis**: Track user behavior by signup month
5. **A/B test campaigns**: Compare different incentive structures
6. **Prevent fraud**: Validate referrals, limit rewards per user
7. **Expire rewards**: Set expiration dates to encourage usage

## Integration Steps

1. **Run database migration**:
   ```bash
   psql -d wasel -f src/supabase/referral_schema.sql
   ```

2. **Deploy Edge Function**:
   ```bash
   supabase functions deploy calculate-metrics
   ```

3. **Set up cron job** (via Supabase Dashboard):
   - Schedule: `0 * * * *` (hourly)
   - Function: `calculate-metrics`

4. **Add to navigation**:
   ```typescript
   <Link to="/referrals">Referrals</Link>
   <Link to="/admin/metrics">Growth Metrics</Link>
   ```

## Monitoring & Alerts

Set up alerts for:
- CPA exceeds LTV
- Supply/demand ratio < 0.5 or > 2.0
- Fulfillment rate < 70%
- Unusual referral activity (fraud detection)
- Budget limits reached on campaigns

## Future Enhancements

1. **Dynamic pricing** based on supply/demand
2. **Predictive analytics** for demand forecasting
3. **Personalized incentives** based on user behavior
4. **Gamification** with leaderboards and badges
5. **Social sharing** integration
6. **Multi-tier referral** programs (MLM-style)
7. **Geographic targeting** for campaigns
8. **Time-based surge** pricing automation

# Wasel Feature Specification
## Hybrid Ride-Sharing Platform (BlaBlaCar + Swvl Integration)

### Core Features

#### 1. Route & Trip Types
- **Long Distance (BlaBlaCar-style)**
  - City-to-city trips
  - Flexible pickup/dropoff points
  - Driver-set prices
  - Advance booking required
  - Full journey sharing

- **Urban/Commuter (Swvl-style)**
  - Fixed routes with multiple stops
  - Scheduled departure times
  - Standard pricing per stop
  - Same-day booking allowed
  - Hop-on/hop-off capability

#### 2. Search & Matching
- **Smart Search**
  - Search by origin/destination
  - Filter by date, time, price range
  - View both long-distance and urban routes
  - Map view with route visualization
  - Real-time seat availability

- **Flexible Booking**
  - Book entire journey or specific segments
  - Choose pickup/dropoff points
  - Select number of seats
  - Add special requirements
  - Instant confirmation for fixed routes

#### 3. Driver Experience
- **Trip Creation**
  - Create long-distance trips
  - Join as fixed-route driver
  - Set stops and schedule
  - Define pricing and rules
  - Vehicle management

- **Route Management**
  - Real-time passenger updates
  - Stop arrival notifications
  - Route optimization
  - Schedule adjustments
  - Capacity management

#### 4. Rider Experience
- **Booking Flow**
  - Easy search interface
  - Clear pricing breakdown
  - Multiple payment methods
  - Digital tickets
  - Real-time trip status

- **Journey Features**
  - Live tracking
  - Chat with driver
  - Share trip status
  - Rate and review
  - Support access

### Technical Implementation

#### 1. Database Schema (Supabase)
\`\`\`sql
-- Already defined in database.ts
-- Key tables:
-- - users (riders/drivers)
-- - trips (both long-distance and fixed-route)
-- - bookings
-- - vehicles
-- - routes (fixed routes)
-- - stops (route stops)
\`\`\`

#### 2. API Endpoints
- POST /api/trips/search
- POST /api/trips/create
- POST /api/bookings/create
- GET /api/trips/{id}/status
- POST /api/trips/{id}/track
- GET /api/routes/popular
- POST /api/chat/send

#### 3. Frontend Components
- FindRide (search + results)
- OfferRide (trip creation)
- TripDetails (booking flow)
- LiveMap (tracking)
- RouteManager (drivers)
- BookingHistory
- Messaging
- Payments

### Phase 1 Implementation Plan
1. Core matching system
2. Basic booking flow
3. Driver trip creation
4. Simple chat
5. Payment integration

### Security & Safety
- Driver verification
- Passenger verification
- Real-time tracking
- Emergency contact
- Review system
- Payment protection

### Quality Metrics
- Booking success rate
- Driver response time
- On-time performance
- User ratings
- Support response
- App stability
# 🚗 Wasel - Modern Ride Sharing Platform

[![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)](https://github.com/Wasel-01/Wasel)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

Wasel is a next-generation ride-sharing platform designed for the Middle East, built with modern web technologies and best practices.

## ✨ Features

- 🔐 **Secure Authentication** - Email/password authentication with Supabase
- 🗺️ **Smart Route Matching** - Find rides based on location and preferences
- 💬 **Real-time Messaging** - Chat with drivers and passengers
- 💰 **Integrated Payments** - Secure payment processing
- ⭐ **Rating System** - Rate and review your trips
- 🛡️ **Safety Center** - Emergency contacts and SOS features
- 📊 **Analytics Dashboard** - Track your trips and earnings
- 🎁 **Referral Program** - Earn rewards by inviting friends

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Supabase account (optional for backend features)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Wasel-01/Wasel.git
   cd Wasel
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## 🏗️ Tech Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite 6
- **Styling**: Tailwind CSS 3
- **UI Components**: Radix UI (headless components)
- **Icons**: Lucide React
- **Backend**: Supabase (PostgreSQL + Auth + Realtime)
- **State Management**: React Context API

## 📁 Project Structure

```
Wasel/
├── src/
│   ├── components/        # React components
│   │   ├── ui/           # Reusable UI components
│   │   ├── Dashboard.tsx
│   │   ├── FindRide.tsx
│   │   └── ...
│   ├── contexts/         # React contexts (Auth, etc.)
│   ├── hooks/            # Custom React hooks
│   ├── utils/            # Utility functions
│   ├── lib/              # Library configurations
│   ├── App.tsx           # Main app component
│   └── main.tsx          # Entry point
├── public/               # Static assets
├── .env.example          # Environment variables template
└── package.json          # Dependencies
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## 🎨 Customization

### Theme Colors

Edit `tailwind.config.cjs` to customize the color palette:

```js
theme: {
  extend: {
    colors: {
      primary: {
        DEFAULT: '#14b8a6',
        // ... other shades
      }
    }
  }
}
```

### Fonts

The app uses Inter and Poppins fonts from Google Fonts. To change fonts, edit `src/index.css`.

## 🔐 Backend Setup (Optional)

Wasel works in demo mode without a backend, but for full functionality:

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Run the SQL migrations from `src/supabase/migrations/`
3. Add your Supabase credentials to `.env`
4. Restart the development server

## 📱 Features Overview

### For Passengers
- Search for rides by location and date
- Book seats instantly
- Real-time trip tracking
- In-app messaging with drivers
- Rate and review trips

### For Drivers
- Offer rides on your route
- Manage bookings
- Track earnings
- Build your reputation
- Flexible scheduling

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 🔗 Links

- [GitHub Repository](https://github.com/Wasel-01/Wasel)
- [Documentation](./src/DEVELOPER_GUIDE.md)
- [Backend Setup Guide](./src/BACKEND_SETUP_GUIDE.md)

## 💬 Support

For support, please open an issue on GitHub or contact the development team.

---

Made with ❤️ by the Wasel Team
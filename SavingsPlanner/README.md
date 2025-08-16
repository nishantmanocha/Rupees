# Savings Planner - React Native Expo App

A comprehensive financial planning app that helps users plan savings and compare "saving only" vs "saving + investing" strategies.

## Features

### 🎯 Core Functionality
- **Financial Planning**: Track monthly income, expenses, and calculate surplus
- **Savings Goals**: Set and track multiple savings goals with target amounts and dates
- **Investment Comparison**: Compare different investment instruments and their projected returns
- **Educational Content**: Learn about various investment options and financial planning concepts

### 📊 Investment Options
- PPF (Public Provident Fund) - 7.1%
- Nifty 50 Index Fund - 12%
- Gold ETF - 8%
- Sovereign Gold Bond (SGB) - 10%
- Debt Mutual Fund - 6.5%
- Fixed Deposit (FD) - 7%
- Recurring Deposit (RD) - 6.8%
- ELSS - 11.5%
- Sukanya Samriddhi - 8%
- NPS - 9%

### 🎨 UI/UX Features
- Modern, clean interface with Tailwind CSS
- Light/Dark/System theme support
- Responsive design for all screen sizes
- Interactive charts and visualizations
- Intuitive navigation with bottom tabs

## Tech Stack

- **Framework**: React Native with Expo (latest)
- **Language**: TypeScript
- **State Management**: Zustand with AsyncStorage persistence
- **Navigation**: React Navigation (Stack + Bottom Tabs)
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **Charts**: React Native Chart Kit
- **Icons**: Lucide React Native
- **Forms**: React Hook Form with Zod validation
- **Date Handling**: Day.js
- **Storage**: AsyncStorage

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator (macOS) or Android Emulator

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd SavingsPlanner
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Run on device/simulator**
   ```bash
   # For iOS
   npm run ios
   
   # For Android
   npm run android
   
   # For web
   npm run web
   ```

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Button.tsx
│   ├── Card.tsx
│   └── Input.tsx
├── screens/            # App screens
│   ├── onboarding/     # Onboarding flow
│   ├── plan/          # Main planning screen
│   ├── compare/       # Investment comparison
│   ├── goals/         # Savings goals management
│   ├── learn/         # Educational content
│   └── settings/      # App settings
├── navigation/         # Navigation configuration
├── store/             # Zustand state management
├── utils/             # Utility functions and calculations
├── types/             # TypeScript type definitions
└── hooks/             # Custom React hooks
```

## Key Components

### Financial Calculations
- Monthly surplus calculation
- Savings projections (saving only)
- Investment projections (SIP-style)
- Goal timeline estimation

### State Management
- Persistent storage with AsyncStorage
- Centralized state for app data
- Real-time updates across screens

### Navigation
- Onboarding flow for first-time users
- Tab-based navigation for main features
- Stack navigation for screen transitions

## Features in Detail

### 1. Onboarding Screen
- Welcome introduction
- Income input
- Expense setup
- Goal creation guidance

### 2. Plan Screen
- Financial summary dashboard
- Income and expense tracking
- Surplus calculation
- Improvement tips
- Quick actions

### 3. Compare Screen
- Investment instrument selection
- Time horizon selection
- Line and bar charts
- Performance comparison table
- Plan setting functionality

### 4. Goals Screen
- Goal creation and management
- Progress tracking
- Primary goal setting
- Goal editing and deletion

### 5. Learn Screen
- Educational content categories
- Expandable Q&A sections
- Investment checklists
- Beginner-friendly explanations

### 6. Settings Screen
- Theme customization
- Investment rate editing
- Data backup/restore
- App information

## Configuration

### Investment Rates
All investment rates are configurable through the Settings screen. Users can:
- Modify annual return rates
- Enable/disable specific instruments
- Customize compounding frequencies

### Theme Support
- Light mode
- Dark mode
- System theme (follows device settings)

## Data Persistence

The app automatically saves all user data including:
- Income and expenses
- Savings goals
- Investment preferences
- Theme settings
- Onboarding status

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue in the repository.

---

Built with ❤️ for better financial planning
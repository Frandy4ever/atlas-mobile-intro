# 👟 Activity Tracker App

A beautiful, feature-rich React Native mobile application for tracking your daily steps and physical activities. Built with Expo, this app provides an intuitive interface to log, manage, and visualize your fitness data with full dark mode support.

## ✨ Features

### 📊 Activity Management
- **Add Activities**: Quickly log your step count with a simple, clean interface
- **View Activities**: Browse all your activities in a scrollable list with step counts and timestamps
- **Edit Activities**: Tap any activity to edit the step count
- **Delete Activities**: Swipe left on any activity to delete it, or use the "Delete All" button to clear everything
- **Search**: Filter activities by steps or date using the search bar

### 📈 Statistics & Insights
- **Summary Cards**: View total steps, average steps, max steps, and min steps at a glance
- **Recent Activities Chart**: Visual bar chart showing your last 7 activities
- **Activity Distribution**: See how your activities are distributed across step ranges (0-2K, 2K-5K, 5K-10K, 10K+)
- **Real-time Updates**: All statistics update automatically as you add, edit, or delete activities

### 🎨 User Experience
- **Dark Mode**: Full dark mode support with a toggle button (☀️/🌙)
- **Responsive Design**: Beautiful UI that adapts to your device
- **Smooth Animations**: Polished transitions and interactions throughout the app
- **Swipe Gestures**: Natural swipe-to-delete functionality
- **Confirmation Dialogs**: Prevents accidental deletions with confirmation prompts

### 💾 Data Persistence
- **Local Database**: Uses SQLite for reliable local data storage
- **Instant Sync**: All changes are immediately saved to the database
- **Data Integrity**: Automatic table creation and data validation

## 🛠️ Technology Stack

- **Framework**: React Native with Expo
- **Language**: TypeScript
- **Navigation**: Expo Router (file-based routing)
- **Database**: Expo SQLite
- **UI Components**: React Native core components
- **State Management**: React Context API
- **Gestures**: React Native Gesture Handler
- **Lists**: FlashList for optimized list rendering

## 📁 Project Structure

```
.
├── app/                          # Screen components (file-based routing)
│   ├── _layout.tsx              # Root layout with tab navigation
│   ├── index.tsx                # Home screen (activities list)
│   ├── stats.tsx                # Statistics screen
│   └── add.tsx                  # Add activity screen
├── src/
│   ├── components/              # Reusable components
│   │   ├── ActivityItem.tsx    # Individual activity list item
│   │   └── EditModal.tsx       # Modal for editing activities
│   ├── context/                 # React contexts
│   │   ├── ActivitiesContext.tsx  # Activities state management
│   │   └── ThemeContext.tsx       # Theme (dark/light mode) management
│   └── types/                   # TypeScript type definitions
│       └── navigation.d.ts
├── assets/                      # Images and static assets
└── package.json
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator (for Mac) or Android Emulator

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd atlas-mobile-intro
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
or
npm expo start -c --tunnal
```

4. Run on your device:
- Press `i` for iOS simulator
- Press `a` for Android emulator
- Scan the QR code with Expo Go app on your physical device

## 📱 Screens Overview

### Home Screen (Activities)
- Displays all logged activities in a scrollable list
- Shows summary statistics at the top (total steps, average, count)
- Search bar for filtering activities
- "+ Add Activity" button to log new activities
- "Delete All" button (appears when activities exist)
- Dark mode toggle in the top-right corner (☀️/🌙)
- Swipe left on any activity to delete
- Tap any activity to edit

### Statistics Screen
- Summary cards showing total, average, max, and min steps
- Bar chart visualizing recent activities (last 7)
- Distribution breakdown showing activity ranges with progress bars
- All visualizations update in real-time

### Add Activity Screen
- Simple form to enter step count
- Input validation (must be a positive number)
- Success confirmation dialog
- Automatically returns to home screen after adding

## 🎨 Theme System

The app features a comprehensive theming system with two modes:

### Light Mode
- Clean white backgrounds
- Dark text for readability
- Blue accent colors (#007AFF)
- Subtle shadows and borders

### Dark Mode
- Pure black background (#000)
- Dark card backgrounds (#1c1c1e)
- White text with gray secondary text
- Brighter blue accent (#0A84FF)
- Optimized for OLED displays

**Toggle**: Tap the sun/moon icon in the top-right corner of the home screen to switch themes.

## 🗄️ Database Schema

The app uses SQLite with the following table structure:

```sql
CREATE TABLE IF NOT EXISTS activities (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  steps INTEGER NOT NULL,
  date INTEGER NOT NULL
)
```

- `id`: Unique identifier (auto-incrementing)
- `steps`: Number of steps (integer)
- `date`: Unix timestamp (seconds since epoch)

## 🔧 Key Dependencies

```json
{
  "expo": "~52.0.11",
  "react-native": "0.76.3",
  "expo-router": "~4.0.9",
  "expo-sqlite": "~15.0.3",
  "react-native-gesture-handler": "~2.20.2",
  "@shopify/flash-list": "1.7.2"
}
```

## 🤝 Context Providers

### ActivitiesContext
Manages all activity-related state and operations:
- `activities`: Array of all activities
- `loading`: Loading state
- `addActivity(steps)`: Add a new activity
- `updateActivity(id, steps)`: Update an existing activity
- `deleteActivity(id)`: Delete a single activity
- `deleteAllActivities()`: Delete all activities

### ThemeContext
Manages theme state:
- `theme`: Current theme ("light" or "dark")
- `colors`: Color palette for current theme
- `isDark`: Boolean indicating if dark mode is active
- `toggleTheme()`: Toggle between light and dark mode

## 📝 Usage Examples

### Adding an Activity
1. Tap the "+ Add Activity" button on the home screen
2. Enter the number of steps (e.g., 10000)
3. Tap "Add Activity"
4. Confirm the success dialog

### Editing an Activity
1. Tap on any activity in the list
2. Modify the step count in the modal
3. Tap "Save"

### Deleting an Activity
1. Swipe left on the activity
2. Tap the red "Delete" button
3. Confirm the deletion

### Switching to Dark Mode
1. Tap the 🌙 icon in the top-right corner
2. The app immediately switches to dark mode
3. Tap the ☀️ icon to switch back to light mode

## 🐛 Troubleshooting

### Database Issues
If you encounter database errors, try:
```bash
expo start -c
```
This clears the cache and restarts the development server.

### Build Issues
Clear node modules and reinstall:
```bash
rm -rf node_modules
npm install
```

## 🔮 Future Enhancements

Potential features for future versions:
- Export data to CSV
- Weekly/monthly goal setting
- Activity categories (walking, running, cycling)
- Charts with more date range options
- Cloud sync across devices
- Social sharing features
- Activity streaks and achievements

## 📄 License

This project is part of the ATLAS mobile development curriculum.

## 👥 Author

Developed as part of the ATLAS mobile development program.

---

**Happy Tracking! 👟📊**
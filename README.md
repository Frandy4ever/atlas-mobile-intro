# Activity Tracker - Mobile Application

A comprehensive mobile activity tracking application built with React Native and Expo, featuring user authentication, activity management, statistics visualization, and theme customization.

**Created by:** Frandy Slueue  
**Email:** frandy.slueue@atlasstudents.com  
**GitHub:** [@frandy4ever](https://github.com/frandy4ever)  
**License:** MIT

---

## 📱 Features

### Core Functionality
- **Activity Tracking**: Log and manage daily step counts with timestamps
- **User Authentication**: Secure registration and login system with password validation
- **Activity Management**: Create, edit, delete, and archive activities
- **Statistics Dashboard**: Visual representations of activity data with charts and metrics
- **Archive System**: Store completed activities separately from active ones
- **Search & Filter**: Smart search with frequency-based sorting for numeric queries
- **Theme Support**: Three beautiful themes (Light, Dark, Warm)
- **Admin Panel**: User management interface for administrators

### User Experience
- Swipe gestures for quick actions (delete left, archive right)
- Real-time data updates across all screens
- Skeleton loading states for smooth transitions
- Responsive design with proper keyboard handling
- Form validation with helpful error messages
- Confirmation dialogs for destructive actions

---

## 🛠 Tech Stack

### Framework & Libraries
- **React Native** 0.81.4
- **React** 19.1.0
- **Expo** ^54.0.13
- **Expo Router** ~6.0.11 (File-based navigation)
- **TypeScript** ~5.9.2

### UI & Styling
- **lucide-react-native** ^0.546.0 (Icons)
- **@shopify/flash-list** 2.0.2 (Optimized lists)
- **react-native-gesture-handler** ~2.28.0 (Swipe gestures)
- **react-native-reanimated** ~4.1.1 (Animations)
- **victory-native** ^41.20.1 (Charts - available but not currently used)

### Database
- **expo-sqlite** ^16.0.8 (Local SQLite database)

### Additional Features
- **expo-haptics** ~15.0.7 (Haptic feedback)
- **expo-keep-awake** ~15.0.7 (Prevent screen sleep)

---

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator (Mac) or Android Emulator

### Setup Steps

1. **Clone the repository**
```bash
git clone <repository-url>
cd atlas-mobile-intro
```

2. **Install dependencies**
```bash
npm install
```

3. **Start the development server**
```bash
npm start
```

4. **Run on platform**
```bash
# iOS
npm run ios

# Android
npm run android

# Web
npm run web
```

---

## 📂 Project Structure

```
.
├── app/                          # Screens (Expo Router)
│   ├── _layout.tsx              # Root layout with navigation
│   ├── index.tsx                # Home screen (activity list)
│   ├── add.tsx                  # Add activity screen
│   ├── stats.tsx                # Statistics screen
│   ├── archive.tsx              # Archive screen
│   ├── settings.tsx             # Settings screen
│   ├── theme.tsx                # Theme selector
│   ├── login.tsx                # Login screen
│   ├── register.tsx             # Registration screen
│   └── admin.tsx                # Admin panel
├── src/
│   ├── components/              # Reusable components
│   │   ├── ActivityItem.tsx    # Activity list item with swipe
│   │   ├── ArchivedItem.tsx    # Archived activity item
│   │   ├── EditModal.tsx       # Edit activity modal
│   │   ├── LoadingSkeleton.tsx # Loading placeholder
│   │   └── ThemeSelector.tsx   # Theme picker modal
│   ├── context/                 # React Context providers
│   │   ├── ActivitiesContext.tsx  # Activity state management
│   │   ├── ArchiveContext.tsx     # Archive state management
│   │   ├── AuthContext.tsx        # Authentication & user management
│   │   └── ThemeContext.tsx       # Theme state management
│   └── types/                   # TypeScript definitions
│       ├── auth.d.ts           # Auth-related types
│       └── navigation.d.ts     # Navigation types
├── assets/                      # Images and static files
├── package.json                 # Dependencies
├── app.json                     # Expo configuration
├── tsconfig.json               # TypeScript configuration
└── README.md                   # This file
```

---

## 🗄️ Database Schema

### Tables

#### **users**
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  firstName TEXT NOT NULL,
  lastName TEXT NOT NULL,
  phone TEXT NOT NULL,
  isAdmin BOOLEAN DEFAULT FALSE,
  createdAt INTEGER NOT NULL
);
```

**Default Admin Account:**
- Email: `atlas@studentmail.com`
- Username: `admin22`
- Password: `@Atlas22`

#### **activities**
```sql
CREATE TABLE activities (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  steps INTEGER NOT NULL,
  date INTEGER NOT NULL  -- Unix timestamp
);
```

#### **archived_activities**
```sql
CREATE TABLE archived_activities (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  steps INTEGER NOT NULL,
  date INTEGER NOT NULL,        -- Original activity date
  archivedAt INTEGER NOT NULL   -- Archive timestamp
);
```

### Database Files
- `app.db` - User authentication database
- `activities.db` - Activities and archive database

---

## 🔐 Authentication System

### Password Requirements
- Minimum 6 characters
- At least one letter
- At least one number
- At least one special character (@#!&$*)
- No consecutive characters or sequential patterns
- Not in common weak password list

### Username Requirements
- 3-15 characters
- Letters and numbers only
- No spaces or special characters
- Must be unique

### Email Requirements
- Valid email format
- Must be unique

### Phone Requirements
- Exactly 10 digits (US format)
- Numbers only

### Features
- Secure password validation
- Duplicate email/username detection
- Database migration support
- Session management
- Admin user creation on first launch

---

## 📊 Key Features Explained

### Activity Management
- **Add Activities**: Input step count with automatic timestamp
- **Edit Activities**: Tap any activity to modify step count
- **Delete Activities**: Swipe right to delete individual activities
- **Archive Activities**: Swipe left to archive (moves to archive section)
- **Bulk Delete**: Delete all activities or filtered search results

### Search Functionality
- Search by step count (with intelligent frequency + position sorting)
- Search by date (supports partial date matching)
- Search by time
- Real-time filtering

### Statistics
- Total steps across all activities
- Average steps per activity
- Maximum and minimum step counts
- Recent activity bar chart (last 7 entries)
- Activity distribution by ranges (0-2K, 2K-5K, 5K-10K, 10K+)

### Archive System
- Permanent storage for completed activities
- Separate statistics for archived data
- Restore from archive functionality
- Bulk delete archived activities
- Independent from active activities

### Theme System
Three pre-configured themes:
- **Light**: Clean, bright interface
- **Dark**: OLED-friendly dark mode
- **Warm**: Beige/cream aesthetic

Themes affect:
- Background colors
- Card backgrounds
- Text colors
- Border colors
- Input fields
- Shadow colors

---

## 🎨 UI/UX Highlights

### Gestures
- **Swipe Left**: Archive activity
- **Swipe Right**: Delete activity
- **Tap**: Edit activity
- **Pull to Refresh**: Reload data

### Visual Feedback
- Loading skeletons for data fetching
- Success/error alerts for all actions
- Haptic feedback on interactions
- Smooth animations for transitions
- Real-time badge updates

### Accessibility
- High contrast text colors
- Clear visual hierarchy
- Readable font sizes
- Descriptive button labels
- Confirmation dialogs for destructive actions

---

## 🚀 Development Workflow

### Available Scripts
```bash
npm start              # Start Expo dev server
npm run android        # Run on Android
npm run ios           # Run on iOS
npm run web           # Run on web browser
npm run lint          # Run ESLint
npm run reset-project # Reset project (removes example code)
```

### Development Tips
1. Use Expo Go app for quick testing
2. Enable hot reload for rapid iteration
3. Check console logs for database operations
4. Use TypeScript for type safety
5. Test on both iOS and Android
6. Clear app data if database schema changes

---

## 🐛 Troubleshooting

### Database Issues

**Error: "table users has no column named firstName"**
- The app includes automatic database migration
- If issues persist, uninstall and reinstall the app
- This will recreate the database with the correct schema

**Activities not loading**
- Check console for database errors
- Ensure `expo-sqlite` is properly installed
- Verify database file permissions

### Authentication Issues

**Cannot login with admin account**
- Default admin is created on first launch
- Email: `atlas@studentmail.com`
- Password: `@Atlas22`
- Check database was initialized correctly

**Password validation errors**
- Ensure password meets all requirements
- Check for consecutive characters
- Avoid common weak passwords

### Navigation Issues

**Stuck on login screen after successful auth**
- Check `useAuth` hook is called at top level
- Verify navigation guards in `_layout.tsx`
- Clear app cache and restart

### Performance Issues

**Slow list scrolling**
- FlashList is optimized for large datasets
- Ensure `estimatedItemSize` is accurate
- Reduce unnecessary re-renders with `useMemo`

---

## 🔧 Configuration

### Expo Configuration (`app.json`)
- **Name**: atlas-mobile-intro
- **Slug**: atlas-mobile-intro
- **Version**: 1.0.0
- **Orientation**: Portrait
- **New Architecture**: Enabled

### TypeScript Configuration
- Strict mode enabled
- ES2020 target
- ESNext module resolution

---

## 📱 Screen Descriptions

### Home Screen (`index.tsx`)
- Lists all active activities
- Shows summary statistics (total, average, count)
- Search bar with smart filtering
- Add activity button
- Delete all button (conditional)

### Add Activity (`add.tsx`)
- Simple form for step count input
- Date/time picker
- Validation for numeric input
- Auto-focuses on mount

### Statistics (`stats.tsx`)
- Summary cards (total, average, max, min)
- Bar chart for recent 7 activities
- Distribution chart by step ranges
- Responsive to theme changes

### Archive (`archive.tsx`)
- Lists all archived activities
- Archive-specific statistics
- Restore from archive functionality
- Clear archive button

### Settings (`settings.tsx`)
- User profile management
- Account preferences
- Password change
- Logout option

### Login (`login.tsx`)
- Username or email input
- Password with show/hide toggle
- Link to registration
- Form validation

### Register (`register.tsx`)
- Multi-field registration form
- Real-time validation feedback
- Password matching confirmation
- Phone number formatting

### Admin Panel (`admin.tsx`)
- User list with details
- User management actions
- Password reset functionality
- Delete user capability

---

## 🎯 Future Enhancements

Potential features for future versions:
- Cloud sync with backend API
- Social sharing of achievements
- Goal setting and tracking
- Notifications and reminders
- Data export (CSV, PDF)
- Charts with date range selection
- Multi-user profiles on same device
- Integration with fitness APIs
- Dark mode scheduling
- Biometric authentication

---

## 📄 License

MIT License

Copyright (c) 2024 Frandy Slueue

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

---

## 👨‍💻 Developer

**Frandy Slueue**  
Atlas School Student  
📧 frandy.slueue@atlasstudents.com  
🐙 [@frandy4ever](https://github.com/frandy4ever)

---

## 🙏 Acknowledgments

- Atlas School for the opportunity
- Expo team for excellent documentation
- React Native community for support
- Lucide for beautiful icons
- All beta testers and contributors

---

**Happy Tracking! 🎯**
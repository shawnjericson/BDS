# 📱 BDS Mobile App

React Native mobile application for the Business Distribution System (BDS).

## 🚀 Tech Stack

- **Framework**: Expo (React Native)
- **Navigation**: React Navigation v6
- **State Management**: Zustand
- **Data Fetching**: TanStack Query (React Query)
- **Forms**: React Hook Form
- **HTTP Client**: Axios
- **Icons**: React Native Vector Icons
- **Storage**: AsyncStorage & Expo Secure Store

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
├── screens/            # Screen components
│   ├── auth/           # Authentication screens
│   └── main/           # Main app screens
├── navigation/         # Navigation configuration
├── services/           # API services
├── stores/            # Zustand stores
├── types/             # TypeScript type definitions
├── utils/             # Utility functions
└── hooks/             # Custom React hooks
```

## 🔧 Setup & Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Install additional web dependencies** (for web testing):
   ```bash
   npx expo install react-dom react-native-web
   ```

3. **Configure API endpoint**:
   Update `src/services/api.ts` with your backend URL:
   ```typescript
   const API_BASE_URL = 'http://your-backend-url:3000';
   ```

## 🏃‍♂️ Running the App

### Development Server
```bash
npm start
```

### Platform-specific commands
```bash
# Android
npm run android

# iOS (requires macOS)
npm run ios

# Web (for testing)
npm run web
```

## 📱 Features Implemented

### ✅ Authentication
- [x] Login screen with form validation
- [x] Register screen with referral code validation
- [x] JWT token management
- [x] Auto-login on app start
- [x] Logout functionality

### ✅ Navigation
- [x] Stack navigation for auth flow
- [x] Bottom tab navigation for main app
- [x] Screen transitions and navigation guards

### ✅ State Management
- [x] Zustand store for authentication
- [x] Persistent storage with AsyncStorage
- [x] Error handling and loading states

### ✅ UI/UX
- [x] Responsive design
- [x] Material Design icons
- [x] Loading indicators
- [x] Error messages
- [x] Form validation

### 🚧 In Progress
- [ ] Product management screens
- [ ] Booking management screens
- [ ] Wallet and transaction screens
- [ ] Image upload functionality
- [ ] Push notifications

## 🔗 API Integration

The app integrates with the BDS backend API for:

- **Authentication**: Login, register, token refresh
- **User Management**: Profile, referral code validation
- **Product Management**: CRUD operations, approval workflow
- **Booking Management**: Create, view, update bookings
- **Wallet Management**: Balance, transactions, earnings

## 📋 API Endpoints Used

```
POST /auth/login
POST /auth/register
GET  /users/me
GET  /users/validate-referral/:code
GET  /products
POST /products
GET  /bookings
POST /bookings
GET  /wallets/me/summary
GET  /wallets/me/transactions
```

## 🎨 Design System

### Colors
- Primary: `#007AFF` (iOS Blue)
- Success: `#4CAF50` (Green)
- Warning: `#FF9800` (Orange)
- Error: `#ff4444` (Red)
- Background: `#f8f9fa` (Light Gray)

### Typography
- Title: 24px, Bold
- Subtitle: 16px, Regular
- Body: 14px, Regular
- Caption: 12px, Regular

## 🔒 Security

- JWT tokens stored securely using AsyncStorage
- API requests include authorization headers
- Form validation on client-side
- Referral code validation before registration

## 🧪 Testing

### Running Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch
```

### Testing Strategy
- Unit tests for utilities and services
- Component tests for UI components
- Integration tests for API calls
- E2E tests for critical user flows

## 📦 Build & Deployment

### Development Build
```bash
npx expo build:android
npx expo build:ios
```

### Production Build
```bash
# Android
eas build --platform android

# iOS
eas build --platform ios
```

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:
```
API_BASE_URL=http://your-backend-url:3000
```

### App Configuration
Update `app.json` for app-specific settings:
- App name and version
- Icons and splash screens
- Permissions
- Build configurations

## 🐛 Troubleshooting

### Common Issues

1. **Metro bundler port conflict**:
   ```bash
   npx expo start --clear
   ```

2. **Dependencies version conflicts**:
   ```bash
   npm install --legacy-peer-deps
   ```

3. **iOS simulator not opening**:
   - Ensure Xcode is installed
   - Check iOS simulator is available

4. **Android emulator issues**:
   - Ensure Android Studio is installed
   - Check AVD is running

## 📚 Next Steps

1. **Complete remaining screens**:
   - Product listing and detail screens
   - Booking management screens
   - Wallet transaction history
   - User profile management

2. **Add advanced features**:
   - Image upload for products
   - Push notifications
   - Offline support
   - Biometric authentication

3. **Performance optimization**:
   - Image caching
   - List virtualization
   - Bundle size optimization

4. **Testing & QA**:
   - Comprehensive test coverage
   - Device testing
   - Performance testing

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is part of the BDS system and is proprietary software.

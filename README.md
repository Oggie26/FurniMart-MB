# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## 📱 AR Feature (Augmented Reality)

FurniMart now includes a complete AR solution for viewing furniture in real space!

### ✨ Features

- ✅ WebAR with model-viewer (no native code required)
- ✅ Works on both iOS and Android
- ✅ View 3D models in AR mode
- ✅ Camera controls (rotate, zoom, pan)
- ✅ Auto-rotation
- ✅ Fully integrated with Expo Managed Workflow

### 🚀 Quick Start

```bash
# Start the app
npm start

# Navigate to /ar-demo to see the demo
```

### 📚 Documentation

- **[AR_INDEX.md](./AR_INDEX.md)** - Start here! Complete navigation guide
- **[QUICK_START.md](./components/ar/QUICK_START.md)** - Get started in 5 minutes
- **[AR_SUMMARY.md](./AR_SUMMARY.md)** - Complete overview
- **[HOSTING_GUIDE.md](./components/ar/HOSTING_GUIDE.md)** - How to host 3D models
- **[SAMPLE_MODELS.md](./components/ar/SAMPLE_MODELS.md)** - Free 3D models for testing

### 💡 Usage Example

```typescript
import ARButton from '@/components/ar/ARButton';

<ARButton 
  modelUrl="https://example.com/model.glb"
  buttonText="XEM TRONG PHÒNG"
  size="large"
  variant="gradient"
/>
```

### 📱 Test AR

1. Run app on a real device (AR doesn't work on emulators)
2. Navigate to a product with 3D model
3. Tap "XEM TRONG PHÒNG"
4. Tap "Xem AR" to place in real space

For more details, see [AR_INDEX.md](./AR_INDEX.md)

## 💝 Favourites Feature

Save and manage your favorite furniture products!

### ✨ Features

- ✅ Add/remove products to favorites
- ✅ Dedicated favorites screen
- ✅ AR support in favorites
- ✅ Beautiful card layout
- ✅ Pull to refresh

### 🚀 Quick Usage

```typescript
// Navigate to favourites
router.push('/favourites');

// In product detail, tap the heart icon to favorite
```

For more details, see [FAVOURITES_GUIDE.md](./FAVOURITES_GUIDE.md)

## 🏠 AR Room Feature

Place multiple furniture products in your real space - just like IKEA Place!

### ✨ Features

- ✅ Multi-product placement
- ✅ Surface detection
- ✅ Infinite product placement
- ✅ Product selection from list
- ✅ Clear all and restart
- ✅ Real-time product count

### 🚀 Quick Usage

```typescript
// Navigate to AR Room demo
router.push('/ar-room');

// Or use component directly
import ARRoomViewer from '@/components/ar/ARRoomViewer';

<ARRoomViewer
  products={products}
  onClose={() => setShowAR(false)}
/>
```

### 🎮 How It Works

1. Open AR Room
2. Camera starts + surface detection
3. Select product from list
4. Tap screen to place
5. Repeat to add more products
6. Clear all anytime

For more details, see [AR_ROOM_GUIDE.md](./components/ar/AR_ROOM_GUIDE.md)

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.

#  - Generated Icons and Splash Screens

This ZIP file contains all the required icon and splash screen assets for your mobile app.

## Folder Structure

### iOS Assets
- `ios/icons/` - App icons for iOS (various sizes for different devices and contexts)
- `ios/splash/` - Splash screens for iOS (various device sizes and orientations)

### Android Assets
- `android/icons/` - App icons for Android (various densities)
- `android/splash/` - Splash screens for Android (various screen sizes)

## Usage Instructions

### For iOS (Xcode)
1. Open your Xcode project
2. Navigate to your app target settings
3. Go to "App Icons and Launch Images"
4. Drag and drop the appropriate icon sizes from `ios/icons/` into the App Icon slots
5. For splash screens, add the images from `ios/splash/` to your project and configure them in your Launch Screen storyboard

### For Android (Android Studio)
1. Open your Android Studio project
2. Right-click on `app/src/main/res`
3. Select "New" > "Image Asset"
4. Choose "Launcher Icons (Adaptive and Legacy)" and import the icons from `android/icons/`
5. For splash screens, place the images from `android/splash/` in the appropriate drawable folders

### For Capacitor Projects
If you're using Capacitor (like NextNative), you can:
1. Place iOS icons in `ios/App/App/Assets.xcassets/AppIcon.appiconset/`
2. Place Android icons in `android/app/src/main/res/drawable*/`
3. Configure splash screens according to Capacitor's documentation

## File Naming Convention

### Icons
- iOS: `ios-icon-{size}` (e.g., ios-icon-1024.png)
- Android: `android-icon-{size}` (e.g., android-icon-512.png)

### Splash Screens
- iOS: `ios-splash-{width}x{height}` (e.g., ios-splash-2732x2732.png)
- Android: `android-splash-{width}x{height}` (e.g., android-splash-1920x1920.png)

## Generated with NextNative Tools
These assets were generated using the free app icon and splash screen generator:

- https://nextnative.dev/free-tools/app-icon-splash-generator

Optional credit (copy/paste into your README):

```
[App icon & splash generator by NextNative](https://nextnative.dev/free-tools/app-icon-splash-generator)
```

For more mobile app development tools and resources, visit:
- NextNative Documentation: https://nextnative.dev/docs
- Mobile App Templates: https://nextnative.dev/templates
- Development Blog: https://nextnative.dev/blog

Happy coding! 🚀

# wonder-emporium-app

Run command:
npx expo run:android

You don't have a React Native project yet, so here's the full flow. Open a terminal:

1. Start the emulator (let it finish booting ~30s):

source-/.bashrc
-/Android/Sdk/emulator/emulator avd rn_dev &
adb wait-for-device shell getprop sys.boot_completed
(It prints 1 when fully booted.)

3. Run it on the emulator:
   npx react-native run-android
   This compiles with Gradle (first build takes 5-15 min on low RAM) and auto-installs + launches the app on the emulator.
   Notes for your low-RAM machine:
   Keep other apps closed while building/running

- If the emulator lags: start it headless with -no-window-gpu swiftshader_indirect and just view via adb (or use adb shell screencap to see it)
- After the first build, subsequent builds are much faster
  Want me to create the project and do a full build test now?

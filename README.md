# Watchout

Mobile and Web application which will allow user to report any kind of incident around them to warn other people about the danger.
Incident can be an uncommonly big traffic jam or power outages on certain streets.

## Mobile application - setup guide

### Prerequisites

- [Node.js with npm](https://nodejs.org/en/download)
- [Android Studio](https://developer.android.com/studio)

### Launching

Setup emulator with guide provided by expo team: [https://docs.expo.dev/workflow/android-studio-emulator/](https://docs.expo.dev/workflow/android-studio-emulator/)

1. Open terminal and ensure current path is `Client/watchout`
2. Install all packages by command `npm install` (alias `npm i`)
3. Run application by command `npm run android`

After third step an application should open on Android emulator or connected device.

For proper functioning of the application backend server must be running. Please refer to the `Server/README.md` for more information about launching the server.

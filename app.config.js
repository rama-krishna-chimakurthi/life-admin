module.exports = {
  "expo": {
    "name": "life-admin",
    "slug": "life-admin",
    "version": "1.0.0",
    "runtimeVersion": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/splash-icon.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "assetBundlePatterns": [
      "**/*"
    ],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.rk.lifeadmin"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "package": "com.rk.lifeadmin",
      "googleServicesFile": process.env.GOOGLE_SERVICES_JSON || "./google-services.json"
    },
    "web": {
      "favicon": "./assets/favicon.png"
    },
    "scheme": "lifeadmin",
    "plugins": [
      "@react-native-google-signin/google-signin"
    ],
    "extra": {
      "eas": {
        "projectId": "6257bcab-dfdf-41c2-9ef4-a3d318e3cb52"
      }
    }
  }
}

# CampusRide Mobile - React Native (Expo)

Application mobile pour le covoiturage universitaire campus UPM Marrakech.

## Screenshots & Features

- **Splash Screen** animee avec le logo CampusRide
- **Authentification** (Login/Register) avec Supabase
- **Home** - Dashboard avec mode passager/driver
- **Recherche** - Filtres par depart, destination + chips rapides
- **Publier** - Formulaire de creation de trajet complet
- **Reservation** - Detail conducteur + envoi de demande
- **Mes Reservations** - Timeline de statut, actions rapides
- **Mes Trajets** - Dashboard driver avec gestion passagers
- **Notifications** - Centre d'activite
- **Profil** - Informations, stats, menu navigation

## Installation

```bash
cd mobile
npm install
```

## Lancer en mode developpement

```bash
npx expo start
```

Scanne le QR code avec **Expo Go** sur ton telephone.

## Construire l'APK

### Option 1: EAS Build (recommandee - cloud)

```bash
# Installer EAS CLI
npm install -g eas-cli

# Se connecter a Expo
eas login

# Construire l'APK
eas build -p android --profile preview
```

L'APK sera disponible en telechargement sur ton dashboard Expo.

### Option 2: Build local

```bash
# Pre-requis: Android SDK installe
npx expo prebuild --platform android
cd android
./gradlew assembleRelease
```

L'APK se trouve dans `android/app/build/outputs/apk/release/`

## Configuration Supabase (optionnel)

Pour connecter au vrai backend, cree un fichier `.env` :

```
EXPO_PUBLIC_SUPABASE_URL=https://ton-projet.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=ta-cle-anon
```

Sans configuration Supabase, l'app fonctionne en **mode demo** avec des donnees mock.

## Structure du projet

```
mobile/
├── App.js                    # Point d'entree
├── app.json                  # Config Expo (splash, icon, etc.)
├── eas.json                  # Config EAS Build (APK/AAB)
├── assets/images/
│   ├── logo.png              # Logo CampusRide
│   └── splash-photo.png      # Image splash
└── src/
    ├── components/           # Composants reutilisables
    │   ├── Avatar.js
    │   ├── GradientButton.js
    │   ├── StatusBadge.js
    │   └── TripCard.js
    ├── context/
    │   └── AuthContext.js    # Authentification
    ├── data/
    │   └── mockData.js       # Donnees demo
    ├── navigation/
    │   └── AppNavigator.js   # React Navigation
    ├── screens/
    │   ├── SplashScreen.js
    │   ├── LoginScreen.js
    │   ├── RegisterScreen.js
    │   ├── HomeScreen.js
    │   ├── SearchScreen.js
    │   ├── PublishScreen.js
    │   ├── ReservationScreen.js
    │   ├── MyReservationsScreen.js
    │   ├── MyTripsScreen.js
    │   ├── NotificationsScreen.js
    │   └── ProfileScreen.js
    ├── services/
    │   ├── authService.js
    │   ├── reservationService.js
    │   ├── supabaseClient.js
    │   └── trajetService.js
    └── utils/
        ├── helpers.js
        └── theme.js          # Couleurs, spacing, design system
```

## Design

- **Theme sombre** premium avec couleurs neon (violet, turquoise)
- **Gradients** et effets de profondeur
- **Animations** sur le splash screen
- **Bottom Tab** avec bouton central flottant pour publier
- **Cards** avec bordures subtiles et shadow
- UI inspiree des apps modernes (Uber, BlaBlaCar)

## Tech Stack

- React Native + Expo SDK 51
- React Navigation 6 (Stack + Bottom Tabs)
- Expo Linear Gradient
- @expo/vector-icons (Ionicons)
- Supabase JS (auth + database)
- AsyncStorage (persistence session)

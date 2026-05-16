import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { AuthStack, AppStack, DemoStack } from './src/navigation/AppNavigator';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Colors } from './src/utils/theme';

function Navigation() {
  const { session, loading, isConfigured } = useAuth();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  // In demo mode (no Supabase configured), always show AuthStack first
  // User can navigate to app from splash -> login (skip auth)
  const showApp = isConfigured ? Boolean(session) : false;

  return (
    <NavigationContainer
      theme={{
        dark: true,
        colors: {
          primary: Colors.primary,
          background: Colors.background,
          card: Colors.backgroundCard,
          text: Colors.text,
          border: Colors.border,
          notification: Colors.secondary,
        },
      }}
    >
      {showApp ? <AppStack /> : <DemoStack />}
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar style="light" />
        <Navigation />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
  },
});

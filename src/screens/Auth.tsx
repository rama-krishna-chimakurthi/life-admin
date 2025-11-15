// src/screens/Auth.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AntDesign } from '@expo/vector-icons';
import { useAuth } from '../store/AuthStore';
import AppIcon from '../components/AppIcon';

export default function Auth() {
  const { signInWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Sign in failed');
    }
    setLoading(false);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f6f8fb' }}>
      <View style={{ flex: 1, padding: 24, justifyContent: 'center', alignItems: 'center' }}>
        <AppIcon size={80} style={{ marginBottom: 24 }} />
        <Text style={{ fontSize: 32, fontWeight: '700', textAlign: 'center', marginBottom: 16 }}>
          Life Admin
        </Text>
        
        <Text style={{ fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 48 }}>
          Manage your finances and reminders
        </Text>

        <TouchableOpacity
          onPress={handleGoogleSignIn}
          disabled={loading}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#fff',
            padding: 16,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: '#e6eef7',
            minWidth: 250
          }}
        >
          <AntDesign name="google" size={20} color="#4285F4" style={{ marginRight: 12 }} />
          <Text style={{ color: '#333', fontWeight: '600', fontSize: 16 }}>
            {loading ? 'Signing in...' : 'Continue with Google'}
          </Text>
        </TouchableOpacity>
        
        <Text style={{ fontSize: 12, color: '#999', textAlign: 'center', marginTop: 32, paddingHorizontal: 32 }}>
          By continuing, you agree to our Terms of Service and Privacy Policy
        </Text>
      </View>
    </SafeAreaView>
  );
}
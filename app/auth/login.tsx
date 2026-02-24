import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Alert, 
  ActivityIndicator, 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform 
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { useRouter } from 'expo-router';
import api from '../../lib/api'; 

export default function LoginScreen() {
  const router = useRouter();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Błąd', 'Proszę podać email i hasło');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/login/', { 
        email: email, 
        password: password 
      });

      const { access, refresh } = response.data;

      await SecureStore.setItemAsync('userToken', access);
      
      if (refresh) {
        await SecureStore.setItemAsync('refreshToken', refresh);
      }
      
      router.replace('/(tabs)'); 

    } catch (error: any) {
      console.error("Login error:", error);
      
      const msg = error.response?.data?.error || "Wystąpił błąd połączenia z serwerem.";
      
      if (error.response?.status === 401) {
         Alert.alert("Błąd logowania", "Nieprawidłowy email lub hasło.");
      } else if (error.response?.status === 404) {
         Alert.alert("Błąd", "Nie znaleziono takiego endpointu (404). Sprawdź adres IP w api.ts.");
      } else {
         Alert.alert("Błąd", msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.formContainer}>
        <Text style={styles.title}>Witaj ponownie!</Text>
        <Text style={styles.subtitle}>Zaloguj się, aby planować wesele</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="np. jan@kowalski.pl"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholderTextColor="#a8a29e"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Hasło</Text>
          <TextInput
            style={styles.input}
            placeholder="********"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholderTextColor="#a8a29e"
          />
        </View>

        <TouchableOpacity 
          style={styles.button} 
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Zaloguj się</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => router.push('/auth/register')} 
          style={styles.linkButton}
        >
          <Text style={styles.linkText}>Nie masz konta? Zarejestruj się</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    padding: 20,
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1c1917',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#78716c',
    marginBottom: 32,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#44403c',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#fafaf9',
    borderWidth: 1,
    borderColor: '#e7e5e4',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: '#1c1917',
  },
  button: {
    backgroundColor: '#e11d48',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#e11d48',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  linkButton: {
    marginTop: 20,
    alignItems: 'center',
    padding: 10,
  },
  linkText: {
    color: '#57534e',
    fontSize: 14,
  }
});
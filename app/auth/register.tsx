import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Mail, Lock, User, ArrowLeft, Eye, EyeOff } from 'lucide-react-native';
import api from '../../lib/api';

export default function RegisterScreen() {
  const router = useRouter();
  const [fullname, setFullname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleRegister = async () => {
    if (!fullname || !email || !password) {
      Alert.alert("Błąd", "Wypełnij wszystkie pola.");
      return;
    }

    setLoading(true);
    try {
      await api.post('/register/', { 
        fullname, 
        email, 
        password,
        role: 'client'
      });

      Alert.alert("Sukces", "Konto utworzone! Możesz się teraz zalogować.", [
        { text: "OK", onPress: () => router.back() }
      ]);
    } catch (error: any) {
      const errorData = error.response?.data;
      let msg = "Wystąpił błąd rejestracji.";
      if (errorData) {
        if (errorData.email) msg = `Email: ${errorData.email[0]}`;
        else if (errorData.password) msg = `Hasło: ${errorData.password[0]}`;
        else if (typeof errorData === 'string') msg = errorData;
      }
      Alert.alert("Błąd", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white"
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} bounces={false}>
        <View className="flex-1">
          
          <View className="h-[40%] w-full relative">
            <Image 
              source={{ uri: "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=2070&auto=format&fit=crop" }} 
              className="w-full h-full"
              resizeMode="cover"
            />
            <LinearGradient 
              colors={['rgba(0,0,0,0.4)', 'transparent', '#ffffff']} 
              locations={[0, 0.4, 1]}
              className="absolute inset-0" 
            />
            
            <TouchableOpacity 
              onPress={() => router.back()} 
              className="absolute top-14 left-6 bg-white/80 p-3 rounded-full shadow-sm"
              style={{ elevation: 5 }}
            >
              <ArrowLeft color="#1c1917" size={20} />
            </TouchableOpacity>
          </View>

          <View className="flex-1 px-8 -mt-16 bg-white rounded-t-[45px] shadow-2xl">
            <View className="items-center mt-10 mb-10">
              <Text className="text-4xl font-extrabold text-stone-900 tracking-tight">Utwórz konto</Text>
              <Text className="text-stone-400 text-base mt-2 text-center">
                Zacznij planować swoje wymarzone wesele z nami.
              </Text>
            </View>

            <View className="gap-y-5">
              <View>
                <Text className="text-stone-500 ml-2 mb-2 font-medium">Imię i Nazwisko</Text>
                <View className="flex-row items-center border border-stone-100 rounded-[22px] px-5 py-4 bg-stone-50/50">
                  <User size={20} color="#a8a29e" />
                  <TextInput 
                    placeholder="np. Anna Nowak"
                    className="flex-1 ml-3 text-stone-800 text-[16px]"
                    value={fullname}
                    onChangeText={setFullname}
                    placeholderTextColor="#d6d3d1"
                  />
                </View>
              </View>

              <View>
                <Text className="text-stone-500 ml-2 mb-2 font-medium">Adres e-mail</Text>
                <View className="flex-row items-center border border-stone-100 rounded-[22px] px-5 py-4 bg-stone-50/50">
                  <Mail size={20} color="#a8a29e" />
                  <TextInput 
                    placeholder="twoj@email.pl"
                    className="flex-1 ml-3 text-stone-800 text-[16px]"
                    autoCapitalize="none"
                    keyboardType="email-address"
                    value={email}
                    onChangeText={setEmail}
                    placeholderTextColor="#d6d3d1"
                  />
                </View>
              </View>

              <View>
                <Text className="text-stone-500 ml-2 mb-2 font-medium">Hasło</Text>
                <View className="flex-row items-center border border-stone-100 rounded-[22px] px-5 py-4 bg-stone-50/50">
                  <Lock size={20} color="#a8a29e" />
                  <TextInput 
                    placeholder="Min. 8 znaków"
                    className="flex-1 ml-3 text-stone-800 text-[16px]"
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={setPassword}
                    placeholderTextColor="#d6d3d1"
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff size={20} color="#a8a29e" /> : <Eye size={20} color="#a8a29e" />}
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity 
                onPress={handleRegister}
                disabled={loading}
                activeOpacity={0.8}
                className="bg-stone-900 rounded-[22px] py-5 mt-4 shadow-xl shadow-stone-400"
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white font-bold text-center text-lg">Zarejestruj się</Text>
                )}
              </TouchableOpacity>
            </View>

            <View className="flex-row justify-center mt-auto py-10">
              <Text className="text-stone-400 text-[15px]">Masz już konto? </Text>
              <Link href="/auth/login" asChild>
                <TouchableOpacity>
                  <Text className="text-stone-900 font-bold text-[15px]">Zaloguj się</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
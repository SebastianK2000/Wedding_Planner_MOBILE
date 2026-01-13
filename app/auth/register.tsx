import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Mail, Lock, User, ArrowLeft } from 'lucide-react-native';
import api from '../../lib/api';

export default function RegisterScreen() {
  const router = useRouter();
  const [fullname, setFullname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

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
        console.error(error);
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
      className="flex-1"
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 bg-white">
          
          <View className="h-[35%] w-full relative">
             <Image 
                source={{ uri: "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=2070&auto=format&fit=crop" }} 
                className="w-full h-full"
                resizeMode="cover"
             />
             <LinearGradient colors={['transparent', '#ffffff']} className="absolute bottom-0 left-0 right-0 h-32" />
             
             <TouchableOpacity onPress={() => router.back()} className="absolute top-12 left-6 bg-white/30 p-2 rounded-full backdrop-blur-md">
                <ArrowLeft color="white" size={24} />
             </TouchableOpacity>
          </View>

          <View className="flex-1 px-8 -mt-10 bg-white rounded-t-[40px]">
             <Text className="text-3xl font-bold text-stone-900 text-center mt-8 mb-2">Utwórz konto</Text>
             <Text className="text-stone-500 text-center mb-8">Zacznij planować swoje wymarzone wesele.</Text>

             <View className="space-y-4">
                <View className="flex-row items-center border border-stone-200 rounded-2xl px-4 py-3 bg-stone-50">
                    <User size={20} className="text-stone-400 mr-3" />
                    <TextInput 
                        placeholder="Imię i Nazwisko"
                        className="flex-1 text-stone-800 text-base"
                        value={fullname}
                        onChangeText={setFullname}
                    />
                </View>

                <View className="flex-row items-center border border-stone-200 rounded-2xl px-4 py-3 bg-stone-50">
                    <Mail size={20} className="text-stone-400 mr-3" />
                    <TextInput 
                        placeholder="Adres e-mail"
                        className="flex-1 text-stone-800 text-base"
                        autoCapitalize="none"
                        value={email}
                        onChangeText={setEmail}
                    />
                </View>

                <View className="flex-row items-center border border-stone-200 rounded-2xl px-4 py-3 bg-stone-50">
                    <Lock size={20} className="text-stone-400 mr-3" />
                    <TextInput 
                        placeholder="Hasło"
                        className="flex-1 text-stone-800 text-base"
                        secureTextEntry
                        value={password}
                        onChangeText={setPassword}
                    />
                </View>

                <TouchableOpacity 
                    onPress={handleRegister}
                    disabled={loading}
                    className="bg-stone-900 rounded-2xl py-4 flex-row justify-center items-center shadow-lg shadow-stone-500/30 mt-4"
                >
                    {loading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text className="text-white font-bold text-lg">Zarejestruj się</Text>
                    )}
                </TouchableOpacity>
             </View>

             <View className="flex-row justify-center mt-8 pb-10">
                <Text className="text-stone-500">Masz już konto? </Text>
                <Link href="/auth/login" asChild>
                    <TouchableOpacity>
                        <Text className="text-stone-900 font-bold">Zaloguj się</Text>
                    </TouchableOpacity>
                </Link>
             </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
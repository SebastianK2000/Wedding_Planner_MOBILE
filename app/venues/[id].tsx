import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { 
    ArrowLeft, Star, MapPin, Check, Building2, 
    Users, Utensils, Share2, Heart, ShoppingCart 
} from 'lucide-react-native';
import { VenueItem } from './index';

const PLN = (n: number) => new Intl.NumberFormat("pl-PL", { style: "currency", currency: "PLN", maximumFractionDigits: 0 }).format(n);

export default function VenueDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const item: VenueItem = params.data ? JSON.parse(params.data as string) : null;
  const [inCart, setInCart] = useState(false);

  useEffect(() => { checkIfInCart(); }, []);

  const checkIfInCart = async () => {
      try {
          const cartRaw = await AsyncStorage.getItem('wp_cart');
          const cart: any[] = cartRaw ? JSON.parse(cartRaw) : [];
          const exists = cart.some(p => String(p.id) === String(item.id) && p.name === item.name);
          setInCart(exists);
      } catch (e) { console.log(e); }
  };

  if (!item) return <View className="flex-1 bg-white items-center justify-center"><Text>Błąd danych</Text></View>;

  const getIcon = (feature: string) => {
    return <Check size={18} className="text-green-600"/>;
  };

  const handleAddToCart = async () => {
      try {
          const cartRaw = await AsyncStorage.getItem('wp_cart');
          const cart: any[] = cartRaw ? JSON.parse(cartRaw) : [];
          
          const exists = cart.some(p => String(p.id) === String(item.id) && p.name === item.name);
          
          if (exists) {
              Alert.alert("Informacja", "Ta sala jest już w koszyku.");
              return;
          }

          const itemToAdd = { ...item, category: 'venue' };
          const newCart = [...cart, itemToAdd];
          
          await AsyncStorage.setItem('wp_cart', JSON.stringify(newCart));
          setInCart(true);
          Alert.alert("Sukces", "Dodano do koszyka!");
      } catch (e) {
          Alert.alert("Błąd", "Nie udało się zapisać.");
      }
  };

  return (
    <View className="flex-1 bg-white">
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 100 }} bounces={false}>
        
        <View className="relative h-[450px] w-full">
          <Image source={{ uri: item.img }} className="w-full h-full" resizeMode="cover" />
          <LinearGradient colors={['rgba(0,0,0,0.4)', 'transparent', 'rgba(0,0,0,0.8)']} className="absolute inset-0" />
          
          <SafeAreaView className="absolute top-0 left-0 right-0 flex-row justify-between px-4 z-50">
            <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full items-center justify-center shadow-sm">
              <ArrowLeft color="white" size={24} />
            </TouchableOpacity>
            <View className="flex-row gap-2">
                <TouchableOpacity className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full items-center justify-center"><Share2 color="white" size={20} /></TouchableOpacity>
                <TouchableOpacity className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full items-center justify-center"><Heart color="white" size={20} /></TouchableOpacity>
            </View>
          </SafeAreaView>

          <View className="absolute bottom-0 left-0 right-0 p-6">
             <View className="flex-row items-center gap-2 mb-3">
                 <View className="bg-yellow-600 px-3 py-1 rounded-full">
                    <Text className="text-white text-xs font-bold uppercase tracking-wider">Sala Weselna</Text>
                 </View>
                 <View className="bg-black/30 backdrop-blur-md px-2 py-1 rounded-lg flex-row items-center gap-1">
                    <Star size={12} fill="#facc15" color="#facc15" />
                    <Text className="text-white text-xs font-bold">{item.rating.toFixed(1)}</Text>
                 </View>
             </View>
             <Text className="text-4xl font-bold text-white mb-1 shadow-sm">{item.name}</Text>
             <View className="flex-row items-center gap-2">
                <MapPin size={16} className="text-stone-300" />
                <Text className="text-stone-200 text-lg">{item.city}</Text>
             </View>
          </View>
        </View>

        <View className="px-6 py-8 -mt-6 rounded-t-[2.5rem] bg-white">
            <View className="flex-row border-b border-stone-100 pb-8 mb-8">
                <View className="flex-1 border-r border-stone-100 pr-4">
                    <Text className="text-xs text-stone-400 uppercase font-bold tracking-wider mb-1">Cena / os.</Text>
                    <Text className="text-xl font-bold text-stone-900">{PLN(item.pricePerPerson)}</Text>
                </View>
                <View className="flex-1 pl-6">
                    <Text className="text-xs text-stone-400 uppercase font-bold tracking-wider mb-1">Pojemność</Text>
                    <View className="flex-row items-center gap-2">
                         <Users size={20} className="text-stone-800" />
                         <Text className="text-base font-medium text-stone-900">{item.capacity}</Text>
                    </View>
                </View>
            </View>

            <Text className="text-2xl font-bold text-stone-900 mb-4">O miejscu</Text>
            <Text className="text-stone-600 text-lg leading-7 mb-8">{item.description}</Text>

            <Text className="text-2xl font-bold text-stone-900 mb-4">Udogodnienia</Text>
            <View className="flex-row flex-wrap gap-3 mb-8">
                {item.features.map((f, i) => (
                    <View key={i} className="flex-row items-center bg-stone-50 px-4 py-3 rounded-2xl border border-stone-100">
                        {getIcon(f)}
                        <Text className="ml-2 text-stone-700 font-medium">{f}</Text>
                    </View>
                ))}
            </View>
        </View>
      </ScrollView>

      <SafeAreaView edges={['bottom']} className="bg-white border-t border-stone-100 p-4 shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
        <View className="flex-row gap-4 items-center">
            <View className="flex-1">
                <Text className="text-sm text-stone-500">Cena za talerzyk</Text>
                <Text className="text-2xl font-bold text-stone-900">{PLN(item.pricePerPerson)}</Text>
            </View>
            
            <TouchableOpacity 
                onPress={handleAddToCart}
                disabled={inCart}
                className={`px-6 py-4 rounded-2xl shadow-lg flex-row items-center gap-2 ${inCart ? 'bg-green-600 shadow-green-500/30' : 'bg-stone-900 shadow-stone-900/30 active:bg-stone-800'}`}
            >
                {inCart ? (
                    <>
                        <Check color="white" size={20} />
                        <Text className="text-white font-bold text-lg">W koszyku</Text>
                    </>
                ) : (
                    <>
                        <ShoppingCart color="white" size={20} />
                        <Text className="text-white font-bold text-lg">Rezerwuj</Text>
                    </>
                )}
            </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}
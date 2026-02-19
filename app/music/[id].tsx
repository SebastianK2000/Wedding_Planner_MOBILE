import React, { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, ActivityIndicator, Alert, SafeAreaView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { MapPin, Star, Music, ShoppingBag } from 'lucide-react-native';
import api from '../../lib/api';
import { useCart } from '../../context/cart_context';

interface MusicDetail {
  id: number;
  name: string;
  city: string;
  pricefrom: string | number;
  imageurl: string;
  description: string;
  rating: number;
}

export default function MusicDetailScreen() {
  const { id } = useLocalSearchParams();
  const [data, setData] = useState<MusicDetail | null>(null);
  const [loading, setLoading] = useState(true);
  
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await api.get(`/music/${id}/`);
        setData(res.data);
      } catch (e) {
        console.error(e);
        Alert.alert("Błąd", "Nie udało się pobrać szczegółów.");
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  const handleAddToCart = () => {
    if (!data) return;
    addToCart({
        id: data.id,
        name: data.name,
        type: 'musician',
        price: Number(data.pricefrom),
        image: data.imageurl
    });
    Alert.alert("Dodano", "Oprawa muzyczna dodana do koszyka");
  };

  if (loading) return <View className="flex-1 items-center justify-center bg-stone-50"><ActivityIndicator color="#e11d48" /></View>;
  if (!data) return <View className="flex-1 items-center justify-center"><Text>Nie znaleziono.</Text></View>;

  return (
    <SafeAreaView className="flex-1 bg-stone-50">
      <ScrollView className="flex-1">
        <View className="relative h-72 w-full">
          <Image 
            source={{ uri: data.imageurl || 'https://placehold.co/600x400' }} 
            className="w-full h-full"
            resizeMode="cover"
          />
          <View className="absolute inset-0 bg-black/30" />
          <View className="absolute bottom-4 left-4 right-4">
            <Text className="text-white text-3xl font-bold">{data.name}</Text>
            <View className="flex-row items-center mt-1 gap-4">
                <View className="flex-row items-center gap-1">
                    <MapPin color="white" size={16} />
                    <Text className="text-white font-medium">{data.city}</Text>
                </View>
                <View className="flex-row items-center gap-1">
                    <Star color="#facc15" fill="#facc15" size={16} />
                    <Text className="text-white font-bold">{Number(data.rating).toFixed(1)}</Text>
                </View>
            </View>
          </View>
        </View>

        <View className="p-6 -mt-6 bg-stone-50 rounded-t-3xl min-h-screen">
            <View className="flex-row justify-between mb-8 border-b border-stone-200 pb-6">
                <View>
                    <Text className="text-stone-500 text-xs uppercase mb-1">Cena od</Text>
                    <View className="flex-row items-center gap-2">
                        <Text className="text-2xl font-bold text-stone-900">{data.pricefrom} zł</Text>
                    </View>
                </View>
                <View className="w-[1px] bg-stone-200" />
                <View className="items-end">
                    <Text className="text-stone-500 text-xs uppercase mb-1">Usługa</Text>
                    <View className="flex-row items-center gap-2">
                        <Music size={20} className="text-stone-400" />
                        <Text className="text-xl font-bold text-stone-900">Muzyka</Text>
                    </View>
                </View>
            </View>

            <Text className="text-lg font-bold text-stone-900 mb-2">O zespole / DJ</Text>
            <Text className="text-stone-600 leading-6 mb-24">{data.description || "Brak opisu."}</Text>
        </View>
      </ScrollView>

      <View className="absolute bottom-0 left-0 right-0 bg-white p-4 border-t border-stone-100 flex-row items-center gap-4 pb-8">
         <View>
            <Text className="text-stone-500 text-xs">Szacowany koszt</Text>
            <Text className="text-xl font-bold text-stone-900">{data.pricefrom} zł</Text>
         </View>
         <TouchableOpacity 
            onPress={handleAddToCart}
            className="flex-1 bg-stone-900 h-14 rounded-xl flex-row items-center justify-center gap-2 shadow-lg"
         >
            <ShoppingBag color="white" size={20} />
            <Text className="text-white font-bold text-lg">Dodaj do planera</Text>
         </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
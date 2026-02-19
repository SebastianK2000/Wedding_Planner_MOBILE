import React, { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, ActivityIndicator, Alert, SafeAreaView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { MapPin, Star, Users, Utensils, Wifi, Car, ShoppingBag } from 'lucide-react-native';
import api from '../../lib/api';
import { useCart } from '../../context/cart_context';

interface VenueDetail {
  id: number;
  name: string;
  city: string;
  capacity: number;
  priceperperson: string | number;
  imageurl: string;
  description: string;
  rating: number;
}

export default function VenueDetailScreen() {
  const { id } = useLocalSearchParams();
  const [venue, setVenue] = useState<VenueDetail | null>(null);
  const [loading, setLoading] = useState(true);
  
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await api.get(`/venues/${id}/`);
        setVenue(res.data);
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
    if (!venue) return;
    addToCart({
        id: venue.id,
        name: venue.name,
        type: 'venue',
        price: Number(venue.priceperperson),
        image: venue.imageurl
    });
    Alert.alert("Dodano", "Sala została dodana do koszyka");
  };

  if (loading) return <View className="flex-1 items-center justify-center bg-stone-50"><ActivityIndicator color="#e11d48" /></View>;
  if (!venue) return <View className="flex-1 items-center justify-center"><Text>Nie znaleziono.</Text></View>;

  return (
    <SafeAreaView className="flex-1 bg-stone-50">
      <ScrollView className="flex-1">
        <View className="relative h-72 w-full">
          <Image 
            source={{ uri: venue.imageurl || 'https://placehold.co/600x400' }} 
            className="w-full h-full"
            resizeMode="cover"
          />
          <View className="absolute inset-0 bg-black/30" />
          <View className="absolute bottom-4 left-4 right-4">
            <View className="bg-rose-500 self-start px-3 py-1 rounded-full mb-2">
                <Text className="text-white text-xs font-bold">TOP WYBÓR</Text>
            </View>
            <Text className="text-white text-3xl font-bold">{venue.name}</Text>
            <View className="flex-row items-center mt-1 gap-4">
                <View className="flex-row items-center gap-1">
                    <MapPin color="white" size={16} />
                    <Text className="text-white font-medium">{venue.city}</Text>
                </View>
                <View className="flex-row items-center gap-1">
                    <Star color="#facc15" fill="#facc15" size={16} />
                    <Text className="text-white font-bold">{Number(venue.rating).toFixed(1)}</Text>
                </View>
            </View>
          </View>
        </View>

        <View className="p-6 -mt-6 bg-stone-50 rounded-t-3xl min-h-screen">
            <View className="flex-row justify-between mb-8 border-b border-stone-200 pb-6">
                <View>
                    <Text className="text-stone-500 text-xs uppercase mb-1">Cena za osobę</Text>
                    <View className="flex-row items-center gap-2">
                        <Utensils size={20} className="text-stone-400" />
                        <Text className="text-2xl font-bold text-stone-900">{venue.priceperperson} zł</Text>
                    </View>
                </View>
                <View className="w-[1px] bg-stone-200" />
                <View>
                    <Text className="text-stone-500 text-xs uppercase mb-1">Pojemność</Text>
                    <View className="flex-row items-center gap-2">
                        <Users size={20} className="text-stone-400" />
                        <Text className="text-2xl font-bold text-stone-900">{venue.capacity} os.</Text>
                    </View>
                </View>
            </View>

            <Text className="text-lg font-bold text-stone-900 mb-2">O miejscu</Text>
            <Text className="text-stone-600 leading-6 mb-6">{venue.description || "Brak opisu."}</Text>

            <Text className="text-lg font-bold text-stone-900 mb-4">Udogodnienia</Text>
            <View className="flex-row flex-wrap gap-3 mb-24">
                <View className="bg-white px-4 py-3 rounded-xl border border-stone-100 flex-row gap-2 items-center">
                    <Wifi size={18} color="#16a34a" />
                    <Text className="text-stone-700 font-medium">Wi-Fi dla gości</Text>
                </View>
                <View className="bg-white px-4 py-3 rounded-xl border border-stone-100 flex-row gap-2 items-center">
                    <Car size={18} color="#2563eb" />
                    <Text className="text-stone-700 font-medium">Parking</Text>
                </View>
            </View>
        </View>
      </ScrollView>

      <View className="absolute bottom-0 left-0 right-0 bg-white p-4 border-t border-stone-100 flex-row items-center gap-4 pb-8">
         <View>
            <Text className="text-stone-500 text-xs">Cena całkowita (est.)</Text>
            <Text className="text-xl font-bold text-stone-900">{Number(venue.priceperperson) * 100} zł</Text>
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
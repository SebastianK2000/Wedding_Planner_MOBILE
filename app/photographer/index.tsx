import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, TextInput, Modal, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  ArrowLeft, Search, Filter, MapPin, Star, Heart, 
  Camera, X 
} from 'lucide-react-native';

import api from '../../lib/api'; 

export interface PhotographerItem {
  id: string | number;
  name: string;
  city: string;
  priceFrom: number;
  rating: number;
  img: string;
  desc: string;
  tags: string[];
  features?: string[];
}

const PLN = (n: number) => new Intl.NumberFormat("pl-PL", { style: "currency", currency: "PLN", maximumFractionDigits: 0 }).format(n);

export default function PhotographerListScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [photographers, setPhotographers] = useState<PhotographerItem[]>([]);
  const [shortlist, setShortlist] = useState<string[]>([]);
  
  const [q, setQ] = useState("");
  const [city, setCity] = useState("Wszystkie");
  const [filtersVisible, setFiltersVisible] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
        try {
            const response = await api.get('/photographers/');
            const dataFromDb = response.data;

            const mappedData: PhotographerItem[] = dataFromDb.map((item: any) => ({
                id: item.id,
                name: item.name,
                city: item.city || "Cała Polska",
                priceFrom: item.pricefrom ? Number(item.pricefrom) : 0, 
                img: item.imageurl || "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=2070&auto=format&fit=crop",
                desc: item.description || "Brak opisu.",
                
                rating: (4.5 + (item.id % 5) / 10), 
                tags: item.id % 2 === 0 ? ["Reportaż", "Klasyk"] : ["Boho", "Artystyczny"],
                features: ["10h reportażu", "Sesja plenerowa", "Galeria online"]
            }));

            setPhotographers(mappedData);
        } catch (error) {
            console.error("Błąd pobierania danych z API:", error);
        } finally {
            setLoading(false);
        }
        
        const saved = await AsyncStorage.getItem("wp_photographers_shortlist");
        if (saved) setShortlist(JSON.parse(saved));
    };

    fetchData();
  }, []);

  const toggleShortlist = async (id: string | number) => {
    const idStr = String(id);
    const newShortlist = shortlist.includes(idStr) 
        ? shortlist.filter(x => x !== idStr) 
        : [...shortlist, idStr];
    
    setShortlist(newShortlist);
    await AsyncStorage.setItem("wp_photographers_shortlist", JSON.stringify(newShortlist));
  };

  const filteredData = useMemo(() => {
    return photographers.filter(p => {
        const matchesQ = p.name.toLowerCase().includes(q.toLowerCase()) || p.city.toLowerCase().includes(q.toLowerCase());
        const matchesCity = city === "Wszystkie" || p.city === city;
        return matchesQ && matchesCity;
    });
  }, [photographers, q, city]);

  const uniqueCities = ["Wszystkie", ...Array.from(new Set(photographers.map(p => p.city)))];

  const renderItem = ({ item }: { item: PhotographerItem }) => (
    <TouchableOpacity 
        activeOpacity={0.9}
        onPress={() => router.push({ pathname: `/photographer/${item.id}`, params: { data: JSON.stringify(item) } })}
        className="mb-6 bg-white rounded-3xl shadow-sm border border-stone-100 overflow-hidden"
    >
        <View className="h-64 w-full relative">
            <Image source={{ uri: item.img }} className="w-full h-full" resizeMode="cover" />
            <LinearGradient colors={['transparent', 'rgba(0,0,0,0.7)']} className="absolute inset-0" />
            
            <View className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-2 py-1 rounded-lg flex-row items-center gap-1">
                <Star size={12} fill="#eab308" color="#eab308" />
                <Text className="text-xs font-bold text-stone-800">{item.rating.toFixed(1)}</Text>
            </View>

            <TouchableOpacity 
                onPress={(e) => { e.stopPropagation(); toggleShortlist(item.id); }}
                className="absolute top-4 right-4 w-10 h-10 bg-white/20 backdrop-blur-md rounded-full items-center justify-center"
            >
                <Heart size={20} color={shortlist.includes(String(item.id)) ? "#e11d48" : "white"} fill={shortlist.includes(String(item.id)) ? "#e11d48" : "none"} />
            </TouchableOpacity>

            <View className="absolute bottom-4 left-4">
                <Text className="text-white/80 text-xs uppercase font-bold tracking-wider">Pakiet od</Text>
                <Text className="text-white text-2xl font-bold">{PLN(item.priceFrom)}</Text>
            </View>
        </View>

        <View className="p-5">
            <View className="flex-row justify-between items-start mb-2">
                <View className="flex-1 mr-2">
                    <Text className="text-xl font-bold text-stone-900 leading-6">{item.name}</Text>
                    <View className="flex-row items-center gap-1 mt-1">
                        <MapPin size={14} className="text-stone-400" />
                        <Text className="text-stone-500 text-sm">{item.city}</Text>
                    </View>
                </View>
            </View>
            
            <View className="flex-row flex-wrap gap-2 mt-2">
                {item.tags.map((tag, i) => (
                    <View key={i} className="border border-stone-200 px-2 py-1 rounded-md">
                        <Text className="text-xs text-stone-500">{tag}</Text>
                    </View>
                ))}
            </View>

            <View className="mt-5 pt-4 border-t border-stone-100 flex-row gap-3">
                <TouchableOpacity 
                    onPress={() => router.push({ pathname: `/photographer/${item.id}`, params: { data: JSON.stringify(item) } })}
                    className="flex-1 bg-stone-900 py-3 rounded-xl items-center"
                >
                    <Text className="text-white font-bold">Szczegóły</Text>
                </TouchableOpacity>
            </View>
        </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-stone-50">
      <View className="px-5 pb-4 bg-white border-b border-stone-200">
         <View className="flex-row gap-3">
            <View className="flex-1 flex-row items-center bg-stone-100 px-3 h-12 rounded-xl">
                <Search size={20} className="text-stone-400 mr-2" />
                <TextInput 
                    placeholder="Szukaj fotografa..." 
                    className="flex-1 h-full text-stone-800"
                    value={q}
                    onChangeText={setQ}
                />
            </View>
            <TouchableOpacity 
                onPress={() => setFiltersVisible(true)}
                className="w-12 h-12 bg-stone-900 rounded-xl items-center justify-center"
            >
                <Filter size={20} color="white" />
            </TouchableOpacity>
         </View>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#e11d48" />
        </View>
      ) : (
        <FlatList
            data={filteredData}
            renderItem={renderItem}
            keyExtractor={item => String(item.id)}
            contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
            ListEmptyComponent={
                <View className="items-center mt-10">
                    <Camera size={40} className="text-stone-300 mb-2" />
                    <Text className="text-stone-500">
                        {photographers.length === 0 ? "Brak połączenia z API lub pusta baza." : "Brak wyników wyszukiwania"}
                    </Text>
                </View>
            }
        />
      )}

      <Modal visible={filtersVisible} animationType="slide" presentationStyle="pageSheet">
         <View className="flex-1 bg-white p-6">
            <View className="flex-row justify-between items-center mb-8">
                <Text className="text-2xl font-bold text-stone-900">Filtry</Text>
                <TouchableOpacity onPress={() => setFiltersVisible(false)}>
                    <X size={24} className="text-stone-500" />
                </TouchableOpacity>
            </View>
            
            <View className="space-y-6">
                <View>
                    <Text className="font-bold text-stone-700 mb-2">Lokalizacja</Text>
                    <View className="flex-row flex-wrap gap-2">
                        {uniqueCities.map(c => (
                            <TouchableOpacity 
                                key={c}
                                onPress={() => setCity(c)}
                                className={`px-4 py-2 rounded-full border ${city === c ? 'bg-stone-900 border-stone-900' : 'bg-white border-stone-200'}`}
                            >
                                <Text className={city === c ? 'text-white' : 'text-stone-600'}>{c}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </View>

            <View className="mt-auto">
                <TouchableOpacity 
                    onPress={() => setFiltersVisible(false)}
                    className="w-full bg-rose-600 py-4 rounded-2xl items-center"
                >
                    <Text className="text-white font-bold text-lg">Pokaż wyniki</Text>
                </TouchableOpacity>
            </View>
         </View>
      </Modal>
    </SafeAreaView>
  );
}
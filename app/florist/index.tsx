import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, TextInput, Modal, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  ArrowLeft, Search, Filter, MapPin, Star, Heart, 
  Flower, Palette, X 
} from 'lucide-react-native';
import api from '../../lib/api';

export interface FloristItem {
  id: string | number;
  name: string;
  type: string;
  city: string;
  priceFrom: number;
  rating: number;
  img: string;
  desc: string;
  styles: string[];
  features: string[];
}

const PLN = (n: number) => new Intl.NumberFormat("pl-PL", { style: "currency", currency: "PLN", maximumFractionDigits: 0 }).format(n);

export default function FloristListScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<FloristItem[]>([]);
  const [shortlist, setShortlist] = useState<string[]>([]);
  
  const [q, setQ] = useState("");
  const [city, setCity] = useState("Wszystkie");
  const [filtersVisible, setFiltersVisible] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
        try {
            const response = await api.get('/florists/');
            const dataFromDb = response.data;
            
            const mappedData: FloristItem[] = dataFromDb.map((item: any) => {
                const idNum = Number(item.id);
                const stylesPool = [
                    ["Boho", "Rustykalny"],
                    ["Glamour", "Klasyczny"],
                    ["Nowoczesny", "Minimalizm"],
                    ["Sielski", "Polny"]
                ];

                return {
                    id: item.id,
                    name: item.companyname || item.name || "Nieznana kwiaciarnia",
                    type: item.title || "Pracownia Florystyczna",
                    city: item.city || "Cała Polska",
                    priceFrom: item.pricefrom ? Number(item.pricefrom) : 0,
                    rating: 4.5 + (idNum % 5) / 10,
                    img: item.imageurl || "https://images.unsplash.com/photo-1526047932273-341f2a7631f9?q=80&w=2080&auto=format&fit=crop",
                    desc: item.description || "Tworzymy piękne kompozycje kwiatowe na Twój ślub.",
                    styles: stylesPool[idNum % stylesPool.length],
                    features: ["Bukiet ślubny", "Dekoracja sali", "Butonierki"]
                };
            });
            
            setItems(mappedData);
        } catch (error) {
            console.error("Błąd pobierania florystów:", error);
        } finally {
            setLoading(false);
        }
        
        const saved = await AsyncStorage.getItem("wp_florist_shortlist");
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
    await AsyncStorage.setItem("wp_florist_shortlist", JSON.stringify(newShortlist));
  };

  const filteredData = useMemo(() => {
    return items.filter(p => {
        const matchesQ = p.name.toLowerCase().includes(q.toLowerCase()) || p.styles.some(s => s.toLowerCase().includes(q.toLowerCase()));
        const matchesCity = city === "Wszystkie" || p.city === city;
        return matchesQ && matchesCity;
    });
  }, [items, q, city]);

  const uniqueCities = ["Wszystkie", ...Array.from(new Set(items.map(p => p.city)))];

  const renderItem = ({ item }: { item: FloristItem }) => (
    <TouchableOpacity 
        activeOpacity={0.9}
        onPress={() => router.push({ pathname: `/florist/${item.id}`, params: { data: JSON.stringify(item) } })}
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
                <View className="flex-row items-center gap-1 mb-1">
                    <Flower size={12} color="white" />
                    <Text className="text-white/90 text-xs font-medium">{item.type}</Text>
                </View>
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
                {item.styles.map((s, i) => (
                    <View key={i} className="bg-green-50 border border-green-100 px-2 py-1 rounded-md">
                        <Text className="text-xs text-green-700 font-medium">{s}</Text>
                    </View>
                ))}
            </View>

            <View className="mt-5 pt-4 border-t border-stone-100 flex-row gap-3">
                <TouchableOpacity 
                    onPress={() => router.push({ pathname: `/florist/${item.id}`, params: { data: JSON.stringify(item) } })}
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
         <View className="flex-row items-center justify-between mb-4">
            <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 bg-stone-100 rounded-full items-center justify-center">
                <ArrowLeft size={20} className="text-stone-600" />
            </TouchableOpacity>
            <Text className="text-lg font-bold text-stone-900">Florystyka</Text>
            <View className="w-10" />
         </View>

         <View className="flex-row gap-3">
            <View className="flex-1 flex-row items-center bg-stone-100 px-3 h-12 rounded-xl">
                <Search size={20} className="text-stone-400 mr-2" />
                <TextInput 
                    placeholder="Szukaj stylu, kwiatów..." 
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
                    <Flower size={40} className="text-stone-300 mb-2" />
                    <Text className="text-stone-500">Brak wyników</Text>
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
                <TouchableOpacity onPress={() => setFiltersVisible(false)} className="w-full bg-rose-600 py-4 rounded-2xl items-center">
                    <Text className="text-white font-bold text-lg">Pokaż wyniki</Text>
                </TouchableOpacity>
            </View>
         </View>
      </Modal>
    </SafeAreaView>
  );
}
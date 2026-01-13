import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { UserPlus, Check, X, Search, MoreHorizontal, Phone } from 'lucide-react-native';

type Guest = {
  id: string;
  name: string;
  status: 'confirmed' | 'pending' | 'declined';
  plusOne: boolean;
  table?: number;
};

const MOCK_GUESTS: Guest[] = [
  { id: '1', name: 'Jan Kowalski', status: 'confirmed', plusOne: true, table: 1 },
  { id: '2', name: 'Anna Nowak', status: 'pending', plusOne: false },
  { id: '3', name: 'Piotr Wiśniewski', status: 'declined', plusOne: true },
  { id: '4', name: 'Maria Dąbrowska', status: 'confirmed', plusOne: true, table: 2 },
  { id: '5', name: 'Krzysztof Zieliński', status: 'pending', plusOne: false },
];

export default function GuestsScreen() {
  const [guests, setGuests] = useState<Guest[]>(MOCK_GUESTS);
  const [filter, setFilter] = useState<'all' | 'confirmed' | 'pending'>('all');
  const [search, setSearch] = useState('');

  const filteredGuests = guests.filter(guest => {
    const matchesFilter = filter === 'all' || guest.status === filter;
    const matchesSearch = guest.name.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const stats = {
    total: guests.length,
    confirmed: guests.filter(g => g.status === 'confirmed').length,
    pending: guests.filter(g => g.status === 'pending').length,
  };

  const handleAddGuest = () => {
    Alert.alert("Dodaj gościa", "Tutaj otworzyłby się formularz dodawania gościa.");
  };

  return (
    <SafeAreaView className="flex-1 bg-stone-50">
      <View className="flex-1 p-4">
        <Text className="text-2xl font-bold text-stone-900 mb-4">Lista Gości</Text>
        
        <View className="flex-row gap-3 mb-6">
            <View className="flex-1 bg-white p-3 rounded-xl border border-stone-200 shadow-sm items-center">
                <Text className="text-2xl font-bold text-stone-800">{stats.total}</Text>
                <Text className="text-xs text-stone-500 uppercase tracking-wide">Razem</Text>
            </View>
            <View className="flex-1 bg-white p-3 rounded-xl border border-stone-200 shadow-sm items-center">
                <Text className="text-2xl font-bold text-green-600">{stats.confirmed}</Text>
                <Text className="text-xs text-stone-500 uppercase tracking-wide">Potwierdzeni</Text>
            </View>
            <View className="flex-1 bg-white p-3 rounded-xl border border-stone-200 shadow-sm items-center">
                <Text className="text-2xl font-bold text-orange-500">{stats.pending}</Text>
                <Text className="text-xs text-stone-500 uppercase tracking-wide">Oczekują</Text>
            </View>
        </View>

        <View className="flex-row items-center bg-white rounded-xl border border-stone-200 px-3 py-2.5 mb-4 shadow-sm">
            <Search size={20} className="text-stone-400 mr-2" />
            <TextInput 
                placeholder="Szukaj gościa..." 
                className="flex-1 text-stone-800"
                value={search}
                onChangeText={setSearch}
            />
        </View>

        <View className="flex-row mb-4 bg-stone-200 p-1 rounded-lg">
            {(['all', 'confirmed', 'pending'] as const).map((f) => (
                <TouchableOpacity 
                    key={f}
                    onPress={() => setFilter(f)}
                    className={`flex-1 py-1.5 items-center rounded-md ${filter === f ? 'bg-white shadow-sm' : ''}`}
                >
                    <Text className={`text-xs font-semibold capitalize ${filter === f ? 'text-stone-900' : 'text-stone-500'}`}>
                        {f === 'all' ? 'Wszyscy' : f === 'confirmed' ? 'Potwierdzeni' : 'Oczekujący'}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>

        <FlatList
          data={filteredGuests}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 80 }}
          renderItem={({ item }) => (
            <TouchableOpacity className="bg-white p-4 rounded-xl mb-3 border border-stone-100 shadow-sm flex-row justify-between items-center">
              <View className="flex-row items-center gap-3">
                 <View className={`w-10 h-10 rounded-full items-center justify-center ${item.status === 'confirmed' ? 'bg-green-100' : item.status === 'declined' ? 'bg-red-100' : 'bg-orange-100'}`}>
                    <Text className={`font-bold ${item.status === 'confirmed' ? 'text-green-700' : item.status === 'declined' ? 'text-red-700' : 'text-orange-700'}`}>
                        {item.name.charAt(0)}
                    </Text>
                 </View>
                 <View>
                    <Text className="font-semibold text-stone-800 text-base">{item.name}</Text>
                    <Text className="text-xs text-stone-500">
                        {item.plusOne ? '+ Osoba towarzysząca' : 'Pojedynczo'} • Stół {item.table || '-'}
                    </Text>
                 </View>
              </View>
            </TouchableOpacity>
          )}
        />
      </View>
    </SafeAreaView>
  );
}
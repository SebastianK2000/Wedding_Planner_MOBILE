import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, Alert, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Plus, User } from 'lucide-react-native';
import { useFocusEffect } from 'expo-router';
import api from '../../lib/api';

type UIStatus = 'confirmed' | 'pending' | 'declined';

type Guest = {
  id: string;
  name: string;
  status: UIStatus;
  plusOne: boolean;
  table?: string;
};

interface ApiGuest {
  id: number;
  fullname: string;
  statusid: number;
  tableid: number | null;
  plusone: boolean;
}

interface ApiStatus {
  id: number;
  name: string;
}

interface ApiTable {
  id: number;
  tablename: string;
}

export default function GuestsScreen() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const [filter, setFilter] = useState<'all' | 'confirmed' | 'pending'>('all');
  const [search, setSearch] = useState('');

  const fetchData = async () => {
    try {
      const [guestsRes, statusesRes, tablesRes] = await Promise.all([
        api.get('/guests/'),
        api.get('/guest-statuses/'),
        api.get('/guest-tables/')
      ]);

      const apiGuests: ApiGuest[] = guestsRes.data;
      const apiStatuses: ApiStatus[] = statusesRes.data;
      const apiTables: ApiTable[] = tablesRes.data;

      const mappedGuests: Guest[] = apiGuests.map(g => {
        const statusObj = apiStatuses.find(s => s.id === g.statusid);
        const statusName = statusObj ? statusObj.name.toLowerCase() : '';
        
        let uiStatus: UIStatus = 'pending';
        if (statusName.includes('potwierdz') || statusName.includes('confirmed')) uiStatus = 'confirmed';
        else if (statusName.includes('odmowa') || statusName.includes('decline')) uiStatus = 'declined';

        const tableObj = apiTables.find(t => t.id === g.tableid);

        return {
          id: String(g.id),
          name: g.fullname,
          status: uiStatus,
          plusOne: g.plusone,
          table: tableObj ? tableObj.tablename : undefined
        };
      });

      setGuests(mappedGuests);
    } catch (error) {
      console.error("Błąd pobierania gości:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

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
    Alert.alert("Dodaj gościa", "Funkcja dodawania będzie dostępna wkrótce!");
  };

  if (loading) {
    return (
        <SafeAreaView className="flex-1 bg-stone-50 items-center justify-center">
            <ActivityIndicator size="large" color="#e11d48" />
        </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-stone-50">
      <View className="flex-1 p-4">
        <Text className="text-2xl font-bold text-stone-900 mb-4">Lista Gości</Text>
        
        <View className="flex-row gap-3 mb-6">
            <View className="flex-1 bg-white p-3 rounded-xl border border-stone-200 shadow-sm items-center">
                <Text className="text-2xl font-bold text-stone-800">{stats.total}</Text>
                <Text className="text-[10px] text-stone-400 uppercase tracking-wide font-bold">Razem</Text>
            </View>
            <View className="flex-1 bg-white p-3 rounded-xl border border-stone-200 shadow-sm items-center">
                <Text className="text-2xl font-bold text-green-600">{stats.confirmed}</Text>
                <Text className="text-[10px] text-stone-400 uppercase tracking-wide font-bold">Potwierdzeni</Text>
            </View>
            <View className="flex-1 bg-white p-3 rounded-xl border border-stone-200 shadow-sm items-center">
                <Text className="text-2xl font-bold text-orange-500">{stats.pending}</Text>
                <Text className="text-[10px] text-stone-400 uppercase tracking-wide font-bold">Oczekują</Text>
            </View>
        </View>

        <View className="flex-row items-center bg-white rounded-xl border border-stone-200 px-3 py-2.5 mb-4 shadow-sm">
            <Search size={20} className="text-stone-400 mr-2" />
            <TextInput 
                placeholder="Szukaj gościa..." 
                className="flex-1 text-stone-800 text-base"
                value={search}
                onChangeText={setSearch}
            />
        </View>

        <View className="flex-row mb-4 bg-stone-200 p-1 rounded-xl">
            {(['all', 'confirmed', 'pending'] as const).map((f) => (
                <TouchableOpacity 
                    key={f}
                    onPress={() => setFilter(f)}
                    className={`flex-1 py-2 items-center rounded-lg ${filter === f ? 'bg-white shadow-sm' : ''}`}
                >
                    <Text className={`text-xs font-bold capitalize ${filter === f ? 'text-stone-900' : 'text-stone-500'}`}>
                        {f === 'all' ? 'Wszyscy' : f === 'confirmed' ? 'Potwierdzeni' : 'Oczekujący'}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>

        <FlatList
          data={filteredGuests}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 100 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <View className="items-center mt-10 opacity-50">
                 <User size={40} className="text-stone-400 mb-2" />
                 <Text className="text-stone-500">Brak gości na liście.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity className="bg-white p-4 rounded-xl mb-3 border border-stone-100 shadow-sm flex-row justify-between items-center">
              <View className="flex-row items-center gap-3">
                 <View className={`w-10 h-10 rounded-full items-center justify-center ${
                     item.status === 'confirmed' ? 'bg-green-100' : 
                     item.status === 'declined' ? 'bg-red-100' : 'bg-orange-100'
                 }`}>
                    <Text className={`font-bold text-base ${
                        item.status === 'confirmed' ? 'text-green-700' : 
                        item.status === 'declined' ? 'text-red-700' : 'text-orange-700'
                    }`}>
                        {item.name.charAt(0).toUpperCase()}
                    </Text>
                 </View>
                 <View>
                    <Text className="font-bold text-stone-800 text-base">{item.name}</Text>
                    <Text className="text-xs text-stone-500 mt-0.5">
                        {item.plusOne ? '+ Osoba towarzysząca' : 'Pojedynczo'} 
                        {item.table ? ` • ${item.table}` : ''}
                    </Text>
                 </View>
              </View>
            </TouchableOpacity>
          )}
        />
      </View>

      <TouchableOpacity 
        onPress={handleAddGuest}
        className="absolute bottom-6 right-6 bg-rose-600 w-14 h-14 rounded-full items-center justify-center shadow-lg shadow-rose-500/40"
      >
        <Plus color="white" size={30} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}
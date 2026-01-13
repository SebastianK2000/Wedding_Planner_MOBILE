import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, Alert, ActivityIndicator, RefreshControl, Modal, Switch, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Plus, User, X, Save, Trash2 } from 'lucide-react-native';
import { useFocusEffect } from 'expo-router';
import api from '../../lib/api';

type UIStatus = 'confirmed' | 'pending' | 'declined';

type Guest = {
  id: string;
  name: string;
  status: UIStatus;
  statusId: number;
  plusOne: boolean;
  table?: string;
  tableId?: number | null;
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
  const [statuses, setStatuses] = useState<ApiStatus[]>([]);
  const [tables, setTables] = useState<ApiTable[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const [filter, setFilter] = useState<'all' | 'confirmed' | 'pending'>('all');
  const [search, setSearch] = useState('');

  const [modalVisible, setModalVisible] = useState(false);
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);

  const [fullname, setFullname] = useState("");
  const [selectedStatusId, setSelectedStatusId] = useState<number | null>(null);
  const [selectedTableId, setSelectedTableId] = useState<number | null>(null);
  const [plusOne, setPlusOne] = useState(false);

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

      setStatuses(apiStatuses);
      setTables(apiTables);

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
          statusId: g.statusid,
          plusOne: g.plusone,
          table: tableObj ? tableObj.tablename : undefined,
          tableId: g.tableid
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

  const openAddModal = () => {
      setEditingGuest(null);
      setFullname("");
      setPlusOne(false);
      const defaultStatus = statuses.find(s => s.name.includes("Oczek")) || statuses[0];
      setSelectedStatusId(defaultStatus?.id || 1);
      setSelectedTableId(null);
      setModalVisible(true);
  };

  const openEditModal = (guest: Guest) => {
      setEditingGuest(guest);
      setFullname(guest.name);
      setPlusOne(guest.plusOne);
      setSelectedStatusId(guest.statusId);
      setSelectedTableId(guest.tableId || null);
      setModalVisible(true);
  };

  const handleSave = async () => {
      if (!fullname) {
          Alert.alert("Błąd", "Podaj imię i nazwisko.");
          return;
      }

      const payload = {
          fullname,
          statusid: selectedStatusId,
          tableid: selectedTableId,
          plusone: plusOne,
          email: "",
          phonenumber: "",
          dietarypreferenceid: null
      };

      try {
          if (editingGuest) {
              await api.patch(`/guests/${editingGuest.id}/`, payload);
          } else {
              await api.post('/guests/', payload);
          }
          setModalVisible(false);
          fetchData();
      } catch (error) {
          console.error(error);
          Alert.alert("Błąd", "Nie udało się zapisać.");
      }
  };

  const handleDelete = (guest: Guest) => {
      Alert.alert("Usuń gościa", `Czy usunąć ${guest.name}?`, [
          { text: "Anuluj", style: "cancel" },
          { text: "Usuń", style: "destructive", onPress: async () => {
              try {
                  await api.delete(`/guests/${guest.id}/`);
                  fetchData();
              } catch(e) { Alert.alert("Błąd", "Nie udało się usunąć."); }
          }}
      ]);
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
            <TouchableOpacity 
                onPress={() => openEditModal(item)}
                onLongPress={() => handleDelete(item)}
                className="bg-white p-4 rounded-xl mb-3 border border-stone-100 shadow-sm flex-row justify-between items-center active:bg-stone-50"
            >
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
        onPress={openAddModal}
        className="absolute bottom-6 right-6 bg-rose-600 w-14 h-14 rounded-full items-center justify-center shadow-lg shadow-rose-500/40"
      >
        <Plus color="white" size={30} />
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
            <View className="flex-1 bg-stone-50">
                <View className="bg-white px-4 py-4 flex-row justify-between items-center border-b border-stone-200">
                    <Text className="text-lg font-bold text-stone-900">
                        {editingGuest ? "Edytuj gościa" : "Nowy gość"}
                    </Text>
                    <TouchableOpacity onPress={() => setModalVisible(false)} className="bg-stone-100 p-2 rounded-full">
                        <X size={20} className="text-stone-600" />
                    </TouchableOpacity>
                </View>

                <ScrollView className="p-6">
                    <Text className="label mb-2 font-bold text-stone-600">Imię i Nazwisko</Text>
                    <TextInput 
                        value={fullname} onChangeText={setFullname} 
                        className="input bg-white p-4 rounded-xl border border-stone-200 mb-6 text-lg"
                        placeholder="np. Jan Kowalski" 
                    />

                    <View className="flex-row items-center justify-between bg-white p-4 rounded-xl border border-stone-200 mb-6">
                        <Text className="font-bold text-stone-700 text-lg">Osoba towarzysząca</Text>
                        <Switch 
                            value={plusOne} onValueChange={setPlusOne} 
                            trackColor={{ false: '#d6d3d1', true: '#e11d48' }}
                        />
                    </View>

                    <Text className="label mb-2 font-bold text-stone-600">Status</Text>
                    <View className="flex-row flex-wrap gap-2 mb-6">
                        {statuses.map(s => (
                            <TouchableOpacity
                                key={s.id}
                                onPress={() => setSelectedStatusId(s.id)}
                                className={`px-4 py-2 rounded-lg border ${selectedStatusId === s.id ? 'bg-stone-800 border-stone-800' : 'bg-white border-stone-200'}`}
                            >
                                <Text className={selectedStatusId === s.id ? 'text-white font-bold' : 'text-stone-600'}>
                                    {s.name}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <Text className="label mb-2 font-bold text-stone-600">Stół (Opcjonalnie)</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-2 mb-8">
                        <TouchableOpacity
                            onPress={() => setSelectedTableId(null)}
                            className={`px-4 py-2 rounded-lg border ${selectedTableId === null ? 'bg-stone-800 border-stone-800' : 'bg-white border-stone-200'}`}
                        >
                            <Text className={selectedTableId === null ? 'text-white font-bold' : 'text-stone-600'}>Brak</Text>
                        </TouchableOpacity>
                        {tables.map(t => (
                            <TouchableOpacity
                                key={t.id}
                                onPress={() => setSelectedTableId(t.id)}
                                className={`px-4 py-2 rounded-lg border ${selectedTableId === t.id ? 'bg-stone-800 border-stone-800' : 'bg-white border-stone-200'}`}
                            >
                                <Text className={selectedTableId === t.id ? 'text-white font-bold' : 'text-stone-600'}>
                                    {t.tablename}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    <TouchableOpacity 
                        onPress={handleSave}
                        className="bg-stone-900 w-full py-4 rounded-2xl flex-row items-center justify-center gap-2 shadow-lg"
                    >
                        <Save color="white" size={20} />
                        <Text className="text-white font-bold text-lg">Zapisz</Text>
                    </TouchableOpacity>

                    {editingGuest && (
                        <TouchableOpacity 
                            onPress={() => { setModalVisible(false); handleDelete(editingGuest); }}
                            className="mt-4 py-3 items-center"
                        >
                            <View className="flex-row gap-2 items-center">
                                <Trash2 size={18} className="text-red-500" />
                                <Text className="text-red-500 font-bold">Usuń gościa</Text>
                            </View>
                        </TouchableOpacity>
                    )}
                </ScrollView>
            </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}
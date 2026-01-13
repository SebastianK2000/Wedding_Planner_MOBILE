import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, SafeAreaView, ActivityIndicator, Alert, RefreshControl, Modal, TextInput, Switch, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Plus, Wallet, AlertCircle, CheckCircle2, X, Trash2, Save } from 'lucide-react-native';
import api from '../../lib/api';

interface BudgetItem {
  id?: number;
  name: string;
  plannedamount: string;
  actualamount: string;
  ispaid: boolean;
}

const PLN = (n: number) =>
  new Intl.NumberFormat("pl-PL", { style: "currency", currency: "PLN", maximumFractionDigits: 0 }).format(n);

export default function BudgetScreen() {
  const [items, setItems] = useState<BudgetItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<BudgetItem | null>(null);

  const [name, setName] = useState("");
  const [planned, setPlanned] = useState("");
  const [actual, setActual] = useState("");
  const [isPaid, setIsPaid] = useState(false);

  const fetchBudget = async () => {
    try {
      const response = await api.get('/budget-items/');
      setItems(response.data);
    } catch (error) {
      console.error("Błąd pobierania budżetu:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchBudget();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchBudget();
  };

  const openAddModal = () => {
      setEditingItem(null);
      setName("");
      setPlanned("");
      setActual("");
      setIsPaid(false);
      setModalVisible(true);
  };

  const openEditModal = (item: BudgetItem) => {
      setEditingItem(item);
      setName(item.name);
      setPlanned(String(item.plannedamount).replace('.', ','));
      setActual(String(item.actualamount).replace('.', ','));
      setIsPaid(item.ispaid);
      setModalVisible(true);
  };

  const handleSave = async () => {
      if (!name || !planned) {
          Alert.alert("Błąd", "Podaj nazwę i planowaną kwotę.");
          return;
      }

      const plannedVal = planned.replace(',', '.');
      const actualVal = actual ? actual.replace(',', '.') : '0';

      const payload = {
          name,
          plannedamount: plannedVal,
          actualamount: actualVal,
          ispaid: isPaid
      };

      try {
          if (editingItem && editingItem.id) {
              await api.patch(`/budget-items/${editingItem.id}/`, payload);
          } else {
              await api.post('/budget-items/', payload);
          }
          setModalVisible(false);
          fetchBudget();
      } catch (error) {
          console.error(error);
          Alert.alert("Błąd", "Nie udało się zapisać zmiany.");
      }
  };

  const handleDelete = (item: BudgetItem) => {
      Alert.alert(
          "Usuń wydatek", 
          `Czy na pewno chcesz usunąć "${item.name}"?`,
          [
              { text: "Anuluj", style: "cancel" },
              { text: "Usuń", style: "destructive", onPress: async () => {
                  try {
                      if (item.id) await api.delete(`/budget-items/${item.id}/`);
                      fetchBudget();
                  } catch (e) {
                      Alert.alert("Błąd", "Nie udało się usunąć.");
                  }
              }}
          ]
      );
  };

  const stats = items.reduce(
    (acc, item) => {
      const p = Number(item.plannedamount) || 0;
      const a = Number(item.actualamount) || 0;
      const paid = item.ispaid ? a : 0; 
      return {
        planned: acc.planned + p,
        actual: acc.actual + a,
        paid: acc.paid + paid,
      };
    },
    { planned: 0, actual: 0, paid: 0 }
  );

  if (loading) {
    return (
        <SafeAreaView className="flex-1 bg-stone-50 items-center justify-center">
            <ActivityIndicator size="large" color="#e11d48" />
        </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-stone-50">
      <View className="p-4 flex-1">
        <Text className="text-2xl font-bold text-stone-900 mb-6">Budżet weselny</Text>

        <View className="bg-white p-5 rounded-2xl shadow-sm border border-stone-200 mb-6">
          <View className="flex-row justify-between items-center mb-4">
            <View>
              <Text className="text-sm text-stone-500">Opłacono łącznie</Text>
              <Text className="text-3xl font-bold text-rose-600">{PLN(stats.paid)}</Text>
            </View>
            <View className="bg-rose-100 p-3 rounded-full">
              <Wallet className="text-rose-600" size={24} />
            </View>
          </View>
          
          <View className="gap-2">
            <View className="flex-row justify-between text-xs">
              <Text className="text-stone-500">Plan: {PLN(stats.planned)}</Text>
              <Text className="text-stone-500">Koszt: {PLN(stats.actual)}</Text>
            </View>
            <View className="h-2 bg-stone-100 rounded-full overflow-hidden">
               <View 
                 className="h-full bg-rose-500 rounded-full" 
                 style={{ width: `${Math.min((stats.paid / (stats.actual || 1)) * 100, 100)}%` }} 
               />
            </View>
          </View>
        </View>

        <FlatList
          data={items}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ paddingBottom: 100 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <Text className="text-center text-stone-400 mt-10">Brak wydatków. Dodaj pierwszy!</Text>
          }
          renderItem={({ item }) => {
            const plannedVal = Number(item.plannedamount);
            const actualVal = Number(item.actualamount);
            const isOverBudget = actualVal > plannedVal;

            return (
              <TouchableOpacity 
                onPress={() => openEditModal(item)}
                onLongPress={() => handleDelete(item)}
                className="bg-white p-4 rounded-xl mb-3 border border-stone-100 shadow-sm flex-row justify-between items-center active:bg-stone-50"
              >
                <View className="flex-1 mr-4">
                  <View className="flex-row items-center gap-2 mb-1">
                      <Text className={`font-semibold text-base ${item.ispaid ? "text-stone-400 line-through" : "text-stone-800"}`}>
                          {item.name}
                      </Text>
                      {item.ispaid && <CheckCircle2 size={14} className="text-green-500" />}
                  </View>
                  
                  <View className="flex-row gap-3">
                    <Text className="text-xs text-stone-500">Plan: {PLN(plannedVal)}</Text>
                    {!item.ispaid && (
                        <Text className="text-xs text-stone-500">Do zapłaty: {PLN(actualVal)}</Text>
                    )}
                  </View>
                </View>
                
                <View className="items-end">
                   <Text className={`font-bold ${item.ispaid ? "text-green-600" : "text-stone-900"}`}>
                       {PLN(actualVal)}
                   </Text>
                   {isOverBudget && (
                      <View className="flex-row items-center gap-1 mt-1">
                          <AlertCircle size={10} className="text-orange-500" />
                          <Text className="text-[10px] text-orange-500">Przekroczono</Text>
                      </View>
                   )}
                </View>
              </TouchableOpacity>
            );
          }}
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
                        {editingItem ? "Edytuj wydatek" : "Nowy wydatek"}
                    </Text>
                    <TouchableOpacity onPress={() => setModalVisible(false)} className="bg-stone-100 p-2 rounded-full">
                        <X size={20} className="text-stone-600" />
                    </TouchableOpacity>
                </View>

                <ScrollView className="p-6">
                    <Text className="label mb-2 font-bold text-stone-600">Nazwa wydatku</Text>
                    <TextInput 
                        value={name} onChangeText={setName} 
                        className="input bg-white p-4 rounded-xl border border-stone-200 mb-4 text-lg"
                        placeholder="np. Tort weselny" 
                    />

                    <View className="flex-row gap-4 mb-4">
                        <View className="flex-1">
                            <Text className="label mb-2 font-bold text-stone-600">Planowana kwota</Text>
                            <TextInput 
                                value={planned} onChangeText={setPlanned} 
                                className="input bg-white p-4 rounded-xl border border-stone-200 text-lg"
                                placeholder="0" keyboardType="numeric"
                            />
                        </View>
                        <View className="flex-1">
                            <Text className="label mb-2 font-bold text-stone-600">Rzeczywista kwota</Text>
                            <TextInput 
                                value={actual} onChangeText={setActual} 
                                className="input bg-white p-4 rounded-xl border border-stone-200 text-lg"
                                placeholder="0" keyboardType="numeric"
                            />
                        </View>
                    </View>

                    <View className="flex-row items-center justify-between bg-white p-4 rounded-xl border border-stone-200 mb-8">
                        <Text className="font-bold text-stone-700 text-lg">Czy opłacone?</Text>
                        <Switch 
                            value={isPaid} onValueChange={setIsPaid} 
                            trackColor={{ false: '#d6d3d1', true: '#16a34a' }}
                        />
                    </View>

                    <TouchableOpacity 
                        onPress={handleSave}
                        className="bg-stone-900 w-full py-4 rounded-2xl flex-row items-center justify-center gap-2 shadow-lg"
                    >
                        <Save color="white" size={20} />
                        <Text className="text-white font-bold text-lg">Zapisz</Text>
                    </TouchableOpacity>

                    {editingItem && (
                        <TouchableOpacity 
                            onPress={() => { setModalVisible(false); handleDelete(editingItem); }}
                            className="mt-4 py-3 items-center"
                        >
                            <View className="flex-row gap-2 items-center">
                                <Trash2 size={18} className="text-red-500" />
                                <Text className="text-red-500 font-bold">Usuń ten wydatek</Text>
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
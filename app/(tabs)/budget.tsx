import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import { Plus, Wallet, AlertCircle } from 'lucide-react-native';
// import api from "../../lib/api"; 

const MOCK_BUDGET = [
  { id: '1', title: 'Sala Weselna', planned: 25000, actual: 25000, paid: 5000 },
  { id: '2', title: 'Zespół / DJ', planned: 6000, actual: 5500, paid: 1000 },
  { id: '3', title: 'Fotograf', planned: 4000, actual: 0, paid: 0 },
  { id: '4', title: 'Kwiaty', planned: 2000, actual: 2200, paid: 500 },
];

const PLN = (n: number) =>
  new Intl.NumberFormat("pl-PL", { style: "currency", currency: "PLN", maximumFractionDigits: 0 }).format(n);

export default function BudgetScreen() {
  const [items, setItems] = useState(MOCK_BUDGET);
  const [loading, setLoading] = useState(false);

  const totalPlanned = items.reduce((acc, item) => acc + item.planned, 0);
  const totalActual = items.reduce((acc, item) => acc + item.actual, 0);
  const totalPaid = items.reduce((acc, item) => acc + item.paid, 0);

  return (
    <SafeAreaView className="flex-1 bg-stone-50">
      <View className="p-4">
        <Text className="text-2xl font-bold text-stone-900 mb-6">Budżet weselny</Text>

        <View className="bg-white p-5 rounded-2xl shadow-sm border border-stone-200 mb-6">
          <View className="flex-row justify-between items-center mb-4">
            <View>
              <Text className="text-sm text-stone-500">Wydano łącznie</Text>
              <Text className="text-3xl font-bold text-rose-600">{PLN(totalPaid)}</Text>
            </View>
            <View className="bg-rose-100 p-3 rounded-full">
              <Wallet className="text-rose-600" size={24} />
            </View>
          </View>
          
          <View className="gap-2">
            <View className="flex-row justify-between text-xs">
              <Text className="text-stone-500">Plan: {PLN(totalPlanned)}</Text>
              <Text className="text-stone-500">Koszt: {PLN(totalActual)}</Text>
            </View>
            <View className="h-2 bg-stone-100 rounded-full overflow-hidden">
               <View 
                 className="h-full bg-rose-500 rounded-full" 
                 style={{ width: `${Math.min((totalPaid / totalActual) * 100, 100)}%` }} 
               />
            </View>
          </View>
        </View>

        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 100 }}
          renderItem={({ item }) => (
            <TouchableOpacity className="bg-white p-4 rounded-xl mb-3 border border-stone-100 shadow-sm flex-row justify-between items-center">
              <View className="flex-1">
                <Text className="font-semibold text-stone-800 text-base">{item.title}</Text>
                <View className="flex-row gap-3 mt-1">
                  <Text className="text-xs text-stone-500">Plan: {item.planned}</Text>
                  <Text className="text-xs text-stone-500">Do zapłaty: {item.actual - item.paid}</Text>
                </View>
              </View>
              
              <View className="items-end">
                 <Text className="font-bold text-stone-900">{PLN(item.paid)}</Text>
                 {item.actual > item.planned && (
                    <View className="flex-row items-center gap-1 mt-1">
                        <AlertCircle size={10} className="text-orange-500" />
                        <Text className="text-[10px] text-orange-500">Przekroczono</Text>
                    </View>
                 )}
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <Text className="text-center text-stone-400 mt-10">Brak wydatków. Dodaj pierwszy!</Text>
          }
        />
      </View>

      <TouchableOpacity className="absolute bottom-6 right-6 bg-rose-600 w-14 h-14 rounded-full items-center justify-center shadow-lg shadow-rose-500/40">
        <Plus color="white" size={30} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}
import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, Alert, SafeAreaView, ActivityIndicator } from 'react-native';
import { useCart, CartItem } from '../context/cart_context';
import { Trash2, CreditCard, CheckCircle2, Lock, Loader2 } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import api from '../lib/api';

const BUDGET_CATEGORY_MAP: Record<string, number> = {
  venue: 1,
  photographer: 2,
  musician: 3,
  florist: 4,
  transport: 6
};

export default function CartScreen() {
  const { items, removeFromCart, clearCart, cartTotal } = useCart();
  const [isPaying, setIsPaying] = useState(false);
  const [paymentStep, setPaymentStep] = useState(0);
  const router = useRouter();

  const handleCheckout = async () => {
    if (items.length === 0) return;

    setIsPaying(true);
    setPaymentStep(1);

    setTimeout(() => setPaymentStep(2), 1500);
    
    setTimeout(async () => {
      try {
        const promises = items.map(item => {
            const categoryId = BUDGET_CATEGORY_MAP[item.type] || 8;
            return api.post('/budget-items/', {
                categoryid: categoryId,
                name: item.name,
                plannedamount: item.price,
                actualamount: item.price,
                ispaid: true,
                notes: "Zakupione w aplikacji mobilnej"
            });
        });

        await Promise.all(promises);
        setPaymentStep(3);

        setTimeout(() => {
            clearCart();
            setIsPaying(false);
            Alert.alert("Sukces", "Zamówienie zrealizowane i dodane do budżetu!", [
                { text: "OK", onPress: () => router.navigate('/(tabs)/budget') }
            ]);
        }, 1000);

      } catch (error) {
        console.error(error);
        setIsPaying(false);
        Alert.alert("Błąd", "Wystąpił problem z zapisem do budżetu, ale płatność symulowana przeszła.");
      }
    }, 3500);
  };

  if (isPaying) {
    return (
        <View className="flex-1 bg-white items-center justify-center p-8">
            {paymentStep < 3 ? (
                <>
                    <ActivityIndicator size="large" color="#e11d48" className="mb-6" />
                    <Text className="text-xl font-bold text-stone-900 mb-2">
                        {paymentStep === 1 ? "Łączenie z bankiem..." : "Autoryzacja płatności..."}
                    </Text>
                    <Text className="text-stone-500 text-sm">Proszę nie zamykać aplikacji</Text>
                </>
            ) : (
                <>
                    <View className="mb-6 h-24 w-24 rounded-full bg-green-100 items-center justify-center">
                        <CheckCircle2 size={48} color="#16a34a" />
                    </View>
                    <Text className="text-xl font-bold text-stone-900 mb-2">Płatność przyjęta!</Text>
                    <Text className="text-stone-500 text-sm">Zapisujemy w budżecie...</Text>
                </>
            )}
        </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-stone-50">
      <View className="flex-1 p-4">
        {items.length === 0 ? (
            <View className="flex-1 items-center justify-center">
                <View className="bg-stone-200 p-6 rounded-full mb-4">
                    <ShoppingBagIcon size={40} color="#78716c" />
                </View>
                <Text className="text-stone-500 text-lg font-medium">Twój koszyk jest pusty</Text>
                <TouchableOpacity onPress={() => router.back()} className="mt-4">
                    <Text className="text-rose-600 font-bold">Wróć do zakupów</Text>
                </TouchableOpacity>
            </View>
        ) : (
            <FlatList
                data={items}
                keyExtractor={(item) => item.uniqueId}
                renderItem={({ item }) => (
                    <View className="bg-white p-3 rounded-xl mb-3 flex-row items-center border border-stone-100 shadow-sm">
                        <Image 
                            source={{ uri: item.image || "https://placehold.co/100" }} 
                            className="w-16 h-16 rounded-lg bg-stone-100" 
                        />
                        <View className="flex-1 ml-3">
                            <Text className="text-xs font-bold text-rose-600 uppercase mb-0.5">{item.type}</Text>
                            <Text className="font-bold text-stone-900 text-base" numberOfLines={1}>{item.name}</Text>
                            <Text className="text-stone-500 text-sm">{item.price} PLN</Text>
                        </View>
                        <TouchableOpacity onPress={() => removeFromCart(item.uniqueId)} className="p-2">
                            <Trash2 size={20} color="#d6d3d1" />
                        </TouchableOpacity>
                    </View>
                )}
            />
        )}
      </View>

      {items.length > 0 && (
          <View className="bg-white p-6 rounded-t-3xl shadow-lg border-t border-stone-100">
              <View className="flex-row justify-between items-center mb-6">
                  <Text className="text-stone-500 font-medium">Do zapłaty:</Text>
                  <Text className="text-2xl font-bold text-stone-900">{cartTotal} PLN</Text>
              </View>
              <TouchableOpacity 
                className="bg-stone-900 h-14 rounded-2xl flex-row items-center justify-center gap-2 shadow-lg shadow-stone-900/20 active:bg-stone-800"
                onPress={handleCheckout}
              >
                  <CreditCard color="white" size={20} />
                  <Text className="text-white font-bold text-lg">Zapłać teraz</Text>
              </TouchableOpacity>
              <View className="flex-row justify-center items-center mt-3 gap-1">
                  <Lock size={12} color="#a8a29e" />
                  <Text className="text-stone-400 text-xs">Bezpieczna transakcja (Symulacja)</Text>
              </View>
          </View>
      )}
    </SafeAreaView>
  );
}

import { ShoppingBag as ShoppingBagIcon } from 'lucide-react-native';
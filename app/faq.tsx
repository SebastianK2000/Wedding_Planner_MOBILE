import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, LayoutAnimation, Platform, UIManager, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react-native';
import api from '../lib/api';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface FaqItem {
  id: number;
  question: string;
  answer: string;
  isvisible: boolean;
  categoryid?: number;
}

export default function FAQScreen() {
  const router = useRouter();
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [items, setItems] = useState<FaqItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFaq = async () => {
        try {
            const response = await api.get('/faq-items/');
            const visibleItems = response.data.filter((item: FaqItem) => item.isvisible !== false);
            setItems(visibleItems);
        } catch (error) {
            console.error("Błąd pobierania FAQ:", error);
        } finally {
            setLoading(false);
        }
    };

    fetchFaq();
  }, []);

  const toggleExpand = (id: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <SafeAreaView className="flex-1 bg-stone-50">
       <View className="px-4 py-2 flex-row items-center border-b border-stone-200 bg-white">
        <TouchableOpacity onPress={() => router.back()} className="p-2 mr-2 bg-stone-100 rounded-full">
          <ArrowLeft size={20} className="text-stone-600" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-stone-900">Pomoc i FAQ</Text>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#e11d48" />
        </View>
      ) : (
        <ScrollView className="p-4">
            {items.length === 0 ? (
                <Text className="text-center text-stone-500 mt-10">Brak pytań w bazie.</Text>
            ) : (
                items.map((item) => (
                <View key={item.id} className="bg-white mb-3 rounded-xl border border-stone-200 overflow-hidden">
                    <TouchableOpacity 
                        onPress={() => toggleExpand(item.id)}
                        className="p-4 flex-row justify-between items-center bg-stone-50/50"
                    >
                        <Text className="font-semibold text-stone-800 flex-1 mr-2">{item.question}</Text>
                        {expandedId === item.id ? <ChevronUp size={20} className="text-stone-400" /> : <ChevronDown size={20} className="text-stone-400" />}
                    </TouchableOpacity>
                    {expandedId === item.id && (
                        <View className="p-4 pt-0">
                            <Text className="text-stone-600 leading-5">{item.answer}</Text>
                        </View>
                    )}
                </View>
                ))
            )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
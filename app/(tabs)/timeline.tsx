import React from 'react';
import { View, Text, SectionList, TouchableOpacity, SafeAreaView } from 'react-native';
import { Clock } from 'lucide-react-native';

const TIMELINE_DATA = [
  {
    title: "Przed ślubem",
    data: [
      { id: '1', time: '09:00', task: 'Fryzjer i Makijaż Panny Młodej', status: 'done' },
      { id: '2', time: '11:00', task: 'Odbiór kwiatów', status: 'pending' },
      { id: '3', time: '13:00', task: 'Błogosławieństwo', status: 'pending' },
    ]
  },
  {
    title: "Ceremonia",
    data: [
      { id: '4', time: '14:00', task: 'Ceremonia w kościele', status: 'pending' },
      { id: '5', time: '15:30', task: 'Życzenia', status: 'pending' },
    ]
  }
];

export default function TimelineScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="p-4 flex-1">
         <Text className="text-2xl font-bold text-stone-900 mb-2">Dzień Ślubu</Text>
         <Text className="text-stone-500 mb-6">24 Sierpnia 2025</Text>

         <SectionList
           sections={TIMELINE_DATA}
           keyExtractor={(item) => item.id}
           renderSectionHeader={({ section: { title } }) => (
             <Text className="text-lg font-bold text-rose-600 mt-4 mb-2 bg-white py-2">{title}</Text>
           )}
           renderItem={({ item, index, section }) => (
             <View className="flex-row mb-0 relative">
                <View className="mr-4 items-center w-12">
                   <Text className="text-xs font-bold text-stone-500 mb-1">{item.time}</Text>
                   <View className={`w-3 h-3 rounded-full z-10 ${item.status === 'done' ? 'bg-green-500' : 'bg-stone-300'}`} />
                   {index < section.data.length - 1 && (
                       <View className="w-0.5 h-full bg-stone-200 absolute top-4" />
                   )}
                </View>

                <TouchableOpacity className="flex-1 bg-stone-50 p-4 rounded-xl mb-4 border border-stone-100">
                   <Text className={`font-medium ${item.status === 'done' ? 'text-stone-400 line-through' : 'text-stone-800'}`}>
                     {item.task}
                   </Text>
                </TouchableOpacity>
             </View>
           )}
         />
      </View>
    </SafeAreaView>
  );
}
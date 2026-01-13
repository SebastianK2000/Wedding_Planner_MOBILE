import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, SectionList, TouchableOpacity, SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import { Clock, CheckCircle2, Circle } from 'lucide-react-native';
import api from '../../lib/api';

interface TimelineGroup {
  id: number;
  name: string;
  orderindex: number;
}

interface TimelineEvent {
  id: number;
  groupid: number;
  title: string;
  details: string;
  iscompleted: boolean;
}

interface SectionData {
  title: string;
  id: number;
  data: TimelineEvent[];
}

export default function TimelineScreen() {
  const [loading, setLoading] = useState(true);
  const [sections, setSections] = useState<SectionData[]>([]);
  
  const fetchData = async () => {
    try {
      const [groupsRes, eventsRes] = await Promise.all([
        api.get("/timeline-groups/"),
        api.get("/timeline/")
      ]);
      
      const groups: TimelineGroup[] = groupsRes.data;
      const events: TimelineEvent[] = eventsRes.data;

      const sortedGroups = groups.sort((a, b) => a.orderindex - b.orderindex);

      const formattedSections: SectionData[] = sortedGroups.map(group => {
        const groupTasks = events.filter(e => e.groupid === group.id);
        return {
          title: group.name,
          id: group.id,
          data: groupTasks
        };
      }).filter(section => section.data.length > 0);

      setSections(formattedSections);
    } catch (error) {
      console.error("Błąd harmonogramu:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleTask = async (task: TimelineEvent) => {
    const newStatus = !task.iscompleted;
    
    setSections(prevSections => prevSections.map(section => ({
        ...section,
        data: section.data.map(t => 
            t.id === task.id ? { ...t, iscompleted: newStatus } : t
        )
    })));

    try {
        await api.patch(`/timeline/${task.id}/`, { iscompleted: newStatus });
    } catch (error) {
        console.error("Błąd zapisu:", error);
        Alert.alert("Błąd", "Nie udało się zapisać zmiany statusu.");
        fetchData();
    }
  };

  if (loading) {
    return (
        <SafeAreaView className="flex-1 bg-white items-center justify-center">
            <ActivityIndicator size="large" color="#e11d48" />
        </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="p-4 flex-1">
         <Text className="text-2xl font-bold text-stone-900 mb-1">Harmonogram</Text>
         <Text className="text-stone-500 mb-6 text-sm">Twoja mapa drogowa do wielkiego dnia</Text>

         <SectionList
           sections={sections}
           keyExtractor={(item) => String(item.id)}
           contentContainerStyle={{ paddingBottom: 40 }}
           renderSectionHeader={({ section: { title } }) => (
             <View className="bg-white pt-4 pb-2 z-10">
                <Text className="text-lg font-bold text-rose-600 uppercase tracking-wide">
                    {title}
                </Text>
             </View>
           )}
           renderItem={({ item, index, section }) => {
             const isLast = index === section.data.length - 1;

             return (
               <View className="flex-row mb-0 relative min-h-[60px]">
                  <View className="mr-4 items-center w-8 pt-6">
                     <View className={`z-10 bg-white`}>
                        {item.iscompleted ? (
                            <CheckCircle2 size={20} className="text-green-500" fill="white" />
                        ) : (
                            <Circle size={16} className="text-stone-300" fill="white" />
                        )}
                     </View>
                     
                     {!isLast && (
                         <View className="w-[2px] h-full bg-stone-200 absolute top-8" />
                     )}
                  </View>

                  <TouchableOpacity 
                    onPress={() => handleToggleTask(item)}
                    activeOpacity={0.7}
                    className={`flex-1 p-4 rounded-xl mb-3 border shadow-sm ${
                        item.iscompleted 
                        ? 'bg-stone-50 border-stone-100 opacity-60' 
                        : 'bg-white border-stone-200'
                    }`}
                  >
                     <Text className={`text-base font-medium ${
                         item.iscompleted ? 'text-stone-400 line-through' : 'text-stone-800'
                     }`}>
                       {item.title}
                     </Text>
                     
                     {item.details ? (
                         <Text className="text-xs text-stone-500 mt-1 leading-4">
                             {item.details}
                         </Text>
                     ) : null}
                  </TouchableOpacity>
               </View>
             );
           }}
           ListEmptyComponent={
               <Text className="text-center text-stone-400 mt-10">Twój harmonogram jest pusty.</Text>
           }
         />
      </View>
    </SafeAreaView>
  );
}
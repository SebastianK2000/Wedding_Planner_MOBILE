import React, { useEffect, useState, useCallback } from "react";
import { View, Text, TextInput, ScrollView, Image, TouchableOpacity, SafeAreaView, ActivityIndicator } from "react-native";
import { Link, useFocusEffect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Sparkles,
  Users,
  Wallet,
  Building2,
  Heart
} from "lucide-react-native";
import api from "../../lib/api"; 
interface ApiHomeSection {
  id: number;
  sectionkey: string;
  title: string;
  subtitle: string;
  buttontext: string;
  imageurl: string;
}

const PLN = (n: number) =>
  new Intl.NumberFormat("pl-PL", { style: "currency", currency: "PLN", maximumFractionDigits: 0 }).format(n);

export default function HomeScreen() {
  const [loading, setLoading] = useState(true);
  const [heroContent, setHeroContent] = useState<ApiHomeSection | null>(null);
  const [userData, setUserData] = useState<{ name: string; date: string } | null>(null);
  
  const [budgetStats, setBudgetStats] = useState({ spent: 0, total: 1, hasData: false });
  const [taskStatus, setTaskStatus] = useState({ salaDone: false, hasData: false });

  const loadDashboardData = async () => {
      try {
        const userStr = await AsyncStorage.getItem("user");
        if (userStr) {
           const userObj = JSON.parse(userStr);
           setUserData({
              name: userObj.fullname || "Anna & Tomasz",
              date: "2025-08-24"
           });
        }

        const [homeSectionsRes, budgetRes, tasksRes] = await Promise.allSettled([
           api.get("/home-sections/"),
           api.get("/budget-items/"),
           api.get("/timeline/")
        ]);

        if (homeSectionsRes.status === "fulfilled") {
            const sections: ApiHomeSection[] = homeSectionsRes.value.data;
            if (Array.isArray(sections)) {
                const hero = sections.find(s => s.sectionkey === 'hero') || sections[0];
                if (hero) setHeroContent(hero);
            }
        }

        if (budgetRes.status === "fulfilled") {
           const items = budgetRes.value.data;
           if (Array.isArray(items) && items.length > 0) {
              const planned = items.reduce((acc: number, item: any) => acc + Number(item.plannedamount), 0);
              const actual = items.reduce((acc: number, item: any) => acc + Number(item.actualamount), 0);
              const paid = items.reduce((acc: number, item: any) => acc + (item.ispaid ? Number(item.actualamount) : 0), 0);
              
              setBudgetStats({ 
                  spent: paid,
                  total: actual > 0 ? actual : planned,
                  hasData: true 
              });
           }
        }

        if (tasksRes.status === "fulfilled") {
           const tasks = tasksRes.value.data;
           if (Array.isArray(tasks) && tasks.length > 0) {
              const salaTask = tasks.find((t: any) => 
                  t.title?.toLowerCase().includes("sala") || t.title?.toLowerCase().includes("lokal")
              );
              const isDone = salaTask && salaTask.iscompleted ? true : false;
              setTaskStatus({ salaDone: isDone, hasData: true });
           }
        }

      } catch (e) {
        console.log("Błąd ładowania Dashboardu:", e);
      } finally {
        setLoading(false);
      }
  };

  useFocusEffect(
    useCallback(() => {
        loadDashboardData();
    }, [])
  );

  const formatDate = (dateStr: string) => {
    try {
        const date = new Date(dateStr);
        return date.toLocaleDateString("pl-PL", { day: "numeric", month: "long", year: "numeric" });
    } catch {
        return dateStr;
    }
  };

  const defaultSubtitle = "Zapomnij o chaosie w notatnikach. Opanuj listę gości, budżet i harmonogram w jednej, pięknej aplikacji.";
  const defaultButton = "Twój harmonogram";
  const defaultImage = "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=2070&auto=format&fit=crop";

  if (loading) {
      return (
          <SafeAreaView className="flex-1 bg-white items-center justify-center">
              <ActivityIndicator size="large" color="#e11d48" />
          </SafeAreaView>
      );
  }

  return (
    <ScrollView className="bg-white flex-1" contentContainerStyle={{ paddingBottom: 40 }}>
      <LinearGradient
        colors={['#ffffff', '#fff1f2', '#ffffff']}
        className="absolute inset-0 h-full w-full"
      />

      <SafeAreaView className="flex-1 px-4 py-8">
        <View className="flex flex-col gap-10">
          
          <View className="flex flex-col items-start">
            <View className="inline-flex flex-row items-center gap-2 rounded-full border border-rose-200 bg-white px-3 py-1 shadow-sm mb-6">
              <Sparkles className="text-rose-500" size={16} />
              <Text className="text-xs font-medium text-rose-700">
                Witaj z powrotem!
              </Text>
            </View>

            <Text className="text-4xl font-bold leading-tight text-stone-900 mb-4">
              {heroContent ? (
                  heroContent.title
              ) : (
                  <Text>
                    Twój ślub.{"\n"}
                    <Text className="text-rose-600">Bez stresu.</Text>
                  </Text>
              )}
            </Text>

            <Text className="text-lg text-stone-600 mb-8 leading-6">
              {heroContent ? heroContent.subtitle : defaultSubtitle}
            </Text>

            <View className="w-full flex flex-col gap-3">
              <View className="relative w-full">
                <View className="absolute top-3 left-3 z-10">
                  <Heart className="text-stone-400" size={20} />
                </View>
                <TextInput
                  value={formatDate(userData?.date || "2025-08-24")}
                  editable={false}
                  className="w-full rounded-2xl border border-stone-200 bg-white py-3 pl-10 pr-4 text-stone-900 shadow-sm"
                />
              </View>
              
              <Link href="/timeline" asChild>
                <TouchableOpacity className="flex-row items-center justify-center gap-2 rounded-2xl bg-rose-600 px-6 py-3 shadow-lg shadow-rose-500/30 active:bg-rose-700">
                    <Text className="text-sm font-bold text-white">
                        {heroContent ? heroContent.buttontext : defaultButton}
                    </Text>
                    <ArrowRight color="white" size={16} />
                </TouchableOpacity>
              </Link>
            </View>

            <View className="mt-8 w-full border-t border-stone-100 pt-6">
              <Text className="text-sm font-medium text-stone-500 mb-4">
                Szybki dostęp:
              </Text>
              <View className="flex-row flex-wrap gap-4">
                <Link href="/guests" asChild>
                    <TouchableOpacity className="flex-row items-center gap-2">
                        <Users size={20} className="text-rose-500" />
                        <Text className="text-sm font-medium text-stone-700">Goście</Text>
                    </TouchableOpacity>
                </Link>
                <Link href="/budget" asChild>
                    <TouchableOpacity className="flex-row items-center gap-2">
                        <Wallet size={20} className="text-rose-500" />
                        <Text className="text-sm font-medium text-stone-700">Budżet</Text>
                    </TouchableOpacity>
                </Link>
                <Link href="/venues" asChild>
                    <TouchableOpacity className="flex-row items-center gap-2">
                        <Building2 size={20} className="text-rose-500" />
                        <Text className="text-sm font-medium text-stone-700">Lokal</Text>
                    </TouchableOpacity>
                </Link>
              </View>
            </View>
          </View>

          <View className="relative w-full aspect-[4/5] rounded-[2.5rem] bg-stone-200 shadow-2xl overflow-hidden mt-4 mb-4">
            <Image
              source={{ uri: heroContent?.imageurl || defaultImage }}
              className="h-full w-full opacity-90"
              resizeMode="cover"
            />
            <LinearGradient
                colors={['transparent', 'rgba(28, 25, 23, 0.6)']}
                className="absolute inset-0"
            />

            <View className="absolute bottom-8 left-6 right-6">
              <Text className="text-3xl text-white font-serif font-bold">
                  {userData ? userData.name : "Anna & Tomasz"}
              </Text>
              <View className="flex-row items-center gap-2 mt-1">
                <CalendarDays size={16} color="#e7e5e4" />
                <Text className="text-stone-200 text-sm">
                    {userData ? formatDate(userData.date) : "24 Sierpnia 2025"}
                </Text>
              </View>
            </View>

            <View className="absolute top-6 left-4 bg-white/90 p-3 rounded-2xl shadow-xl border border-white/50 backdrop-blur-md flex-row items-center gap-3 w-48">
                <View className={`rounded-full p-2 ${taskStatus.salaDone ? "bg-green-100" : "bg-stone-100"}`}>
                  <CheckCircle2 size={20} color={taskStatus.salaDone ? "#16a34a" : "#a8a29e"} />
                </View>
                <View>
                  <Text className="text-sm font-bold text-stone-800">Sala weselna</Text>
                  <Text className="text-xs text-stone-500">
                    {taskStatus.hasData 
                        ? (taskStatus.salaDone ? "Zarezerwowana" : "Do znalezienia") 
                        : "Status nieznany"}
                  </Text>
                </View>
            </View>

            <View className="absolute bottom-24 right-4 bg-white/90 p-3 rounded-2xl shadow-xl border border-white/50 backdrop-blur-md flex-row items-center gap-3 w-48">
                <View className="rounded-full bg-rose-100 p-2">
                  <Wallet size={20} color="#e11d48" />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-bold text-stone-800">Wydatki</Text>
                  <View className="mt-1 h-1.5 w-full rounded-full bg-stone-100 overflow-hidden">
                    <View 
                        className="h-1.5 rounded-full bg-rose-500" 
                        style={{ width: `${Math.min((budgetStats.spent / (budgetStats.total || 1)) * 100, 100)}%` }}
                    />
                  </View>
                  <Text className="mt-1 text-[10px] text-stone-500">
                    {PLN(budgetStats.spent)} opłacone
                  </Text>
                </View>
            </View>

          </View>

        </View>
      </SafeAreaView>
    </ScrollView>
  );
}
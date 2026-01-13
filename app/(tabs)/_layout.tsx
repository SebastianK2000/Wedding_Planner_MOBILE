import React from 'react';
import { Tabs } from 'expo-router';
import { House, Banknote, CalendarClock, Users, Menu } from 'lucide-react-native';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#e11d48',
        tabBarInactiveTintColor: '#78716c',
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: '#e7e5e4',
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Start',
          tabBarIcon: ({ color }) => <House size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="budget"
        options={{
          title: 'Budżet',
          tabBarIcon: ({ color }) => <Banknote size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="timeline"
        options={{
          title: 'Harmonogram',
          tabBarIcon: ({ color }) => <CalendarClock size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="guests"
        options={{
          title: 'Goście',
          tabBarIcon: ({ color }) => <Users size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="menu"
        options={{
          title: 'Menu',
          tabBarIcon: ({ color }) => <Menu size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { ShoppingBag } from 'lucide-react-native';
import { useCart } from '../context/cart_context';

export default function FloatingCartButton() {
  const router = useRouter();
  const { items } = useCart();

  if (items.length === 0) return null;

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={() => router.push('/cart')}
      activeOpacity={0.8}
    >
      <View style={styles.iconContainer}>
        <ShoppingBag color="white" size={24} />
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{items.length}</Text>
        </View>
      </View>
      <Text style={styles.text}>Koszyk</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    backgroundColor: '#1c1917',
    borderRadius: 30,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 100,
  },
  iconContainer: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#e11d48',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  text: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  }
});
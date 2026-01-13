import { View, Text } from 'react-native';
import { Link } from 'expo-router';
// import { Verify } from 'lucide-react-native';

export default function Index() {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <View className="bg-green-100 p-4 rounded-full mb-4">
        {/* <Verify size={48} color="green" /> */}
      </View>
      <Text className="text-2xl font-bold text-gray-800 mb-2">
        To działa!
      </Text>
      <Text className="text-gray-500 mb-6">
        Tailwind + Expo Router gotowe.
      </Text>
      
      <Link href="/details" className="bg-black py-3 px-6 rounded-lg">
        <Text className="text-white font-semibold">Przejdź dalej</Text>
      </Link>
    </View>
  );
}
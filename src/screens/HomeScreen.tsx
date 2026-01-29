import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Plus, Play, BookOpen, Layers } from 'lucide-react-native';
import { FAB, Portal, Provider as PaperProvider } from 'react-native-paper';

// Types
interface Episode {
  id: string;
  title: string;
  videoUrl: string;
}

interface Season {
  id: string;
  number: number;
  episodes: Episode[];
}

interface Anime {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  seasons: Season[];
}

type RootStackParamList = {
  Home: undefined;
  AnimeDetails: { anime: Anime };
  AddAnime: { type: 'anime' | 'season' | 'episode' };
};

const { width } = Dimensions.get('window');
const COLUMN_COUNT = 3;
const ITEM_WIDTH = width / COLUMN_COUNT - 12;

// Mock Data (In a real app, this would come from a Global State or Database)
const MOCK_ANIME: Anime[] = [
  {
    id: '1',
    title: 'ون بيس',
    description: 'مونكي دي. لوفي فتى شاب استلهم من قبل قدوته منذ الطفولة قرصان قوي يسمى "شانكس"، يبدأ رحلة من الأزرق الشرقي للبحث عن الكنز الأسطوري ون بيس.',
    imageUrl: 'https://m.media-amazon.com/images/M/MV5BMTNjNGU4NDgtZTdkMi00OTM1LThjM2QtMjA4YjI2YThhY2E5XkEyXkFqcGdeQXVyNTA4NzY1MzY@._V1_.jpg',
    seasons: [],
  },
  {
    id: '2',
    title: 'ناروتو شيبودن',
    description: 'بعد مرور عامين ونصف منذ مغادرته لقرية الورق المخفية "كونوها"، يعود ناروتو أوزوماكي للتدريب مع جيرايا.',
    imageUrl: 'https://m.media-amazon.com/images/M/MV5BZGFiMWFhNDAtMzUyZS00NmQ2LTljNDYtMmZjNTc5MDUxMzViXkEyXkFqcGdeQXVyNjAwNDUxODI@._V1_.jpg',
    seasons: [],
  },
  {
    id: '3',
    title: 'هجوم العمالقة',
    description: 'منذ مئات السنين، كاد العمالقة أن يبيدوا البشرية. البشر الذين تمكنوا من النجاة احتموا داخل جدران ضخمة.',
    imageUrl: 'https://m.media-amazon.com/images/M/MV5BNDFjYTIxMjctYTQ2ZC00OGQ4LWE3OGYtNDdiMzNiNDBkZGUyXkEyXkFqcGdeQXVyMTUzMTg2ODkz._V1_.jpg',
    seasons: [],
  },
  {
    id: '4',
    title: 'قاتل الشياطين',
    description: 'تانجيرو كامادو، فتى طيب القلب يجد عائلته قد قتلت على يد شيطان، وأخته الصغرى نيزوكو تحولت إلى شيطان.',
    imageUrl: 'https://m.media-amazon.com/images/M/MV5BZjZjNzI5MDctY2Y4YS00NmM4LTg0ZitjOTU3ZDAxMTI3ZDU4XkEyXkFqcGdeQXVyMzgxODM4NjM@._V1_.jpg',
    seasons: [],
  },
];

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [fabOpen, setFabOpen] = useState(false);

  const renderAnimeItem = ({ item }: { item: Anime }) => (
    <TouchableOpacity
      style={styles.animeCard}
      activeOpacity={0.7}
      onPress={() => navigation.navigate('AnimeDetails', { anime: item })}
    >
      <Image
        source={{ uri: item.imageUrl }}
        style={styles.coverImage}
        resizeMode="cover"
      />
      <View style={styles.titleContainer}>
        <Text style={styles.animeTitle} numberOfLines={1}>
          {item.title}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <PaperProvider>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        
        <View style={styles.header}>
          <Text style={styles.headerTitle}>المكتبة الخاصة بي</Text>
          <Text style={styles.headerSubtitle}>إدارة مجموعتك المفضلة</Text>
        </View>

        <FlatList
          data={MOCK_ANIME}
          renderItem={renderAnimeItem}
          keyExtractor={(item) => item.id}
          numColumns={COLUMN_COUNT}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />

        <Portal>
          <FAB.Group
            open={fabOpen}
            visible
            icon={fabOpen ? 'close' : 'plus'}
            actions={[
              {
                icon: () => <Play size={20} color="#6200ee" />,
                label: 'إضافة حلقة',
                onPress: () => navigation.navigate('AddAnime', { type: 'episode' }),
                labelStyle: styles.fabLabel,
              },
              {
                icon: () => <Layers size={20} color="#6200ee" />,
                label: 'إضافة موسم',
                onPress: () => navigation.navigate('AddAnime', { type: 'season' }),
                labelStyle: styles.fabLabel,
              },
              {
                icon: () => <BookOpen size={20} color="#6200ee" />,
                label: 'إضافة أنمي جديد',
                onPress: () => navigation.navigate('AddAnime', { type: 'anime' }),
                labelStyle: styles.fabLabel,
              },
            ]}
            onStateChange={({ open }) => setFabOpen(open)}
            onPress={() => {
              if (fabOpen) {
                // do something if the speed dial is open
              }
            }}
            fabStyle={styles.fab}
          />
        </Portal>
      </SafeAreaView>
    </PaperProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FB',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    alignItems: 'flex-end',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1A1A1A',
    textAlign: 'right',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
    textAlign: 'right',
  },
  listContent: {
    paddingHorizontal: 8,
    paddingBottom: 100,
  },
  animeCard: {
    width: ITEM_WIDTH,
    margin: 6,
    borderRadius: 12,
    backgroundColor: '#fff',
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  coverImage: {
    width: '100%',
    height: ITEM_WIDTH * 1.4,
    backgroundColor: '#E1E1E1',
  },
  titleContainer: {
    padding: 8,
    backgroundColor: '#fff',
  },
  animeTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  fab: {
    backgroundColor: '#FFF',
    borderRadius: 28,
    marginBottom: 10,
  },
  fabLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    backgroundColor: '#FFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    overflow: 'hidden',
  },
});

export default HomeScreen;
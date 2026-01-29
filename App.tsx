import React, { useState, createContext, useContext, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
  Dimensions,
  TextInput,
  Modal,
  ScrollView,
  StatusBar,
  I18nManager,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Video, ResizeMode } from 'expo-av';
import { 
  Plus, 
  Settings as SettingsIcon, 
  ChevronLeft, 
  Play, 
  X, 
  ChevronRight,
  Info,
  Layers,
  Tv
} from 'lucide-react-native';

// --- Types ---

interface Episode {
  id: string;
  title: string;
  videoUrl: string;
  seasonId: string;
}

interface Season {
  id: string;
  number: number;
  animeId: string;
}

interface Anime {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
}

interface AppContextType {
  animes: Anime[];
  seasons: Season[];
  episodes: Episode[];
  addAnime: (anime: Omit<Anime, 'id'>) => void;
  addSeason: (season: Omit<Season, 'id'>) => void;
  addEpisode: (episode: Omit<Episode, 'id'>) => void;
}

// --- Context ---

const AppContext = createContext<AppContextType | undefined>(undefined);

const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [animes, setAnimes] = useState<Anime[]>([
    {
      id: '1',
      title: 'ون بيس',
      description: 'تبدأ مغامرات لوفي للبحث عن الكنز الأسطوري ون بيس ليصبح ملك القراصنة.',
      imageUrl: 'https://m.media-amazon.com/images/M/MV5BMTNjNGU4NDgtZmVlMy00ZTM4LWExNDAtN2IzM2FkM2U4YmUxXkEyXkFqcGdeQXVyNjAwNDUxODI@._V1_.jpg',
    },
    {
      id: '2',
      title: 'هجوم العمالقة',
      description: 'تدور القصة حول حياة إيرين ييغر، وأخته المتبناة ميكاسا أكرمان وصديقهما ارمين أرليت.',
      imageUrl: 'https://m.media-amazon.com/images/M/MV5BNDFjYTIxMjctYTQ2ZC00OGQ4LWE3OGYtNDdiMzNiNDBkZGUyXkEyXkFqcGdeQXVyMTMzNDExODE5._V1_.jpg',
    },
  ]);
  const [seasons, setSeasons] = useState<Season[]>([
    { id: 's1', number: 1, animeId: '1' },
    { id: 's2', number: 1, animeId: '2' },
  ]);
  const [episodes, setEpisodes] = useState<Episode[]>([
    { id: 'e1', title: 'الحلقة 1', videoUrl: 'https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4', seasonId: 's1' },
    { id: 'e2', title: 'الحلقة 1', videoUrl: 'https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4', seasonId: 's2' },
  ]);

  const addAnime = (anime: Omit<Anime, 'id'>) => {
    setAnimes([...animes, { ...anime, id: Date.now().toString() }]);
  };

  const addSeason = (season: Omit<Season, 'id'>) => {
    setSeasons([...seasons, { ...season, id: Date.now().toString() }]);
  };

  const addEpisode = (episode: Omit<Episode, 'id'>) => {
    setEpisodes([...episodes, { ...episode, id: Date.now().toString() }]);
  };

  return (
    <AppContext.Provider value={{ animes, seasons, episodes, addAnime, addSeason, addEpisode }}>
      {children}
    </AppContext.Provider>
  );
};

const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider');
  return context;
};

// --- Components ---

const ScreenHeader: React.FC<{ title: string; showSettings?: boolean; navigation?: any }> = ({ title, showSettings, navigation }) => {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.header, { paddingTop: insets.top }]}>
      {showSettings && (
        <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
          <SettingsIcon color="#007AFF" size={24} />
        </TouchableOpacity>
      )}
      <Text style={styles.headerTitle}>{title}</Text>
      <View style={{ width: 24 }} />
    </View>
  );
};

// --- Screens ---

const HomeScreen = ({ navigation }: any) => {
  const { animes } = useAppContext();
  const [modalVisible, setModalVisible] = useState(false);

  const renderAnimeItem = ({ item }: { item: Anime }) => (
    <TouchableOpacity 
      style={styles.animeCard} 
      onPress={() => navigation.navigate('Details', { animeId: item.id })}
    >
      <Image source={{ uri: item.imageUrl }} style={styles.animeThumbnail} />
      <Text style={styles.animeTitle} numberOfLines={1}>{item.title}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <ScreenHeader title="مكتبتي" showSettings navigation={navigation} />
      <FlatList
        data={animes}
        renderItem={renderAnimeItem}
        keyExtractor={(item) => item.id}
        numColumns={3}
        contentContainerStyle={styles.gridContainer}
      />
      
      <TouchableOpacity 
        style={styles.fab} 
        onPress={() => setModalVisible(true)}
      >
        <Plus color="#FFF" size={30} />
      </TouchableOpacity>

      <AddActionsModal 
        visible={modalVisible} 
        onClose={() => setModalVisible(false)} 
        navigation={navigation}
      />
    </SafeAreaView>
  );
};

const DetailsScreen = ({ route, navigation }: any) => {
  const { animeId } = route.params;
  const { animes, seasons, episodes } = useAppContext();
  const anime = animes.find(a => a.id === animeId);
  const animeSeasons = seasons.filter(s => s.animeId === animeId);

  if (!anime) return null;

  return (
    <View style={styles.container}>
      <ScrollView>
        <Image source={{ uri: anime.imageUrl }} style={styles.heroImage} />
        <View style={styles.overlay} />
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <ChevronLeft color="#FFF" size={28} />
        </TouchableOpacity>

        <View style={styles.detailsContent}>
          <Text style={styles.detailsTitle}>{anime.title}</Text>
          <Text style={styles.detailsDescription}>{anime.description}</Text>

          {animeSeasons.map((season) => (
            <View key={season.id} style={styles.seasonSection}>
              <Text style={styles.sectionHeader}>الموسم {season.number}</Text>
              {episodes
                .filter(e => e.seasonId === season.id)
                .map((episode) => (
                  <TouchableOpacity 
                    key={episode.id} 
                    style={styles.episodeItem}
                    onPress={() => navigation.navigate('Player', { videoUrl: episode.videoUrl, title: episode.title })}
                  >
                    <View style={styles.playIconContainer}>
                      <Play fill="#007AFF" color="#007AFF" size={16} />
                    </View>
                    <Text style={styles.episodeText}>{episode.title}</Text>
                  </TouchableOpacity>
                ))}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const PlayerScreen = ({ route, navigation }: any) => {
  const { videoUrl, title } = route.params;
  return (
    <View style={styles.playerContainer}>
      <StatusBar hidden />
      <Video
        source={{ uri: videoUrl }}
        rate={1.0}
        volume={1.0}
        isMuted={false}
        resizeMode={ResizeMode.CONTAIN}
        shouldPlay
        useNativeControls
        style={styles.videoPlayer}
      />
      <TouchableOpacity 
        style={styles.closePlayer} 
        onPress={() => navigation.goBack()}
      >
        <X color="#FFF" size={30} />
      </TouchableOpacity>
      <View style={styles.playerInfo}>
        <Text style={styles.playerTitle}>{title}</Text>
      </View>
    </View>
  );
};

const SettingsScreen = () => {
  const settingsOptions = [
    { title: 'اللغة', value: 'العربية' },
    { title: 'جودة الفيديو', value: 'تلقائي' },
    { title: 'الوضع الليلي', value: 'مفعل' },
    { title: 'عن التطبيق', value: '' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.settingsHeader}>
        <Text style={styles.settingsHeaderText}>الإعدادات</Text>
      </View>
      <ScrollView>
        {settingsOptions.map((option, index) => (
          <TouchableOpacity key={index} style={styles.settingItem}>
            <ChevronLeft color="#C7C7CC" size={20} />
            <View style={styles.settingItemLeft}>
              <Text style={styles.settingValue}>{option.value}</Text>
              <Text style={styles.settingTitle}>{option.title}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

// --- Modals & Forms ---

const AddActionsModal = ({ visible, onClose, navigation }: any) => {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <TouchableOpacity style={styles.modalOverlay} onPress={onClose} activeOpacity={1}>
        <View style={styles.actionSheet}>
          <Text style={styles.modalHeader}>إضافة محتوى جديد</Text>
          
          <TouchableOpacity 
            style={styles.actionItem} 
            onPress={() => { onClose(); navigation.navigate('AddAnime'); }}
          >
            <Info color="#007AFF" />
            <Text style={styles.actionText}>إضافة أنمي جديد</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionItem} 
            onPress={() => { onClose(); navigation.navigate('AddSeason'); }}
          >
            <Layers color="#007AFF" />
            <Text style={styles.actionText}>إضافة موسم</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionItem} 
            onPress={() => { onClose(); navigation.navigate('AddEpisode'); }}
          >
            <Tv color="#007AFF" />
            <Text style={styles.actionText}>إضافة حلقة</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionItem, styles.cancelItem]} onPress={onClose}>
            <Text style={styles.cancelText}>إلغاء</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const AddAnimeScreen = ({ navigation }: any) => {
  const { addAnime } = useAppContext();
  const [form, setForm] = useState({ title: '', description: '', imageUrl: '' });

  const handleSave = () => {
    if (!form.title || !form.imageUrl) return Alert.alert('خطأ', 'يرجى ملء جميع الحقول');
    addAnime(form);
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.formContainer}>
        <Text style={styles.formLabel}>اسم الأنمي</Text>
        <TextInput 
          style={styles.input} 
          placeholder="أدخل اسم الأنمي..." 
          textAlign="right"
          value={form.title}
          onChangeText={(text) => setForm({...form, title: text})}
        />
        <Text style={styles.formLabel}>الوصف (بالعربية)</Text>
        <TextInput 
          style={[styles.input, { height: 100 }]} 
          multiline 
          placeholder="أدخل وصفاً مشوقاً..." 
          textAlign="right"
          value={form.description}
          onChangeText={(text) => setForm({...form, description: text})}
        />
        <Text style={styles.formLabel}>رابط الصورة (URL)</Text>
        <TextInput 
          style={styles.input} 
          placeholder="https://..." 
          value={form.imageUrl}
          onChangeText={(text) => setForm({...form, imageUrl: text})}
        />
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>حفظ الأنمي</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const AddSeasonScreen = ({ navigation }: any) => {
  const { animes, addSeason } = useAppContext();
  const [selectedAnimeId, setSelectedAnimeId] = useState('');
  const [seasonNum, setSeasonNum] = useState('');

  const handleSave = () => {
    if (!selectedAnimeId || !seasonNum) return Alert.alert('خطأ', 'يرجى الاختيار');
    addSeason({ animeId: selectedAnimeId, number: parseInt(seasonNum) });
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.formContainer}>
        <Text style={styles.formLabel}>اختر الأنمي</Text>
        <ScrollView style={styles.pickerContainer}>
          {animes.map((a) => (
            <TouchableOpacity 
              key={a.id} 
              style={[styles.pickerItem, selectedAnimeId === a.id && styles.pickerItemActive]} 
              onPress={() => setSelectedAnimeId(a.id)}
            >
              <Text style={[styles.pickerText, selectedAnimeId === a.id && styles.pickerTextActive]}>{a.title}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <Text style={styles.formLabel}>رقم الموسم</Text>
        <TextInput 
          style={styles.input} 
          keyboardType="numeric" 
          placeholder="1" 
          textAlign="right"
          value={seasonNum}
          onChangeText={setSeasonNum}
        />
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>إضافة الموسم</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const AddEpisodeScreen = ({ navigation }: any) => {
  const { seasons, animes, addEpisode } = useAppContext();
  const [selectedSeasonId, setSelectedSeasonId] = useState('');
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');

  const handleSave = () => {
    if (!selectedSeasonId || !title || !url) return Alert.alert('خطأ', 'يرجى إكمال البيانات');
    addEpisode({ seasonId: selectedSeasonId, title, videoUrl: url });
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.formContainer}>
        <Text style={styles.formLabel}>اختر الموسم</Text>
        <ScrollView style={styles.pickerContainer}>
          {seasons.map((s) => {
            const anime = animes.find(a => a.id === s.animeId);
            return (
              <TouchableOpacity 
                key={s.id} 
                style={[styles.pickerItem, selectedSeasonId === s.id && styles.pickerItemActive]} 
                onPress={() => setSelectedSeasonId(s.id)}
              >
                <Text style={[styles.pickerText, selectedSeasonId === s.id && styles.pickerTextActive]}>
                  {anime?.title} - موسم {s.number}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
        <Text style={styles.formLabel}>اسم الحلقة</Text>
        <TextInput 
          style={styles.input} 
          placeholder="الحلقة 1..." 
          textAlign="right"
          value={title}
          onChangeText={setTitle}
        />
        <Text style={styles.formLabel}>رابط الفيديو (URL)</Text>
        <TextInput 
          style={styles.input} 
          placeholder="https://..." 
          value={url}
          onChangeText={setUrl}
        />
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>إضافة الحلقة</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

// --- Navigation ---

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <NavigationContainer>
          <Stack.Navigator 
            initialRouteName="Home"
            screenOptions={{
              headerShown: false,
              animation: 'slide_from_left',
              contentStyle: { backgroundColor: '#F2F2F7' }
            }}
          >
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Details" component={DetailsScreen} />
            <Stack.Screen name="Player" component={PlayerScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
            <Stack.Screen name="AddAnime" component={AddAnimeScreen} />
            <Stack.Screen name="AddSeason" component={AddSeasonScreen} />
            <Stack.Screen name="AddEpisode" component={AddEpisodeScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </AppProvider>
    </SafeAreaProvider>
  );
}

// --- Styles ---

const { width } = Dimensions.get('window');
const ITEM_WIDTH = (width - 48) / 3;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    height: 100,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    backgroundColor: '#FFF',
    borderBottomWidth: 0.5,
    borderBottomColor: '#C6C6C8',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
  },
  gridContainer: {
    padding: 12,
  },
  animeCard: {
    width: ITEM_WIDTH,
    margin: 6,
    backgroundColor: '#FFF',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  animeThumbnail: {
    width: '100%',
    height: ITEM_WIDTH * 1.4,
    backgroundColor: '#E5E5EA',
  },
  animeTitle: {
    padding: 6,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    backgroundColor: '#007AFF',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  heroImage: {
    width: '100%',
    height: 450,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    height: 450,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 4,
  },
  detailsContent: {
    marginTop: -40,
    backgroundColor: '#F2F2F7',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 24,
    minHeight: 500,
  },
  detailsTitle: {
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'right',
    marginBottom: 12,
  },
  detailsDescription: {
    fontSize: 16,
    color: '#3A3A3C',
    textAlign: 'right',
    lineHeight: 24,
    marginBottom: 24,
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'right',
    marginBottom: 12,
    color: '#000',
  },
  seasonSection: {
    marginBottom: 24,
  },
  episodeItem: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  playIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E5F1FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  episodeText: {
    fontSize: 16,
    fontWeight: '500',
  },
  playerContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  videoPlayer: {
    flex: 1,
  },
  closePlayer: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
  },
  playerInfo: {
    position: 'absolute',
    bottom: 80,
    width: '100%',
    alignItems: 'center',
  },
  playerTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
  settingsHeader: {
    padding: 20,
    alignItems: 'flex-end',
    borderBottomWidth: 0.5,
    borderBottomColor: '#C6C6C8',
  },
  settingsHeaderText: {
    fontSize: 32,
    fontWeight: '800',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 0.5,
    borderBottomColor: '#C6C6C8',
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingTitle: {
    fontSize: 17,
    marginLeft: 10,
  },
  settingValue: {
    fontSize: 17,
    color: '#8E8E93',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  actionSheet: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
  },
  modalHeader: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 20,
  },
  actionItem: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E5E5EA',
  },
  actionText: {
    fontSize: 17,
    marginRight: 15,
    color: '#007AFF',
  },
  cancelItem: {
    borderBottomWidth: 0,
    marginTop: 10,
    justifyContent: 'center',
  },
  cancelText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FF3B30',
  },
  formContainer: {
    padding: 20,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'right',
    marginBottom: 8,
    marginTop: 15,
  },
  input: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 30,
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
  },
  pickerContainer: {
    maxHeight: 200,
    backgroundColor: '#FFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  pickerItem: {
    padding: 15,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E5E5EA',
  },
  pickerItemActive: {
    backgroundColor: '#E5F1FF',
  },
  pickerText: {
    textAlign: 'right',
    fontSize: 16,
  },
  pickerTextActive: {
    color: '#007AFF',
    fontWeight: '700',
  }
});
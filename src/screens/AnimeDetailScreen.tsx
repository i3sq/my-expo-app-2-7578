import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  FlatList,
  I18nManager,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

// Force RTL layout for Arabic support
I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

const { width } = Dimensions.get('window');

interface Episode {
  id: string;
  title: string;
  videoUrl: string;
  thumbnail?: string;
}

interface Season {
  id: string;
  number: number;
  episodes: Episode[];
}

interface Anime {
  id: string;
  title: string;
  descriptionAr: string;
  imageUrl: string;
  seasons: Season[];
}

type RootStackParamList = {
  Home: undefined;
  AnimeDetail: { anime: Anime };
  VideoPlayer: { videoUrl: string; title: string };
};

type DetailScreenRouteProp = RouteProp<RootStackParamList, 'AnimeDetail'>;
type DetailScreenNavigationProp = StackNavigationProp<RootStackParamList, 'AnimeDetail'>;

const AnimeDetailScreen: React.FC = () => {
  const navigation = useNavigation<DetailScreenNavigationProp>();
  const route = useRoute<DetailScreenRouteProp>();
  const { anime } = route.params;

  const [selectedSeasonId, setSelectedSeasonId] = useState<string>(
    anime.seasons.length > 0 ? anime.seasons[0].id : ''
  );

  const activeSeason = anime.seasons.find((s) => s.id === selectedSeasonId);

  const handlePlayEpisode = (episode: Episode) => {
    navigation.navigate('VideoPlayer', {
      videoUrl: episode.videoUrl,
      title: episode.title,
    });
  };

  const renderSeasonTab = ({ item }: { item: Season }) => (
    <TouchableOpacity
      style={[
        styles.seasonTab,
        selectedSeasonId === item.id && styles.activeSeasonTab,
      ]}
      onPress={() => setSelectedSeasonId(item.id)}
    >
      <Text
        style={[
          styles.seasonTabText,
          selectedSeasonId === item.id && styles.activeSeasonTabText,
        ]}
      >
        الموسم {item.number}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
        {/* Header Image Section */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: anime.imageUrl }} style={styles.coverImage} />
          <View style={styles.overlay} />
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-forward" size={28} color="#FFF" />
          </TouchableOpacity>
        </View>

        {/* Info Section */}
        <View style={styles.detailsContainer}>
          <Text style={styles.title}>{anime.title}</Text>
          
          <View style={styles.badgeContainer}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>HD</Text>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>+13</Text>
            </View>
            <Text style={styles.seasonCount}>
              {anime.seasons.length} مواسم
            </Text>
          </View>

          <Text style={styles.description}>{anime.descriptionAr}</Text>

          {/* Seasons Selector */}
          <View style={styles.seasonsSection}>
            <FlatList
              data={anime.seasons}
              renderItem={renderSeasonTab}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              inverted={I18nManager.isRTL}
              contentContainerStyle={styles.seasonListContent}
            />
          </View>

          {/* Episodes List */}
          <View style={styles.episodesSection}>
            {activeSeason?.episodes.map((episode, index) => (
              <TouchableOpacity
                key={episode.id}
                style={styles.episodeCard}
                onPress={() => handlePlayEpisode(episode)}
              >
                <View style={styles.episodeThumbnailContainer}>
                  <Image
                    source={{ uri: episode.thumbnail || anime.imageUrl }}
                    style={styles.episodeThumbnail}
                  />
                  <View style={styles.playIconOverlay}>
                    <Ionicons name="play" size={20} color="#FFF" />
                  </View>
                </View>
                <View style={styles.episodeInfo}>
                  <Text style={styles.episodeNumber}>الحلقة {index + 1}</Text>
                  <Text style={styles.episodeTitle} numberOfLines={1}>
                    {episode.title}
                  </Text>
                </View>
                <Ionicons name="download-outline" size={22} color="#8E8E93" />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  imageContainer: {
    width: width,
    height: width * 1.2,
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  detailsContainer: {
    flex: 1,
    backgroundColor: '#121212',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -30,
    paddingTop: 25,
    paddingHorizontal: 20,
    minHeight: 500,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFF',
    textAlign: 'right',
    marginBottom: 10,
  },
  badgeContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginBottom: 15,
  },
  badge: {
    backgroundColor: '#333',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 10,
  },
  badgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  seasonCount: {
    color: '#8E8E93',
    fontSize: 14,
  },
  description: {
    color: '#D1D1D6',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'right',
    marginBottom: 25,
  },
  seasonsSection: {
    marginBottom: 20,
    borderBottomWidth: 0.5,
    borderBottomColor: '#333',
    paddingBottom: 10,
  },
  seasonListContent: {
    paddingRight: 0,
  },
  seasonTab: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    marginLeft: 10,
  },
  activeSeasonTab: {
    backgroundColor: '#E50914',
  },
  seasonTabText: {
    color: '#8E8E93',
    fontSize: 16,
    fontWeight: '600',
  },
  activeSeasonTabText: {
    color: '#FFF',
  },
  episodesSection: {
    paddingBottom: 40,
  },
  episodeCard: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 10,
    marginBottom: 12,
  },
  episodeThumbnailContainer: {
    width: 100,
    height: 60,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  episodeThumbnail: {
    width: '100%',
    height: '100%',
  },
  playIconOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  episodeInfo: {
    flex: 1,
    marginRight: 15,
    alignItems: 'flex-start',
  },
  episodeNumber: {
    color: '#E50914',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'right',
  },
  episodeTitle: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '500',
    textAlign: 'right',
  },
});

export default AnimeDetailScreen;
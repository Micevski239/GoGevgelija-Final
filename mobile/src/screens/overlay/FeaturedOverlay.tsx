// src/screens/overlay/FeaturedOverlay.tsx
import React, { useCallback } from 'react';
import {
  Dimensions,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BaseOverlay from '../../components/overlay/BaseOverlay';

const { width } = Dimensions.get('window');

// ---- Types -----------------------------------------------------------------
interface Listing {
  id: number;
  title: string;
  rating: string;
  address: string;
  open_time: string;
  category: string;
  tags: string[];
  image: string;
  featured: boolean;
  created_at: string;
  updated_at: string;
}

const Chip = React.memo(({ label }: { label: string }) => (
  <View style={[styles.chip, { marginRight: 6, marginBottom: 6 }]}>
    <Text style={styles.chipText}>{label}</Text>
  </View>
));

const RestaurantCard = React.memo(({ item, onPress }: { item: Listing; onPress?: () => void }) => {
  return (
  <TouchableOpacity 
    style={styles.featureCard}
    onPress={() => {
      console.log('Restaurant card pressed:', item.title);
      console.log('onPress function available:', !!onPress);
      if (onPress) {
        console.log('Calling onPress');
        onPress();
      }
    }}
    activeOpacity={0.9}
  >
    <ImageBackground
      source={{ uri: item.image }}
      style={styles.featureImage}
      imageStyle={{ borderTopLeftRadius: 14, borderTopRightRadius: 14 }}
    >
      <View style={styles.heartBtn}>
        <Ionicons name="heart-outline" size={18} color="#fff" />
      </View>
    </ImageBackground>
    <View style={styles.featureMeta}>
      <Text style={styles.featureTitle} numberOfLines={1}>{item.title}</Text>

      <View style={styles.rowCenter}>
        <Ionicons name="star-outline" size={14} color={"#B91C1C"}/>
        <Text style={[styles.metaText, { marginLeft: 4, marginRight: 6 }]}>{parseFloat(item.rating).toFixed(1)}</Text>
        <Text style={{ color: '#AAA', marginRight: 6 }}>•</Text>
        <Ionicons name="location-outline" size={14} color="#B91C1C" />
        <Text style={[styles.metaText, { marginLeft: 4 }]}>{item.address}</Text>
      </View>

      <View style={[styles.rowCenter, { marginTop: 6 }]}>
        <Ionicons name="time-outline" size={14} color="#777" />
        <Text style={[styles.metaText, { marginLeft: 4 }]}>{item.open_time}</Text>
      </View>

      <View style={styles.tagRow}>
        {item.tags.map((t: string) => (<Chip key={t} label={t} />))}
      </View>
    </View>
  </TouchableOpacity>
  );
});

type Props = { 
  visible: boolean; 
  onClose: () => void;
  onOpenDetails?: () => void;
  data?: Listing[];
};

export default function FeaturedOverlay({ visible, onClose, onOpenDetails, data = [] }: Props) {
  console.log('FeaturedOverlay rendered, onOpenDetails available:', !!onOpenDetails);
  
  // FlatList render callback
  const renderItem = useCallback(({ item }: { item: Listing }) => (
    <RestaurantCard item={item} onPress={onOpenDetails} />
  ), [onOpenDetails]);
  
  // Key extractor
  const keyExtractor = useCallback((item: Listing) => item.id.toString(), []);

  return (
    <BaseOverlay
      visible={visible}
      onClose={onClose}
      title="Featured"
      data={data}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      bottomBarHeight={56}
      itemHeight={200} // Approx height: image(160) + meta(40)
      // Performance optimized for restaurant cards
      performanceConfig={{
        initialNumToRender: 6,
        maxToRenderPerBatch: 6,
        updateCellsBatchingPeriod: 16,
        windowSize: 7,
        removeClippedSubviews: true,
      }}
    />
  );
}

const styles = StyleSheet.create({
  featureCard: {
    width: width * 0.9,
    borderRadius: 14,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  featureImage: { width: '100%', height: 160, justifyContent: 'flex-end' },
  heartBtn: {
    alignSelf: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.35)',
    padding: 6,
    borderRadius: 14,
    margin: 8,
  },
  featureMeta: { padding: 10 },
  featureTitle: { fontSize: 14, fontWeight: '800', color: '#111' },
  rowCenter: { flexDirection: 'row', alignItems: 'center' },
  metaText: { fontSize: 12, color: '#666' },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 6 },
  chip: { backgroundColor: '#FEE2E2', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  chipText: { fontSize: 11, color: '#B91C1C', fontWeight: '700' },
});
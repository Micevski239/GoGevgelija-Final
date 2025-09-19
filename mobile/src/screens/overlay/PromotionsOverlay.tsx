// src/screens/overlay/PromotionsOverlay.tsx
import React, { useCallback } from 'react';
import {
  Dimensions,
  ImageBackground,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BaseOverlay from '../../components/overlay/BaseOverlay';

const { width } = Dimensions.get('window');

// ---- mock data (same as Home) ----
const promos = [
  { id: 'p1', title: '-15% at Balkan Bistro', code: 'GOGEV15', chips: ['Today', 'Dine-in'], img: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2070&auto=format&fit=crop' },
  { id: 'p2', title: 'Spa Day 2', code: 'GOCE', chips: ['Today'], img: 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?q=80&w=2070&auto=format&fit=crop' },
  { id: 'p3', title: 'Free dessert with dinner', code: 'SWEET23', chips: ['Weekend', 'Dinner'], img: 'https://images.unsplash.com/photo-1551218808-94e220e084d2?q=80&w=2070&auto=format&fit=crop' },
  { id: 'p4', title: '2-for-1 cocktails', code: 'HAPPY2', chips: ['Happy Hour'], img: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?q=80&w=2070&auto=format&fit=crop' },
];

const Chip = React.memo(({ label }: { label: string }) => (
  <View style={[styles.chip, { marginRight: 6, marginBottom: 6 }]}>
    <Text style={styles.chipText}>{label}</Text>
  </View>
));

const PromoCard = React.memo(({ item }: any) => (
  <View style={styles.promoCard}>
    <ImageBackground
      source={{ uri: item.img }}
      style={styles.promoImage}
      imageStyle={{ borderTopLeftRadius: 14, borderTopRightRadius: 14 }}
    >
      <View style={styles.heartBtn}>
        <Ionicons name="heart-outline" size={18} color="#fff" />
      </View>
    </ImageBackground>

    <View style={styles.promoMeta}>
      <Text style={styles.promoTitle} numberOfLines={2}>{item.title}</Text>

      <View style={[styles.rowCenter, { marginTop: 6 }]}>
        <Ionicons name="pricetag-outline" size={14} color="#B91C1C" />
        <Text style={[styles.promoCodeText, { marginLeft: 6 }]} selectable>{item.code}</Text>
      </View>

      <View style={styles.tagRow}>
        {(item.chips ?? []).map((c: string) => (
          <Chip key={c} label={c} />
        ))}
      </View>
    </View>
  </View>
));

type Props = { visible: boolean; onClose: () => void };

export default function PromotionsOverlay({ visible, onClose }: Props) {
  // FlatList render callback
  const renderItem = useCallback(({ item }: any) => <PromoCard item={item} />, []);
  
  // Key extractor
  const keyExtractor = useCallback((item: any) => item.id, []);

  return (
    <BaseOverlay
      visible={visible}
      onClose={onClose}
      title="Promotions"
      data={promos}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      bottomBarHeight={56}
      itemHeight={200} // Approx height: image(160) + meta(40)
      // Performance optimized for promo cards
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
  promoCard: {
    width: width * 0.9,
    borderRadius: 14,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  promoImage: { width: '100%', height: 160, justifyContent: 'flex-end' },
  heartBtn: {
    alignSelf: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.35)',
    padding: 6,
    borderRadius: 14,
    margin: 8,
  },
  promoMeta: { padding: 10 },
  promoTitle: { fontSize: 14, fontWeight: '800', color: '#111' },
  promoCodeText: { fontSize: 12, color: '#B91C1C', fontWeight: '700' },
  rowCenter: { flexDirection: 'row', alignItems: 'center' },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 6 },
  chip: { backgroundColor: '#FEE2E2', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  chipText: { fontSize: 11, color: '#B91C1C', fontWeight: '700' },
});
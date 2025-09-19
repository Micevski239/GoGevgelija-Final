// src/screens/overlay/BlogOverlay.tsx
import React, { useCallback } from 'react';
import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BaseOverlay from '../../components/overlay/BaseOverlay';

const { width } = Dimensions.get('window');

// ---- mock data (same as Home) ----
const blog = [
  { id: 'b1', title: 'Top 10 cafes in Gevgelija', subtitle: 'Where to sip, snack, and unwind', img: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2069&auto=format&fit=crop' },
  { id: 'b2', title: 'Top 10 cafes in Gevgelija', subtitle: 'Where to sip, snack, and unwind', img: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2069&auto=format&fit=crop' },
  { id: 'b3', title: 'Hidden gems in the old town', subtitle: 'Discover authentic local experiences', img: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=2070&auto=format&fit=crop' },
  { id: 'b4', title: 'Weekend events guide', subtitle: 'Never miss what\'s happening this weekend', img: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?q=80&w=2070&auto=format&fit=crop' },
];

const BlogCard = React.memo(({ item }: any) => (
  <View style={styles.blogCard}>
    <Image source={{ uri: item.img }} style={styles.blogImage} />
    <View style={styles.blogMeta}>
      <Text style={styles.blogTitle} numberOfLines={2}>{item.title}</Text>
      <Text style={styles.blogSubtitle} numberOfLines={1}>{item.subtitle}</Text>
      
      <View style={[styles.rowCenter, { marginTop: 8 }]}>
        <Ionicons name="time-outline" size={14} color="#777" />
        <Text style={[styles.metaText, { marginLeft: 4, marginRight: 6 }]}>5 min read</Text>
        <Text style={{ color: '#AAA', marginRight: 6 }}>•</Text>
        <Ionicons name="eye-outline" size={14} color="#777" />
        <Text style={[styles.metaText, { marginLeft: 4 }]}>142 views</Text>
      </View>
    </View>
  </View>
));

type Props = { visible: boolean; onClose: () => void };

export default function BlogOverlay({ visible, onClose }: Props) {
  // FlatList render callback
  const renderItem = useCallback(({ item }: any) => <BlogCard item={item} />, []);
  
  // Key extractor
  const keyExtractor = useCallback((item: any) => item.id, []);

  return (
    <BaseOverlay
      visible={visible}
      onClose={onClose}
      title="From the Blog"
      data={blog}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      bottomBarHeight={56}
      itemHeight={180} // Approx height: image(140) + meta(40)
      // Performance optimized for blog cards
      performanceConfig={{
        initialNumToRender: 8,
        maxToRenderPerBatch: 8,
        updateCellsBatchingPeriod: 16,
        windowSize: 7,
        removeClippedSubviews: true,
      }}
    />
  );
}

const styles = StyleSheet.create({
  blogCard: {
    width: width * 0.9,
    borderRadius: 14,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  blogImage: { 
    width: '100%', 
    height: 140, 
    borderTopLeftRadius: 14, 
    borderTopRightRadius: 14 
  },
  blogMeta: { padding: 12 },
  blogTitle: { 
    fontSize: 16, 
    fontWeight: '800', 
    color: '#111', 
    marginBottom: 4 
  },
  blogSubtitle: { 
    fontSize: 13, 
    color: '#666', 
    lineHeight: 18 
  },
  rowCenter: { flexDirection: 'row', alignItems: 'center' },
  metaText: { fontSize: 12, color: '#666' },
});
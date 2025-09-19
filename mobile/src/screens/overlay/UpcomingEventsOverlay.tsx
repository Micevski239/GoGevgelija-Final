// src/screens/overlay/UpcomingEventsOverlay.tsx
import React, { useCallback } from 'react';
import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BaseOverlay from '../../components/overlay/BaseOverlay';

const { width } = Dimensions.get('window');

// ---- mock events (mirror Home's shape) ----
const events = [
  { id: 'e1', title: 'Summer Jazz Night', dt: 'Fri, 20:00', place: 'City Park Stage', cover: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?q=80&w=2069&auto=format&fit=crop' },
  { id: 'e2', title: 'Food Festival', dt: 'Sat, 10:00', place: 'Main Square', cover: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=2070&auto=format&fit=crop' },
  { id: 'e3', title: 'Art Gallery Opening', dt: 'Sun, 18:00', place: 'Cultural Center', cover: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?q=80&w=2070&auto=format&fit=crop' },
  { id: 'e4', title: 'Live Music Evening', dt: 'Thu, 21:00', place: 'Riverside Cafe', cover: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=2070&auto=format&fit=crop' },
  { id: 'e5', title: 'Comedy Show', dt: 'Fri, 19:30', place: 'Theater Hall', cover: 'https://images.unsplash.com/photo-1528834342297-47a4ee5eaef6?q=80&w=2070&auto=format&fit=crop' },
];

const EventCard = React.memo(({ item }: any) => {
  return (
  <TouchableOpacity 
    style={styles.eventCard}
    onPress={() => console.log('Event card pressed:', item.title)}
    activeOpacity={0.7}
  >
    <Image source={{ uri: item.cover }} style={styles.eventImage} />
    <View style={styles.eventMeta}>
      <Text style={styles.eventTitle} numberOfLines={2}>{item.title}</Text>
      
      <View style={styles.rowCenter}>
        <Ionicons name="calendar-outline" size={14} color="#777" />
        <Text style={[styles.eventMetaText, { marginLeft: 4, marginRight: 6 }]}>{item.dt}</Text>
        <Text style={{ color: '#AAA', marginRight: 6 }}>•</Text>
        <Ionicons name="location-outline" size={14} color="#777" />
        <Text style={[styles.eventMetaText, { marginLeft: 4 }]}>{item.place}</Text>
      </View>
      
      <View style={[styles.rowCenter, { marginTop: 8 }]}>
        <Ionicons name="people-outline" size={14} color="#B91C1C" />
        <Text style={[styles.attendeeText, { marginLeft: 4 }]}>24 attending</Text>
      </View>
    </View>
    
    <Ionicons name="chevron-forward" size={18} color="#999" />
  </TouchableOpacity>
  );
});

type Props = { visible: boolean; onClose: () => void };

export default function UpcomingEventsOverlay({ visible, onClose }: Props) {
  // FlatList render callback
  const renderItem = useCallback(({ item }: any) => <EventCard item={item} />, []);
  
  // Key extractor
  const keyExtractor = useCallback((item: any) => item.id, []);

  return (
    <BaseOverlay
      visible={visible}
      onClose={onClose}
      title="Upcoming Events"
      data={events}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      bottomBarHeight={56}
      // Performance optimized for event cards (horizontal layout)
      performanceConfig={{
        initialNumToRender: 10,
        maxToRenderPerBatch: 10,
        updateCellsBatchingPeriod: 16,
        windowSize: 9,
        removeClippedSubviews: true,
      }}
    />
  );
}

const styles = StyleSheet.create({
  eventCard: {
    width: width * 0.9,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 12,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  eventImage: { 
    width: 80, 
    height: 80, 
    borderRadius: 12, 
    marginRight: 12 
  },
  eventMeta: { flex: 1 },
  eventTitle: { 
    fontSize: 14, 
    fontWeight: '800', 
    color: '#111',
    marginBottom: 4 
  },
  eventMetaText: { fontSize: 12, color: '#666' },
  attendeeText: { fontSize: 12, color: '#B91C1C', fontWeight: '600' },
  rowCenter: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
});
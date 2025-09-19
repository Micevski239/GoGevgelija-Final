import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Image as RNImage } from 'react-native';

import {
  Dimensions,
  FlatList,
  Image,
  ImageBackground,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import AppHeader from '../components/AppHeader';
import { useBackgroundColor } from '../contexts/BackgroundContext';
import FeaturedOverlay from './overlay/FeaturedOverlay';
import UpcomingEventsOverlay from './overlay/UpcomingEventsOverlay';
import PromotionsOverlay from './overlay/PromotionsOverlay';
import BlogOverlay from './overlay/BlogOverlay';
import { api } from '../api/client';

const { width } = Dimensions.get('window');
const TAB_BAR_HEIGHT = 64;

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

const events = [
  { id: 'e1', title: 'Summer Jazz Night', dt: 'Fri, 20:00', place: 'City Park Stage', cover: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?q=80&w=2069&auto=format&fit=crop' },
  { id: 'e2', title: 'Summer Jazz Night', dt: 'Fri, 20:00', place: 'City Park Stage', cover: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?q=80&w=2069&auto=format&fit=crop' },
];

const promos = [
  { id: 'p1', title: '-15% at Balkan Bistro', code: 'GOGEV15', chips: ['Today', 'Dine-in'], img: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2070&auto=format&fit=crop' },
  { id: 'p2', title: 'Spa Day 2', code: 'GOCE', chips: ['Today'], img: 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?q=80&w=2070&auto=format&fit=crop' },
];

const blog = [
  { id: 'b1', title: 'Top 10 cafes in Gevgelija', subtitle: 'Where to sip, snack, and unwind', img: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2069&auto=format&fit=crop' },
  { id: 'b2', title: 'Top 10 cafes in Gevgelija', subtitle: 'Where to sip, snack, and unwind', img: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2069&auto=format&fit=crop' },
];

const forYou = [
  { id: 'r1', title: 'Nearby: Espresso Bar', img: 'https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?q=80&w=2067&auto=format&fit=crop' },
  { id: 'r2', title: 'You viewed: Green Park', img: 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?q=80&w=2070&auto=format&fit=crop' },
];

interface HomeScreenProps {
  signOut: () => Promise<void>;
}

// ---- Helpers ---------------------------------------------------------------
const HSeparator = ({ w = 12 }: { w?: number }) => <View style={{ width: w }} />;

// ---- Components -----------------------------------------------------------
const SectionHeader = ({ title, actionText, onPress }: { title: string; actionText?: string; onPress?: () => void }) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {actionText ? (
      <TouchableOpacity onPress={onPress}>
        <Text style={styles.sectionAction}>{actionText}</Text>
      </TouchableOpacity>
    ) : null}
  </View>
);

const Chip = ({ label }: { label: string }) => (
  <View style={[styles.chip, { marginRight: 6, marginBottom: 6 }]}>
    <Text style={styles.chipText}>{label}</Text>
  </View>
);

/** FEATURED: two-layer (shadow wrapper + clipping inner) */
const RestaurantCard = ({ item, onPress }: { item: Listing; onPress?: () => void }) => {
  return (
  <View style={styles.featureCardShadow}>
    <TouchableOpacity 
      style={styles.featureCardClip} 
      activeOpacity={0.85}
      onPress={onPress}
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
  </View>
  );
};

/** PROMO: same structure as Featured but own promo* styles */
const PromoCard = ({ item, onPress }: any) => {
  return (
  <View style={styles.promoCardShadow}>
    <TouchableOpacity style={styles.promoCardClip} activeOpacity={0.85} onPress={onPress}>
      <ImageBackground
        source={{ uri: item.img }}
        style={styles.promoImage}
        imageStyle={{ borderTopLeftRadius: 14, borderTopRightRadius: 14 }}
      >
        <View style={styles.promoHeartBtn}>
          <Ionicons name="heart-outline" size={18} color="#fff" />
        </View>
      </ImageBackground>

      <View style={styles.promoMeta}>
        <Text style={styles.promoTitle} numberOfLines={2}>{item.title}</Text>

        <View style={[styles.rowCenter, { marginTop: 6 }]}>
          <Ionicons name="pricetag-outline" size={14} color="#B91C1C" />
          <Text style={[styles.promoCodeText, { marginLeft: 6 }]} selectable>{item.code}</Text>
        </View>

        <View style={styles.promoTagRow}>
          {item.chips.map((c: string) => (
            <View key={c} style={styles.promoChip}>
              <Text style={styles.promoChipText}>{c}</Text>
            </View>
          ))}
        </View>
      </View>
    </TouchableOpacity>
  </View>
  );
};

const EventItem = ({ item, onPress }: any) => {
  return (
  <TouchableOpacity 
    style={styles.eventItem}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <Image source={{ uri: item.cover }} style={styles.eventThumb} />
    <View style={{ flex: 1 }}>
      <Text style={styles.eventTitle} numberOfLines={1}>{item.title}</Text>
      <View style={styles.rowCenter}>
        <Ionicons name="calendar-outline" size={14} color="#777" />
        <Text style={[styles.eventMeta, { marginLeft: 4, marginRight: 6 }]}>{item.dt}</Text>
        <Text style={{ color: '#AAA', marginRight: 6 }}>•</Text>
        <Ionicons name="map-outline" size={14} color="#777" />
        <Text style={[styles.eventMeta, { marginLeft: 4 }]}>{item.place}</Text>
      </View>
    </View>
    <Ionicons name="chevron-forward" size={18} color="#999" />
  </TouchableOpacity>
  );
};

const BlogItem = ({ item, onPress }: any) => {
  return (
  <TouchableOpacity style={styles.blogItem} onPress={onPress}>
    <Image source={{ uri: item.img }} style={styles.blogThumb} />
    <View style={{ flex: 1 }}>
      <Text style={styles.blogTitle} numberOfLines={1}>{item.title}</Text>
      <Text style={styles.blogSubtitle} numberOfLines={1}>{item.subtitle}</Text>
    </View>
    <Ionicons name="chevron-forward" size={18} color="#999" />
  </TouchableOpacity>
  );
};

const ForYouCard = ({ item }: any) => (
  <TouchableOpacity style={styles.forYouCard}>
    <Image source={{ uri: item.img }} style={styles.forYouImage} />
    <Text style={styles.forYouTitle} numberOfLines={1}>{item.title}</Text>
  </TouchableOpacity>
);

// ---- Main Screen ----------------------------------------------------------
export default function HomeScreen({ signOut }: HomeScreenProps) {
  
  const { setColor } = useBackgroundColor();
  const insets = useSafeAreaInsets();
  
  // Data states
  const [featuredListings, setFeaturedListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Overlay states
  const [featuredVisible, setFeaturedVisible] = useState(false);
  const [eventsVisible, setEventsVisible] = useState(false);
  const [promotionsVisible, setPromotionsVisible] = useState(false);
  const [blogVisible, setBlogVisible] = useState(false);

  useEffect(() => { setColor('#fff'); }, [setColor]);

  // Fetch featured listings from API
  useEffect(() => {
    const fetchFeaturedListings = async () => {
      try {
        setLoading(true);
        console.log('Fetching featured listings...');
        
        const response = await fetch('https://gogevgelija-api.fly.dev/api/listings/featured/');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Featured listings loaded:', data.length, 'items');
        setFeaturedListings(data);
        
        // Prefetch images
        data.forEach((listing: Listing) => RNImage.prefetch(listing.image).catch(() => {}));
      } catch (error: any) {
        console.error('Error fetching featured listings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedListings();
  }, []);

  useEffect(() => {
    events.forEach(e => RNImage.prefetch(e.cover).catch(() => {}));
    promos.forEach(p => RNImage.prefetch(p.img).catch(() => {}));
    blog.forEach(b => RNImage.prefetch(b.img).catch(() => {}));
    forYou.forEach(r => RNImage.prefetch(r.img).catch(() => {}));
  }, []);


  const bottomPad = Platform.OS === 'ios'
    ? TAB_BAR_HEIGHT + 12
    : TAB_BAR_HEIGHT + insets.bottom + 12;

  const content = (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: bottomPad }}
        scrollIndicatorInsets={{ bottom: bottomPad }}
      >
        <AppHeader
          name="Filip"
          greeting="Welcome back"
          compact
          bottomSpacing={10}
          actions={[
            { icon: 'heart-outline', badgeCount: 2 },
            { icon: 'notifications-outline' },
          ]}
        />

        <SectionHeader title="Featured" actionText="See All" onPress={() => setFeaturedVisible(true)} />
        {loading ? (
          <View style={{ paddingHorizontal: 16, paddingVertical: 20 }}>
            <Text style={{ textAlign: 'center', color: '#666' }}>Loading featured listings...</Text>
          </View>
        ) : (
          <FlatList
            data={featuredListings}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => <RestaurantCard item={item} onPress={() => console.log('Featured item pressed:', item.title)} />}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 8 }}
            ItemSeparatorComponent={() => <HSeparator w={12} />}
          />
        )}

        <SectionHeader title="Upcoming Events" actionText="View All Events" onPress={() => setEventsVisible(true)} />
        <View style={{ paddingHorizontal: 16 }}>
          {events.map((e) => (<EventItem key={e.id} item={e} onPress={() => console.log('Event pressed')} />))}
        </View>

        <SectionHeader title="Promotions" actionText="See All" onPress={() => setPromotionsVisible(true)} />
        <FlatList
          data={promos}
          keyExtractor={(i) => i.id}
          renderItem={({ item }) => <PromoCard item={item} onPress={() => console.log('Promo pressed')} />}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 8 }}
          ItemSeparatorComponent={() => <HSeparator w={12} />}
        />

        <SectionHeader title="From the Blog" actionText="More Articles" onPress={() => setBlogVisible(true)} />
        <View style={{ paddingHorizontal: 16 }}>
          {blog.map((b) => (<BlogItem key={b.id} item={b} onPress={() => console.log('Blog pressed')} />))}
        </View>

        <SectionHeader title="For You" actionText="Manage" />
        <FlatList
          data={forYou}
          keyExtractor={(i) => i.id}
          renderItem={({ item }) => <ForYouCard item={item} />}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 8 }}
          ItemSeparatorComponent={() => <HSeparator w={12} />}
        />

        {/* Logout section */}
        <View style={styles.logoutSection}>
          <TouchableOpacity style={styles.logoutButton} onPress={signOut}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Overlays */}
      <FeaturedOverlay 
        visible={featuredVisible} 
        onClose={() => setFeaturedVisible(false)}
        onOpenDetails={() => console.log('Open featured details')}
        data={featuredListings}
      />
      <UpcomingEventsOverlay 
        visible={eventsVisible} 
        onClose={() => setEventsVisible(false)} 
      />
      <PromotionsOverlay 
        visible={promotionsVisible} 
        onClose={() => setPromotionsVisible(false)} 
      />
      <BlogOverlay 
        visible={blogVisible} 
        onClose={() => setBlogVisible(false)} 
      />
    </View>
  );

  return Platform.OS === 'android' ? (
    <SafeAreaView edges={['top']} style={styles.safe}>
      {content}
    </SafeAreaView>
  ) : (
    <View style={styles.safe}>{content}</View>
  );
}

// ---- Styles ---------------------------------------------------------------
const CARD_RADIUS = 14;

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: { flex: 1 },

  sectionHeader: {
    paddingHorizontal: 16,
    marginTop: 10,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
  },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#111' },
  sectionAction: { fontSize: 13, color: '#B91C1C', fontWeight: '700' },

  rowCenter: { flexDirection: 'row', alignItems: 'center' },
  metaText: { fontSize: 12, color: '#666' },

  tagRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop:6 },
  chip: { backgroundColor: '#FEE2E2', paddingHorizontal: 10, paddingVertical:4, borderRadius: 20 },
  chipText: { fontSize: 11, color: '#B91C1C', fontWeight: '700' },

  // ---------- FEATURED (two-layer) ----------
  featureCardShadow: {
    width: width * 0.64,
    borderRadius: CARD_RADIUS,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2, // Android shadow
  },
  featureCardClip: {
    borderRadius: CARD_RADIUS,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  featureImage: { width: '100%', height: 120, justifyContent: 'flex-end' },
  heartBtn: { alignSelf: 'flex-end', backgroundColor: 'rgba(0,0,0,0.35)', padding: 6, borderRadius: 14, margin: 8 },
  featureMeta: { padding: 10 },
  featureTitle: { fontSize: 14, fontWeight: '800', color: '#111' },

  // ---------- EVENTS ----------
  eventItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 1,
  },
  eventThumb: { width: 54, height: 54, borderRadius: 10, marginRight: 10 },
  eventTitle: { fontSize: 14, fontWeight: '800', color: '#111' },
  eventMeta: { fontSize: 12, color: '#666' },

  // ---------- PROMOTIONS (two-layer, mirrors Featured) ----------
  promoCardShadow: {
    width: width * 0.64,
    borderRadius: CARD_RADIUS,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },

  
  promoCardClip: {
    borderRadius: CARD_RADIUS,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  promoImage: { width: '100%', height: 110, justifyContent: 'flex-end' },
  promoHeartBtn: { alignSelf: 'flex-end', backgroundColor: 'rgba(0,0,0,0.35)', padding: 6, borderRadius: 14, margin: 8 },

  promoMeta: { padding: 10 },
  promoTitle: { fontSize: 14, fontWeight: '800', color: '#111' },
  promoCodeText: { fontSize: 12, color: '#B91C1C', fontWeight: '700' },

  promoTagRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 6 },
  promoChip: { backgroundColor: '#FEE2E2', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, marginRight: 6, marginBottom: 6 },
  promoChipText: { fontSize: 11, color: '#B91C1C', fontWeight: '700' },

  // ---------- BLOG ----------
  blogItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 1,
  },
  blogThumb: { width: 54, height: 54, borderRadius: 10, marginRight: 10 },
  blogTitle: { fontSize: 14, fontWeight: '800', color: '#111' },
  blogSubtitle: { fontSize: 12, color: '#666', marginTop: 2 },

  // ---------- FOR YOU ----------
  forYouCard: {
    width: width * 0.7,
    borderRadius: CARD_RADIUS,
    backgroundColor: '#fff',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  forYouImage: { width: '100%', height: 110 },
  forYouTitle: { padding: 10, fontSize: 14, fontWeight: '800', color: '#111' },

  // ---------- LOGOUT ----------
  logoutSection: {
    paddingHorizontal: 16,
    marginTop: 30,
    marginBottom: 20,
  },
  logoutButton: {
    backgroundColor: '#B91C1C',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
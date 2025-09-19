// src/screens/main/SearchScreen.tsx
import { Ionicons } from '@expo/vector-icons';
import React, { useState, useCallback, useMemo } from 'react';
import {
  FlatList,
  Image,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Dimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBackgroundColor } from '../../contexts/BackgroundContext';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2; // 2 columns with 16px margins + 16px gap

// Mock data for search results
const allItems = [
  // Restaurants
  { id: 'r1', type: 'restaurant', name: 'Balkan Bistro', category: 'Restaurant', rating: 4.7, area: 'Central Square', description: 'Traditional Balkan cuisine with modern twist. The graphic and ographic operators know this well, in reality...', img: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=1974&auto=format&fit=crop' },
  { id: 'r2', type: 'restaurant', name: 'Villa Rose', category: 'Restaurant', rating: 4.8, area: 'Old Town', description: 'Fine dining experience with local ingredients. The graphic and ographic operators know this well, in reality...', img: 'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=2070&auto=format&fit=crop' },
  { id: 'r3', type: 'cafe', name: 'Cafe Central', category: 'Cafe', rating: 4.5, area: 'City Center', description: 'Perfect coffee and pastries spot. The graphic and ographic operators know this well, in reality...', img: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2069&auto=format&fit=crop' },
  { id: 'r4', type: 'cafe', name: 'Sweet Corner', category: 'Cafe', rating: 4.3, area: 'Downtown', description: 'Artisanal cakes and desserts. The graphic and ographic operators know this well, in reality...', img: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?q=80&w=2070&auto=format&fit=crop' },
  
  // Events/Music
  { id: 'e1', type: 'music', name: 'Summer Jazz Night', category: 'Music', date: 'Fri, 20:00', location: 'City Park Stage', description: 'Live jazz performance under the stars. The graphic and ographic operators know this well, in reality...', img: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?q=80&w=2069&auto=format&fit=crop' },
  { id: 'e2', type: 'music', name: 'Folk Festival', category: 'Music', date: 'Sat, 18:00', location: 'Main Square', description: 'Traditional music and dance. The graphic and ographic operators know this well, in reality...', img: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=2070&auto=format&fit=crop' },
  
  // Places/Globe
  { id: 'p1', type: 'place', name: 'City Park', category: 'Globe', rating: 4.6, area: 'North District', description: 'Beautiful green space for relaxation. The graphic and ographic operators know this well, in reality...', img: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=2070&auto=format&fit=crop' },
  { id: 'p2', type: 'place', name: 'Art Gallery', category: 'Globe', rating: 4.4, area: 'Cultural Center', description: 'Contemporary art exhibitions. The graphic and ographic operators know this well, in reality...', img: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?q=80&w=2070&auto=format&fit=crop' },
];

const categories = [
  { id: 'home', name: 'Home', icon: 'home-outline', trending: false },
  { id: 'restaurant', name: 'Restaurant', icon: 'restaurant-outline', trending: true },
  { id: 'cafe', name: 'Cafe', icon: 'cafe-outline', trending: false },
  { id: 'music', name: 'Music', icon: 'musical-notes-outline', trending: false },
  { id: 'store', name: 'Store', icon: 'storefront-outline', trending: false },
  { id: 'place', name: 'Globe', icon: 'globe-outline', trending: true },
];

// Component for category tabs
const CategoryTab = React.memo(({ category, isSelected, onPress }: {
  category: typeof categories[0];
  isSelected: boolean;
  onPress: () => void;
}) => (
  <TouchableOpacity
    style={styles.categoryTab}
    onPress={onPress}
    activeOpacity={0.7}
  >
  
    <View style={[styles.categoryIcon, isSelected && styles.categoryIconSelected]}>
      <Ionicons 
        name={category.icon as any} 
        size={25} 
        color={isSelected ? '#fff' : '#B91C1C'} 
      />
    </View>
    <Text style={[styles.categoryName, isSelected && styles.categoryNameSelected]}>
      {category.name}
    </Text>
  </TouchableOpacity>
));

// Search result card component
const SearchResultCard = React.memo(({ item }: { item: typeof allItems[0] }) => (
  <View style={styles.card}>
    <View style={styles.imageContainer}>
      <Image source={{ uri: item.img }} style={styles.cardImage} />
      <TouchableOpacity style={styles.favoriteButton}>
        <Ionicons name="heart-outline" size={20} color="#666" />
      </TouchableOpacity>
    </View>
    
    <View style={styles.cardContent}>
      <Text style={styles.cardTitle} numberOfLines={1}>{item.name}</Text>
      <Text style={styles.cardSubtitle} numberOfLines={1}>
        {item.type === 'music' ? (item as any).date : `${item.category} ${(item as any).rating ? (item as any).rating : '342'}`}
      </Text>
      <Text style={styles.cardDescription} numberOfLines={3}>
        {item.description}
      </Text>
    </View>
  </View>
));

const EmptyState = React.memo(({ searchQuery }: { searchQuery: string }) => (
  <View style={styles.emptyState}>
    <Ionicons name="search-outline" size={48} color="#D1D5DB" />
    <Text style={styles.emptyTitle}>
      {searchQuery ? 'No results found' : 'Start searching'}
    </Text>
    <Text style={styles.emptySubtitle}>
      {searchQuery 
        ? `No results found for "${searchQuery}"`
        : 'Find restaurants, cafes, music venues and places'
      }
    </Text>
  </View>
));

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('home');
  const { setColor } = useBackgroundColor();
  const insets = useSafeAreaInsets();

  React.useEffect(() => { 
    setColor('#FAFAFA'); 
  }, [setColor]);

  // Filter and search logic
  const filteredResults = useMemo(() => {
    let results = allItems;
    
    // Filter by category
    if (selectedCategory !== 'home') {
      results = results.filter(item => item.type === selectedCategory);
    }
    
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      results = results.filter(item =>
        item.name.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query) ||
        ((item as any).area && (item as any).area.toLowerCase().includes(query))
      );
    }
    
    return results;
  }, [searchQuery, selectedCategory]);

  const handleCategoryPress = useCallback((categoryId: string) => {
    setSelectedCategory(categoryId);
  }, []);

  const keyExtractor = useCallback((item: typeof allItems[0]) => item.id, []);
  const renderItem = useCallback(({ item }: { item: typeof allItems[0] }) => 
    <SearchResultCard item={item} />, []
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Search Header */}
      <View style={styles.searchHeader}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search"
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCorrect={false}
            returnKeyType="search"
          />
        </View>
      </View>

      {/* Category Tabs */}
      <View style={styles.categoryContainer}>
        <FlatList
          data={categories}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <CategoryTab
              category={item}
              isSelected={selectedCategory === item.id}
              onPress={() => handleCategoryPress(item.id)}
            />
          )}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryList}
          ItemSeparatorComponent={() => <View style={{ width: 24 }} />}
        />
      </View>

      {/* Results Grid */}
      <View style={styles.resultsContainer}>
        {filteredResults.length > 0 ? (
          <FlatList
            data={filteredResults}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            numColumns={2}
            columnWrapperStyle={styles.row}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[
              styles.resultsList,
              { paddingBottom: insets.bottom + 80 }
            ]}
          />
        ) : (
          <EmptyState searchQuery={searchQuery} />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },

  // Search Header
  searchHeader: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    backgroundColor: '#FAFAFA',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 25,
    paddingHorizontal: 16,
    height: 48,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#1A1A1A',
  },

  // Category Tabs
  categoryContainer: {
    paddingBottom: 24,
    backgroundColor: '#FAFAFA',
  },
  categoryList: {
    paddingHorizontal: 16,
  },
  categoryTab: {
    alignItems: 'center',
    position: 'relative',
  },
 
  categoryIcon: {
    width: 60,
    height: 60,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
   
  },
  categoryIconSelected: {
    backgroundColor: '#B91C1C',
    borderColor: '#B91C1C',
  },
  categoryName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
    textAlign: 'center',
  },
  categoryNameSelected: {
    color: '#1A1A1A',
    fontWeight: '600',
  },

  // Results Grid
  resultsContainer: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  resultsList: {
    paddingHorizontal: 16,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },

  // Card Design
  card: {
    width: CARD_WIDTH,
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#1A1A1A',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  imageContainer: {
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: 120,
  },
  favoriteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContent: {
    padding: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
    fontWeight: '500',
  },
  cardDescription: {
    fontSize: 12,
    color: '#9CA3AF',
    lineHeight: 16,
  },

  // Empty State
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingTop: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
});
// src/components/overlay/BaseOverlay.tsx
import React, { useEffect, useMemo, useCallback } from 'react';
import {
  BackHandler,
  Dimensions,
  FlatList,
  Modal,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  ListRenderItem,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  Extrapolate,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

interface PerformanceConfig {
  initialNumToRender?: number;
  maxToRenderPerBatch?: number;
  updateCellsBatchingPeriod?: number;
  windowSize?: number;
  removeClippedSubviews?: boolean;
  getItemLayout?: (data: any, index: number) => {length: number, offset: number, index: number};
}

interface BaseOverlayProps<T> {
  visible: boolean;
  onClose: () => void;
  title: string;
  data: T[];
  renderItem: ListRenderItem<T>;
  keyExtractor?: (item: T, index: number) => string;
  emptyState?: React.ReactElement;
  performanceConfig?: PerformanceConfig;
  backdropOpacity?: number;
  bottomBarHeight?: number;
  extraBottomInset?: number;
  itemHeight?: number; // For getItemLayout optimization
}

const Separator = React.memo(() => <View style={{ height: 12 }} />);
Separator.displayName = 'Separator';

const defaultPerformanceConfig: PerformanceConfig = {
  initialNumToRender: 8,
  maxToRenderPerBatch: 8,
  updateCellsBatchingPeriod: 16,
  windowSize: 7,
  removeClippedSubviews: true,
};

export default function BaseOverlay<T>({
  visible,
  onClose,
  title,
  data,
  renderItem,
  keyExtractor,
  emptyState,
  performanceConfig = {},
  backdropOpacity = 0.08,
  bottomBarHeight = 56,
  extraBottomInset = 0,
  itemHeight,
}: BaseOverlayProps<T>) {
  const insets = useSafeAreaInsets();

  // Merge performance config with defaults
  const perfConfig = { ...defaultPerformanceConfig, ...performanceConfig };

  // Smooth slide-in/out animation
  const tx = useSharedValue(width);

  // Mount control: keep mounted until close animation finishes
  const [mounted, setMounted] = React.useState(visible);

  // Status bar styling - set once
  useEffect(() => {
    StatusBar.setBarStyle('dark-content');
    if (Platform.OS === 'android') {
      StatusBar.setTranslucent(true);
      StatusBar.setBackgroundColor('transparent');
    }
  }, []);

  // Open/close animations + mount lifecycle
  useEffect(() => {
    if (visible) {
      if (!mounted) setMounted(true);
      // Start off-screen and slide in
      tx.value = width;
      tx.value = withTiming(0, { duration: 240 });
    } else if (mounted) {
      // Slide out then unmount
      tx.value = withTiming(width, { duration: 220 }, (finished) => {
        if (finished) runOnJS(setMounted)(false);
      });
    }
  }, [visible, mounted, tx]);

  // Handle Android hardware back ONLY while mounted
  useEffect(() => {
    if (!mounted) return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      // If overlay is open, close it and consume the back event
      if (visible) {
        onClose();
        return true;
      }
      return false;
    });
    return () => sub.remove();
  }, [mounted, visible, onClose]);


  // Animation styles
  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: tx.value }],
  }));

  const backdropStyle = useAnimatedStyle(() => {
    const opacity = interpolate(tx.value, [0, width], [backdropOpacity, 0], Extrapolate.CLAMP);
    return { opacity };
  });

  // Safe area handling - platform specific for header positioning
  const topPad = Platform.OS === 'ios' 
    ? (insets.top || 0)
    : (insets.top || 0); // Both platforms use minimal safe area padding
  // FlatList memo callbacks
  const defaultKeyExtractor = useCallback((item: any, index: number) => {
    return item?.id?.toString() || index.toString();
  }, []);

  const finalKeyExtractor = keyExtractor || defaultKeyExtractor;

  // getItemLayout optimization for stable item heights
  const getItemLayout = useMemo(() => {
    if (!itemHeight || !perfConfig.getItemLayout) return undefined;
    return perfConfig.getItemLayout || ((data: any, index: number) => ({
      length: itemHeight,
      offset: itemHeight * index,
      index,
    }));
  }, [itemHeight, perfConfig.getItemLayout]);

  // Bottom padding: ensure last item is fully visible above bottom bar
  const listContentStyle = useMemo(() => {
    const safeAreaBottom = insets.bottom || 0;
    const totalBottomPadding = safeAreaBottom + bottomBarHeight + extraBottomInset + 16; // 16px scroll buffer
    return [styles.listContent, { paddingBottom: totalBottomPadding }];
  }, [insets.bottom, bottomBarHeight, extraBottomInset]);

  // Don't render anything if not mounted
  if (!mounted) return null;

  return (
    <Modal
      visible={mounted}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
        {/* Backdrop */}
        <Animated.View
          style={[StyleSheet.absoluteFillObject, { backgroundColor: '#000' }, backdropStyle]}
        />

        {/* Slide sheet */}
        <Animated.View
          style={[
            StyleSheet.absoluteFillObject,
            { backgroundColor: '#fff' },
            sheetStyle,
          ]}
        >
          {/* Header */}
          <View style={[styles.header, { paddingTop: topPad }]}>
            <TouchableOpacity
              style={styles.backBtn}
              onPress={onClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessibilityRole="button"
              accessibilityLabel="Close overlay"
            >
              <Ionicons name="arrow-back" size={24} color="#111" />
            </TouchableOpacity>
            <Text style={styles.headerTitle} accessibilityRole="header">
              {title}
            </Text>
            <View style={{ width: 40 }} />
          </View>

          {/* Content */}
          {data.length === 0 ? (
            emptyState || (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>No items found</Text>
              </View>
            )
          ) : (
            <FlatList
              data={data}
              keyExtractor={finalKeyExtractor}
              renderItem={renderItem}
              contentContainerStyle={listContentStyle}
              ItemSeparatorComponent={Separator}
              showsVerticalScrollIndicator={false}
              initialNumToRender={perfConfig.initialNumToRender}
              maxToRenderPerBatch={perfConfig.maxToRenderPerBatch}
              updateCellsBatchingPeriod={perfConfig.updateCellsBatchingPeriod}
              windowSize={perfConfig.windowSize}
              removeClippedSubviews={perfConfig.removeClippedSubviews}
              getItemLayout={getItemLayout}
              accessibilityRole="list"
            />
          )}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ddd',
    backgroundColor: '#fff',
  },
  backBtn: { 
    width: 40, 
    height: 40, 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  headerTitle: { 
    flex: 1, 
    textAlign: 'center', 
    fontSize: 16, 
    fontWeight: '700', 
    color: '#111' 
  },
  listContent: { 
    paddingHorizontal: 16, 
    paddingVertical: 12, 
    alignItems: 'center' 
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});
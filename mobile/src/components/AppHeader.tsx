// src/components/AppHeader.tsx
import * as React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Platform,
  PixelRatio,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const IOS = Platform.OS === 'ios';
const FS = PixelRatio.getFontScale();

const SIZES = {
  AVATAR: IOS ? 44 : 48,
  ICON: 28,
  HELLO: (IOS ? 16 : 27) / FS,
  GREETING: (IOS ? 12 : 13) / FS,
};

type HeaderAction = {
  icon: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
  badgeCount?: number;
  color?: string;
  size?: number;
};

type Props = {
  name?: string;
  greeting?: string;
  avatarUri?: string;
  onPressAvatar?: () => void;
  actions?: HeaderAction[];
  compact?: boolean;
  bottomSpacing?: number; // space under header
  backgroundColor?: string; // header bg, default white
  statusBarStyle?: 'light-content' | 'dark-content';
  translucentStatusBar?: boolean; // default true
};

function calcGreeting(now = new Date()) {
  const h = now.getHours();
  if (h < 12) return 'Good Morning';
  if (h < 18) return 'Good Afternoon';
  return 'Good Evening';
}

export default function AppHeader({
  name = 'Guest',
  greeting,
  avatarUri = 'https://i.pravatar.cc/120?img=12',
  onPressAvatar,
  actions = [{ icon: 'heart-outline' }, { icon: 'notifications-outline' }],
  compact = false,
  bottomSpacing = 0,
  backgroundColor = '#fff',
  statusBarStyle = 'dark-content',
  translucentStatusBar = true,
}: Props) {
  const greet = greeting ?? calcGreeting();
  const insets = useSafeAreaInsets();
  const CUTOUT_THRESHOLD = 35;     // ~S24 Ultra top inset (tweak if needed)
  const REGULAR_SUBTRACT = 15;     // your original value
  const BIG_CUTOUT_SUBTRACT = 35;  // keep a bit more space for big cutouts
  
  const rawTop = insets.top || StatusBar.currentHeight || 0;
  const topPad = Platform.OS === 'android'
    ? Math.max(0, rawTop - (rawTop > CUTOUT_THRESHOLD ? BIG_CUTOUT_SUBTRACT : REGULAR_SUBTRACT))
    : insets.top;
  
  // Make the OS status bar translucent so the header can paint behind it.
  // Our paddingTop=insets.top ensures content is never overlapped.
  React.useEffect(() => {
    StatusBar.setBarStyle(statusBarStyle);
    if (translucentStatusBar) {
      if (Platform.OS === 'android') {
        StatusBar.setTranslucent(true);
        StatusBar.setBackgroundColor('transparent');
      }
    } 
    else {
      if (Platform.OS === 'android') {
        StatusBar.setTranslucent(true);
        StatusBar.setBackgroundColor('transparent'); 
      }
    }
  }, [statusBarStyle, translucentStatusBar]);

  return (
    <View style={[styles.safe, { backgroundColor, paddingTop: topPad }]}>
      <View style={[styles.row, compact && styles.rowCompact, { marginBottom: bottomSpacing }]}>
        <TouchableOpacity onPress={onPressAvatar} style={styles.left} activeOpacity={0.8}>
          <Image source={{ uri: avatarUri }} style={[styles.avatar, compact && styles.avatarCompact]} />
          <View>
            <Text style={[styles.hello, compact && styles.helloCompact]}>Hello, {name}</Text>
            <Text style={[styles.greeting, compact && styles.greetingCompact]}>{greet}</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.right}>
          {actions.map((a, i) => (
            <TouchableOpacity
              key={`${a.icon}-${i}`}
              onPress={a.onPress}
              style={styles.iconBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              activeOpacity={0.8}
            >
              <Ionicons name={a.icon} size={a.size ?? SIZES.ICON} color={a.color ?? '#222'} />
              {!!a.badgeCount && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{a.badgeCount > 99 ? '99+' : a.badgeCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    // backgroundColor provided via prop, paddingTop via insets.top
  },
  row: {
    paddingHorizontal: 16,
    paddingBottom: 8, // small breathing room below content
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowCompact: { paddingHorizontal: 12, paddingBottom: 4 },

  left: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: SIZES.AVATAR, height: SIZES.AVATAR, borderRadius: SIZES.AVATAR / 2, marginRight: 12 },
  avatarCompact: { width: SIZES.AVATAR, height: SIZES.AVATAR, borderRadius: SIZES.AVATAR / 2, marginRight: 10 },

  hello: { fontSize: 16, fontWeight: '700', color: '#111' },
  helloCompact: { fontSize: 15 },
  greeting: { fontSize: 12, color: '#666', marginTop: 2 },
  greetingCompact: { fontSize: 11 },

  right: { flexDirection: 'row', alignItems: 'center' },
  iconBtn: { marginLeft: 14, position: 'relative' },
  badge: {
    position: 'absolute',
    right: -6,
    top: -6,
    minWidth: 16,
    height: 16,
    paddingHorizontal: 4,
    borderRadius: 8,
    backgroundColor: '#ef4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
});
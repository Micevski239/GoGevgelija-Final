import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Animated, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CurvedBottomBarExpo } from 'react-native-curved-bottom-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBackgroundColor } from '../contexts/BackgroundContext';
import SearchScreen from '../screens/main/SearchScreen';

const Navigator: any = CurvedBottomBarExpo.Navigator;
const Screen: any = CurvedBottomBarExpo.Screen;

const CIRCLE = 56;
const BASE_BAR = 56;
const ANDROID_LIFT = 9;

const BAR_BG = 'white';
const IOS_BAR_DROP = 18;

function SafeAreaBackground() {
  const insets = useSafeAreaInsets();
  const { color } = useBackgroundColor();
  if (insets.bottom === 0) return null;
  return (
    <View
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: insets.bottom,
        backgroundColor: color,
        zIndex: 999,
      }}
    />
  );
}

function Center({ label }: { label: string }) {
  return (
    <View style={styles.center}>
      <Text style={styles.centerText}>{label}</Text>
    </View>
  );
}

function Saved() { return <Center label="🔖 Saved" />; }
function Profile() { return <Center label="👤 Profile" />; }

type TabName = 'home' | 'search' | 'saved' | 'profile';
const iconFor: Record<TabName, keyof typeof Ionicons.glyphMap> = {
  home: 'home-outline',
  search: 'search-outline',
  saved: 'bookmark-outline',
  profile: 'person-outline',
};

interface BottomNavigationProps {
  HomeComponent: React.ComponentType;
}

export default function BottomNavigation({ HomeComponent }: BottomNavigationProps) {
  const { color } = useBackgroundColor();
  const insets = useSafeAreaInsets();
  const fabBottomBase = Platform.select({ ios: 28, android: 28, default: 18 });

  return (
    <View style={[styles.root, { backgroundColor: BAR_BG }]}>
      <View
        style={[
          styles.container,
          { position: 'relative', overflow: 'visible' },
          Platform.OS === 'android' && { marginBottom: ANDROID_LIFT },
        ]}
      >
        <Navigator
          type="DOWN"
          initialRouteName="home"
          circleWidth={CIRCLE}
          height={BASE_BAR}
          bgColor={BAR_BG}
          borderTopLeftRight={false}
          shadowStyle={styles.barShadow}
          screenOptions={{ headerShown: false }}
          borderColor="#E5E7EB"
          borderWidth={1}
          style={Platform.OS === 'ios' ? { bottom: IOS_BAR_DROP } : undefined}
          renderCircle={() => (
            <Animated.View
              style={[
                styles.fab,
                { bottom: fabBottomBase, width: CIRCLE, height: CIRCLE, borderRadius: CIRCLE / 2 },
              ]}
            >
              <TouchableOpacity style={styles.fabBtn} activeOpacity={0.8}>
                <MaterialIcons name='auto-awesome' size={30} color={"#fff"}/>
              </TouchableOpacity>
            </Animated.View>
          )}
          tabBar={(props: any) => (
            <TouchableOpacity
              onPress={() => props.navigate(props.routeName)}
              style={styles.tabItem}
              activeOpacity={0.8}
            >
              <Ionicons
                name={iconFor[props.routeName as TabName]}
                size={24}
                color={props.routeName === props.selectedTab ? 'black' : 'gray'}
              />
            </TouchableOpacity>
          )}
        >
          <Screen name="home" position="LEFT" component={HomeComponent} />
          <Screen name="search" position="LEFT" component={SearchScreen} />
          <Screen name="saved" position="RIGHT" component={Saved} />
          <Screen name="profile" position="RIGHT" component={Profile} />
        </Navigator>

        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: Platform.OS === 'ios' ? -IOS_BAR_DROP : 0,
            height: Platform.select({ ios: 8, android: 5 , default: 8 }),
            backgroundColor: BAR_BG,
          }}
        />
      </View>
      <SafeAreaBackground />

      {Platform.OS === 'android' && (
        <View style={{ height: ANDROID_LIFT, backgroundColor: BAR_BG }} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BAR_BG },
  container: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  centerText: { fontSize: 18, fontWeight: '700' },
  tabItem: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  barShadow: {},

  fabContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fab: {
    width: CIRCLE,
    height: CIRCLE,
    borderRadius: CIRCLE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#B91C1C',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 1,
  },
  fabBtn: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
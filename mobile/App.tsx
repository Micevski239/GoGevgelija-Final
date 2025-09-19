// App.tsx
import "react-native-gesture-handler";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useEffect, useState, createContext, useContext } from "react";
import { View, Text, TextInput, Button, FlatList, Alert } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { api } from "./src/api/client";
import { loadTokens, saveTokens, getRefresh } from "./src/auth/tokens";
import { BackgroundProvider } from "./src/contexts/BackgroundContext";
import BottomNavigation from "./src/components/BottomNavigation";
import HomeScreen from "./src/screens/HomeScreen";

type RootStackParamList = { Home: undefined; Login: undefined };
const Stack = createNativeStackNavigator<RootStackParamList>();

type AuthState = { authed: boolean; loading: boolean };
type Ctx = {
  state: AuthState;
  signIn: (u: string, p: string) => Promise<void>;
  signOut: () => Promise<void>;
  signUp: (u: string, e: string | undefined, p: string) => Promise<void>;
};
const AuthCtx = createContext<Ctx>({
  state: { authed: false, loading: true },
  signIn: async () => {},
  signOut: async () => {},
  signUp: async () => {},
});
const useAuth = () => useContext(AuthCtx);

function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, set] = useState<AuthState>({ authed: false, loading: true });

  useEffect(() => {
    (async () => {
      await loadTokens();
      set({ authed: !!getRefresh(), loading: false });
    })();
  }, []);

  const signIn = async (username: string, password: string) => {
    const { data } = await api.post("/api/token/", { username, password });
    await saveTokens(data.access, data.refresh);
    set({ authed: true, loading: false });
  };

  const signUp = async (username: string, email: string | undefined, password: string) => {
    const { data } = await api.post("/api/auth/register/", { username, email, password });
    await saveTokens(data.access, data.refresh);
    set({ authed: true, loading: false });
  };

  const signOut = async () => {
    await saveTokens(undefined, undefined);
    set({ authed: false, loading: false });
  };

  return <AuthCtx.Provider value={{ state, signIn, signOut, signUp }}>{children}</AuthCtx.Provider>;
}

/** ---------- FIX: schema + types align ---------- **/
const schema = z
  .object({
    username: z.string().min(3, "min 3 chars"),
    // accept "" or valid email; keep input type as string|undefined for RHF
    email: z.string().email("invalid email").optional().or(z.literal("")),
    password: z.string().min(8, "min 8 chars"),
  })
  // normalize "" → undefined for the value you send to API
  .transform(({ email, ...rest }) => ({
    ...rest,
    email: email && email.trim() !== "" ? email : undefined,
  }));

// Use the SCHEMA INPUT for RHF types, not output.
type FormValues = z.input<typeof schema>;
/** ---------------------------------------------- **/

function LoginScreen() {
  const { signIn, signUp } = useAuth();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { username: "", email: "", password: "" },
  });

  const onLogin = async ({ username, password }: Pick<FormValues, "username" | "password">) => {
    try {
      await signIn(username, password);
    } catch (e: any) {
      const msg = e?.response?.data?.detail || e?.message || "Login failed";
      Alert.alert("Error", String(msg));
    }
  };

  const onRegister = async (raw: FormValues) => {
    try {
      // Get normalized output to pass to API
      const parsed = schema.parse(raw);
      await signUp(parsed.username, parsed.email, parsed.password);
      Alert.alert("Registered", parsed.username);
    } catch (e: any) {
      const body = e?.response?.data;
      const msg =
        (body && typeof body === "object" ? JSON.stringify(body) : body) ||
        e?.message ||
        "Register failed";
      Alert.alert("Error", String(msg));
    }
  };

  return (
    <View style={{ flex: 1, padding: 16, gap: 12, justifyContent: "center" }}>
      <Controller
        name="username"
        control={control}
        render={({ field: { onChange, value } }) => (
          <TextInput
            placeholder="username"
            value={value ?? ""}
            onChangeText={onChange}
            autoCapitalize="none"
            style={{ borderWidth: 1, padding: 10 }}
          />
        )}
      />
      {errors.username && <Text style={{ color: "red" }}>{String(errors.username.message)}</Text>}

      <Controller
        name="email"
        control={control}
        render={({ field: { onChange, value } }) => (
          <TextInput
            placeholder="email (optional)"
            value={value ?? ""}
            onChangeText={onChange}
            autoCapitalize="none"
            keyboardType="email-address"
            style={{ borderWidth: 1, padding: 10 }}
          />
        )}
      />
      {errors.email && <Text style={{ color: "red" }}>{String(errors.email.message)}</Text>}

      <Controller
        name="password"
        control={control}
        render={({ field: { onChange, value } }) => (
          <TextInput
            placeholder="password"
            value={value ?? ""}
            onChangeText={onChange}
            secureTextEntry
            style={{ borderWidth: 1, padding: 10 }}
          />
        )}
      />
      {errors.password && <Text style={{ color: "red" }}>{String(errors.password.message)}</Text>}

      <Button title={isSubmitting ? "Working..." : "Login"} onPress={handleSubmit(onLogin)} disabled={isSubmitting} />
      <Button title={isSubmitting ? "Working..." : "Register"} onPress={handleSubmit(onRegister)} disabled={isSubmitting} />
    </View>
  );
}

function HomeScreenWrapper() {
  const { signOut } = useAuth();
  return <HomeScreen signOut={signOut} />;
}

function Nav() {
  const { state } = useAuth();
  if (state.loading)
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text>Loading…</Text>
      </View>
    );
  return (
    <NavigationContainer>
      <Stack.Navigator>
        {state.authed ? (
          <Stack.Screen 
            name="Home" 
            component={() => <BottomNavigation HomeComponent={HomeScreenWrapper} />}
            options={{ headerShown: false }}
          />
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <BackgroundProvider>
          <AuthProvider>
            <Nav />
          </AuthProvider>
        </BackgroundProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

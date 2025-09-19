import { ConfigContext, ExpoConfig } from "@expo/config"

export default ({ config }: ConfigContext): ExpoConfig => ({
    ...config,
    name: "GoGevgelija",
    slug: "gogevgelija",
    extra: {
        API_URL: process.env.EXPO_PUBLIC_API_URL ?? "https://127.0.0.1:8000",
    },
});
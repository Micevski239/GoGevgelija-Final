import * as SecureStore from "expo-secure-store";

let mem: {access?: string; refresh?: string} = {};

export async function loadTokens() {
  const [access, refresh] = await Promise.all([
    SecureStore.getItemAsync("access"),
    SecureStore.getItemAsync("refresh"),
  ]);
  mem = { access: access ?? undefined, refresh: refresh ?? undefined };
  return mem;
}
export async function saveTokens(access?: string, refresh?: string) {
  mem = { access, refresh };
  if (access) await SecureStore.setItemAsync("access", access); else await SecureStore.deleteItemAsync("access");
  if (refresh) await SecureStore.setItemAsync("refresh", refresh); else await SecureStore.deleteItemAsync("refresh");
}
export const getAccess = () => mem.access;
export const getRefresh = () => mem.refresh;

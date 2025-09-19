import React, { createContext, useState, useContext, useMemo } from 'react';

type Ctx = { color: string; setColor: (c: string) => void };
const C = createContext<Ctx | null>(null);

export function BackgroundProvider({ children }: {children:React.ReactNode}) {
    const [color, setColor] = useState('#ffffff');
    const value = useMemo(() => ({ color, setColor }), [color]);
    return <C.Provider value={value}>{children}</C.Provider>
}

export function useBackgroundColor() {
    const ctx = useContext(C);
    if (!ctx) throw new Error('useBackgroundColor must be used within BackgroundProvider');
    return ctx;
}
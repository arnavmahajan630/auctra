'use client';

import { PrivyProvider } from '@privy-io/react-auth';
import { ReactNode } from 'react';

export default function Providers({ children }: { children: ReactNode }) {
  // If no App ID is provided in dev, we could warn, but it's required for Privy.
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID || '';

  return (
    <PrivyProvider
      appId={appId}
      config={{
        // Customize Privy's appearance to match the dark theme
        appearance: {
          theme: 'dark',
          accentColor: '#4f46e5', // indigo-600
          logo: 'https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?w=128&h=128&fit=crop', // optional placeholder logo
        },
        // We want email, wallet, and google
        loginMethods: ['email', 'wallet', 'google'],
      }}
    >
      {children}
    </PrivyProvider>
  );
}

import type { CapacitorConfig } from '@capacitor/cli';

const apiHost = process.env.CAPACITOR_SERVER_URL;

const config: CapacitorConfig = {
  appId: 'com.gifts.couple.connection',
  appName: 'GIFTS',
  webDir: 'dist',
  bundledWebRuntime: false,
  server: apiHost
    ? {
        url: apiHost,
        cleartext: false,
      }
    : undefined,
  android: {
    allowMixedContent: false,
  },
};

export default config;

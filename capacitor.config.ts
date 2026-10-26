import type { CapacitorConfig } from '@capacitor/cli';

// Forked from designfuchen/word-atlas (MIT + CC BY 4.0).
// AppId must differ from any official package name to avoid signature clash.
const config: CapacitorConfig = {
  appId: 'com.xueweijian.wordatlas',
  appName: '词光',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
  android: {
    allowMixedContent: false,
  },
};

export default config;

/**
 * Toastify Lite example (bare React Native, no Expo).
 * An iOS-settings style list; every row fires a toast. Each section lives in
 * src/examples so you can copy the snippet you need.
 *
 * The header has a Light/Dark app toggle. Because the toast contrasts with the
 * app theme, a dark app shows white toasts and a light app shows dark toasts.
 */
import { useMemo, useState } from 'react';
import { Platform, Pressable, ScrollView, StatusBar, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { toast, ToastMode, ToastProvider } from 'react-native-toastify-lite';
import { type DemoItem, type DemoSection, MORPH_SECTIONS, STACK_SECTIONS } from './src/examples';
import { icons } from './src/icons';

const ROW_HEIGHT = 60;

type AppTheme = 'light' | 'dark';

const palettes = {
  light: {
    bg: '#F2F2F7',
    card: '#FFFFFF',
    title: '#000000',
    sub: '#6D6D72',
    desc: '#8E8E93',
    separator: '#C6C6C8',
    pressed: '#E5E5EA',
    control: 'rgba(118,118,128,0.12)',
    controlOn: '#FFFFFF',
    controlText: '#000000',
    chevron: '#C7C7CC',
    statusBar: 'dark-content' as const,
  },
  dark: {
    bg: '#000000',
    card: '#1C1C1E',
    title: '#FFFFFF',
    sub: '#8E8E93',
    desc: '#8E8E93',
    separator: '#38383A',
    pressed: '#2C2C2E',
    control: 'rgba(120,120,128,0.24)',
    controlOn: '#2C2C2E',
    controlText: '#FFFFFF',
    chevron: '#48484A',
    statusBar: 'light-content' as const,
  },
};

type Palette = (typeof palettes)[AppTheme];

function Row({ item, isLast, palette }: { item: DemoItem; isLast: boolean; palette: Palette }) {
  const Icon = icons[item.icon];
  return (
    <Pressable
      onPress={item.onPress}
      style={({ pressed }) => [s.row, pressed && { backgroundColor: palette.pressed }]}
    >
      <View style={[s.iconTile, { backgroundColor: item.tint }]}>
        <Icon size={17} />
      </View>
      <View style={s.rowText}>
        <Text style={[s.rowTitle, { color: palette.title }]} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={[s.rowDescription, { color: palette.desc }]} numberOfLines={1}>
          {item.description}
        </Text>
      </View>
      {icons.chevron({ color: palette.chevron, size: 16 })}
      {!isLast && <View style={[s.separator, { backgroundColor: palette.separator }]} />}
    </Pressable>
  );
}

function Screen({
  mode,
  setMode,
  theme,
  setTheme,
}: {
  mode: ToastMode;
  setMode: (m: ToastMode) => void;
  theme: AppTheme;
  setTheme: (t: AppTheme) => void;
}) {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const palette = palettes[theme];
  const base: DemoSection[] = mode === ToastMode.Morph ? MORPH_SECTIONS : STACK_SECTIONS;

  const sections = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return base;
    return base
      .map(sec => ({
        ...sec,
        items: sec.items.filter(i => i.title.toLowerCase().includes(q) || i.description.toLowerCase().includes(q)),
      }))
      .filter(sec => sec.items.length > 0);
  }, [query, base]);

  return (
    <ScrollView
      style={[s.scroll, { backgroundColor: palette.bg }]}
      contentContainerStyle={{ paddingTop: insets.top + 8, paddingBottom: insets.bottom + 32 }}
      showsVerticalScrollIndicator={false}
      keyboardDismissMode="on-drag"
      keyboardShouldPersistTaps="handled"
    >
      <Text style={[s.largeTitle, { color: palette.title }]}>Toastify Lite</Text>

      <View style={[s.search, { backgroundColor: palette.control }]}>
        {icons.search({ color: palette.desc, size: 16 })}
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search"
          placeholderTextColor={palette.desc}
          style={[s.searchInput, { color: palette.title }]}
          returnKeyType="search"
        />
      </View>

      <View style={[s.segment, { backgroundColor: palette.control }]}>
        {[ToastMode.Morph, ToastMode.Stack].map(m => (
          <Pressable
            key={m}
            accessibilityRole="button"
            accessibilityState={{ selected: mode === m }}
            onPress={() => {
              toast.dismissAll();
              setMode(m);
            }}
            style={[s.segmentItem, mode === m && [s.segmentItemOn, { backgroundColor: palette.controlOn }]]}
          >
            <Text style={[s.segmentText, { color: palette.controlText }, mode === m && s.segmentTextOn]}>
              {m === ToastMode.Morph ? 'Morph' : 'Stack'}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={[s.segment, { backgroundColor: palette.control }]}>
        {(['light', 'dark'] as const).map(t => (
          <Pressable
            key={t}
            accessibilityRole="button"
            accessibilityState={{ selected: theme === t }}
            onPress={() => {
              toast.dismissAll();
              setTheme(t);
            }}
            style={[s.segmentItem, theme === t && [s.segmentItemOn, { backgroundColor: palette.controlOn }]]}
          >
            <Text style={[s.segmentText, { color: palette.controlText }, theme === t && s.segmentTextOn]}>
              {t === 'light' ? 'Light app' : 'Dark app'}
            </Text>
          </Pressable>
        ))}
      </View>
      <Text style={[s.themeHint, { color: palette.sub }]}>
        Dark app → white toast · Light app → dark toast
      </Text>

      {sections.map(section => (
        <View key={section.title} style={s.section}>
          <Text style={[s.sectionHeader, { color: palette.sub }]}>{section.title.toUpperCase()}</Text>
          <View style={[s.card, { backgroundColor: palette.card }]}>
            {section.items.map((item, i) => (
              <Row key={item.title} item={item} isLast={i === section.items.length - 1} palette={palette} />
            ))}
          </View>
          {section.footer ? <Text style={[s.sectionFooter, { color: palette.sub }]}>{section.footer}</Text> : null}
        </View>
      ))}
      {sections.length === 0 ? <Text style={[s.emptyText, { color: palette.desc }]}>No matching toasts.</Text> : null}
    </ScrollView>
  );
}

export default function App() {
  const [mode, setMode] = useState<ToastMode>(ToastMode.Morph);
  const [theme, setTheme] = useState<AppTheme>('light');
  return (
    <SafeAreaProvider>
      <StatusBar barStyle={palettes[theme].statusBar} />
      <ToastProvider mode={mode} theme={theme}>
        <Screen mode={mode} setMode={setMode} theme={theme} setTheme={setTheme} />
      </ToastProvider>
    </SafeAreaProvider>
  );
}

const s = StyleSheet.create({
  scroll: { flex: 1 },
  largeTitle: { fontSize: 34, fontWeight: '700', letterSpacing: 0.4, marginHorizontal: 16, marginTop: 44 },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginHorizontal: 16,
    marginTop: 10,
    paddingHorizontal: 8,
    height: 36,
    borderRadius: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 17,
    paddingVertical: 0,
    ...(Platform.OS === 'web' ? ({ outlineStyle: 'none' } as object) : {}),
  },
  segment: { flexDirection: 'row', marginHorizontal: 16, marginTop: 14, padding: 2, borderRadius: 9 },
  segmentItem: { flex: 1, height: 28, borderRadius: 7, alignItems: 'center', justifyContent: 'center' },
  segmentItemOn: {
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  segmentText: { fontSize: 13, fontWeight: '500' },
  segmentTextOn: { fontWeight: '600' },
  themeHint: { fontSize: 12, marginTop: 6, marginHorizontal: 20, textAlign: 'center' },
  section: { marginTop: 24, paddingHorizontal: 16 },
  sectionHeader: { fontSize: 13, fontWeight: '500', letterSpacing: 0.4, marginBottom: 8, marginLeft: 16 },
  sectionFooter: { fontSize: 13, marginTop: 8, marginHorizontal: 16, lineHeight: 18 },
  card: { overflow: 'hidden', borderRadius: 28, borderCurve: 'continuous' },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 16, height: ROW_HEIGHT },
  iconTile: { width: 30, height: 30, borderRadius: 8, borderCurve: 'continuous', marginRight: 14, alignItems: 'center', justifyContent: 'center' },
  rowText: { flex: 1, justifyContent: 'center' },
  rowTitle: { fontSize: 17, marginBottom: 2 },
  rowDescription: { fontSize: 13 },
  separator: { position: 'absolute', left: 60, right: 0, bottom: 0, height: StyleSheet.hairlineWidth },
  emptyText: { fontSize: 15, marginHorizontal: 32, marginTop: 24 },
});

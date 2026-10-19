/**
 * 04 · Custom
 *
 *   toast.custom(<Body />, { headerContent: <Header />, fill, stroke })
 *   toast.success("…", { fill: "#fff", styles: { description: { color } } })
 *   toast.info("…", { icon: <MyIcon /> })
 *
 * Any React Native view works as header or body. `styles` overrides any part
 * of the toast.
 */
import { StyleSheet, Text, View } from 'react-native';
import { toast } from 'react-native-toastify-lite';
import { icons } from '../icons';
import type { DemoSection } from './types';

export const custom: DemoSection = {
  title: 'Custom',
  footer: 'Override header, body, icon, fill, stroke and styles per toast.',
  gif: 'custom.gif',
  items: [
    {
      title: 'Earbuds Pro',
      description: 'Custom header and body content.',
      icon: 'headphones',
      tint: '#111214',
      onPress: () =>
        toast.custom(
          <View style={s.body}>
            <Text style={s.bodyText}>Spatial audio is ready. Your Earbuds Pro are connected.</Text>
          </View>,
          {
            headerContent: (
              <View style={s.header}>
                <View style={s.badge}>{icons.headphones({ size: 16 })}</View>
                <View>
                  <Text style={s.title}>Earbuds Pro</Text>
                  <Text style={s.meta}>Connected</Text>
                </View>
              </View>
            ),
            title: 'Earbuds Pro',
            fill: '#111214',
            stroke: 'rgba(255,255,255,0.12)',
            showProgress: false,
          },
        ),
    },
    {
      title: 'Light fill',
      description: 'White card with dark text.',
      icon: 'sun',
      tint: '#FFCC00',
      onPress: () =>
        toast.success('Light toast', {
          description: 'Your changes are synced across every device.',
          action: { label: 'View', onPress: () => toast.success('Opened') },
          showProgress: false,
          fill: '#FFFFFF',
          stroke: 'rgba(0,0,0,0.08)',
          styles: { description: { color: 'rgba(0,0,0,0.72)' }, meta: { color: 'rgba(0,0,0,0.42)' } },
        }),
    },
    {
      title: 'Custom icon',
      description: 'Any element in the badge.',
      icon: 'sparkles',
      tint: '#AF52DE',
      onPress: () =>
        toast.info('Deployment started', {
          icon: icons.rocket({ color: '#60a5fa', size: 14 }),
          description: 'Your app is being deployed to production.',
        }),
    },
    {
      title: 'Dismiss all',
      description: 'Clear every toast on screen.',
      icon: 'trash',
      tint: '#8E8E93',
      onPress: () => toast.dismissAll(),
    },
  ],
};

const s = StyleSheet.create({
  header: { height: 40, minWidth: 190, flexDirection: 'row', alignItems: 'center', gap: 10 },
  badge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { color: '#FFFFFF', fontSize: 13, fontWeight: '700', lineHeight: 16 },
  meta: { color: 'rgba(255,255,255,0.58)', fontSize: 11, fontWeight: '500', lineHeight: 13 },
  body: { justifyContent: 'center', alignItems: 'center', top: 5 },
  bodyText: { color: 'rgba(255,255,255,0.74)', fontSize: 13, lineHeight: 18, textAlign: 'center' },
});

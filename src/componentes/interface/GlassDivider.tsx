import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, ViewStyle } from 'react-native';

type GlassDividerProps = {
  style?: ViewStyle | ViewStyle[];
};

export function GlassDivider({ style }: GlassDividerProps) {
  return (
    <LinearGradient
      colors={['rgba(255,255,255,0)', 'rgba(17,24,39,0.10)', 'rgba(255,255,255,0)']}
      start={{ x: 0, y: 0.5 }}
      end={{ x: 1, y: 0.5 }}
      style={[styles.divider, style]}
    />
  );
}

const styles = StyleSheet.create({
  divider: {
    height: 1,
    width: '100%',
  },
});


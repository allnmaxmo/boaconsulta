import { PropsWithChildren } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';

type VisualLayerProps = PropsWithChildren<{
  style?: ViewStyle | ViewStyle[];
}>;

export function VisualLayer({ children, style }: VisualLayerProps) {
  return <View pointerEvents="none" style={[styles.layer, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  layer: {
    ...StyleSheet.absoluteFillObject,
  },
});


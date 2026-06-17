import { PropsWithChildren } from 'react';
import { Pressable, PressableProps, StyleProp, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { movimento } from '@/src/constantes/movimento';

const PressableAnimado = Animated.createAnimatedComponent(Pressable);

type MotionPressableProps = PropsWithChildren<
  PressableProps & {
    style?: StyleProp<ViewStyle>;
    scaleTo?: number;
  }
>;

export function MotionPressable({
  children,
  style,
  scaleTo = movimento.escala.pressable,
  onPressIn,
  onPressOut,
  ...props
}: MotionPressableProps) {
  const escala = useSharedValue(1);
  const estiloAnimado = useAnimatedStyle(() => ({
    transform: [
      {
        scale: withSpring(escala.value, {
          damping: movimento.molas.toqueDamping,
          stiffness: movimento.molas.toqueStiffness,
        }),
      },
    ],
  }));

  return (
    <PressableAnimado
      {...props}
      onPressIn={(event) => {
        escala.value = scaleTo;
        onPressIn?.(event);
      }}
      onPressOut={(event) => {
        escala.value = 1;
        onPressOut?.(event);
      }}
      style={[estiloAnimado, style]}>
      {children}
    </PressableAnimado>
  );
}

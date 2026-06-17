import { Text, TextProps } from 'react-native';

type GradientTextProps = TextProps;

export function GradientText({ style, children, ...props }: GradientTextProps) {
  return <Text {...props} style={style}>{children}</Text>;
}

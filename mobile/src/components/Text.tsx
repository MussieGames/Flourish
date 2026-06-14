import { Text as RNText, type TextProps, type TextStyle } from 'react-native';
import { colors, fonts } from '@/theme';

type Variant =
  | 'display'
  | 'displayItalic'
  | 'title'
  | 'titleItalic'
  | 'body'
  | 'bodyLight'
  | 'bodyMedium'
  | 'serifItalic'
  | 'label'
  | 'caption';

interface Props extends TextProps {
  variant?: Variant;
  color?: string;
  center?: boolean;
}

const VARIANT_STYLES: Record<Variant, TextStyle> = {
  display: { fontFamily: fonts.display, fontSize: 36, lineHeight: 40, color: colors.ink },
  displayItalic: { fontFamily: fonts.displayItalic, fontSize: 36, lineHeight: 40, color: colors.ink },
  title: { fontFamily: fonts.display, fontSize: 26, lineHeight: 30, color: colors.ink },
  titleItalic: { fontFamily: fonts.displayItalic, fontSize: 26, lineHeight: 30, color: colors.ink },
  body: { fontFamily: fonts.body, fontSize: 14, lineHeight: 22, color: colors.inkLight },
  bodyLight: { fontFamily: fonts.bodyLight, fontSize: 14, lineHeight: 24, color: colors.inkLight },
  bodyMedium: { fontFamily: fonts.bodyMedium, fontSize: 14, lineHeight: 20, color: colors.ink },
  serifItalic: { fontFamily: fonts.serifItalic, fontSize: 15, lineHeight: 26, color: colors.inkLight },
  label: {
    fontFamily: fonts.bodyMedium,
    fontSize: 10,
    letterSpacing: 1.8,
    textTransform: 'uppercase',
    color: colors.sienna,
  },
  caption: { fontFamily: fonts.body, fontSize: 12, lineHeight: 18, color: colors.inkMuted },
};

export function AppText({ variant = 'body', color, center, style, ...rest }: Props) {
  return (
    <RNText
      style={[
        VARIANT_STYLES[variant],
        color ? { color } : null,
        center ? { textAlign: 'center' } : null,
        style,
      ]}
      {...rest}
    />
  );
}

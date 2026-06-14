import { useState } from 'react';
import {
  StyleSheet,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';
import { colors, fonts, radius } from '@/theme';
import { AppText } from './Text';

interface Props extends TextInputProps {
  icon?: string;
  serif?: boolean;
  error?: string | null;
}

export function TextField({ icon, serif, error, style, ...rest }: Props) {
  const [focused, setFocused] = useState(false);

  return (
    <View>
      <View
        style={[
          styles.wrap,
          focused && styles.focused,
          error ? styles.errored : null,
        ]}
      >
        {icon ? <AppText style={styles.icon}>{icon}</AppText> : null}
        <TextInput
          placeholderTextColor={colors.inkMuted}
          style={[
            styles.input,
            serif ? styles.serif : styles.sans,
            style,
          ]}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...rest}
        />
      </View>
      {error ? (
        <AppText variant="caption" color={colors.danger} style={styles.errorText}>
          {error}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warm,
    borderWidth: 1.5,
    borderColor: 'rgba(196,169,160,0.35)',
    borderRadius: radius.sm,
    paddingHorizontal: 16,
  },
  focused: { borderColor: colors.sienna },
  errored: { borderColor: colors.danger },
  icon: { fontSize: 18, marginRight: 8 },
  input: { flex: 1, paddingVertical: 16, color: colors.ink },
  serif: { fontFamily: fonts.displayItalic, fontSize: 20 },
  sans: { fontFamily: fonts.body, fontSize: 15 },
  errorText: { marginTop: 6 },
});

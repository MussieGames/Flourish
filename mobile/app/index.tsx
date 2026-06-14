import { View } from 'react-native';
import { colors } from '@/theme';

/**
 * Entry route. The navigation guard in the root layout redirects to the right
 * place (welcome / onboarding / tabs) once auth + data have resolved, so this
 * just renders a calm background to avoid a flash.
 */
export default function Index() {
  return <View style={{ flex: 1, backgroundColor: colors.ink }} />;
}

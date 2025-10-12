import { StyleSheet } from 'react-native';
import { Text } from '../Base/Text';

export const ErrorDisplay = () => (
  <>
    <Text style={styles.title}>Wystąpił problem!</Text>
    <Text style={styles.subtitle}>
      Spróbuj ponownie za chwilę.
    </Text>
    <Text style={styles.subtitle}>
      Pracujemy nad rozwiązaniem problemu!
    </Text>
  </>
)

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { Icon } from 'react-native-paper';
import { theme } from 'utils/theme';

interface FilterButtonProps {
  onClick: () => void;
  active?: boolean;
  label?: string;
}

export const FilterButton = ({ onClick, active = true, label }: FilterButtonProps) => {
  return (
    <TouchableOpacity
      onPress={onClick}
      accessibilityLabel={label}
      style={[styles.button, active ? styles.active : styles.inactive]}>
      <View style={styles.iconContainer}>
        <Icon source="filter-variant" size={28} color={active ? '#fff' : theme.palette.primary} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    bottom: 120,
    left: 24,
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  active: {
    backgroundColor: theme.palette.primary,
  },
  inactive: {
    backgroundColor: theme.palette.text.primaryInverse,
    borderWidth: 1,
    borderColor: theme.palette.primary,
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

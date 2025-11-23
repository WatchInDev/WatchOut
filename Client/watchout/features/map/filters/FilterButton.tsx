import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { Icon } from 'react-native-paper';
import { theme } from 'utils/theme';

interface FilterButtonProps {
  onClick: () => void;
  isDirty: boolean;
  label?: string;
}

export const FilterButton = ({ onClick, isDirty, label }: FilterButtonProps) => {
  return (
    <TouchableOpacity
      onPress={onClick}
      accessibilityLabel={label}
      style={[styles.button]}>
      {isDirty && (
        <View style={styles.badge}>
          <Icon source="cog" size={20} color={theme.palette.text.primaryInverse} />
        </View>
      )}

      <View style={styles.iconContainer}>
        <Icon source="filter-variant" size={28} color={theme.palette.text.primaryInverse} />
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
    backgroundColor: theme.palette.primary,
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    color: theme.palette.text.primaryInverse,
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 24,
    backgroundColor: theme.palette.primary,
    zIndex: 10,
  },
});

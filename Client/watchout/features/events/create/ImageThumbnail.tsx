import { View, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Icon } from 'react-native-paper';

type ImageThumbnailProps = {
  uri: string;
  id: string;
  onRemove: (id: string) => void;
};

export const ImageThumbnail = ({ uri, id, onRemove }: ImageThumbnailProps) => (
  <View style={styles.thumbnailContainer}>
    <Image source={{ uri }} style={styles.image} />
    <TouchableOpacity style={styles.removeButton} onPress={() => onRemove(id)}>
      <Icon source="close" size={16} color={'white'}/>
    </TouchableOpacity>
  </View>
);

const THUMBNAIL_SIZE = 100;

const styles = StyleSheet.create({
  thumbnailContainer: {
    width: THUMBNAIL_SIZE,
    height: THUMBNAIL_SIZE,
    margin: 8,
    borderRadius: 8,
  },

  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    borderRadius: 8,
  },

  removeButton: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: 'red',
    borderRadius: 15,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    borderWidth: 2,
    borderColor: 'white',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },

  removeIcon: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

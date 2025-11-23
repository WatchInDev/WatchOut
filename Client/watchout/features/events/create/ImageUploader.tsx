import { Pressable, ScrollView } from 'react-native-gesture-handler';
import { ActivityIndicator, Icon } from 'react-native-paper';
import { theme } from 'utils/theme';
import { Text } from 'components/Base/Text';
import { useCallback, useState } from 'react';
import { Alert, View } from 'react-native';
import { launchImageLibraryAsync } from 'expo-image-picker';
import { ImageThumbnail } from './ImageThumbnail';
import { MAX_EVENT_IMAGES } from 'utils/constants';

type ImageUploaderProps = {
  images: { uri: string; base64: string }[];
  onImagesUpload: (value: { uri: string; base64: string }[]) => void;
};

export const ImageUploader = ({ images, onImagesUpload }: ImageUploaderProps) => {
  const [areImagesLoading, setAreImagesLoading] = useState(false);

  const handleImageUpload = useCallback(async () => {
    setAreImagesLoading(true);
    let result;
    try {
      result = await launchImageLibraryAsync({
        mediaTypes: 'images',
        base64: true,
        allowsMultipleSelection: true,
        quality: 0.7,
      });
      setAreImagesLoading(false);
    } catch (err) {
      setAreImagesLoading(false);
      Alert.alert('Błąd', 'Nie udało się załadować zdjęć.');
      console.error('Error picking images:', err);
      return;
    }

    if (!result.canceled && result.assets && result.assets.length > 0) {
      if (images.length + result.assets.length > MAX_EVENT_IMAGES) {
        Alert.alert(
          'Limit zdjęć',
          `Możesz dodać maksymalnie ${MAX_EVENT_IMAGES} zdjęć.`
        );
        return;
      }
      onImagesUpload([
        ...images,
        ...result.assets
          .filter((asset) => images.every((img) => img.uri !== asset.uri))
          .map((asset) => ({ uri: asset.uri, base64: asset.base64 || '' })),
      ]);
    }
  }, [images, onImagesUpload]);

  return (
    <>
      {areImagesLoading ? (
        <View style={{ alignItems: 'center' }}>
          <Text>Ładowanie zdjęć...</Text>
          <ActivityIndicator size="large" color={theme.palette.primary} />
        </View>
      ) : images.length === 0 ? (
        <Pressable
          onPress={handleImageUpload}
          style={{
            alignItems: 'center',
            borderStyle: 'dashed',
            borderWidth: 2,
            paddingVertical: 16,
            paddingHorizontal: 32,
            borderRadius: 8,
            borderColor: theme.palette.tertiary,
          }}>
          <Text variant="body2" color="tertiary" align="center">
            Dodaj zdjęcia (maks. {MAX_EVENT_IMAGES}), aby lepiej zobrazować zgłaszane zdarzenie
          </Text>
          <Icon source="image" size={48} color={theme.palette.tertiary} />
        </Pressable>
      ) : (
        <ScrollView horizontal>
          {images.length > 0 &&
            images.map((image) => (
              <ImageThumbnail
                key={image.uri}
                uri={image.uri}
                id={image.uri}
                onRemove={(id) => {
                  onImagesUpload(images.filter((img) => img.uri !== id));
                }}
              />
            ))}
          <Pressable
            onPress={handleImageUpload}
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              borderStyle: 'dashed',
              borderWidth: 2,
              margin: 8,
              paddingVertical: 8,
              paddingHorizontal: 16,
              borderRadius: 8,
              borderColor: theme.palette.tertiary,
            }}>
            <Text variant="body2" color="tertiary" align="center">
              Dodaj więcej zdjęć
            </Text>
            <Icon source="image" size={24} color={theme.palette.tertiary} />
          </Pressable>
        </ScrollView>
      )}
    </>
  );
};

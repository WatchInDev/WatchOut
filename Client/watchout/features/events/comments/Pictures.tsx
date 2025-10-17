import { CustomSurface } from 'components/Layout/CustomSurface';
import { View, Image } from 'react-native';
import { Text } from 'components/Base/Text';

export const Pictures = () => {
  const mockImages = [
    'https://picsum.photos/300/200?random=1',
    'https://picsum.photos/300/200?random=2',
    'https://picsum.photos/300/200?random=3',
  ];

  return (
    <View>
      <Text style={{ fontWeight: 'bold', fontSize: 24, marginBottom: 16 }}>Zdjęcia</Text>
      {mockImages.map((url, idx) => (
        <CustomSurface
          key={idx}
          style={{
            marginBottom: 16,
            height: 200,
            padding: 8,
            borderRadius: 8,
          }}>
          <Text style={{ padding: 4 }}>Zdjęcie {idx + 1}</Text>
          <Image
            source={{ uri: url }}
            style={{ width: '100%', height: 150, borderRadius: 8 }}
            resizeMode="cover"
          />
        </CustomSurface>
      ))}
    </View>
  );
};

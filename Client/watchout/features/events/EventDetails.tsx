import { StyleSheet, View, Image, Modal, Pressable } from 'react-native';
import { Text } from 'components/Base/Text';
import { Event } from 'utils/types';
import dayjs from 'dayjs';
import { icons } from 'components/Base/icons';
import { Row } from 'components/Base/Row';
import { useState } from 'react';

type EventDetailsProps = {
  event: Event;
};

const PICTURE_SIZE = 75;

export const EventDetails = ({ event }: EventDetailsProps) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const reportedDateText = `${new Date(event.reportedDate).toLocaleString()} (${dayjs(event.reportedDate).fromNow()})`;

  const openImage = (uri: string) => {
    setSelectedImage(uri);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedImage(null);
  };

  return (
    <View style={{ gap: 4 }}>
      <View style={styles.header}>
        <Image
          source={icons[(event.eventType.icon as keyof typeof icons) || 'alert-circle']}
          style={{ width: 64, height: 64 }}
        />
        <Text variant="h2" style={{ flexShrink: 1 }}>
          {event.name}
        </Text>
      </View>
      <Text variant="body2">Zgłoszono: {reportedDateText}</Text>
      <Text>{event.description}</Text>

      {event.images.length > 0 && (
        <Row style={{ gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
          {event.images.map((imageUri) => (
            <Pressable key={imageUri} onPress={() => openImage(imageUri)}>
              <Image
                source={{ uri: imageUri }}
                style={{ width: PICTURE_SIZE, height: PICTURE_SIZE * 2, borderRadius: 8 }}
              />
            </Pressable>
          ))}
        </Row>
      )}

      <Modal
        visible={modalVisible}
        transparent={true}
        onRequestClose={closeModal}
        animationType="fade">
        <Pressable
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.85)',
            justifyContent: 'center',
            alignItems: 'center',
          }}
          onPress={closeModal}>
          {selectedImage && (
            <Image
              source={{ uri: selectedImage }}
              style={{
                width: '90%',
                height: '70%',
                resizeMode: 'contain',
                borderRadius: 12,
              }}
            />
          )}
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 4,
  },
  title: {
    fontSize: 32,
    flexShrink: 1,
    fontWeight: 'bold',
    lineHeight: 40,
  },
});

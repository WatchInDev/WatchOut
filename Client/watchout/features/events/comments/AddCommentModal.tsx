import Modal from 'react-native-modal';
import { Button } from 'react-native-paper';
import React, { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { useCreateComment } from './useCreateComment';

type AddCommentModalProps = {
  eventId: number;
  isVisible: boolean;
  onClose: () => void;
  onSubmit: (comment: string) => void;
};

export const AddCommentModal = ({
  eventId,
  isVisible,
  onClose,
  onSubmit,
}: AddCommentModalProps) => {
  const [comment, setComment] = useState('');
  const { mutate } = useCreateComment();

  const handleSubmit = () => {
    mutate(
      { eventId, content: comment },
      {
        onSuccess: () => {
          onSubmit(comment);
          setComment('');
        },
      }
    );
  };

  return (
    <View>
      <Modal isVisible={isVisible} onBackdropPress={onClose}>
        <View style={styles.modal}>
          <TextInput
            placeholder="Dodaj komentarz..."
            value={comment}
            onChangeText={setComment}
            multiline
            style={styles.textInput}
          />
          <Button onPress={handleSubmit}>Wyślij</Button>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  modal: {
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#fff',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 8,
    minHeight: 60,
    backgroundColor: '#fff',
  },
});

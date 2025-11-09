import { Button, TextInput } from 'react-native-paper';
import { useState } from 'react';
import { View } from 'react-native';
import { useCreateComment } from 'features/events/comments/useCreateComment';
import { CustomModal } from 'components/Base/CustomModal';

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
    <>
      <CustomModal isVisible={isVisible} onBackdropPress={onClose}>
        <View style={{ gap: 12 }}>
          <TextInput
            placeholder="Dodaj komentarz..."
            value={comment}
            mode="outlined"
            onChangeText={setComment}
            multiline
            numberOfLines={4}
            style={{ minHeight: 100, paddingTop: 8 }}
          />
          <Button onPress={handleSubmit} mode="contained" disabled={comment.trim() === ''}>
            Wyślij
          </Button>
        </View>
      </CustomModal>
    </>
  );
};

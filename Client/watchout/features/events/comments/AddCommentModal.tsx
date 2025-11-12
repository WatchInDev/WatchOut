import { Button, TextInput } from 'react-native-paper';
import { useState } from 'react';
import { View } from 'react-native';
import { useCreateComment } from 'features/events/comments/useCreateComment';
import { CustomModal } from 'components/Base/CustomModal';
import { CustomTextInput } from 'components/Base/CustomTextInput';

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
  const { mutate, isPending } = useCreateComment();

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
          <CustomTextInput
            placeholder="Dodaj komentarz..."
            value={comment}
            onChangeText={setComment}
            multiline
            numberOfLines={4}
            style={{ minHeight: 100, paddingTop: 8 }}
          />
          <Button
            onPress={handleSubmit}
            mode="contained"
            loading={isPending}
            disabled={comment.trim() === ''}>
            Wyślij
          </Button>
        </View>
      </CustomModal>
    </>
  );
};

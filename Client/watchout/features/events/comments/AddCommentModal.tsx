import { Button } from 'react-native-paper';
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
  onError: (error: unknown) => void;
};

export const AddCommentModal = ({
  eventId,
  isVisible,
  onClose,
  onSubmit,
  onError,
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
        onError: (error) => {
          onError(error);
        }
      }
    );
  };

  return (
    <>
      <CustomModal visible={isVisible} onRequestClose={onClose}>
        <View style={{ gap: 12, width: 300 }}>
          <CustomTextInput
            placeholder="Dodaj komentarz..."
            value={comment}
            onChangeText={setComment}
            multiline
            numberOfLines={4}
          />
          <Button
            onPress={handleSubmit}
            mode="contained"
            loading={isPending}
            icon="send"
            disabled={comment.trim() === '' || isPending}>
            Wyślij
          </Button>
        </View>
      </CustomModal>
    </>
  );
};

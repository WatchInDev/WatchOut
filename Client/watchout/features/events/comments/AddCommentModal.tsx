import { ActivityIndicator, Button, Icon } from 'react-native-paper';
import { useState } from 'react';
import { View } from 'react-native';
import { useCreateComment } from 'features/events/comments/useCreateComment';
import { CustomModal } from 'components/Base/CustomModal';
import { CustomTextInput } from 'components/Base/CustomTextInput';
import { useActionAvailability } from 'features/events/create/useActionAvailability';
import { Text } from 'components/Base/Text';
import { theme } from 'utils/theme';

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
  const { data: availability, isPending: isAvailabilityPending } = useActionAvailability();

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
        },
      }
    );
  };

  return (
    <>
      <CustomModal visible={isVisible} onRequestClose={onClose}>
        {isAvailabilityPending ? (
          <View style={{ padding: 20 }}>
            <ActivityIndicator size={'large'} />
          </View>
        ) : !availability?.canPost ? (
          <View style={{ padding: 20 }}>
            <View style={{ alignItems: 'center' }}>
              <Icon source="alert-circle-outline" size={40} color={theme.palette.text.secondary} />
            </View>
            <Text style={{ marginTop: 16 }}>
              Z powodu niskiej reputacji nie możesz obecnie dodawać komentarzy. Spróbuj ponownie
              później.
            </Text>
            <Button onPress={onClose} style={{ marginTop: 16 }} mode="contained">
              Zamknij
            </Button>
          </View>
        ) : (
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
        )}
      </CustomModal>
    </>
  );
};

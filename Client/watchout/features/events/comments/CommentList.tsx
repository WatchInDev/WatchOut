import { View } from 'react-native';
import { Text } from 'components/Base/Text';
import { CustomSurface } from 'components/Layout/CustomSurface';
import { ActivityIndicator, Button, Icon, IconButton } from 'react-native-paper';
import { AddCommentModal } from './AddCommentModal';
import { theme } from 'utils/theme';
import { ConfirmationModal } from 'components/Common/ConfirmationModal';
import { formatDate, generateAnonName } from 'utils/helpers';
import { useCommentsList } from './useCommentsList';
import { useActionAvailability } from 'features/events/create/useActionAvailability';
import { Coordinates } from 'utils/types';
import { Row } from 'components/Base/Row';

type CommentListProps = {
  eventId: number;
  eventAuthorId: number;
  eventCoordinates: Coordinates;
};

export const CommentList = ({ eventId, eventAuthorId, eventCoordinates }: CommentListProps) => {
  const {
    comments,
    isDeleting,
    commentToDelete,
    setCommentToDelete,
    isCommentModalOpen,
    setIsCommentModalOpen,
    handleCommentDelete,
    handleCommentSubmit,
    handleCommentSubmitError,
  } = useCommentsList(eventId);

  const { availability, isLoading: isAvailabilityLoading } = useActionAvailability({
    eventLat: eventCoordinates.latitude,
    eventLong: eventCoordinates.longitude,
  });

  if (comments.isFetching && !comments.isFetchingNextPage) {
    return <ActivityIndicator color={theme.palette.primary} />;
  }

  const currentCommentCount = comments?.content.length ?? 0;

  return (
    <>
      <Text variant="h3">Komentarze ({comments?.totalElements ?? 0})</Text>

      <Button
        onPress={() => {
          if (availability != null) {
            setIsCommentModalOpen(true);
          }
        }}
        mode={availability?.canPost ? 'contained' : 'outlined'}
        style={[!availability?.canPost ? { borderStyle: 'dashed' } : {}, { marginVertical: 12 }]}>
        {isAvailabilityLoading || availability == null
          ? 'Ładowanie...'
          : availability.canPost
            ? 'Dodaj komentarz'
            : 'Nie możesz dodać komentarza'}
      </Button>

      {comments?.empty ? (
        <View style={{ alignItems: 'center', marginTop: 32 }}>
          <Icon source={'comment'} size={64} color="#bbb" />
          <Text>Jeszcze nikt nie skomentował tego zdarzenia</Text>
        </View>
      ) : (
        <>
          {comments?.content.map((item) => (
            <CustomSurface
              key={'Comments_' + item.id}
              style={{
                padding: 12,
                marginBottom: 12,
                justifyContent: 'space-between',
                flexDirection: 'row',
              }}>
              <View>
                <Row>
                  {item.isAuthor ? (
                    <Text
                      variant="subtitle2"
                      style={{ textDecorationLine: 'underline' }}>
                      Twój komentarz
                    </Text>
                  ) : (
                    <Text variant="subtitle2">{generateAnonName(item.author.id)} {item.author.id === eventAuthorId ? '(autor zdarzenia)' : ''}</Text>
                  )}
                </Row>

                <Text variant="body1" wrap>
                  {item.content}
                </Text>
                <Text variant="body2" color="tertiary">
                  {formatDate(item.createdAt)}
                </Text>
              </View>
              {item.isAuthor && (
                <View>
                  <IconButton icon={'delete'} onPress={() => setCommentToDelete(item.id)} />
                </View>
              )}
            </CustomSurface>
          ))}

          {comments.hasNextPage && (
            <Button
              mode="outlined"
              onPress={() => comments.fetchNextPage()}
              disabled={comments.isFetchingNextPage}
              style={{ paddingVertical: 16, alignItems: 'center' }}>
              <Text style={{ textAlign: 'center' }}>
                {comments.isFetchingNextPage
                  ? 'Ładowanie...'
                  : `Wyświetl więcej komentarzy (${(comments?.totalElements ?? 0) - currentCommentCount})`}
              </Text>
            </Button>
          )}

          {(!comments.hasNextPage || comments.totalElements === 0) && currentCommentCount > 0 && (
            <View style={{ paddingVertical: 16, alignItems: 'center' }}>
              <Text variant="body1">Wszystkie komentarze zostały załadowane.</Text>
            </View>
          )}
        </>
      )}

      {availability != null && (
        <AddCommentModal
          eventId={eventId}
          isVisible={isCommentModalOpen}
          onClose={() => setIsCommentModalOpen(false)}
          onSubmit={handleCommentSubmit}
          onError={handleCommentSubmitError}
          availability={availability}
        />
      )}
      <ConfirmationModal
        isVisible={commentToDelete != null}
        onConfirm={handleCommentDelete}
        isLoading={isDeleting}
        onCancel={() => setCommentToDelete(null)}
        content={
          <View>
            <Text>Czy na pewno chcesz usunąć ten komentarz?</Text>
            <Text
              variant="body2"
              color="tertiary"
              style={{ marginTop: 8, backgroundColor: '#f8f8f8', padding: 8 }}>
              {comments?.content.find((c) => c.id === commentToDelete)?.content}
            </Text>
          </View>
        }
      />
    </>
  );
};

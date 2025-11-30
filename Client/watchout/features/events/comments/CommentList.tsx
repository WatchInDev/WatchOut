import { TouchableOpacity, View } from 'react-native';
import { Text } from 'components/Base/Text';
import { CustomSurface } from 'components/Layout/CustomSurface';
import { ActivityIndicator, Button, Icon, IconButton } from 'react-native-paper';
import { AddCommentModal } from './AddCommentModal';
import dayjs from 'dayjs';
import { theme } from 'utils/theme';
import { ConfirmationModal } from 'components/Common/ConfirmationModal';
import { generateAnonName } from 'utils/helpers';
import { useCommentsList } from './useCommentsList';

type CommentListProps = {
  eventId: number;
};

export const CommentList = ({ eventId }: CommentListProps) => {
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

  if (comments.isFetching && !comments.isFetchingNextPage) {
    return <ActivityIndicator color={theme.palette.primary} />;
  }

  const currentCommentCount = comments?.content.length || 0;

  return (
    <>
      <AddCommentModal
        eventId={eventId}
        isVisible={isCommentModalOpen}
        onClose={() => setIsCommentModalOpen(false)}
        onSubmit={handleCommentSubmit}
        onError={handleCommentSubmitError}
      />
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
      <Text variant="h3">Komentarze ({comments?.totalElements || 0})</Text>
      <Button
        onPress={() => setIsCommentModalOpen(true)}
        mode="contained"
        style={{ marginVertical: 12 }}>
        Dodaj komentarz
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
              <View style={{ flex: 1 }}>
                <Text variant="subtitle2">
                  {item.isAuthor ? 'Twój komentarz' : generateAnonName(item.author.id)}
                </Text>
                <Text variant="body1" wrap>
                  {item.content}
                </Text>
                <Text variant="body2" color="tertiary">
                  {dayjs.utc(item.createdAt).local().format('YYYY-MM-DD HH:mm')} (
                  {dayjs.utc(item.createdAt).local().fromNow()})
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
            <TouchableOpacity
              onPress={() => comments.fetchNextPage()}
              disabled={comments.isFetchingNextPage}
              style={{ paddingVertical: 16, alignItems: 'center' }}>
              <Text style={{ textAlign: 'center' }}>
                {comments.isFetchingNextPage
                  ? 'Ładowanie...'
                  : `Wyświetl więcej komentarzy (${(comments?.totalElements ?? 0) - currentCommentCount})`}
              </Text>
            </TouchableOpacity>
          )}

          {(!comments.hasNextPage || comments.totalElements === 0) && currentCommentCount > 0 && (
            <View style={{ paddingVertical: 16, alignItems: 'center' }}>
              <Text variant="body1">Wszystkie komentarze zostały załadowane.</Text>
            </View>
          )}
        </>
      )}
    </>
  );
};

import { TouchableOpacity, View } from 'react-native';
import { useComments } from './useComments';
import { Text } from 'components/Base/Text';
import { CustomSurface } from 'components/Layout/CustomSurface';
import { ActivityIndicator, Button, Icon, IconButton } from 'react-native-paper';
import { AddCommentModal } from './AddCommentModal';
import { useState, useMemo } from 'react';
import dayjs from 'dayjs';
import { theme } from 'utils/theme';
import { useCommentDelete } from './useCommentDelete';
import { useSnackbar } from 'utils/useSnackbar';
import { ConfirmationModal } from 'components/Common/ConfirmationModal';
import { useAuth } from 'features/auth/authContext';
import { generateAnonName } from 'utils/helpers';

type CommentListProps = {
  eventId: number;
};

export const CommentList = ({ eventId }: CommentListProps) => {
  const { data, isFetching, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } = useComments(
    eventId,
    {
      page: 0,
      size: 5,
      sort: [{ field: 'createdAt', direction: 'desc' }],
    }
  );
  const { mutateAsync: deleteCommentAsync, isPending: isDeleting } = useCommentDelete();
  const [commentToDelete, setCommentToDelete] = useState<number | null>(null);

  const handleCommentDelete = () => {
    if (commentToDelete == null) return;

    deleteCommentAsync({ eventId, commentId: commentToDelete }).then(() => {
      showSnackbar({ message: 'Komentarz usunięty pomyślnie', type: 'success' });
      setCommentToDelete(null);
      refetch();
    });
  };

  const { showSnackbar } = useSnackbar();
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);

  const comments = useMemo(() => {
    if (!data) return null;
    const allComments = data.pages.flatMap((page) => page.content);
    const totalElements = data.pages[0]?.totalElements;
    const empty = totalElements === 0;

    return { content: allComments, totalElements, empty };
  }, [data]);

  const handleCommentSubmit = () => {
    setIsCommentModalOpen(false);
    showSnackbar({ message: 'Komentarz dodany pomyślnie', type: 'success' });
    refetch();
  };

  if (isFetching && !isFetchingNextPage) {
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
        onError={() => {
          showSnackbar({ message: 'Wystąpił błąd podczas dodawania komentarza', type: 'error' });
        }}
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
                <Text variant="subtitle2">{item.isAuthor ? 'Twój komentarz' : generateAnonName(item.author.id)}</Text>
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

          {hasNextPage && (
            <TouchableOpacity
              onPress={() => fetchNextPage()}
              disabled={isFetchingNextPage}
              style={{ paddingVertical: 16, alignItems: 'center' }}>
              <Text style={{ textAlign: 'center' }}>
                {isFetchingNextPage
                  ? 'Ładowanie...'
                  : `Wyświetl więcej komentarzy (${(comments?.totalElements ?? 0) - currentCommentCount})`}
              </Text>
            </TouchableOpacity>
          )}

          {(!hasNextPage || comments?.totalElements === 0) && currentCommentCount > 0 && (
            <View style={{ paddingVertical: 16, alignItems: 'center' }}>
              <Text variant="body1">Wszystkie komentarze zostały załadowane.</Text>
            </View>
          )}
        </>
      )}
    </>
  );
};

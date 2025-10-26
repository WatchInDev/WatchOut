import { TouchableOpacity, View } from 'react-native';
import { useComments } from './useComments';
import { Text } from 'components/Base/Text';
import { CustomSurface } from 'components/Layout/CustomSurface';
import { Button, Icon } from 'react-native-paper';
import { AddCommentModal } from './AddCommentModal';
import { useState, useMemo } from 'react';
import dayjs from 'dayjs';

type CommentListProps = {
  eventId: number;
};

export const CommentList = ({ eventId }: CommentListProps) => {
  const { data, isFetching, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } = useComments(
    eventId,
    { page: 0, size: 5, sort: [{ field: 'createdAt', direction: 'desc' }] }
  );

  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);

  const comments = useMemo(() => {
    if (!data) return null;
    const allComments = data.pages.flatMap((page) => page.content);
    const totalElements = data.pages[0]?.totalElements;
    const empty = totalElements === 0;

    return { content: allComments, totalElements, empty };
  }, [data]);

  const handleCommentSubmit = (comment: string) => {
    setIsCommentModalOpen(false);
    refetch();
  };

  if (isFetching && !isFetchingNextPage) {
    return <Text>Ładowanie komentarzy...</Text>;
  }

  const currentCommentCount = comments?.content.length || 0;

  return (
    <>
      <AddCommentModal
        eventId={eventId}
        isVisible={isCommentModalOpen}
        onClose={() => setIsCommentModalOpen(false)}
        onSubmit={handleCommentSubmit}
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
            <CustomSurface key={item.id} style={{ padding: 12, marginBottom: 12 }}>
              <Text variant="subtitle1">{item.author.name}</Text>
              <Text variant="body1">{item.content}</Text>
              <Text variant="body2" color="tertiary">
                {new Date(item.createdAt).toLocaleString()} ({dayjs(item.createdAt).fromNow()})
              </Text>
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

import { useState, useMemo } from 'react';
import { PaginationRequest } from 'utils/types';
import { useSnackbar } from 'utils/useSnackbar';
import { useCommentDelete } from './useCommentDelete';
import { useComments } from './useComments';

export const useCommentsList = (eventId: number) => {
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

  const handleCommentSubmitError = () => {
    showSnackbar({ message: 'Wystąpił błąd podczas dodawania komentarza', type: 'error' });
  };

  return {
    comments: {
      content: comments?.content || [],
      isFetching,
      hasNextPage,
      fetchNextPage,
      isFetchingNextPage,
      totalElements: comments?.totalElements || 0,
      empty: comments?.empty || false,
    },
    isDeleting,
    commentToDelete,
    setCommentToDelete,
    isCommentModalOpen,
    setIsCommentModalOpen,
    handleCommentDelete,
    handleCommentSubmit,
    handleCommentSubmitError,
  };
};

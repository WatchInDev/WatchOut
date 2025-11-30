import { useMutation } from '@tanstack/react-query';
import { apiClient } from 'utils/apiClient';
import { API_ENDPOINTS } from 'utils/apiDefinition';

export const useCommentDelete = () =>
  useMutation({
    mutationKey: ['deleteComment'],
    mutationFn: ({ eventId, commentId }: { eventId: number; commentId: number }) =>
      apiClient.delete(API_ENDPOINTS.comments.delete(eventId, commentId)).then((res) => res.data),
  });

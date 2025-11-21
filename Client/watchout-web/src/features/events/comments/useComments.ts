import { API_ENDPOINTS } from '../../../utils/apiDefinition';
import { useQueryHook } from '../../../utils/useQueryHook';
import type { Comment } from '../../../utils/types';

export const useComments = (eventId: number) =>
  useQueryHook<Comment[]>(
    ['events', eventId.toString(), 'comments'],
    API_ENDPOINTS.comments.getByEventId(eventId)
  );

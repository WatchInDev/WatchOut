import { API_ENDPOINTS } from 'utils/apiDefinition';
import { Comment, Page, PaginationRequest } from 'utils/types';
import { apiClient } from 'utils/apiClient';
import { useInfiniteQuery } from '@tanstack/react-query';

export const useComments = (eventId: number, initialPagination: PaginationRequest<Comment>) =>
  useInfiniteQuery({
    queryKey: ['events', eventId.toString(), 'comments'],
    queryFn: ({ pageParam = initialPagination.page }) => {
      const pagination = { ...initialPagination, page: pageParam };
      return apiClient
        .get<Page<Comment>>(API_ENDPOINTS.comments.getByEventId(eventId, pagination))
        .then((res) => res.data);
    },
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage.last) {
        return lastPage.pageable.pageNumber + 1;
      }
      return undefined;
    },
    initialPageParam: initialPagination.page,
  });

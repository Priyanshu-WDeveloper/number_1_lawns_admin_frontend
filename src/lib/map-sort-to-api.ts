import type { ListQueryParams } from '@/types/common.types';

export function mapSortToApi(sortValue: string): ListQueryParams['sort'] {
  if (sortValue.endsWith('_desc')) {
    if (sortValue.startsWith('jobDate')) return 'date_desc';
    if (sortValue.startsWith('createdAt') || sortValue.startsWith('updatedAt')) return 'oldest';
    return 'z_a';
  }
  if (sortValue === 'jobDate') return 'date_asc';
  if (sortValue === 'createdAt' || sortValue === 'updatedAt') return 'newest';
  return 'a_z';
}

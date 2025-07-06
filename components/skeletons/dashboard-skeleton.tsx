import { Skeleton } from '@/components/ui/skeleton';
import { StatsSkeleton } from './stats-skeleton';
import { FiltersSkeleton } from './filters-skeleton';
import { TableSkeleton } from './table-skeleton';

export function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header Skeleton */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <Skeleton className="h-10 w-80 mb-2" />
              <Skeleton className="h-5 w-64" />
            </div>
            <div className="flex items-center space-x-4">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="w-24 h-10 rounded-md" />
            </div>
          </div>
        </div>

        {/* Stats Cards Skeleton */}
        <StatsSkeleton />

        {/* Filters Skeleton */}
        <FiltersSkeleton />

        {/* Data Table Skeleton */}
        <TableSkeleton />
      </div>
    </div>
  );
}
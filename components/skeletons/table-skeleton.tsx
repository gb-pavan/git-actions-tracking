import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function TableSkeleton() {
  return (
    <Card className="backdrop-blur-sm bg-white/80 border-0 shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-32" />
          <div className="flex items-center space-x-2">
            <Skeleton className="h-4 w-10" />
            <Skeleton className="w-20 h-8" />
            <Skeleton className="h-4 w-12" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Table Header Skeleton */}
          <div className="flex items-center space-x-4 pb-4 border-b border-gray-200">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-16" />
          </div>
          
          {/* Table Rows Skeleton */}
          {[...Array(10)].map((_, index) => (
            <div 
              key={index} 
              className="flex items-center space-x-4 py-3 border-b border-gray-100"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center space-x-2">
                <Skeleton className="w-6 h-6 rounded" />
                <Skeleton className="h-4 w-12" />
              </div>
              <div className="flex items-center space-x-2">
                <Skeleton className="w-8 h-8 rounded-full" />
                <Skeleton className="h-4 w-20" />
              </div>
              <div>
                <Skeleton className="h-4 w-24 mb-1" />
                <Skeleton className="h-3 w-16" />
              </div>
              <Skeleton className="h-4 w-48" />
              <div className="flex items-center space-x-2">
                <Skeleton className="h-3 w-8" />
                <Skeleton className="h-3 w-8" />
              </div>
              <Skeleton className="h-3 w-12" />
            </div>
          ))}
        </div>

        {/* Pagination Skeleton */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
          <Skeleton className="h-4 w-48" />
          <div className="flex items-center space-x-2">
            <Skeleton className="w-20 h-8" />
            <div className="flex space-x-1">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="w-8 h-8" />
              ))}
            </div>
            <Skeleton className="w-16 h-8" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
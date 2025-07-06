import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function StatsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      {[...Array(4)].map((_, index) => (
        <Card key={index} className="backdrop-blur-sm bg-white/80 border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-16 mb-2" />
                <div className="flex items-center">
                  <Skeleton className="h-3 w-3 rounded-full mr-1" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
              <Skeleton className="w-12 h-12 rounded-full" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
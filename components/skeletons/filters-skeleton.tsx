import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function FiltersSkeleton() {
  return (
    <Card className="backdrop-blur-sm bg-white/80 border-0 shadow-lg mb-8">
      <CardHeader>
        <div className="flex items-center">
          <Skeleton className="w-5 h-5 mr-2" />
          <Skeleton className="h-6 w-32" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Skeleton className="w-full h-10 rounded-md" />
            </div>
          </div>
          <Skeleton className="w-full md:w-48 h-10 rounded-md" />
          <Skeleton className="w-full md:w-48 h-10 rounded-md" />
        </div>
      </CardContent>
    </Card>
  );
}
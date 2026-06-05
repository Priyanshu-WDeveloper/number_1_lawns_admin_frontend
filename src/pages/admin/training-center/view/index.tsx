import { useParams, useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { AppLayout } from '@/components/layout/app-layout';
import { Navbar } from '@/components/layout/navbar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { useGetTrainingQuery } from '@/API/api';

function getYoutubeVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

export default function TrainingVideoViewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: video, isLoading, isError } = useGetTrainingQuery(id!, {
    skip: !id,
  });

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex flex-1 flex-col">
          <div className="flex-1 w-full px-2 sm:px-5 py-1 sm:py-4 min-h-0 flex flex-col">
            <div className="flex w-full flex-col flex-1">
              <Navbar title="" subtitle="" showWelcome={false} />
              <div className="flex-1 min-h-0 mt-4 flex flex-col">
                <Skeleton className="h-4 w-32 mb-4" />
                <div className="bg-white rounded-xl border border-[#ececec] overflow-hidden">
                  <Skeleton className="aspect-video rounded-none" />
                  <div className="p-4 sm:p-6">
                    <Skeleton className="h-6 w-3/4 mb-3" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-1/2 mb-4" />
                    <div className="flex items-center justify-between pt-4 border-t border-[#ececec]">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-36" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (isError || !video) {
    return (
      <AppLayout>
        <div className="flex flex-1 flex-col items-center justify-center p-8">
          <p className="text-muted-foreground text-lg">Video not found</p>
          <Button
            onClick={() => navigate(ROUTES.TRAINING_CENTER)}
            variant="outline"
            className="mt-4 rounded-xl"
          >
            Back to Training Center
          </Button>
        </div>
      </AppLayout>
    );
  }

  const videoId = getYoutubeVideoId(video.videoUrl);

  return (
    <AppLayout>
      <div className="flex flex-1 flex-col">
        <div className="flex-1 w-full px-2 sm:px-5 py-1 sm:py-4 min-h-0 flex flex-col">
          <div className="flex w-full flex-col flex-1">
            <Navbar
              title={video.title}
              subtitle={video.description}
              showWelcome={false}
            />
            <div className="flex-1 min-h-0 mt-4 flex flex-col">
              <button
                onClick={() => navigate(ROUTES.TRAINING_CENTER)}
                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-[#151515] transition-colors mb-4 w-fit"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Videos
              </button>

              <div className="bg-white rounded-xl border border-[#ececec] overflow-hidden">
                <div className="aspect-video bg-gray-100">
                  {videoId ? (
                    <iframe
                      src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
                      title={video.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white">
                      Invalid YouTube URL
                    </div>
                  )}
                </div>
                <div className="p-4 sm:p-6">
                  <h2 className="text-xl font-semibold text-[#151515]">
                    {video.title}
                  </h2>
                  <p className="text-sm text-muted-foreground mt-2">
                    {video.description}
                  </p>
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#ececec]">
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(video.createdAt), 'MMM dd, yyyy')}
                    </span>
                    <a
                      href={video.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-red-600 hover:text-red-700"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Open on YouTube
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

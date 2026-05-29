import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { AppLayout } from '@/components/layout/app-layout';
import { Navbar } from '@/components/layout/navbar';
import { Button } from '@/components/ui/button';
import { mockVideos } from '@/data/training-videos';
import { format } from 'date-fns';

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
  const video = mockVideos.find((v) => v.id === id);

  if (!video) {
    return (
      <AppLayout>
        <div className="flex flex-1 flex-col items-center justify-center p-8">
          <p className="text-muted-foreground text-lg">Video not found</p>
          <Button
            onClick={() => navigate('/training-center')}
            variant="outline"
            className="mt-4 rounded-xl"
          >
            Back to Training Center
          </Button>
        </div>
      </AppLayout>
    );
  }

  const videoId = getYoutubeVideoId(video.youtubeUrl);

  return (
    <AppLayout>
      <div className="flex flex-1 flex-col">
        <div className="flex-1 w-full px-2 sm:px-5 py-1 sm:py-4 min-h-0 flex flex-col">
          <div className="flex w-full flex-col flex-1">
            <Navbar
              title={video.title}
              subtitle={video.subtitle}
              showWelcome={false}
            />
            <div className="flex-1 min-h-0 mt-4 flex flex-col">
              <button
                onClick={() => navigate('/training-center')}
                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-[#151515] transition-colors mb-4 w-fit"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Videos
              </button>

              <div className="bg-white rounded-xl border border-[#ececec] overflow-hidden">
                <div className="aspect-video bg-black">
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
                    {video.subtitle}
                  </p>
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#ececec]">
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(video.date), 'MMM dd, yyyy')}
                    </span>
                    <a
                      href={video.youtubeUrl}
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

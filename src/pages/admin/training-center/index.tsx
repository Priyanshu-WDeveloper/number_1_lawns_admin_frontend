import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Video,
  Play,
  Pencil,
  Trash2,
  Plus,
  Calendar,
  ExternalLink,
  PlaySquare,
  Type,
  FileText,
} from 'lucide-react';
import { AppLayout } from '@/components/layout/app-layout';
import { Navbar } from '@/components/layout/navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import {
  mockVideos,
  type TrainingVideo,
} from '@/data/training-videos';
import { ROUTES } from '@/constants';
import { Textarea } from '@/components/ui/textarea';

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

function getYoutubeThumbnail(url: string): string {
  const id = getYoutubeVideoId(url);
  return id
    ? `https://img.youtube.com/vi/${id}/hqdefault.jpg`
    : '/placeholder-video.png';
}

export default function TrainingCenterPage() {
  const [videos, setVideos] = useState<TrainingVideo[]>(mockVideos);
  const [editingVideo, setEditingVideo] =
    useState<TrainingVideo | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [removeId, setRemoveId] = useState<string | null>(null);
  const navigate = useNavigate();

  const openEdit = (video: TrainingVideo) => {
    setEditingVideo({ ...video });
    setIsEditOpen(true);
  };

  const openAdd = () => {
    setEditingVideo({
      id: String(Date.now()),
      title: '',
      subtitle: '',
      youtubeUrl: '',
      date: format(new Date(), 'yyyy-MM-dd'),
    });
    setIsEditOpen(true);
  };

  const handleEditSave = () => {
    if (!editingVideo) return;
    if (
      !editingVideo.title.trim() ||
      !editingVideo.youtubeUrl.trim()
    ) {
      toast.error('Title and YouTube URL are required');
      return;
    }
    setVideos((prev) => {
      const exists = prev.find((v) => v.id === editingVideo.id);
      if (exists) {
        return prev.map((v) =>
          v.id === editingVideo.id ? editingVideo : v,
        );
      }
      return [...prev, editingVideo];
    });
    toast.success('Video saved');
    setIsEditOpen(false);
    setEditingVideo(null);
  };

  const handleRemove = () => {
    if (!removeId) return;
    setVideos((prev) => prev.filter((v) => v.id !== removeId));
    toast.success('Video removed');
    setRemoveId(null);
  };

  return (
    <AppLayout>
      <div className="flex flex-1 flex-col">
        <div className="flex-1 w-full px-2 sm:px-5 py-1 sm:py-4 min-h-0 flex flex-col">
          <div className="flex w-full flex-col flex-1">
            <Navbar
              title="Training Center"
              subtitle="Manage training videos and resources"
              showWelcome={false}
            />
            <div className="flex-1 min-h-0 mt-4 flex flex-col">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Video className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-[#151515]">
                      Training Videos
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      {videos.length} video
                      {videos.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <Button
                  onClick={openAdd}
                  className="h-9 px-4 rounded-xl bg-primary text-white hover:bg-primary/90 text-sm"
                >
                  <Plus className="h-4 w-4 mr-1.5" />
                  Add Video
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {videos.map((video) => (
                  <div
                    key={video.id}
                    className="bg-white rounded-xl border border-[#ececec] overflow-hidden group transition-shadow hover:shadow-md flex flex-col"
                  >
                    <div className="relative aspect-video bg-black shrink-0">
                      <img
                        src={getYoutubeThumbnail(video.youtubeUrl)}
                        alt={video.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://placehold.co/640x360/16610E/FFFFFF?text=No+Thumbnail';
                        }}
                      />
                      <a
                        href={video.youtubeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute top-2 right-2 px-2.5 h-7 rounded-full bg-black/40 backdrop-blur-sm flex items-center gap-1 hover:bg-black/60 transition-colors shadow-sm z-10 text-xs font-medium text-white/80"
                        title="Open on YouTube"
                      >
                        <ExternalLink className="h-3 w-3" />
                        YouTube
                      </a>
                      <button
                        onClick={() =>
                          navigate(
                            ROUTES.TRAINING_CENTER + '/' + video.id,
                          )
                        }
                        className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity w-full cursor-pointer"
                      >
                        <div className="h-14 w-14 rounded-full bg-white/90 flex items-center justify-center pointer-events-none">
                          <Play className="h-6 w-6 text-[#151515] ml-0.5" />
                        </div>
                      </button>
                    </div>

                    <div className="p-4 flex flex-col flex-1">
                      <div className="flex-1">
                        <h3 className="font-semibold text-[#151515] text-base line-clamp-1">
                          {video.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {video.subtitle}
                        </p>
                      </div>
                      <div className="flex items-center justify-between pt-3 border-t border-[#ececec]">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Calendar className="h-3.5 w-3.5" />
                          {format(
                            new Date(video.date),
                            'MMM dd, yyyy',
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => openEdit(video)}
                            className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-md text-xs font-medium bg-[#f5f5f5] text-[#374151] hover:bg-primary/10 hover:text-primary transition-colors"
                          >
                            <Pencil className="h-3 w-3" />
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => setRemoveId(video.id)}
                            className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-md text-xs font-medium bg-[#f5f5f5] text-[#374151] hover:bg-red-50 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="h-3 w-3" />
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {videos.length === 0 && (
                <div className="bg-white rounded-xl p-12 text-center border border-[#ececec]">
                  <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                    <Video className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-[#151515] mb-2">
                    No training videos
                  </h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    Add your first training video to get started
                  </p>
                  <Button
                    onClick={openAdd}
                    className="h-10 px-4 rounded-xl bg-primary text-white hover:bg-primary/90"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Video
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* 
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingVideo && mockVideos.some((v) => v.id === editingVideo.id)
                ? 'Edit Video'
                : 'Add Video'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#151515]">
                Title
              </label>
              <Input
                value={editingVideo?.title ?? ''}
                onChange={(e) =>
                  setEditingVideo((prev) =>
                    prev ? { ...prev, title: e.target.value } : prev,
                  )
                }
                placeholder="Video title"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#151515]">
                Subtitle
              </label>
              <Input
                value={editingVideo?.subtitle ?? ''}
                onChange={(e) =>
                  setEditingVideo((prev) =>
                    prev ? { ...prev, subtitle: e.target.value } : prev,
                  )
                }
                placeholder="Brief description"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#151515]">
                YouTube URL
              </label>
              <Input
                value={editingVideo?.youtubeUrl ?? ''}
                onChange={(e) =>
                  setEditingVideo((prev) =>
                    prev ? { ...prev, youtubeUrl: e.target.value } : prev,
                  )
                }
                placeholder="https://www.youtube.com/watch?v=..."
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#151515]">
                Date
              </label>
              <Input
                type="date"
                value={editingVideo?.date ?? ''}
                onChange={(e) =>
                  setEditingVideo((prev) =>
                    prev ? { ...prev, date: e.target.value } : prev,
                  )
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditOpen(false);
                setEditingVideo(null);
              }}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              onClick={handleEditSave}
              className="rounded-xl bg-primary text-white hover:bg-primary/90"
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog> */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent
          className="
      max-w-[520px]
      rounded-[30px]
      border-0
      bg-[#F8F8F7]
      p-0
      shadow-[0_20px_60px_rgba(0,0,0,0.12)]
      overflow-hidden
    "
        >
          <div className="p-7">
            {/* Header */}
            <div className="flex items-start gap-4">
              <div
                className="
            flex h-14 w-14 items-center justify-center
            rounded-2xl
            bg-[#E7F1E7]
          "
              >
                <PlaySquare className="h-7 w-7 text-[#2E7D32]" />
              </div>

              <div>
                <h2 className="text-[28px] font-semibold leading-none text-[#1E1E1E]">
                  {editingVideo &&
                  mockVideos.some((v) => v.id === editingVideo.id)
                    ? 'Edit Training Video'
                    : 'Add Training Video'}
                </h2>

                <p className="mt-2 text-sm text-[#8D96A7]">
                  {editingVideo &&
                  mockVideos.some((v) => v.id === editingVideo.id)
                    ? 'Update the training video details'
                    : 'Add a new training video'}
                </p>
              </div>
            </div>

            {/* Form */}
            <div className="mt-8 space-y-5">
              {/* Title */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#5D6778]">
                  Title
                </label>

                <div className="relative">
                  <Type className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#2E7D32]" />

                  <Input
                    value={editingVideo?.title ?? ''}
                    onChange={(e) =>
                      setEditingVideo((prev) =>
                        prev
                          ? { ...prev, title: e.target.value }
                          : prev,
                      )
                    }
                    placeholder="e.g. Zero-Turn Mower Safety"
                    className="
                h-14
                rounded-2xl
                border-[#DDE5EC]
                bg-[#EEF3F7]
                pl-12
                text-[15px]
                shadow-none
                focus-visible:ring-0
                focus-visible:border-[#C9D5E0]
              "
                  />
                </div>
              </div>

              {/* URL */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#5D6778]">
                  YouTube URL
                </label>

                <div className="relative">
                  <PlaySquare className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#2E7D32]" />

                  <Input
                    value={editingVideo?.youtubeUrl ?? ''}
                    onChange={(e) =>
                      setEditingVideo((prev) =>
                        prev
                          ? { ...prev, youtubeUrl: e.target.value }
                          : prev,
                      )
                    }
                    placeholder="https://youtube.com/watch?v=..."
                    className="
                h-14
                rounded-2xl
                border-[#DDE5EC]
                bg-[#EEF3F7]
                pl-12
                text-[15px]
                shadow-none
                focus-visible:ring-0
              "
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#5D6778]">
                  Description
                </label>

                <div className="relative">
                  <FileText className="absolute left-4 top-4 h-5 w-5 text-[#2E7D32]" />

                  <Textarea
                    value={editingVideo?.subtitle ?? ''}
                    onChange={(e) =>
                      setEditingVideo((prev) =>
                        prev
                          ? { ...prev, subtitle: e.target.value }
                          : prev,
                      )
                    }
                    placeholder="What will employees learn from this video?"
                    className="
                min-h-[100px]
                rounded-2xl
                border-[#DDE5EC]
                bg-[#EEF3F7]
                pl-12 md:pl-12
                pt-4
                resize-none
                shadow-none
                focus-visible:ring-0
              "
                  />
                </div>
              </div>

              {/* Date */}
              {/* <div className="space-y-2">
                <label className="text-sm font-medium text-[#5D6778]">
                  Date
                </label>

                <Input
                  type="date"
                  value={editingVideo?.date ?? ''}
                  onChange={(e) =>
                    setEditingVideo((prev) =>
                      prev ? { ...prev, date: e.target.value } : prev,
                    )
                  }
                  className="
              h-14
              rounded-2xl
              border-[#DDE5EC]
              bg-[#EEF3F7]
              shadow-none
              focus-visible:ring-0
            "
                />
              </div> */}
            </div>

            {/* Footer */}
            <div className="mt-8 flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditOpen(false);
                  setEditingVideo(null);
                }}
                className="
            h-12
            flex-1
            rounded-2xl
            border-[#D7DDE4]
            bg-white
            text-[15px]
            font-medium
            text-[#4E5665]
            hover:bg-white
          "
              >
                Cancel
              </Button>

              <Button
                onClick={handleEditSave}
                className="
            h-12
            flex-1
            rounded-2xl
            bg-[#2E7D32]
            text-[15px]
            font-semibold
            text-white
            hover:bg-[#276B2B]
          "
              >
                {editingVideo &&
                mockVideos.some((v) => v.id === editingVideo.id)
                  ? 'Save Changes'
                  : 'Add Video'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!removeId}
        onOpenChange={(open) => {
          if (!open) setRemoveId(null);
        }}
        title="Remove Video"
        description="Are you sure you want to remove this training video? This action cannot be undone."
        confirmText="Remove"
        onConfirm={handleRemove}
      />
    </AppLayout>
  );
}

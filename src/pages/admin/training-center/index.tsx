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
  Search,
  BadgeCheck,
  XCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { AppLayout } from '@/components/layout/app-layout';
import { Navbar } from '@/components/layout/navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { ROUTES } from '@/constants';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useGetTrainingsQuery,
  useCreateTrainingMutation,
  useUpdateTrainingMutation,
  useDeleteTrainingMutation,
  useToggleTrainingStatusMutation,
} from '@/API/api';
import type { ITraining } from '@/types';

function getPageNumbers(current: number, total: number): (number | 'ellipsis')[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const pages: (number | 'ellipsis')[] = [1];
  if (current > 3) pages.push('ellipsis');
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) pages.push(i);
  if (current < total - 2) pages.push('ellipsis');
  pages.push(total);
  return pages;
}

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
    ? `https://img.youtube.com/vi/${id}/mqdefault.jpg`
    : '/placeholder-video.png';
}

export default function TrainingCenterPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [isActiveFilter, setIsActiveFilter] = useState<boolean | undefined>(undefined);
  const limit = 12;

  const { data, isLoading, isFetching } = useGetTrainingsQuery({
    page,
    limit,
    search: search || undefined,
    isActive: isActiveFilter,
  });

  const [createTraining] = useCreateTrainingMutation();
  const [updateTraining] = useUpdateTrainingMutation();
  const [deleteTraining] = useDeleteTrainingMutation();
  const [toggleStatus] = useToggleTrainingStatusMutation();

  const [editingVideo, setEditingVideo] = useState<{
    id?: string;
    title: string;
    description: string;
    videoUrl: string;
  } | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [removeId, setRemoveId] = useState<string | null>(null);

  const videos = data?.trainings ?? [];
  const totalPages = data?.totalPages ?? 1;
  const total = data?.total ?? 0;

  const openEdit = (video: ITraining) => {
    setEditingVideo({
      id: video._id,
      title: video.title,
      description: video.description,
      videoUrl: video.videoUrl,
    });
    setIsEditOpen(true);
  };

  const openAdd = () => {
    setEditingVideo({
      title: '',
      description: '',
      videoUrl: '',
    });
    setIsEditOpen(true);
  };

  const handleEditSave = async () => {
    if (!editingVideo) return;
    if (!editingVideo.title.trim() || !editingVideo.videoUrl.trim()) {
      toast.error('Title and YouTube URL are required');
      return;
    }

    try {
      if (editingVideo.id) {
        await updateTraining({
          id: editingVideo.id,
          title: editingVideo.title,
          description: editingVideo.description,
          videoUrl: editingVideo.videoUrl,
        }).unwrap();
        toast.success('Training video updated');
      } else {
        await createTraining({
          title: editingVideo.title,
          description: editingVideo.description,
          videoUrl: editingVideo.videoUrl,
        }).unwrap();
        toast.success('Training video added');
      }
      setIsEditOpen(false);
      setEditingVideo(null);
    } catch (err) {
      toast.error('Failed to save training video');
    }
  };

  const handleRemove = async () => {
    if (!removeId) return;
    try {
      await deleteTraining(removeId).unwrap();
      toast.success('Training video removed');
      setRemoveId(null);
    } catch {
      toast.error('Failed to remove training video');
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      await toggleStatus(id).unwrap();
      toast.success('Status toggled');
    } catch {
      toast.error('Failed to toggle status');
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput);
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
              {/* Search + Filters + Add */}
              <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Video className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-[#151515]">
                      Training Videos
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      {total} video{total !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <form onSubmit={handleSearch} className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      placeholder="Search videos..."
                      className="h-9 w-40 sm:w-52 rounded-xl pl-9 text-sm"
                    />
                  </form>
                  <select
                    value={isActiveFilter === undefined ? '' : isActiveFilter ? 'true' : 'false'}
                    onChange={(e) => {
                      setPage(1);
                      setIsActiveFilter(e.target.value === '' ? undefined : e.target.value === 'true');
                    }}
                    className="h-9 rounded-xl border border-input bg-background px-3 text-sm"
                  >
                    <option value="">All</option>
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                  <Button
                    onClick={openAdd}
                    className="h-9 px-4 rounded-xl bg-primary text-white hover:bg-primary/90 text-sm"
                  >
                    <Plus className="h-4 w-4 mr-1.5" />
                    Add Video
                  </Button>
                </div>
              </div>

              {/* Loading */}
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={i}
                      className="bg-white rounded-xl border border-[#ececec] overflow-hidden flex flex-col"
                    >
                      <Skeleton className="aspect-video rounded-none" />
                      <div className="p-4 flex flex-col flex-1 gap-2">
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-1/2" />
                        <div className="flex items-center justify-between pt-3 border-t border-[#ececec] mt-auto">
                          <Skeleton className="h-4 w-24" />
                          <div className="flex gap-1">
                            <Skeleton className="h-7 w-14 rounded-md" />
                            <Skeleton className="h-7 w-20 rounded-md" />
                            <Skeleton className="h-7 w-16 rounded-md" />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  {/* Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {videos.map((video) => (
                      <div
                        key={video._id}
                        className="bg-white rounded-xl border border-[#ececec] overflow-hidden group transition-shadow hover:shadow-md flex flex-col"
                      >
                        <div className="relative aspect-video bg-gray-100 shrink-0">
                          <img
                            src={getYoutubeThumbnail(video.videoUrl)}
                            alt={video.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                'https://placehold.co/640x360/16610E/FFFFFF?text=No+Thumbnail';
                            }}
                          />
                          <a
                            href={video.videoUrl}
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
                                ROUTES.TRAINING_CENTER + '/' + video._id,
                              )
                            }
                            className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity w-full cursor-pointer"
                          >
                            <div className="h-14 w-14 rounded-full bg-white/90 flex items-center justify-center pointer-events-none">
                              <Play className="h-6 w-6 text-[#151515] ml-0.5" />
                            </div>
                          </button>
                          {/* Active badge */}
                          <div className="absolute top-2 left-2">
                            {video.isActive ? (
                              <span className="inline-flex items-center gap-1 px-2 h-6 rounded-full bg-green-500/80 backdrop-blur-sm text-xs font-medium text-white">
                                <BadgeCheck className="h-3 w-3" />
                                Active
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 h-6 rounded-full bg-red-500/80 backdrop-blur-sm text-xs font-medium text-white">
                                <XCircle className="h-3 w-3" />
                                Inactive
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="p-4 flex flex-col flex-1">
                          <div className="flex-1">
                            <h3 className="font-semibold text-[#151515] text-base line-clamp-1">
                              {video.title}
                            </h3>
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                              {video.description}
                            </p>
                          </div>
                          <div className="flex items-center justify-between pt-3 border-t border-[#ececec]">
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <Calendar className="h-3.5 w-3.5" />
                              {format(
                                new Date(video.createdAt),
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
                                onClick={() => handleToggleStatus(video._id)}
                                className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-md text-xs font-medium bg-[#f5f5f5] text-[#374151] hover:bg-amber-50 hover:text-amber-600 transition-colors"
                              >
                                {video.isActive ? 'Deactivate' : 'Activate'}
                              </button>
                              <button
                                type="button"
                                onClick={() => setRemoveId(video._id)}
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

                  {/* Empty state */}
                  {videos.length === 0 && (
                    <div className="bg-white rounded-xl p-6 sm:p-12 text-center border border-[#ececec]">
                      <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                        <Video className="h-8 w-8 text-primary" />
                      </div>
                      <h3 className="text-lg font-semibold text-[#151515] mb-2">
                        No training videos
                      </h3>
                      <p className="text-muted-foreground text-sm mb-4">
                        {search || isActiveFilter !== undefined
                          ? 'No videos match your search criteria'
                          : 'Add your first training video to get started'}
                      </p>
                      {!search && isActiveFilter === undefined && (
                        <Button
                          onClick={openAdd}
                          className="h-10 px-4 rounded-xl bg-primary text-white hover:bg-primary/90"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Video
                        </Button>
                      )}
                    </div>
                  )}

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-6 pb-2 flex-wrap">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={page <= 1 || isFetching}
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        className="rounded-xl h-9"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      {getPageNumbers(page, totalPages).map((p, i) =>
                        p === 'ellipsis' ? (
                          <span
                            key={`e-${i}`}
                            className="px-1 text-muted-foreground select-none"
                          >
                            ...
                          </span>
                        ) : (
                          <Button
                            key={p}
                            variant={p === page ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setPage(p)}
                            className={`rounded-xl h-9 min-w-9 ${
                              p === page
                                ? 'bg-primary text-white'
                                : ''
                            }`}
                          >
                            {p}
                          </Button>
                        ),
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={page >= totalPages || isFetching}
                        onClick={() =>
                          setPage((p) => Math.min(totalPages, p + 1))
                        }
                        className="rounded-xl h-9"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Dialog */}
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
      w-[calc(100%-2rem)] sm:w-full
    "
        >
          <div className="p-5 sm:p-7 max-h-[85vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start gap-4">
              <div
                className="
            flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center
            rounded-2xl
            bg-[#E7F1E7]
          "
              >
                <PlaySquare className="h-6 w-6 sm:h-7 sm:w-7 text-[#2E7D32]" />
              </div>

              <div>
                <h2 className="text-[22px] sm:text-[28px] font-semibold leading-none text-[#1E1E1E]">
                  {editingVideo?.id ? 'Edit Training Video' : 'Add Training Video'}
                </h2>

                <p className="mt-2 text-sm text-[#8D96A7]">
                  {editingVideo?.id
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
                    value={editingVideo?.videoUrl ?? ''}
                    onChange={(e) =>
                      setEditingVideo((prev) =>
                        prev
                          ? { ...prev, videoUrl: e.target.value }
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
                    value={editingVideo?.description ?? ''}
                    onChange={(e) =>
                      setEditingVideo((prev) =>
                        prev
                          ? { ...prev, description: e.target.value }
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
                {editingVideo?.id ? 'Save Changes' : 'Add Video'}
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

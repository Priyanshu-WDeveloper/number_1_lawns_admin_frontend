export interface TrainingVideo {
  id: string;
  title: string;
  subtitle: string;
  youtubeUrl: string;
  date: string;
}

export const mockVideos: TrainingVideo[] = [
  {
    id: '1',
    title: 'How to Mow Like a Pro',
    subtitle: 'Professional lawn mowing techniques for perfect stripes',
    youtubeUrl: 'https://www.youtube.com/watch?v=UGDY34m7sEo',
    date: '2025-01-15',
  },
  {
    id: '2',
    title: 'Seasonal Lawn Care Guide',
    subtitle: 'Complete guide to maintaining your lawn through all seasons',
    youtubeUrl: 'https://www.youtube.com/watch?v=kISaEj476U4',
    date: '2025-02-20',
  },
  {
    id: '3',
    title: 'Weed Control Masterclass',
    subtitle: 'Identify and eliminate common lawn weeds effectively',
    youtubeUrl: 'https://www.youtube.com/watch?v=g0zwGGoK0NY',
    date: '2025-03-10',
  },
  {
    id: '4',
    title: 'Irrigation System Setup',
    subtitle: 'Step-by-step guide to installing and maintaining sprinklers',
    youtubeUrl: 'https://www.youtube.com/watch?v=c-lg-vx0Dtg',
    date: '2025-04-05',
  },
  {
    id: '5',
    title: 'Fertilization Best Practices',
    subtitle: 'When and how to fertilize for a lush green lawn',
    youtubeUrl: 'https://www.youtube.com/watch?v=88RnOSqBxl0',
    date: '2025-04-18',
  },
  {
    id: '6',
    title: 'Customer Service Excellence',
    subtitle: 'Building strong relationships with your lawn care clients',
    youtubeUrl: 'https://www.youtube.com/watch?v=zjiyhlF1C8U',
    date: '2025-05-01',
  },
];

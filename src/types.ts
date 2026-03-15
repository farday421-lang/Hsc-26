export type Subject = 
  | 'Bangla'
  | 'English'
  | 'ICT'
  | 'Higher Math 1st Paper'
  | 'Higher Math 2nd Paper'
  | 'Physics 1st Paper'
  | 'Physics 2nd Paper'
  | 'Chemistry 1st Paper'
  | 'Chemistry 2nd Paper';

export type ProgressState = 'Not Started' | 'Half Completed' | 'Completed';

export interface ClassItem {
  id: string;
  title: string;
  subject: Subject;
  youtubeUrl: string;
  pdfUrl?: string;
  dateAdded: string;
  progress: ProgressState;
  isBookmarked: boolean;
  lastWatchedAt?: string;
  lastPosition?: number; // in seconds
}

export interface UserData {
  username: string;
  classes: ClassItem[];
  totalStudyHours: number;
  lastActiveDate: string;
}

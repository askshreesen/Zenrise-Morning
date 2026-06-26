export type MoodType = 'excellent' | 'happy' | 'neutral' | 'sad' | 'exhausted';

export interface Habit {
  id: string;
  name: string;
  icon: string;
  createdAt: string;
  logs: string[]; // ISO Date strings (YYYY-MM-DD) when completed
}

export interface Goal {
  id: string;
  text: string;
  completed: boolean;
  date: string; // YYYY-MM-DD
}

export interface JournalEntry {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  content: string; // Markdown text
  gratitudeAnswers: string[]; // 3 gratitude prompt answers
  tags: string[];
  mood: MoodType | '';
}

export interface MoodLog {
  id: string;
  date: string; // YYYY-MM-DD
  mood: MoodType;
  note: string;
}

export interface HealthLog {
  date: string; // YYYY-MM-DD
  water: number; // ml
  sleep: number; // hours
  exercise: number; // minutes
  meditation: number; // minutes
  steps: number;
  screenTime: number; // hours
}

export interface Quote {
  id: number;
  text: string;
  author: string;
  category: string;
}

export interface Affirmation {
  id: string;
  text: string;
  isCustom: boolean;
}

export interface DashboardState {
  habits: Habit[];
  goals: Goal[];
  entries: JournalEntry[];
  moods: MoodLog[];
  health: Record<string, HealthLog>; // keyed by date (YYYY-MM-DD)
  theme: string;
  particleEffect: string;
  fontSize: 'sm' | 'md' | 'lg';
  reducedMotion: boolean;
  favoriteQuotes: number[];
  favoriteAffirmations: string[];
  customAffirmations: string[];
  weatherCity: string;
}

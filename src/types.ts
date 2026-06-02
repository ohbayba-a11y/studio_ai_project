export type WorkoutType = '수영' | '홈트' | '사이클' | '걷기' | '헬스장';

export interface BaseWorkout {
  id: string;
  date: string;
  type: WorkoutType;
  condition: number; // 1-10
  duration: number; // minutes (calculated or input)
  calories: number; // estimated
  workoutNote?: string;
  bodyNote?: string;
}

export interface SwimmingWorkout extends BaseWorkout {
  type: '수영';
  distance: number; // meters
  lanes: number;
  stroke: string;
}

export interface HomeTrainingWorkout extends BaseWorkout {
  type: '홈트';
  exerciseName: string;
  sets: number;
  reps: number;
}

export interface CyclingWorkout extends BaseWorkout {
  type: '사이클';
  distance: number; // km
  duration: number; // minutes
}

export interface WalkingWorkout extends BaseWorkout {
  type: '걷기';
  steps: number;
  duration: number; // minutes
}

export interface GymWorkout extends BaseWorkout {
  type: '헬스장';
  bodyPart: string;
  exercise: string;
  weight: number; // kg
  sets: number;
  reps: number;
}

export type WorkoutLog = SwimmingWorkout | HomeTrainingWorkout | CyclingWorkout | WalkingWorkout | GymWorkout;

export interface FavoriteTemplate {
  id: string;
  name: string;
  type: WorkoutType;
  condition: number;
  formData: any;
}

export const WORKOUT_TYPES: WorkoutType[] = ['수영', '홈트', '사이클', '걷기', '헬스장'];

export const CALORIE_METS: Record<WorkoutType, number> = {
  '수영': 8,
  '홈트': 5,
  '사이클': 7.5,
  '걷기': 3.5,
  '헬스장': 6,
};

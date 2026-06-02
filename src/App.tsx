/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  Trash2, 
  Activity, 
  Calendar as CalendarIcon, 
  TrendingUp, 
  Award, 
  AlertCircle, 
  Download, 
  RefreshCcw,
  Waves,
  Home,
  Bike,
  Footprints,
  Dumbbell,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Sparkles,
  MessageCircle,
  Brain,
  User,
  Check,
  Target,
  Trophy,
  Flame,
  Zap,
  Lock,
  Settings,
  X,
  Share2,
  Camera,
  Sun,
  Moon
} from 'lucide-react';
import { 
  format, 
  startOfWeek, 
  endOfWeek, 
  isWithinInterval, 
  subDays, 
  parseISO, 
  differenceInDays,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  addMonths,
  subMonths,
  isSameMonth
} from 'date-fns';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { cn } from './lib/utils';
import { 
  WorkoutLog, 
  WorkoutType, 
  WORKOUT_TYPES, 
  CALORIE_METS,
  FavoriteTemplate
} from './types';

// Constants
const NEON_GREEN = '#adff2f';
const CHARCOAL = '#333333';
const COLORS = [NEON_GREEN, '#4ade80', '#22c55e', '#16a34a', '#15803d'];

// Dropdown Helper & Options Constants
const generateRangeOptions = (start: number, end: number, step: number) => {
  const options = [];
  for (let i = start; i <= end; i += step) {
    options.push({ value: i.toString(), label: i.toLocaleString() });
  }
  return options;
};

const DURATION_OPTIONS = [
  ...generateRangeOptions(5, 60, 5),
  ...generateRangeOptions(70, 180, 10)
];

const SWIM_DISTANCE_OPTIONS = [
  ...generateRangeOptions(100, 1000, 100),
  ...generateRangeOptions(1200, 3000, 200),
  ...generateRangeOptions(3500, 5000, 500)
];

const SWIM_LANES_OPTIONS = generateRangeOptions(1, 40, 1);

const SWIM_STROKE_OPTIONS = [
  { value: '자유형', label: '자유형 (Freestyle)' },
  { value: '평영', label: '평영 (Breaststroke)' },
  { value: '배영', label: '배영 (Backstroke)' },
  { value: '접영', label: '접영 (Butterfly)' },
  { value: '개인혼영', label: '개인혼영 (Individual Medley)' },
  { value: '혼합', label: '영법 혼합 (Mixed)' }
];

const HOMET_SETS_OPTIONS = generateRangeOptions(1, 10, 1);
const HOMET_REPS_OPTIONS = [
  ...generateRangeOptions(5, 30, 5),
  ...generateRangeOptions(40, 100, 10)
];

const CYCLE_DISTANCE_OPTIONS = [
  ...generateRangeOptions(1, 10, 1),
  ...generateRangeOptions(12, 30, 2),
  ...generateRangeOptions(35, 100, 5)
];

const WALK_STEPS_OPTIONS = [
  ...generateRangeOptions(1000, 10000, 1000),
  ...generateRangeOptions(12000, 30000, 2000)
];

const GYM_BODYPART_OPTIONS = [
  { value: '가슴', label: '가슴 (Chest)' },
  { value: '등', label: '등 (Back)' },
  { value: '하체', label: '하체 (Legs)' },
  { value: '어깨', label: '어깨 (Shoulders)' },
  { value: '팔', label: '팔 (Arms)' },
  { value: '코어/복근', label: '코어/복근 (Core/Abs)' },
  { value: '전신', label: '전신 (Full Body)' }
];

const GYM_EXERCISE_OPTIONS = [
  { value: '스쿼트', label: '스쿼트 (Squat)' },
  { value: '데드리프트', label: '데드리프트 (Deadlift)' },
  { value: '벤치프레스', label: '벤치프레스 (Bench Press)' },
  { value: '숄더프레스', label: '숄더프레스 (Shoulder Press)' },
  { value: '랫풀다운', label: '랫풀다운 (Lat Pulldown)' },
  { value: '레그프레스', label: '레그프레스 (Leg Press)' },
  { value: '레그컬', label: '레그컬 (Leg Curl)' },
  { value: '바이셉스 컬', label: '바이셉스 컬 (Bicep Curl)' },
  { value: '트라이셉스 익스텐션', label: '트라이셉스 푸시다운' },
  { value: '사이드 레터럴 레이즈', label: '사이드 레터럴 레이즈' },
  { value: '크런치', label: '크런치 / 플랭크' },
  { value: '기타 덤벨/머신', label: '기타 운동 기구' }
];

const GYM_WEIGHT_OPTIONS = [
  { value: '0', label: '맨몸 (Bodyweight)' },
  ...generateRangeOptions(2, 20, 2),
  ...generateRangeOptions(25, 100, 5),
  ...generateRangeOptions(110, 200, 10)
];

const WEIGHT_OPTIONS = (() => {
  const opts = [];
  for (let w = 35; w <= 140; w++) {
    opts.push({ value: w.toString(), label: w.toString() });
  }
  return opts;
})();

const AGE_GROUP_OPTIONS = [
  { value: '10대', label: '10대 (청소년)' },
  { value: '20대', label: '20대' },
  { value: '30대', label: '30대' },
  { value: '40대', label: '40대' },
  { value: '50대', label: '50대' },
  { value: '60대 이상', label: '60대 이상' }
];

const GENDER_OPTIONS = [
  { value: '남성', label: '남성 (Male)' },
  { value: '여성', label: '여성 (Female)' },
  { value: '기타', label: '기타 (Other)' }
];

const GOAL_OPTIONS = [
  { value: '건강', label: '💪 건강해지기' },
  { value: '다이어트', label: '🔥 살빼기' },
  { value: '힐링', label: '🧘 힐링하기' }
];

interface Badge {
  id: string;
  name: string;
  description: string;
  requirement: string;
  unlocked: boolean;
  iconName: 'Award' | 'Trophy' | 'Flame' | 'Zap' | 'Sparkles' | 'Activity';
  colorClass: string;
}

export default function App() {
  const [logs, setLogs] = useState<WorkoutLog[]>([]);
  const [selectedType, setSelectedType] = useState<WorkoutType>('걷기');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [condition, setCondition] = useState(7);
  const [showNotification, setShowNotification] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [mood, setMood] = useState('');
  const [aiRecommendation, setAiRecommendation] = useState<{ text: string, type: 'rest' | 'workout' | 'encouragement' } | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiHealthAnalysis, setAiHealthAnalysis] = useState<{ status: string, icon: string, color: string, msg: string, isFallback?: boolean } | null>(null);
  const [isHealthLoading, setIsHealthLoading] = useState(false);
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);
  const [showHealthDetail, setShowHealthDetail] = useState<boolean>(false);

  // Physical profile states
  const [ageGroup, setAgeGroup] = useState<string>('30대');
  const [gender, setGender] = useState<string>('남성');
  const [userWeight, setUserWeight] = useState<number>(75);
  const [workoutGoal, setWorkoutGoal] = useState<string>('건강');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  const [shareImageSrc, setShareImageSrc] = useState<string | null>(null);
  const [isGeneratingShareImage, setIsGeneratingShareImage] = useState<boolean>(false);

  // Form states
  const [formData, setFormData] = useState<any>({});
  const [favorites, setFavorites] = useState<FavoriteTemplate[]>([]);
  const [favoriteName, setFavoriteName] = useState<string>('');
  const [theme, setTheme] = useState<'default' | 'dark' | 'light'>('default');
  const [isFormExpanded, setIsFormExpanded] = useState<boolean>(true);
  const [isBadgesExpanded, setIsBadgesExpanded] = useState<boolean>(true);

  // Load data
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isLargeScreen = window.innerWidth > 1024;
      setIsFormExpanded(isLargeScreen);
      setIsBadgesExpanded(isLargeScreen);
    }
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('workout_logs');
    if (saved) {
      try {
        setLogs(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse logs', e);
      }
    }
    const savedTheme = localStorage.getItem('workout_theme');
    if (savedTheme === 'default' || savedTheme === 'dark' || savedTheme === 'light') {
      setTheme(savedTheme);
    }
    const savedFavorites = localStorage.getItem('workout_favorites');
    if (savedFavorites) {
      try {
        setFavorites(JSON.parse(savedFavorites));
      } catch (e) {
        console.error('Failed to parse favorites', e);
      }
    }
    const savedProfile = localStorage.getItem('workout_profile_image');
    if (savedProfile) {
      setProfileImage(savedProfile);
    }

    // Load physical profile
    const savedAge = localStorage.getItem('workout_profile_ageGroup');
    if (savedAge) setAgeGroup(savedAge);
    const savedGender = localStorage.getItem('workout_profile_gender');
    if (savedGender) setGender(savedGender);
    const savedWeight = localStorage.getItem('workout_profile_weight');
    if (savedWeight) setUserWeight(Number(savedWeight));
    const savedGoal = localStorage.getItem('workout_profile_goal');
    if (savedGoal) setWorkoutGoal(savedGoal);
  }, []);

  // Save data
  useEffect(() => {
    localStorage.setItem('workout_logs', JSON.stringify(logs));
    
    // Check for 3+ days inactivity
    if (logs.length > 0) {
      const lastLogDate = new Date(Math.max(...logs.map(l => new Date(l.date).getTime())));
      if (differenceInDays(new Date(), lastLogDate) >= 3) {
        setShowNotification(true);
      } else {
        setShowNotification(false);
      }
    } else {
      setShowNotification(true);
    }
    
    // Reset AI Health Analysis on logs shift to prompt a refresh
    setAiHealthAnalysis(null);
  }, [logs]);

  useEffect(() => {
    if (profileImage) {
      localStorage.setItem('workout_profile_image', profileImage);
    }
  }, [profileImage]);

  useEffect(() => {
    localStorage.setItem('workout_profile_ageGroup', ageGroup);
    localStorage.setItem('workout_profile_gender', gender);
    localStorage.setItem('workout_profile_weight', userWeight.toString());
    localStorage.setItem('workout_profile_goal', workoutGoal);
  }, [ageGroup, gender, userWeight, workoutGoal]);

  useEffect(() => {
    localStorage.setItem('workout_favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('workout_theme', theme);
  }, [theme]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const getAIRecommendation = async () => {
    if (!mood.trim()) return;
    
    setIsAiLoading(true);
    try {
      const response = await fetch("/api/gemini/recommendation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mood })
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || `Server returned status ${response.status}`);
      }
      setAiRecommendation(result);
    } catch (error: any) {
      console.error("AI Recommendation Error:", error);
      let errMsg = error.message || "일시적인 지연이 발생했습니다.";
      if (errMsg.includes("denied access") || errMsg.includes("PERMISSION_DENIED")) {
        errMsg = "현재 사용 중인 Gemini API 키의 Google Cloud Project 접근이 거부되었습니다. 좌측 하단 'Settings > Secrets' 메뉴 또는 .env 파일에서 활성화된 올바른 API 키로 교체해 주세요.";
      }
      setAiRecommendation({ 
        text: `오류 안내: ${errMsg}`, 
        type: 'encouragement' 
      });
    } finally {
      setIsAiLoading(false);
    }
  };

  const getAIHealthAnalysis = async () => {
    setIsHealthLoading(true);
    try {
      const response = await fetch("/api/gemini/health-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          weeklyFrequency: weeklyStats.frequency,
          weeklyDuration: weeklyStats.totalTime,
          weeklyCalories: weeklyStats.totalCalories,
          workoutLogs: logs.slice(0, 5)
        })
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || `Server returned status ${response.status}`);
      }
      setAiHealthAnalysis(result);
    } catch (error: any) {
      console.error("AI Health Analysis Error:", error);
      let errMsg = error.message || "일시적인 지연이 발생했습니다.";
      if (errMsg.includes("denied access") || errMsg.includes("PERMISSION_DENIED")) {
        errMsg = "현재 사용 중인 Gemini API 키의 Google Cloud Project 접근이 거부되었습니다. 'Settings > Secrets'에서 정상적인 API 키로 설정해 주시면 완벽한 분석을 받아보실 수 있습니다.";
      }
      setAiHealthAnalysis({
        status: "오류",
        icon: "⚠️",
        color: "text-red-500",
        msg: `건강 분석 오류: ${errMsg}`
      });
    } finally {
      setIsHealthLoading(false);
    }
  };

  const handleAddRecord = () => {
    const duration = Number(formData.duration || 30);
    const weight = userWeight; // Use active user weight for calorie calculation
    const met = CALORIE_METS[selectedType];
    const calories = Math.round((met * 3.5 * weight * duration) / 200);

    const newLog: WorkoutLog = {
      id: crypto.randomUUID(),
      date,
      type: selectedType,
      condition,
      duration,
      calories,
      ...formData
    };

    setLogs(prev => [newLog, ...prev]);
    setFormData({});
    // Reset specific fields if needed
  };

  const getAutoTemplateName = (type: WorkoutType, data: any) => {
    if (type === '수영') {
      return `🏊 ${data.stroke || '수영'} ${data.distance ? `${data.distance}m` : ''}`.trim();
    } else if (type === '홈트') {
      return `🏠 ${data.exerciseName || '홈트레이닝'} ${data.sets ? `${data.sets}세트` : ''}`.trim();
    } else if (type === '사이클') {
      return `🚴 사이클 ${data.distance ? `${data.distance}km` : ''}`.trim();
    } else if (type === '걷기') {
      return `🚶 걷기 ${data.steps ? `${data.steps}걸음` : ''}`.trim();
    } else if (type === '헬스장') {
      return `💪 ${data.bodyPart || '헬스'} ${data.exercise || ''}`.trim();
    }
    return `⭐ ${type} 루틴`;
  };

  const handleAddFavorite = () => {
    const autoname = getAutoTemplateName(selectedType, formData);
    const nameToUse = favoriteName.trim() || autoname;

    const newFav: FavoriteTemplate = {
      id: crypto.randomUUID(),
      name: nameToUse,
      type: selectedType,
      condition,
      formData: { ...formData }
    };

    setFavorites(prev => [newFav, ...prev]);
    setFavoriteName('');
  };

  const handleLoadFavorite = (template: FavoriteTemplate) => {
    setSelectedType(template.type);
    setCondition(template.condition);
    setFormData({ ...template.formData });
  };

  const handleDeleteFavorite = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setFavorites(prev => prev.filter(f => f.id !== id));
  };

  const handleReset = () => {
    if (window.confirm('모든 데이터를 초기화하시겠습니까?')) {
      setLogs([]);
      localStorage.removeItem('workout_logs');
    }
  };

  const loadExampleData = () => {
    const exampleLogs: WorkoutLog[] = [];
    const types: WorkoutType[] = ['수영', '홈트', '사이클', '걷기', '헬스장'];
    
    for (let i = 0; i < 7; i++) {
      const d = format(subDays(new Date(), i), 'yyyy-MM-dd');
      const type = types[Math.floor(Math.random() * types.length)];
      const duration = 30 + Math.floor(Math.random() * 60);
      const met = CALORIE_METS[type];
      const calories = Math.round((met * 3.5 * userWeight * duration) / 200);
      
      const base = {
        id: crypto.randomUUID(),
        date: d,
        type,
        condition: 5 + Math.floor(Math.random() * 5),
        duration,
        calories,
      };

      let specific = {};
      if (type === '수영') specific = { distance: 1000, lanes: 20, stroke: '자유형' };
      if (type === '홈트') specific = { exerciseName: '푸쉬업', sets: 3, reps: 15 };
      if (type === '사이클') specific = { distance: 15, duration };
      if (type === '걷기') specific = { steps: 8000, duration };
      if (type === '헬스장') specific = { bodyPart: '하체', exercise: '스쿼트', weight: 60, sets: 4, reps: 12 };

      exampleLogs.push({ ...base, ...specific } as WorkoutLog);
    }
    setLogs(exampleLogs);
  };

  // Stats Calculations
  const weeklyStats = useMemo(() => {
    const start = startOfWeek(new Date(), { weekStartsOn: 1 });
    const end = endOfWeek(new Date(), { weekStartsOn: 1 });
    
    const weekLogs = logs.filter(l => isWithinInterval(parseISO(l.date), { start, end }));
    
    const totalTime = weekLogs.reduce((acc, curr) => acc + curr.duration, 0);
    const totalCalories = weekLogs.reduce((acc, curr) => acc + curr.calories, 0);
    const frequency = weekLogs.length;

    const distribution = WORKOUT_TYPES.map(type => ({
      name: type,
      value: weekLogs.filter(l => l.type === type).length
    })).filter(d => d.value > 0);

    return { totalTime, totalCalories, frequency, distribution };
  }, [logs]);

  const healthStatus = useMemo(() => {
    const freq = weeklyStats.frequency;
    if (freq < 1) return { status: '적신호', icon: '🚨', color: 'text-red-500', msg: '활동량이 너무 부족합니다. 가벼운 걷기부터 시작해보세요!' };
    if (freq <= 3) return { status: '보통', icon: '🟡', color: 'text-yellow-500', msg: '꾸준히 노력 중이시네요. 조금만 더 빈도를 높여볼까요?' };
    if (freq <= 5) return { status: '좋음', icon: '🟢', color: 'text-neon-green', msg: '아주 훌륭한 운동 습관을 가지고 계십니다. 신체 활력이 높습니다.' };
    return { status: '최고', icon: '✨', color: 'text-cyan-400', msg: '완벽한 자기관리! 다만 근육 회복을 위한 휴식도 잊지 마세요.' };
  }, [weeklyStats.frequency]);

  const goalMetrics = useMemo(() => {
    let frequencyGoal = 3;
    let timeGoal = 150;
    let calorieGoal = Math.round(userWeight * 15);
    let label = '건강해지기';
    let description = '일정한 활력을 유지하고 기초 심폐 기관과 근밀도를 단단히 수호하는 기초 건강 케어 목표입니다.';
    let icon = '💪';

    if (workoutGoal === '다이어트') {
      frequencyGoal = 4;
      timeGoal = 240;
      calorieGoal = Math.round(userWeight * 28);
      label = '체중 감량 (살빼기)';
      description = '체지방 연소 효율을 극대화하여 체지방 감량 및 근육 선명도를 올리는 무산소/유산소 집중 목표입니다.';
      icon = '🔥';
    } else if (workoutGoal === '힐링') {
      frequencyGoal = 2;
      timeGoal = 90;
      calorieGoal = Math.round(userWeight * 8);
      label = '스트레스 해소 (힐링하기)';
      description = '몸에 무리를 주지 않고 피로를 최소화하며 심신 안정 및 하루 스트레스를 씻어내는 릴랙스 목표입니다.';
      icon = '🧘';
    }

    return { frequencyGoal, timeGoal, calorieGoal, label, description, icon };
  }, [workoutGoal, userWeight]);

  const totalGoalProgress = useMemo(() => {
    const timeProgress = Math.min(100, (weeklyStats.totalTime / goalMetrics.timeGoal) * 100);
    const calorieProgress = Math.min(100, (weeklyStats.totalCalories / goalMetrics.calorieGoal) * 100);
    const freqProgress = Math.min(100, (weeklyStats.frequency / goalMetrics.frequencyGoal) * 100);
    return Math.round((timeProgress + calorieProgress + freqProgress) / 3);
  }, [weeklyStats, goalMetrics]);

  const progressData = useMemo(() => {
    // Last 7 days trend
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const d = format(subDays(new Date(), i), 'yyyy-MM-dd');
      const dayLogs = logs.filter(l => l.date === d);
      data.push({
        date: format(subDays(new Date(), i), 'MM/dd'),
        time: dayLogs.reduce((acc, curr) => acc + curr.duration, 0),
        calories: dayLogs.reduce((acc, curr) => acc + curr.calories, 0),
      });
    }
    return data;
  }, [logs]);

  const badges = useMemo<Badge[]>(() => {
    const totalCount = logs.length;
    const totalTime = logs.reduce((acc, curr) => acc + curr.duration, 0);
    const weeklyCalories = weeklyStats.totalCalories;
    const weeklyMinutes = weeklyStats.totalTime;
    
    // Days workout completed in the current week
    const currentWeekLogs = logs.filter(l => {
      const start = startOfWeek(new Date(), { weekStartsOn: 1 });
      const end = endOfWeek(new Date(), { weekStartsOn: 1 });
      return isWithinInterval(parseISO(l.date), { start, end });
    });
    
    const uniqueDaysThisWeek = new Set(currentWeekLogs.map(l => l.date)).size;
    const maxCondition = currentWeekLogs.length > 0 ? Math.max(...currentWeekLogs.map(l => l.condition)) : 0;

    return [
      {
        id: 'first_step',
        name: '첫걸음의 기적',
        description: '피트니스 저널에 생애 첫 운동 일지를 무사히 남겼습니다.',
        requirement: '전체 로그 1개 이상 작성',
        unlocked: totalCount >= 1,
        iconName: 'Award',
        colorClass: 'cyan'
      },
      {
        id: 'calorie_burner',
        name: '칼로리 분쇄기',
        description: '이번 주 트레이닝으로 누적 1,000 kcal를 돌파했습니다.',
        requirement: `주간 칼로리 ${weeklyCalories} / 1000 kcal`,
        unlocked: weeklyCalories >= 1000,
        iconName: 'Flame',
        colorClass: 'orange'
      },
      {
        id: 'goal_slayer',
        name: '한계 돌파',
        description: '권장 운동량 및 목표 칼로리 대비 100%를 정복했습니다.',
        requirement: `목표 달성률 ${totalGoalProgress}% / 100%`,
        unlocked: totalGoalProgress >= 100,
        iconName: 'Trophy',
        colorClass: 'yellow'
      },
      {
        id: 'streak_builder',
        name: '끈기의 철인',
        description: '일회성 운동에 그치지 않고 이번 주 3일 이상 지속했습니다.',
        requirement: `주간 일수 ${uniqueDaysThisWeek} / 3일`,
        unlocked: uniqueDaysThisWeek >= 3,
        iconName: 'Activity',
        colorClass: 'emerald'
      },
      {
        id: 'limitless',
        name: '에너지 비스트',
        description: '한 주간 집중 180분 이상 또는 단일 60분 세션을 돌파했습니다.',
        requirement: `주간 시간 ${weeklyMinutes} / 180분 (또는 단일 60분 달성)`,
        unlocked: weeklyMinutes >= 180 || logs.some(l => l.duration >= 60),
        iconName: 'Zap',
        colorClass: 'purple'
      },
      {
        id: 'zen_soul',
        name: '이너 피스 마스터',
        description: '스트레스를 완벽히 씻어내어 컨디션 지수 9점 이상을 기록했습니다.',
        requirement: `달성 최고 컨디션 ${maxCondition} / 9점`,
        unlocked: maxCondition >= 9,
        iconName: 'Sparkles',
        colorClass: 'pink'
      }
    ];
  }, [logs, weeklyStats, totalGoalProgress]);

  const renderBadgeIcon = (iconName: string, size = 20) => {
    switch (iconName) {
      case 'Award': return <Award size={size} />;
      case 'Trophy': return <Trophy size={size} />;
      case 'Flame': return <Flame size={size} />;
      case 'Zap': return <Zap size={size} />;
      case 'Sparkles': return <Sparkles size={size} />;
      case 'Activity': return <Activity size={size} />;
      default: return <Award size={size} />;
    }
  };

  // --- Confetti Achievement Effect Setup ---
  const initialLoadRef = React.useRef<boolean>(false);
  const prevProgressRef = React.useRef<number>(0);
  const prevBadgeCountRef = React.useRef<number>(0);

  // Confetti Cannons: Perfect double-cannon side bursts for clearing goals (100%+)
  const triggerGoalConfetti = () => {
    const duration = 2.5 * 1000;
    const end = Date.now() + duration;

    (function frame() {
      // Left side burst
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.8 },
        colors: ['#adff2f', '#4ade80', '#22c55e', '#38bdf8']
      });
      // Right side burst
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.8 },
        colors: ['#adff2f', '#4ade80', '#22c55e', '#38bdf8']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    }());
  };

  // Confetti Fountain: Center rocket fireworks blast for unlocking/achieving badges
  const triggerBadgeConfetti = () => {
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#adff2f', '#fbbf24', '#f59e0b', '#ec4899', '#3b82f6'],
      scalar: 1.25,
      drift: 0.1,
      gravity: 0.95
    });
  };

  // Complete data hydration check
  useEffect(() => {
    const timer = setTimeout(() => {
      initialLoadRef.current = true;
      // Initialize states to match loaded logs so they do not trigger confetti on first load
      prevProgressRef.current = totalGoalProgress;
      prevBadgeCountRef.current = badges.filter(b => b.unlocked).length;
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  // Monitor target progression & unlocked badges structure changes
  useEffect(() => {
    if (!initialLoadRef.current) return;

    const currentBadgeCount = badges.filter(b => b.unlocked).length;

    // Trigger 1: Hit 100% target progress threshold
    if (totalGoalProgress >= 100 && prevProgressRef.current < 100) {
      triggerGoalConfetti();
    }

    // Trigger 2: Unlocked a newer milestone badge
    if (currentBadgeCount > prevBadgeCountRef.current) {
      triggerBadgeConfetti();
    }

    // Capture comparative snapshot references for subsequent runs
    prevProgressRef.current = totalGoalProgress;
    prevBadgeCountRef.current = currentBadgeCount;
  }, [totalGoalProgress, badges]);
  // --- End Confetti Setup ---

  // --- Dynamic Web Share Canvas Poster & Web Share API setup ---
  const drawRoundRect = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
    if (w < 2 * r) r = w / 2;
    if (h < 2 * r) r = h / 2;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  };

  const drawCanvasIcon = (ctx: CanvasRenderingContext2D, iconName: string, cx: number, cy: number, size: number) => {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#000000';

    if (iconName === 'Award') {
      // Ribbon lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.beginPath();
      ctx.moveTo(-10, 5);
      ctx.lineTo(-18, 30);
      ctx.lineTo(-6, 26);
      ctx.lineTo(-2, 30);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(10, 5);
      ctx.lineTo(18, 30);
      ctx.lineTo(6, 26);
      ctx.lineTo(2, 30);
      ctx.stroke();

      // Circle Base
      ctx.beginPath();
      ctx.arc(0, 0, 16, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.strokeStyle = '#000000';
      ctx.stroke();

      // Star Icon inside medallion
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        ctx.lineTo(Math.cos((18 + i * 72) * Math.PI / 180) * 8, -Math.sin((18 + i * 72) * Math.PI / 180) * 8);
        ctx.lineTo(Math.cos((54 + i * 72) * Math.PI / 180) * 3, -Math.sin((54 + i * 72) * Math.PI / 180) * 3);
      }
      ctx.closePath();
      ctx.fillStyle = '#f59e0b';
      ctx.fill();
    } 
    else if (iconName === 'Trophy') {
      ctx.strokeStyle = '#000000';
      ctx.fillStyle = '#101010';
      
      // Cup Shape drawing
      ctx.beginPath();
      ctx.moveTo(-12, -14);
      ctx.lineTo(12, -14);
      ctx.lineTo(10, 4);
      ctx.quadraticCurveTo(0, 14, -10, 4);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      
      // Stem and Base
      ctx.beginPath();
      ctx.moveTo(0, 10);
      ctx.lineTo(0, 19);
      ctx.moveTo(-9, 19);
      ctx.lineTo(9, 19);
      ctx.stroke();
      
      // Handles
      ctx.beginPath();
      ctx.arc(-14, -4, 6, -Math.PI/2, Math.PI/2, true);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(14, -4, 6, -Math.PI/2, Math.PI/2, false);
      ctx.stroke();
    } 
    else if (iconName === 'Flame') {
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.moveTo(0, 16);
      ctx.bezierCurveTo(12, 16, 15, 3, 7, -13);
      ctx.bezierCurveTo(3, -5, -4, -5, -6, -15);
      ctx.bezierCurveTo(-14, 3, -12, 16, 0, 16);
      ctx.closePath();
      ctx.fill();
    } 
    else if (iconName === 'Activity') {
      ctx.strokeStyle = '#000000';
      ctx.beginPath();
      ctx.moveTo(-20, 0);
      ctx.lineTo(-9, 0);
      ctx.lineTo(-5, -15);
      ctx.lineTo(-1, 16);
      ctx.lineTo(3, -20);
      ctx.lineTo(7, 9);
      ctx.lineTo(11, 0);
      ctx.lineTo(20, 0);
      ctx.stroke();
    } 
    else if (iconName === 'Zap') {
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.moveTo(4, -17);
      ctx.lineTo(-11, 2);
      ctx.lineTo(-2, 2);
      ctx.lineTo(-4, 17);
      ctx.lineTo(11, -2);
      ctx.lineTo(2, -2);
      ctx.closePath();
      ctx.fill();
    } 
    else if (iconName === 'Sparkles') {
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.moveTo(0, -17);
      ctx.quadraticCurveTo(0, 0, 17, 0);
      ctx.quadraticCurveTo(0, 0, 0, 17);
      ctx.quadraticCurveTo(0, 0, -17, 0);
      ctx.quadraticCurveTo(0, 0, 0, -17);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  };

  const handleShareSummary = async () => {
    setIsGeneratingShareImage(true);
    setShareImageSrc(null);
    setIsShareModalOpen(true);

    try {
      const canvas = document.createElement('canvas');
      canvas.width = 680;
      canvas.height = 1000;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // 1. Sleek neon-accent dual dark background gradient
      const grad = ctx.createLinearGradient(0, 0, 0, 1000);
      grad.addColorStop(0, '#0a0d14');
      grad.addColorStop(0.5, '#121620');
      grad.addColorStop(1, '#080a0e');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 680, 1000);

      // 2. High density ambient glow circles representing physical health energy
      ctx.globalAlpha = 0.16;
      const glow1 = ctx.createRadialGradient(100, 200, 40, 100, 200, 280);
      glow1.addColorStop(0, '#18f078');
      glow1.addColorStop(1, 'transparent');
      ctx.fillStyle = glow1;
      ctx.fillRect(0, 0, 680, 1000);

      const glow2 = ctx.createRadialGradient(560, 720, 40, 560, 720, 280);
      glow2.addColorStop(0, '#38bdf8');
      glow2.addColorStop(1, 'transparent');
      ctx.fillStyle = glow2;
      ctx.fillRect(0, 0, 680, 1000);
      ctx.globalAlpha = 1.0;

      // 3. Double physical frame panels
      ctx.strokeStyle = 'rgba(24, 240, 120, 0.16)';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(20, 20, 640, 960);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.lineWidth = 1;
      ctx.strokeRect(26, 26, 628, 948);

      // 4. Header metadata & app branding
      ctx.fillStyle = '#18f078';
      ctx.font = 'italic 900 13px system-ui, -apple-system, sans-serif';
      ctx.fillText('👟 PERSONAL WORKOUT DASHBOARD', 44, 66);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 28px system-ui, -apple-system, sans-serif';
      ctx.fillText('주간 피트니스 활동 리포트', 44, 106);

      const todayText = format(new Date(), 'yyyy년 MM월 dd일');
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.font = 'bold 12px monospace';
      ctx.fillText(`REPORT GENERATION TIMESTAMP: ${todayText}`, 44, 131);

      // Line division divider
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(44, 156);
      ctx.lineTo(636, 156);
      ctx.stroke();

      // 5. User Specs and physical details panel
      ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
      drawRoundRect(ctx, 44, 180, 592, 82, 16);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.stroke();

      // Inner profile icon back plate
      ctx.fillStyle = 'rgba(24, 240, 120, 0.1)';
      ctx.beginPath();
      ctx.arc(84, 221, 24, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(24, 240, 120, 0.3)';
      ctx.stroke();

      // Dynamic head element
      ctx.fillStyle = '#18f078';
      ctx.beginPath();
      ctx.arc(84, 215, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(84, 233, 14, Math.PI, Math.PI * 2);
      ctx.fill();

      // Text details
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 16px system-ui, -apple-system, sans-serif';
      ctx.fillText('맞춤형 인텔리전트 건강 멤버', 128, 215);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.font = 'bold 13px system-ui, -apple-system, sans-serif';
      ctx.fillText(`${gender} · ${ageGroup} · ${userWeight}kg · 목표 [${workoutGoal}]`, 128, 238);

      // VIP design status banner
      ctx.fillStyle = 'rgba(24, 240, 120, 0.14)';
      ctx.beginPath();
      drawRoundRect(ctx, 512, 205, 106, 32, 8);
      ctx.fill();
      ctx.fillStyle = '#18f078';
      ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
      ctx.fillText('FITNESS CHAMP', 526, 225);

      // 6. Statistics Grid display
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 18px system-ui, -apple-system, sans-serif';
      ctx.fillText('이번 주 목표 달성 핵심 현황', 44, 310);

      const statsCards = [
        { label: '이번 주 총 운동 소요', value: `${weeklyStats.totalTime}분`, target: `${goalMetrics.timeGoal}분`, color: '#38bdf8' },
        { label: '누적 소모 에너지', value: `${weeklyStats.totalCalories} kcal`, target: `${goalMetrics.calorieGoal} kcal`, color: '#f59e0b' },
        { label: '주간 기록 횟수', value: `${weeklyStats.totalCount}회`, target: `${goalMetrics.frequencyGoal}회`, color: '#a855f7' }
      ];

      statsCards.forEach((item, index) => {
        const x = 44 + index * 204;
        const y = 335;
        const w = 180;
        const h = 130;

        ctx.fillStyle = 'rgba(255, 255, 255, 0.02)';
        drawRoundRect(ctx, x, y, w, h, 16);
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
        ctx.fillText(item.label, x + 16, y + 32);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'black 22px system-ui, -apple-system, sans-serif';
        ctx.fillText(item.value, x + 16, y + 70);

        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.font = 'bold 11px monospace';
        ctx.fillText(`목표: ${item.target}`, x + 16, y + 105);

        // Highlight marker
        ctx.fillStyle = item.color;
        ctx.fillRect(x + 16, y + 80, 32, 3);
      });

      // 7. Large Progress Gauge
      const gy = 512;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.02)';
      drawRoundRect(ctx, 44, gy, 592, 100, 20);
      ctx.fill();
      ctx.strokeStyle = 'rgba(24, 240, 120, 0.14)';
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 15px system-ui, -apple-system, sans-serif';
      ctx.fillText('종합 주간 목표 성공률', 68, gy + 45);

      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.font = 'medium 11px system-ui, -apple-system, sans-serif';
      ctx.fillText(`물리적 피지크 조건에 기반한 달성 성공 지수`, 68, gy + 68);

      const gX = 398;
      const gY = gy + 50;
      const gW = 210;
      const gH = 12;

      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      drawRoundRect(ctx, gX, gY - 6, gW, gH, 6);
      ctx.fill();

      const activeBarW = Math.min(gW, Math.round((totalGoalProgress / 100) * gW));
      ctx.fillStyle = '#18f078';
      drawRoundRect(ctx, gX, gY - 6, activeBarW, gH, 6);
      ctx.fill();

      // Big percentage text indicator
      ctx.fillStyle = '#18f078';
      ctx.font = 'black 26px system-ui, -apple-system, sans-serif';
      ctx.fillText(`${totalGoalProgress}%`, gX - 72, gY + 4);

      // 8. Achieved Medals / Badges Section
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 18px system-ui, -apple-system, sans-serif';
      ctx.fillText('달성완료 피트니스 훈장 배지', 44, 660);

      const unlockedBadges = badges.filter(b => b.unlocked);

      if (unlockedBadges.length === 0) {
        ctx.fillStyle = 'rgba(255,255,255,0.01)';
        drawRoundRect(ctx, 44, 688, 592, 185, 20);
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.04)';
        ctx.stroke();

        ctx.fillStyle = 'rgba(255,255,255,0.35)';
        ctx.font = 'bold 14px system-ui, -apple-system, sans-serif';
        ctx.fillText('아직 획득한 훈장이 없습니다. 운동을 기록하고 첫 마일스톤에 도전해보세요! 🥊', 64, 786);
      } else {
        // Draw up to 6 badges
        unlockedBadges.slice(0, 6).forEach((badge, idx) => {
          const col = idx % 3;
          const row = Math.floor(idx / 3);
          const bx = 44 + col * 202;
          const by = 688 + row * 115;

          ctx.fillStyle = 'rgba(24, 240, 120, 0.02)';
          drawRoundRect(ctx, bx, by, 184, 100, 16);
          ctx.fill();
          ctx.strokeStyle = 'rgba(24, 240, 120, 0.08)';
          ctx.stroke();

          const colorMap: Record<string, string> = {
            cyan: '#22d3ee',
            orange: '#f97316',
            yellow: '#fbbf24',
            emerald: '#10b981',
            purple: '#a855f7',
            pink: '#ec4899',
          };
          const badgeColor = colorMap[badge.colorClass] || '#18f078';

          // Coin ring
          ctx.beginPath();
          ctx.arc(bx + 38, by + 50, 23, 0, Math.PI * 2);
          ctx.fillStyle = badgeColor;
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.5;
          ctx.stroke();

          // Render clean vectors
          drawCanvasIcon(ctx, badge.iconName, bx + 38, by + 50, 18);

          // Write titles
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 13px system-ui, -apple-system, sans-serif';
          ctx.fillText(badge.name, bx + 72, by + 45);

          ctx.fillStyle = '#18f078';
          ctx.font = 'bold 9px monospace';
          ctx.fillText('UNLOCKED', bx + 72, by + 62);
        });
      }

      // 9. Footer tagging
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.beginPath();
      ctx.moveTo(44, 915);
      ctx.lineTo(636, 915);
      ctx.stroke();

      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.font = 'mono 10px monospace';
      ctx.fillText('POWERED BY PERSONAL WORKOUT DASHBOARD', 44, 942);

      ctx.fillStyle = '#18f078';
      ctx.font = 'bold italic 11px system-ui, -apple-system, sans-serif';
      ctx.fillText('INTELLIGENT RECORDING FOR A HEALTHIER LIFE 🥊', 315, 942);

      const exportedUrl = canvas.toDataURL('image/png');
      setShareImageSrc(exportedUrl);

      // Attempt to share natively on Web Share supporting clients
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        const file = new File([blob], 'weekly-health-summary.png', { type: 'image/png' });
        if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({
              files: [file],
              title: '나의 주간 운동 리포트 👟',
              text: `이번 주 건강 목표 달성률 ${totalGoalProgress}% 완료! 🎖️ 더 건강해진 나의 운동 기록을 공유합니다.`,
            });
          } catch (sharingError: any) {
            console.warn('Native Web Share aborted or blocked:', sharingError);
          }
        }
      }, 'image/png');

    } catch (err) {
      console.error('Failed to generate high-resolution share image: ', err);
    } finally {
      setIsGeneratingShareImage(false);
    }
  };

  const calendarDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 0 });
    const end = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 0 });
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const getWorkoutIcon = (type: WorkoutType) => {
    switch (type) {
      case '수영': return <Waves size={12} />;
      case '홈트': return <Home size={12} />;
      case '사이클': return <Bike size={12} />;
      case '걷기': return <Footprints size={12} />;
      case '헬스장': return <Dumbbell size={12} />;
      default: return null;
    }
  };

  return (
    <div className={cn("min-h-screen bg-dark-bg text-white p-4 md:p-8 font-sans transition-colors duration-300", {
      "theme-default": theme === 'default',
      "theme-dark": theme === 'dark',
      "theme-light": theme === 'light'
    })}>
      {/* Dynamic Theme Style Sheet */}
      <style dangerouslySetInnerHTML={{ __html: `
        /* LIGHT THEME OVERRIDES */
        .theme-light {
          --color-dark-bg: #eceef2 !important;
          --color-card-bg: #ffffff !important;
          --color-charcoal: #e2e8f0 !important;
          --color-neon-green: #10b981 !important;
          color-scheme: light;
        }
        .theme-light, .theme-light * {
          border-color: rgba(15, 23, 42, 0.08);
        }
        .theme-light .text-white {
          color: #0f172a !important;
        }
        .theme-light .text-gray-100 {
          color: #1e293b !important;
        }
        .theme-light .text-gray-200 {
          color: #334155 !important;
        }
        .theme-light .text-gray-300 {
          color: #475569 !important;
        }
        .theme-light .text-gray-400 {
          color: #64748b !important;
        }
        .theme-light .text-gray-500 {
          color: #94a3b8 !important;
        }
        .theme-light .text-gray-650, .theme-light .text-gray-600 {
          color: #94a3b8 !important;
        }
        .theme-light .text-neon-green {
          color: #059669 !important;
        }
        .theme-light .border-white\\/5 {
          border-color: rgba(15, 23, 42, 0.08) !important;
        }
        .theme-light .border-white\\/10 {
          border-color: rgba(15, 23, 42, 0.12) !important;
        }
        .theme-light .border-white\\/20 {
          border-color: rgba(15, 23, 42, 0.2) !important;
        }
        .theme-light .bg-charcoal\\/20 {
          background-color: rgba(15, 23, 42, 0.03) !important;
        }
        .theme-light .bg-charcoal\\/30 {
          background-color: rgba(15, 23, 42, 0.04) !important;
        }
        .theme-light .bg-charcoal\\/40 {
          background-color: rgba(15, 23, 42, 0.05) !important;
        }
        .theme-light .bg-charcoal\\/65 {
          background-color: rgba(15, 23, 42, 0.06) !important;
        }
        .theme-light .bg-charcoal\\/80 {
          background-color: rgba(15, 23, 42, 0.08) !important;
        }
        .theme-light .bg-black\\/85 {
          background-color: rgba(15, 23, 42, 0.75) !important;
        }
        .theme-light .bg-card-bg\\/80 {
          background-color: rgba(255, 255, 255, 0.85) !important;
        }
        .theme-light .bg-\\[\\#0e1117\\] {
          background-color: #ffffff !important;
          border-color: rgba(15, 23, 42, 0.12) !important;
        }
        .theme-light input, .theme-light select, .theme-light textarea {
          background-color: #f1f5f9 !important;
          color: #0f172a !important;
          border-color: #cbd5e1 !important;
        }
        .theme-light input:focus, .theme-light select:focus, .theme-light textarea:focus {
          border-color: #10b981 !important;
        }
        .theme-light .bg-neon-green\\/10 {
          background-color: rgba(16, 185, 129, 0.09) !important;
        }
        .theme-light .bg-neon-green\\/20 {
          background-color: rgba(16, 185, 129, 0.16) !important;
        }
        .theme-light .border-neon-green\\/30 {
          border-color: rgba(16, 185, 129, 0.3) !important;
        }
        .theme-light .neon-glow {
          text-shadow: 0 0 10px rgba(16, 185, 129, 0.3) !important;
        }
        .theme-light .shadow-neon-green\\/5, .theme-light .shadow-neon-green\\/10 {
          box-shadow: 0 4px 20px rgba(16, 185, 129, 0.05) !important;
        }
        .theme-light .shadow-2xl {
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1) !important;
        }
        .theme-light .recharts-text {
          fill: #475569 !important;
        }
        .theme-light .recharts-layer text {
          fill: #475569 !important;
        }

        /* DARK MIDNIGHT COMPLEX OVERRIDES */
        .theme-dark {
          --color-dark-bg: #040406 !important;
          --color-card-bg: #0c0d12 !important;
          --color-charcoal: #171a22 !important;
          --color-neon-green: #38bdf8 !important;
        }
        .theme-dark .text-neon-green {
          color: #38bdf8 !important;
        }
        .theme-dark .border-neon-green\\/20 {
          border-color: rgba(56, 189, 248, 0.2) !important;
        }
        .theme-dark .border-neon-green\\/30 {
          border-color: rgba(56, 189, 248, 0.3) !important;
        }
        .theme-dark .bg-neon-green\\/10 {
          background-color: rgba(56, 189, 248, 0.09) !important;
        }
        .theme-dark .bg-neon-green\\/20 {
          background-color: rgba(56, 189, 248, 0.16) !important;
        }
        .theme-dark .neon-glow {
          text-shadow: 0 0 10px rgba(56, 189, 248, 0.4) !important;
        }
        .theme-dark .shadow-neon-green\\/5, .theme-dark .shadow-neon-green\\/10 {
          box-shadow: 0 4px 20px rgba(56, 189, 248, 0.05) !important;
        }
      ` }} />
      {/* Header & Notifications */}
      <header className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-4 md:gap-6">
            {/* Motivation Profile Section */}
            <div className="relative group shrink-0">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl border-2 border-neon-green/30 overflow-hidden bg-charcoal flex items-center justify-center shadow-lg shadow-neon-green/10 group-hover:border-neon-green transition-all">
                {profileImage ? (
                  <img src={profileImage} alt="Motivation" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <Activity className="text-gray-600" size={28} />
                )}
                <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity">
                  <Plus className="text-neon-green" size={20} />
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </label>
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 md:w-6 md:h-6 bg-neon-green rounded-full flex items-center justify-center text-black shadow-lg">
                < Award size={12} />
              </div>
            </div>

            <div>
              <h1 className="text-2xl md:text-4xl font-black italic tracking-tighter flex items-center gap-2 flex-wrap">
                <span className="text-neon-green neon-glow">👟</span>
                PERSONAL <span className="text-neon-green">WORKOUT</span> DASHBOARD
              </h1>
              <p className="text-xs md:text-sm text-gray-400 mt-1">개인 맞춤형 운동 기록 및 건강 분석</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 w-full md:w-auto items-center">
            {/* 테마 변경 컨트롤 */}
            <div className="flex items-center bg-charcoal/50 p-1 rounded-lg border border-white/5 w-full md:w-auto gap-0.5 shrink-0 select-none">
              <button
                onClick={() => setTheme('default')}
                className={cn(
                  "flex-1 md:flex-initial px-2.5 py-1.5 rounded-md text-[11px] font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer",
                  theme === 'default' 
                    ? "bg-neon-green text-black shadow-sm" 
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                )}
                title="기본 테마"
              >
                <Zap size={11} className={theme === 'default' ? 'text-black' : 'text-neon-green'} />
                <span>기본</span>
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={cn(
                  "flex-1 md:flex-initial px-2.5 py-1.5 rounded-md text-[11px] font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer",
                  theme === 'dark' 
                    ? "bg-[#38bdf8] text-black shadow-sm" 
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                )}
                title="다크 테마"
              >
                <Moon size={11} className={theme === 'dark' ? 'text-black' : 'text-sky-450'} />
                <span>다크</span>
              </button>
              <button
                onClick={() => setTheme('light')}
                className={cn(
                  "flex-1 md:flex-initial px-2.5 py-1.5 rounded-md text-[11px] font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer",
                  theme === 'light' 
                    ? "bg-[#10b981] text-white shadow-sm" 
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                )}
                title="화이트 테마"
              >
                <Sun size={11} className={theme === 'light' ? 'text-white' : 'text-emerald-500'} />
                <span>화이트</span>
              </button>
            </div>

            <button 
              onClick={loadExampleData}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-3 py-2 bg-charcoal hover:bg-charcoal/80 rounded-lg text-xs md:text-sm font-medium transition-all"
            >
              <RefreshCcw size={14} /> 예시 데이터
            </button>
            <button 
              onClick={() => window.print()}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-3 py-2 bg-charcoal hover:bg-charcoal/80 rounded-lg text-xs md:text-sm font-medium transition-all"
            >
              <Download size={14} /> PDF 저장
            </button>
            <button 
              onClick={handleShareSummary}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-3.5 py-2 bg-gradient-to-r from-neon-green/20 to-emerald-500/20 text-neon-green hover:from-neon-green/30 hover:to-emerald-500/30 border border-neon-green/30 rounded-lg text-xs md:text-sm font-bold transition-all shadow-md shadow-neon-green/5"
            >
              <Share2 size={14} className="animate-pulse" /> 성과 공유하기
            </button>
            <button 
              onClick={handleReset}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-3 py-2 bg-red-900/30 text-red-400 hover:bg-red-900/50 rounded-lg text-xs md:text-sm font-medium transition-all"
            >
              <Trash2 size={14} /> 초기화
            </button>
          </div>
        </div>

        <AnimatePresence>
          {showNotification && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mt-6 p-4 bg-neon-green/10 border border-neon-green/30 rounded-xl flex items-center gap-3 text-neon-green"
            >
              <AlertCircle size={20} />
              <span className="font-bold">운동할 시간입니다! 3일 이상 기록이 없습니다.</span>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Entry Form */}
        <section className="lg:col-span-4 space-y-6">
          {/* Compact Profile Settings Trigger Card */}
          <button
            onClick={() => setIsProfileModalOpen(true)}
            className="w-full text-left bg-card-bg hover:bg-card-bg/80 border border-white/5 rounded-2xl p-5 shadow-xl hover:shadow-neon-green/5 transition-all flex items-center justify-between group relative overflow-hidden focus:outline-none"
          >
            <div className="absolute top-0 right-0 p-3 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-300">
              <Settings size={64} className="text-neon-green" />
            </div>
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-neon-green/10 text-neon-green flex items-center justify-center shrink-0 border border-neon-green/20 group-hover:scale-105 transition-all">
                <User size={20} />
              </div>
              <div>
                <h3 className="text-sm font-black text-white group-hover:text-neon-green transition-colors flex items-center gap-1 text-left">
                  프로필 및 운동 목표 설정
                </h3>
                <p className="text-[11px] text-gray-400 mt-0.5 font-bold text-left">
                  {gender} · {ageGroup} · {userWeight}kg · {workoutGoal}
                </p>
              </div>
            </div>
            <div className="text-gray-500 group-hover:text-neon-green transition-colors font-medium text-xs flex items-center gap-1 bg-charcoal/40 px-2.5 py-1.5 rounded-lg border border-white/5 shrink-0">
              설정 <ChevronRight size={14} />
            </div>
          </button>

          <div className="bg-card-bg border border-white/5 rounded-2xl shadow-xl overflow-hidden">
            <button
              onClick={() => setIsFormExpanded(prev => !prev)}
              className="w-full text-left p-6 flex items-center justify-between hover:bg-white/[0.02] transition-colors focus:outline-none"
            >
              <h2 className="text-xl font-bold flex items-center gap-2 m-0 text-white">
                <Plus className="text-neon-green" /> 오늘의 운동 기록
              </h2>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-black tracking-wider text-gray-400 bg-charcoal/40 px-2 py-1 rounded border border-white/5 md:inline hidden">
                  {isFormExpanded ? "접기" : "기록하기 +"}
                </span>
                <div className="w-8 h-8 rounded-lg bg-charcoal/50 text-neon-green hover:text-white flex items-center justify-center border border-white/5 transition-colors">
                  {isFormExpanded ? (
                    <X size={16} className="animate-pulse" />
                  ) : (
                    <Plus size={16} />
                  )}
                </div>
              </div>
            </button>
            
            <AnimatePresence initial={false}>
              {isFormExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                  className="overflow-hidden border-t border-white/5"
                >
                  <div className="p-6 space-y-4">
                    {/* 즐겨찾기 템플릿 섹션 */}
                    <div className="border border-white/5 bg-charcoal/30 rounded-xl p-3.5 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-400 flex items-center gap-1">
                          <span className="text-amber-400">★</span> 자주 하는 운동 템플릿
                        </span>
                        <span className="text-[10px] text-gray-500 font-medium">Auto-Fill</span>
                      </div>
                      {favorites.length === 0 ? (
                        <p className="text-[11px] text-gray-500 leading-normal">
                          자주 수행하는 루틴을 아래에서 즐겨찾기로 저장하면 언제든지 원클릭으로 양식을 불러올 수 있습니다.
                        </p>
                      ) : (
                        <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
                          {favorites.map(fav => (
                            <div
                              key={fav.id}
                              onClick={() => handleLoadFavorite(fav)}
                              className="group flex items-center gap-1.5 px-3 py-1.5 bg-charcoal/65 hover:bg-neon-green/10 border border-white/10 hover:border-neon-green/40 rounded-lg text-xs font-bold text-gray-300 hover:text-white transition-all cursor-pointer select-none"
                            >
                              <span className="truncate max-w-[120px]">{fav.name}</span>
                              <button
                                onClick={(e) => handleDeleteFavorite(e, fav.id)}
                                className="opacity-40 group-hover:opacity-100 hover:text-red-400 transition-opacity p-0.5"
                                title="삭제"
                              >
                                <X size={10} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">날짜 선택</label>
                      <input 
                        type="date" 
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full bg-charcoal border border-white/10 rounded-lg px-4 py-2.5 focus:outline-none focus:border-neon-green transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">운동 종류</label>
                      <div className="grid grid-cols-3 gap-2">
                        {WORKOUT_TYPES.map(type => (
                          <button
                            key={type}
                            onClick={() => setSelectedType(type)}
                            className={cn(
                              "py-2 rounded-lg text-sm font-bold border transition-all flex flex-col items-center gap-1",
                              selectedType === type 
                                ? "bg-neon-green text-black border-neon-green" 
                                : "bg-charcoal text-gray-400 border-white/5 hover:border-white/20"
                            )}
                          >
                            {type === '수영' && <Waves size={18} />}
                            {type === '홈트' && <Home size={18} />}
                            {type === '사이클' && <Bike size={18} />}
                            {type === '걷기' && <Footprints size={18} />}
                            {type === '헬스장' && <Dumbbell size={18} />}
                            {type}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-white/5 space-y-4">
                      {/* Dynamic Fields Based on Type */}
                      {selectedType === '수영' && (
                        <>
                          <div className="grid grid-cols-2 gap-4">
                            <SelectField label="거리" value={formData.distance} onChange={v => setFormData({...formData, distance: v ? Number(v) : undefined})} options={SWIM_DISTANCE_OPTIONS} suffix="m" />
                            <SelectField label="레인 수" value={formData.lanes} onChange={v => setFormData({...formData, lanes: v ? Number(v) : undefined})} options={SWIM_LANES_OPTIONS} suffix="개" />
                          </div>
                          <SelectField label="영법" value={formData.stroke} onChange={v => setFormData({...formData, stroke: v || undefined})} options={SWIM_STROKE_OPTIONS} />
                        </>
                      )}

                      {selectedType === '홈트' && (
                        <>
                          <InputField label="종목명" type="text" placeholder="예: 푸쉬업, 스쿼트 등" value={formData.exerciseName} onChange={v => setFormData({...formData, exerciseName: v})} />
                          <div className="grid grid-cols-2 gap-4">
                            <SelectField label="세트 수" value={formData.sets} onChange={v => setFormData({...formData, sets: v ? Number(v) : undefined})} options={HOMET_SETS_OPTIONS} suffix="세트" />
                            <SelectField label="횟수" value={formData.reps} onChange={v => setFormData({...formData, reps: v ? Number(v) : undefined})} options={HOMET_REPS_OPTIONS} suffix="회" />
                          </div>
                        </>
                      )}

                      {selectedType === '사이클' && (
                        <>
                          <SelectField label="주행 거리" value={formData.distance} onChange={v => setFormData({...formData, distance: v ? Number(v) : undefined})} options={CYCLE_DISTANCE_OPTIONS} suffix="km" />
                          <SelectField label="소요 시간" value={formData.duration} onChange={v => setFormData({...formData, duration: v ? Number(v) : undefined})} options={DURATION_OPTIONS} suffix="분" />
                        </>
                      )}

                      {selectedType === '걷기' && (
                        <>
                          <SelectField label="걸음 수" value={formData.steps} onChange={v => setFormData({...formData, steps: v ? Number(v) : undefined})} options={WALK_STEPS_OPTIONS} suffix="걸음" />
                          <SelectField label="소요 시간" value={formData.duration} onChange={v => setFormData({...formData, duration: v ? Number(v) : undefined})} options={DURATION_OPTIONS} suffix="분" />
                        </>
                      )}

                      {selectedType === '헬스장' && (
                        <>
                          <div className="grid grid-cols-2 gap-4">
                            <SelectField label="부위" value={formData.bodyPart} onChange={v => setFormData({...formData, bodyPart: v || undefined})} options={GYM_BODYPART_OPTIONS} />
                            <SelectField label="종목" value={formData.exercise} onChange={v => setFormData({...formData, exercise: v || undefined})} options={GYM_EXERCISE_OPTIONS} />
                          </div>
                          <div className="grid grid-cols-3 gap-4">
                            <SelectField label="무게" value={formData.weight} onChange={v => setFormData({...formData, weight: v ? Number(v) : undefined})} options={GYM_WEIGHT_OPTIONS} suffix="kg" />
                            <SelectField label="세트" value={formData.sets} onChange={v => setFormData({...formData, sets: v ? Number(v) : undefined})} options={HOMET_SETS_OPTIONS} suffix="세트" />
                            <SelectField label="횟수" value={formData.reps} onChange={v => setFormData({...formData, reps: v ? Number(v) : undefined})} options={HOMET_REPS_OPTIONS} suffix="회" />
                          </div>
                        </>
                      )}

                      {/* Common Fields */}
                      {!['사이클', '걷기'].includes(selectedType) && (
                        <SelectField label="소요 시간" value={formData.duration} onChange={v => setFormData({...formData, duration: v ? Number(v) : undefined})} options={DURATION_OPTIONS} suffix="분" />
                      )}

                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">오늘의 컨디션 ({condition}/10)</label>
                        <input 
                          type="range" 
                          min="1" 
                          max="10" 
                          value={condition}
                          onChange={(e) => setCondition(Number(e.target.value))}
                          className="w-full accent-neon-green"
                        />
                        <div className="flex justify-between text-[10px] text-gray-500 mt-1 font-bold">
                          <span>최악</span>
                          <span>보통</span>
                          <span>최상</span>
                        </div>
                      </div>

                      <TextAreaField 
                        label="운동 내용" 
                        placeholder="오늘 어떤 운동을 했나요? (예: 자유형 500m, 스쿼트 3세트 등)" 
                        value={formData.workoutNote} 
                        onChange={v => setFormData({...formData, workoutNote: v})} 
                      />
                      
                      <TextAreaField 
                        label="오늘의 몸 상태" 
                        placeholder="몸 상태는 어떠신가요? (예: 근육통이 있음, 가벼운 느낌 등)" 
                        value={formData.bodyNote} 
                        onChange={v => setFormData({...formData, bodyNote: v})} 
                      />

                      {/* 현재 루틴을 즐겨찾기로 저장 */}
                      <div className="pt-4 border-t border-white/5 space-y-2">
                        <label className="block text-xs font-bold text-gray-500 uppercase">★ 현재 루틴을 템플릿으로 저장</label>
                        <div className="flex gap-2">
                          <input 
                            type="text" 
                            placeholder="템플릿 명칭 (미지정 시 자동 생성)" 
                            value={favoriteName}
                            onChange={(e) => setFavoriteName(e.target.value)}
                            className="flex-1 bg-charcoal border border-white/10 rounded-lg px-3.5 py-2.5 text-xs focus:outline-none focus:border-neon-green/50 transition-colors text-white"
                          />
                          <button
                            onClick={handleAddFavorite}
                            className="px-4 py-2.5 bg-charcoal hover:bg-neon-green/10 text-gray-300 hover:text-neon-green border border-white/10 hover:border-neon-green/40 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 shrink-0"
                          >
                            추가
                          </button>
                        </div>
                      </div>
                    </div>

                    <button 
                      onClick={handleAddRecord}
                      className="w-full bg-neon-green hover:bg-neon-green/90 text-black font-black py-4 rounded-xl shadow-lg shadow-neon-green/20 transition-all active:scale-[0.98] mt-4"
                    >
                      기록 추가하기
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* AI Health Analysis Card */}
          <div className="bg-card-bg border border-white/5 rounded-2xl p-6 shadow-xl overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Activity size={80} />
            </div>
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Award className="text-neon-green" /> AI 건강 상태 분석
            </h2>
            
            <div className="flex items-center gap-4 mb-4">
              <div className="text-4xl">{aiHealthAnalysis ? aiHealthAnalysis.icon : healthStatus.icon}</div>
              <div>
                <div className={cn("text-2xl font-black italic", aiHealthAnalysis ? aiHealthAnalysis.color : healthStatus.color)}>
                  건강 {aiHealthAnalysis ? aiHealthAnalysis.status : healthStatus.status}
                </div>
                <div className="text-sm text-gray-400">주간 운동 빈도: {weeklyStats.frequency}회</div>
              </div>
            </div>
            
            <p className="text-gray-300 leading-relaxed bg-charcoal/50 p-4 rounded-xl border border-white/5 text-sm">
              "{aiHealthAnalysis ? aiHealthAnalysis.msg : healthStatus.msg}"
              {aiHealthAnalysis && aiHealthAnalysis.isFallback && (
                <span className="block text-[11px] text-gray-400 mt-2.5 pt-2 border-t border-white/5 flex items-center gap-1">
                  ⚠️ API 키 프로젝트 권한 제한으로 인해 즉시 로컬 헬스 분석 엔진이 작동되었습니다.
                </span>
              )}
            </p>

            <div className="flex gap-2 mt-4">
              <button
                onClick={getAIHealthAnalysis}
                disabled={isHealthLoading}
                className="flex-[2] border border-neon-green/30 hover:bg-neon-green text-neon-green hover:text-black font-bold text-sm py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 active:scale-[0.98] truncate"
              >
                <RefreshCcw size={14} className={cn(isHealthLoading && "animate-spin")} />
                {isHealthLoading ? "AI 맞춤 분석 진행 중..." : "AI 분석 받기"}
              </button>
              
              <button
                onClick={() => setShowHealthDetail(true)}
                className="flex-1 bg-charcoal hover:bg-charcoal/80 text-white font-bold text-sm py-2.5 px-4 rounded-xl border border-white/5 transition-all flex items-center justify-center gap-1.5 active:scale-[0.98]"
              >
                📊 상세 보고서
              </button>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="bg-charcoal/30 p-3 rounded-lg border border-white/5">
                <div className="text-[10px] uppercase font-bold text-gray-500">주간 총 시간</div>
                <div className="text-xl font-black text-neon-green">{weeklyStats.totalTime}분</div>
              </div>
              <div className="bg-charcoal/30 p-3 rounded-lg border border-white/5">
                <div className="text-[10px] uppercase font-bold text-gray-500">주간 소모 칼로리</div>
                <div className="text-xl font-black text-neon-green">{weeklyStats.totalCalories}kcal</div>
              </div>
            </div>
          </div>

          {/* AI Mood & Workout Recommendation */}
          <div className="bg-card-bg border border-white/5 rounded-2xl p-6 shadow-xl relative overflow-hidden">
            <div className="absolute -top-4 -right-4 text-neon-green/5 rotate-12">
              <Brain size={120} />
            </div>
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Sparkles className="text-neon-green" /> AI 기분 맞춤 추천
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">지금 기분이 어떠신가요?</label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input 
                    type="text" 
                    value={mood}
                    onChange={(e) => setMood(e.target.value)}
                    placeholder="예: 너무 피곤해, 에너지가 넘쳐!, 운동하기 싫어..."
                    className="flex-1 bg-charcoal border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-neon-green transition-colors"
                    onKeyDown={(e) => e.key === 'Enter' && getAIRecommendation()}
                  />
                  <button 
                    onClick={getAIRecommendation}
                    disabled={isAiLoading || !mood.trim()}
                    className="bg-neon-green text-black px-4 py-2 rounded-lg font-bold text-sm hover:bg-neon-green/90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                  >
                    {isAiLoading ? <RefreshCcw size={16} className="animate-spin" /> : <MessageCircle size={16} />}
                    추천받기
                  </button>
                </div>
              </div>

              <AnimatePresence mode="wait">
                {aiRecommendation && (
                  <motion.div 
                    key={aiRecommendation.text}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className={cn(
                      "p-4 rounded-xl border border-white/5 leading-relaxed text-sm",
                      aiRecommendation.type === 'rest' ? "bg-blue-900/20 text-blue-300 border-blue-500/30" : 
                      aiRecommendation.type === 'workout' ? "bg-neon-green/10 text-neon-green border-neon-green/30" :
                      "bg-purple-900/20 text-purple-300 border-purple-500/30"
                    )}
                  >
                    <div className="font-bold mb-1 flex items-center gap-2">
                      {aiRecommendation.type === 'rest' && "🧘 오늘은 쉬어가도 좋아요"}
                      {aiRecommendation.type === 'workout' && "🔥 이런 운동은 어때요?"}
                      {aiRecommendation.type === 'encouragement' && "✨ 당신을 위한 한마디"}
                    </div>
                    <div>{aiRecommendation.text}</div>
                    {aiRecommendation.isFallback && (
                      <div className="text-[11px] text-gray-400 mt-2.5 pt-2 border-t border-white/10 flex items-center gap-1">
                        ⚠️ API 키 프로젝트 권한 제한으로 인해 규칙 기반 인텔리전트 추천 엔진(Fallback)이 작동되었습니다.
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </section>

        {/* Right Column: Stats & Dashboard */}
        <section className="lg:col-span-8 flex flex-col gap-6">
          
          {/* Milestone Badges Board */}
          <div className="order-3 lg:order-none bg-card-bg border border-white/5 rounded-2xl p-6 shadow-xl relative overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
              <div>
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Award className="text-neon-green" size={20} /> 전용 업적 & 마일스톤 배지 수집
                </h3>
                <p className="text-xs text-gray-400 mt-1">지속적인 자기관리를 통해 특별 피트니스 훈장을 활성화하세요!</p>
              </div>
              <div className="flex items-center gap-3 bg-charcoal/40 px-3.5 py-2 rounded-xl border border-white/5 self-start md:self-auto">
                <span className="text-xs font-bold text-gray-400">수집 현황</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black text-neon-green">
                    {badges.filter(b => b.unlocked).length}
                  </span>
                  <span className="text-xs text-gray-500">/ {badges.length} 개</span>
                </div>
                <div className="w-16 h-1.5 bg-dark-bg rounded-full overflow-hidden ml-1">
                  <div 
                    className="h-full bg-neon-green transition-all duration-500" 
                    style={{ width: `${(badges.filter(b => b.unlocked).length / badges.length) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Badges Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {(isBadgesExpanded ? badges : badges.slice(0, 3)).map((badge) => {
                const isUnlocked = badge.unlocked;
                const colorMap: Record<string, { bg: string, text: string, border: string, badgeBg: string, ring: string, shadow: string, glowColor: string }> = {
                  cyan: { 
                    bg: 'from-cyan-950/20 to-charcoal/30', 
                    text: 'text-cyan-400', 
                    border: 'border-cyan-500/30 hover:border-cyan-400/80', 
                    badgeBg: 'bg-gradient-to-tr from-cyan-600 via-cyan-405 to-cyan-200',
                    ring: 'ring-cyan-500/30',
                    shadow: 'shadow-[0_0_20px_rgba(34,211,238,0.25)]',
                    glowColor: 'rgba(34,211,238,0.2)'
                  },
                  orange: { 
                    bg: 'from-orange-950/20 to-charcoal/30', 
                    text: 'text-orange-400', 
                    border: 'border-orange-500/30 hover:border-orange-400/80', 
                    badgeBg: 'bg-gradient-to-tr from-orange-600 via-orange-405 to-orange-200',
                    ring: 'ring-orange-500/30',
                    shadow: 'shadow-[0_0_20px_rgba(249,115,22,0.25)]',
                    glowColor: 'rgba(249,115,22,0.2)'
                  },
                  yellow: { 
                    bg: 'from-yellow-950/20 to-charcoal/30', 
                    text: 'text-yellow-400', 
                    border: 'border-yellow-500/30 hover:border-yellow-400/80', 
                    badgeBg: 'bg-gradient-to-tr from-amber-600 via-yellow-405 to-yellow-200',
                    ring: 'ring-yellow-500/30',
                    shadow: 'shadow-[0_0_20px_rgba(234,179,8,0.25)]',
                    glowColor: 'rgba(234,179,8,0.2)'
                  },
                  emerald: { 
                    bg: 'from-emerald-950/20 to-charcoal/30', 
                    text: 'text-emerald-400', 
                    border: 'border-emerald-500/30 hover:border-emerald-400/80', 
                    badgeBg: 'bg-gradient-to-tr from-emerald-600 via-emerald-405 to-teal-200',
                    ring: 'ring-emerald-500/30',
                    shadow: 'shadow-[0_0_20px_rgba(16,185,129,0.25)]',
                    glowColor: 'rgba(16,185,129,0.2)'
                  },
                  purple: { 
                    bg: 'from-purple-950/20 to-charcoal/30', 
                    text: 'text-purple-400', 
                    border: 'border-purple-500/30 hover:border-purple-400/80', 
                    badgeBg: 'bg-gradient-to-tr from-purple-600 via-purple-405 to-fuchsia-200',
                    ring: 'ring-purple-500/30',
                    shadow: 'shadow-[0_0_20px_rgba(168,85,247,0.25)]',
                    glowColor: 'rgba(168,85,247,0.2)'
                  },
                  pink: { 
                    bg: 'from-pink-950/20 to-charcoal/30', 
                    text: 'text-pink-400', 
                    border: 'border-pink-500/30 hover:border-pink-400/80', 
                    badgeBg: 'bg-gradient-to-tr from-pink-600 via-pink-405 to-pink-200',
                    ring: 'ring-pink-500/30',
                    shadow: 'shadow-[0_0_20px_rgba(236,72,153,0.25)]',
                    glowColor: 'rgba(236,72,153,0.2)'
                  },
                };
 
                const cl = isUnlocked ? colorMap[badge.colorClass] : null;
 
                return (
                  <motion.div 
                    key={badge.id}
                    onClick={() => setSelectedBadge(badge)}
                    whileHover={isUnlocked ? { 
                      y: -8, 
                      scale: 1.05,
                      boxShadow: cl ? `0 15px 30px -5px ${cl.glowColor}, 0 4px 12px rgba(0,0,0,0.5)` : undefined
                    } : { y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className={cn(
                      "p-3.5 rounded-2xl border flex flex-col items-center text-center transition-all duration-300 relative group cursor-pointer overflow-hidden backdrop-blur-md",
                      isUnlocked 
                        ? cn("bg-gradient-to-b from-[#222222] to-card-bg", cl!.border, cl!.shadow) 
                        : "bg-charcoal/10 border-white/[0.04] opacity-35 hover:opacity-55 border-dashed"
                    )}
                  >
                    {/* Glowing pulse aura on back layer (Dynamic radial blur glow) */}
                    {isUnlocked && cl && (
                      <div 
                        className="absolute -inset-8 opacity-0 group-hover:opacity-40 rounded-full blur-2xl transition-opacity duration-500 -z-10 pointer-events-none"
                        style={{ background: `radial-gradient(circle, ${cl.glowColor} 0%, transparent 70%)` }}
                      />
                    )}

                    {/* Glass sheen light glide sweep effect on hover */}
                    {isUnlocked && (
                      <div className="absolute inset-0 w-[200%] h-full bg-gradient-to-r from-transparent via-white/[0.08] to-transparent -skew-x-12 translate-x-[-150%] group-hover:translate-x-[150%] transition-transform duration-[1200ms] ease-out pointer-events-none" />
                    )}

                    {/* Locked small overlay padlock indicator */}
                    {!isUnlocked && (
                      <div className="absolute top-1.5 right-1.5 bg-black/40 border border-white/5 w-5 h-5 rounded-full flex items-center justify-center text-gray-500">
                        <Lock size={10} className="text-gray-400" />
                      </div>
                    )}
 
                    {/* Physical embossed coin medallion container */}
                    <div className={cn(
                      "w-14 h-14 rounded-full flex items-center justify-center mb-3 relative transition-all duration-300 select-none",
                      isUnlocked 
                        ? cn(cl!.badgeBg, "text-slate-905 ring-4 ring-offset-2 ring-offset-dark-bg transition-transform duration-500 group-hover:rotate-[12deg] group-hover:scale-110", cl!.ring)
                        : "bg-white/5 text-gray-500 border border-white/5"
                    )}
                    style={{
                      boxShadow: isUnlocked ? 'inset 0 2px 4px rgba(255, 255, 255, 0.4), 0 8px 16px rgba(0, 0, 0, 0.4)' : undefined
                    }}
                    >
                      {/* Active tiny pulsing drop shadow under the icon */}
                      {isUnlocked && (
                        <span className="absolute inset-0 rounded-full animate-ping opacity-15 scale-105 pointer-events-none bg-current" />
                      )}
                      <div className="relative z-10 drop-shadow-[0_2px_3px_rgba(0,0,0,0.5)]">
                        {renderBadgeIcon(badge.iconName, 26)}
                      </div>
                    </div>
 
                    <div className="text-xs font-black tracking-tight text-white truncate w-full group-hover:text-neon-green transition-colors">
                      {badge.name}
                    </div>
                    
                    <div className="mt-1.5">
                      {isUnlocked ? (
                        <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[8px] font-black bg-neon-green/10 text-neon-green uppercase tracking-wider border border-neon-green/20">
                          ACTIVE 🎖️
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[8px] font-black bg-white/5 text-gray-500 uppercase tracking-wider border border-white/5">
                          LOCKED 🔒
                        </span>
                      )}
                    </div>
 
                    {/* Premium Elegant Glass Tooltip */}
                    <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 w-52 bg-dark-bg/95 backdrop-blur-xl border border-white/10 rounded-xl p-3 text-left opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-300 z-50 shadow-[0_12px_30px_rgba(0,0,0,0.9)] translate-y-2 group-hover:translate-y-0 text-white">
                      <div className="text-[11px] font-black uppercase tracking-wider mb-1 flex items-center justify-between">
                        <span className={cn(isUnlocked ? cl!.text : 'text-gray-400')}>{badge.name}</span>
                        {isUnlocked ? (
                          <span className="text-[9px] text-neon-green font-bold">UNLOCKED 🎉</span>
                        ) : (
                          <span className="text-[9px] text-orange-400 font-bold">LOCKED 🔒</span>
                        )}
                      </div>
                      <p className="text-[10px] text-gray-300 leading-relaxed mb-2 font-medium">
                        {badge.description}
                      </p>
                      <div className="pt-2 border-t border-white/5 flex flex-col gap-0.5">
                        <span className="text-[8px] text-gray-500 uppercase font-black tracking-wider">획득 조건</span>
                        <span className="text-[9px] text-gray-200 font-bold leading-normal">
                          {badge.requirement}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Toggle Button for Badges on Mobile and Tablet */}
            <div className="mt-5 flex justify-center">
              <button
                onClick={() => setIsBadgesExpanded(!isBadgesExpanded)}
                className="w-full sm:w-auto px-5 py-2.5 bg-charcoal/60 hover:bg-neon-green/10 text-gray-300 hover:text-neon-green border border-white/5 hover:border-neon-green/30 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {isBadgesExpanded ? (
                  <>접기 <ChevronUp size={14} /></>
                ) : (
                  <>배지 컬렉션 전체 보기 ({badges.filter(b => b.unlocked).length}/{badges.length}) <ChevronDown size={14} /></>
                )}
              </button>
            </div>
          </div>
          
          {/* Summary Cards */}
          <div className="order-2 lg:order-none grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard 
              icon={<Activity className="text-neon-green" />} 
              label="이번 주 운동 시간" 
              value={`${weeklyStats.totalTime}분`} 
              subValue={`목표 대비 ${Math.round((weeklyStats.totalTime / goalMetrics.timeGoal) * 100)}% (${goalMetrics.timeGoal}분 목표)`}
              progress={Math.min(100, Math.round((weeklyStats.totalTime / goalMetrics.timeGoal) * 100))}
            />
            <StatCard 
              icon={<TrendingUp className="text-neon-green" />} 
              label="소모 칼로리" 
              value={`${weeklyStats.totalCalories} kcal`} 
              subValue={`목표 대비 ${Math.round((weeklyStats.totalCalories / goalMetrics.calorieGoal) * 100)}% (${goalMetrics.calorieGoal}kcal 목표)`}
              progress={Math.min(100, Math.round((weeklyStats.totalCalories / goalMetrics.calorieGoal) * 100))}
            />
            <StatCard 
              icon={<CheckCircle2 className="text-neon-green" />} 
              label={`목표 달성률 (${goalMetrics.icon} ${workoutGoal})`} 
              value={`${totalGoalProgress}%`} 
              progress={totalGoalProgress}
              subValue={`주간 목표: ${goalMetrics.frequencyGoal}회 / ${goalMetrics.timeGoal}분 / ${goalMetrics.calorieGoal}kcal`}
            />
          </div>

          {/* Monthly Calendar View */}
          <div className="order-1 lg:order-none bg-card-bg border border-white/5 rounded-2xl p-4 md:p-6 shadow-xl">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <CalendarIcon className="text-neon-green" /> 월간 운동 캘린더
              </h3>
              <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                <button 
                  onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                  className="p-1.5 hover:bg-charcoal rounded-full transition-colors"
                >
                  <ChevronLeft size={20} />
                </button>
                <span className="font-bold italic text-neon-green text-sm md:text-base">{format(currentMonth, 'yyyy년 MM월')}</span>
                <button 
                  onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                  className="p-1.5 hover:bg-charcoal rounded-full transition-colors"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-px bg-white/5 rounded-xl overflow-hidden border border-white/5">
              {['일', '월', '화', '수', '목', '금', '토'].map(day => (
                <div key={day} className="bg-charcoal/50 py-2 text-center text-[10px] font-bold text-gray-500 uppercase">
                  {day}
                </div>
              ))}
              {calendarDays.map((day, i) => {
                const dayStr = format(day, 'yyyy-MM-dd');
                const dayLogs = logs.filter(l => l.date === dayStr);
                const isCurrentMonth = isSameMonth(day, currentMonth);
                const isToday = isSameDay(day, new Date());

                return (
                  <div 
                    key={i} 
                    className={cn(
                      "min-h-[60px] md:min-h-[80px] p-1 md:p-2 bg-card-bg transition-colors hover:bg-charcoal/30",
                      !isCurrentMonth && "opacity-20"
                    )}
                  >
                    <div className={cn(
                      "text-[10px] md:text-xs font-bold mb-1 w-5 h-5 md:w-6 md:h-6 flex items-center justify-center rounded-full",
                      isToday ? "bg-neon-green text-black" : "text-gray-400"
                    )}>
                      {format(day, 'd')}
                    </div>
                    <div className="flex flex-wrap gap-0.5 md:gap-1">
                      {dayLogs.slice(0, 3).map((log, idx) => (
                        <div 
                          key={idx} 
                          title={`${log.type}: ${log.duration}분 - 상세보기`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedLogId(log.id);
                          }}
                          className="w-4 h-4 md:w-5 md:h-5 rounded bg-neon-green/20 text-neon-green flex items-center justify-center cursor-pointer hover:bg-neon-green/50 transition-colors"
                        >
                          {getWorkoutIcon(log.type)}
                        </div>
                      ))}
                      {dayLogs.length > 3 && (
                        <div className="text-[8px] text-neon-green font-bold">+{dayLogs.length - 3}</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Charts Row */}
          <div className="order-4 lg:order-none grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-card-bg border border-white/5 rounded-2xl p-6 shadow-xl">
              <h3 className="text-lg font-bold mb-6">종목별 운동 비중</h3>
              <div className="h-[250px]">
                {weeklyStats.distribution.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={weeklyStats.distribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {weeklyStats.distribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#262626', border: 'none', borderRadius: '8px' }}
                        itemStyle={{ color: '#fff' }}
                      />
                      <Legend verticalAlign="bottom" height={36}/>
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-500 italic">데이터가 없습니다.</div>
                )}
              </div>
            </div>

            <div className="bg-card-bg border border-white/5 rounded-2xl p-6 shadow-xl">
              <h3 className="text-lg font-bold mb-6">최근 7일 운동량 추이</h3>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={progressData}>
                    <defs>
                      <linearGradient id="colorTime" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={NEON_GREEN} stopOpacity={0.3}/>
                        <stop offset="95%" stopColor={NEON_GREEN} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis hide />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#262626', border: 'none', borderRadius: '8px' }}
                      itemStyle={{ color: '#fff' }}
                    />
                    <Area type="monotone" dataKey="time" stroke={NEON_GREEN} fillOpacity={1} fill="url(#colorTime)" strokeWidth={3} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Recent Logs List */}
          <div className="order-5 lg:order-none bg-card-bg border border-white/5 rounded-2xl p-6 shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold">최근 운동 기록</h3>
              <span className="text-xs text-gray-500 font-bold uppercase">전체 {logs.length}건</span>
            </div>
            
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
              {logs.length > 0 ? (
                logs.map((log) => (
                  <div 
                    key={log.id} 
                    onClick={() => setSelectedLogId(log.id)}
                    className="bg-charcoal/40 border border-white/5 rounded-xl p-4 flex items-center justify-between group hover:border-neon-green/40 hover:bg-charcoal/60 transition-all cursor-pointer active:scale-[0.99]"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-neon-green/10 flex items-center justify-center text-neon-green group-hover:scale-105 transition-transform">
                        {log.type === '수영' && <Waves size={20} />}
                        {log.type === '홈트' && <Home size={20} />}
                        {log.type === '사이클' && <Bike size={20} />}
                        {log.type === '걷기' && <Footprints size={20} />}
                        {log.type === '헬스장' && <Dumbbell size={20} />}
                      </div>
                      <div>
                        <div className="font-bold flex items-center gap-2 text-sm">
                          {log.type} 
                          <span className="text-[10px] px-1.5 py-0.5 bg-white/5 rounded text-gray-400">{log.date}</span>
                        </div>
                        <div className="text-xs text-gray-400 mt-0.5">
                          {log.duration}분 • {log.calories}kcal • 컨디션 {log.condition}/10
                        </div>
                        <div className="mt-2 flex items-center gap-1.5">
                          <span className="text-[9px] text-neon-green font-black tracking-wider uppercase bg-neon-green/10 px-1.5 py-0.5 rounded border border-neon-green/15 select-none">
                            상세보기 🔍
                          </span>
                          {(log.workoutNote || log.bodyNote) && (
                            <span className="text-[9px] text-gray-400 bg-white/5 border border-white/5 px-1.5 py-0.5 rounded select-none">
                              📝 메모 완료
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm('이 기록을 정말 삭제하시겠습니까?')) {
                          setLogs(logs.filter(l => l.id !== log.id));
                        }
                      }}
                      className="p-2 text-gray-600 hover:text-red-400 md:opacity-0 group-hover:opacity-100 transition-all focus:opacity-100"
                      title="기록 삭제"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-gray-500 italic">
                  기록된 운동이 없습니다. 새로운 기록을 추가해보세요!
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* Workout Detail Page Backdrop Overlay */}
      <AnimatePresence>
        {selectedLogId && (() => {
          const log = logs.find(l => l.id === selectedLogId);
          if (!log) return null;
          
          const coachingTip = getCoachingInsight(log);
          
          // Theme helper
          const getThemeStyles = (type: WorkoutType) => {
            switch (type) {
              case '수영': return {
                bg: 'bg-cyan-950/95',
                border: 'border-cyan-500/30',
                text: 'text-cyan-400',
                lightBg: 'bg-cyan-500/10',
                gradient: 'from-cyan-950 via-cyan-900 to-black',
                glow: 'shadow-cyan-500/10',
                label: '수영 세션'
              };
              case '사이클': return {
                bg: 'bg-amber-950/95',
                border: 'border-amber-500/30',
                text: 'text-amber-400',
                lightBg: 'bg-amber-500/10',
                gradient: 'from-amber-950 via-amber-900 to-black',
                glow: 'shadow-amber-500/10',
                label: '라이딩 & 사이클'
              };
              case '걷기': return {
                bg: 'bg-teal-950/95',
                border: 'border-teal-400/30',
                text: 'text-teal-400',
                lightBg: 'bg-teal-400/10',
                gradient: 'from-teal-950 via-teal-900 to-black',
                glow: 'shadow-teal-400/10',
                label: '산책 & 유산소 보행'
              };
              case '홈트': return {
                bg: 'bg-purple-950/95',
                border: 'border-purple-500/30',
                text: 'text-purple-400',
                lightBg: 'bg-purple-500/10',
                gradient: 'from-purple-950 via-purple-900 to-black',
                glow: 'shadow-purple-500/10',
                label: '홈 트레이닝'
              };
              case '헬스장': return {
                bg: 'bg-neutral-900/95',
                border: 'border-neon-green/30',
                text: 'text-neon-green',
                lightBg: 'bg-neon-green/10',
                gradient: 'from-neutral-900 via-zinc-800 to-black',
                glow: 'shadow-neon-green/10',
                label: '헬스 & 전문 피트니스'
              };
            }
          };
          
          const theme = getThemeStyles(log.type);
          
          return (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto"
              onClick={() => setSelectedLogId(null)}
            >
              <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                transition={{ type: "spring", duration: 0.5 }}
                className={cn(
                  "w-full max-w-2xl rounded-3xl overflow-hidden border shadow-2xl relative bg-gradient-to-b text-white my-auto",
                  theme.gradient, theme.border, theme.glow
                )}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header Grid Decoration */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none opacity-40"></div>
                
                {/* Banner Header */}
                <div className="p-6 md:p-8 pb-3 relative border-b border-white/5">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex items-center gap-4">
                      <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center border", theme.lightBg, theme.border, theme.text)}>
                        {log.type === '수영' && <Waves size={28} />}
                        {log.type === '홈트' && <Home size={28} />}
                        {log.type === '사이클' && <Bike size={28} />}
                        {log.type === '걷기' && <Footprints size={28} />}
                        {log.type === '헬스장' && <Dumbbell size={28} />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] md:text-xs font-black uppercase tracking-widest bg-white/5 border border-white/10 px-2.5 py-0.5 rounded-full text-gray-300">
                            {theme.label}
                          </span>
                        </div>
                        <h2 className="text-2xl md:text-3xl font-black italic tracking-tighter mt-1">
                          {log.type} <span className={theme.text}>상세 기입 결과</span>
                        </h2>
                      </div>
                    </div>
                    <button 
                      onClick={() => setSelectedLogId(null)}
                      className="p-2 bg-white/5 border border-white/10 hover:bg-white/10 text-gray-400 hover:text-white rounded-full transition-colors"
                    >
                      <Plus className="rotate-45" size={20} />
                    </button>
                  </div>
                  
                  {/* Date badge */}
                  <div className="mt-4 flex items-center gap-1.5 text-xs text-gray-400 font-bold">
                    <CalendarIcon size={12} className={theme.text} />
                    기록일자: <span className="text-white font-medium">{log.date}</span>
                  </div>
                </div>

                {/* Content scroll block */}
                <div className="p-6 md:p-8 space-y-6 max-h-[60vh] overflow-y-auto relative z-10">
                  
                  {/* Core Metrics Summary */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-white/5 border border-white/5 rounded-2xl p-4 text-center">
                      <span className="block text-[10px] text-gray-500 font-extrabold tracking-wider uppercase mb-1">소요 시간</span>
                      <strong className={cn("text-2xl md:text-3xl font-black italic", theme.text)}>{log.duration}<span className="text-xs font-bold text-white not-italic ml-0.5">분</span></strong>
                    </div>
                    <div className="bg-white/5 border border-white/5 rounded-2xl p-4 text-center">
                      <span className="block text-[10px] text-gray-500 font-extrabold tracking-wider uppercase mb-1">열량 소모</span>
                      <strong className={cn("text-2xl md:text-3xl font-black italic", theme.text)}>{log.calories}<span className="text-xs font-bold text-white not-italic ml-0.5">kcal</span></strong>
                    </div>
                    <div className="bg-white/5 border border-white/5 rounded-2xl p-4 text-center">
                      <span className="block text-[10px] text-gray-500 font-extrabold tracking-wider uppercase mb-1">오늘의 컨디션</span>
                      <strong className={cn("text-2xl md:text-3xl font-black italic", theme.text)}>{log.condition}<span className="text-xs font-bold text-white not-italic ml-0.5">/10</span></strong>
                    </div>
                  </div>

                  {/* Dynamic Category Specifications */}
                  <div className="bg-white/5 border border-white/5 rounded-2xl p-5 space-y-4">
                    <h3 className="text-xs font-black uppercase text-gray-400 tracking-widest border-b border-white/5 pb-2">기록 상세 지표 (Activity Metrics)</h3>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                      {log.type === '수영' && (
                        <>
                          <div>
                            <span className="text-xs font-bold text-gray-500 block">적용 영법</span>
                            <span className="font-bold text-white">{(log as any).stroke || '-'}</span>
                          </div>
                          <div>
                            <span className="text-xs font-bold text-gray-500 block">누적 수영 거리</span>
                            <span className="font-bold text-white">{(log as any).distance ? `${(log as any).distance}m` : '-'}</span>
                          </div>
                          <div>
                            <span className="text-xs font-bold text-gray-500 block">수행 레인 수</span>
                            <span className="font-bold text-white">{(log as any).lanes ? `${(log as any).lanes}개` : '-'}</span>
                          </div>
                        </>
                      )}

                      {log.type === '홈트' && (
                        <>
                          <div className="col-span-2 md:col-span-1">
                            <span className="text-xs font-bold text-gray-500 block">구체적 종목명</span>
                            <span className="font-bold text-white">{(log as any).exerciseName || '-'}</span>
                          </div>
                          <div>
                            <span className="text-xs font-bold text-gray-500 block">완료 세트 수</span>
                            <span className="font-bold text-white">{(log as any).sets ? `${(log as any).sets}세트` : '-'}</span>
                          </div>
                          <div>
                            <span className="text-xs font-bold text-gray-500 block">세트당 횟수</span>
                            <span className="font-bold text-white">{(log as any).reps ? `${(log as any).reps}회` : '-'}</span>
                          </div>
                        </>
                      )}

                      {log.type === '사이클' && (
                        <>
                          <div className="col-span-2">
                            <span className="text-xs font-bold text-gray-500 block">주행 거리</span>
                            <span className="font-extrabold text-neon-green text-base">{(log as any).distance ? `${(log as any).distance} km` : '-'}</span>
                          </div>
                          <div>
                            <span className="text-xs font-bold text-gray-500 block">환산 신체부하</span>
                            <span className="font-bold text-white">7.5 METs</span>
                          </div>
                        </>
                      )}

                      {log.type === '걷기' && (
                        <>
                          <div className="col-span-2">
                            <span className="text-xs font-bold text-gray-500 block">측정된 총 보행수</span>
                            <span className="font-extrabold text-neon-green text-base">{(log as any).steps ? `${(log as any).steps.toLocaleString()} 걸음` : '-'}</span>
                          </div>
                          <div>
                            <span className="text-xs font-bold text-gray-500 block">환산 신체부하</span>
                            <span className="font-bold text-white">3.5 METs</span>
                          </div>
                        </>
                      )}

                      {log.type === '헬스장' && (
                        <>
                          <div>
                            <span className="text-xs font-bold text-gray-500 block">목표 운동 부위</span>
                            <span className="font-bold text-white bg-white/5 border border-white/10 px-2 py-0.5 rounded text-xs inline-block mt-0.5">{(log as any).bodyPart || '-'}</span>
                          </div>
                          <div>
                            <span className="text-xs font-bold text-gray-500 block">수행 종목</span>
                            <span className="font-bold text-white">{(log as any).exercise || '-'}</span>
                          </div>
                          <div>
                            <span className="text-xs font-bold text-gray-500 block">사용한 무게</span>
                            <span className="font-bold text-white">{(log as any).weight ? `${(log as any).weight}kg` : '-'}</span>
                          </div>
                          <div>
                            <span className="text-xs font-bold text-gray-500 block">클리어 세트</span>
                            <span className="font-bold text-white">{(log as any).sets ? `${(log as any).sets} 세트` : '-'}</span>
                          </div>
                          <div>
                            <span className="text-xs font-bold text-gray-500 block">운동 반복 횟수</span>
                            <span className="font-bold text-white">{(log as any).reps ? `${(log as any).reps} 회` : '-'}</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Personal Reflections / Notes */}
                  {(log.workoutNote || log.bodyNote) ? (
                    <div className="space-y-4">
                      {log.workoutNote && (
                        <div className="bg-white/5 border border-white/5 rounded-2xl p-5">
                          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-neon-green"></span> 세부 내용 및 운동일지
                          </h4>
                          <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">{log.workoutNote}</p>
                        </div>
                      )}
                      
                      {log.bodyNote && (
                        <div className="bg-white/5 border border-white/5 rounded-2xl p-5">
                          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span> 신체 변동 및 근 피로도 메모
                          </h4>
                          <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">{log.bodyNote}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-white/5 border border-white/5 rounded-2xl p-5 text-center text-sm text-gray-500 italic">
                      당일 작성한 추가 메모 일지가 존재하지 않습니다.
                    </div>
                  )}

                  {/* Smart Simulated AI Coach Box */}
                  <div className="bg-neon-green/[0.04] border border-neon-green/10 rounded-2xl p-5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-3 opacity-[0.03] pointer-events-none text-neon-green">
                      <Sparkles size={100} />
                    </div>
                    <h4 className="text-xs font-black text-neon-green uppercase tracking-widest mb-3 flex items-center gap-1.5">
                      <Sparkles size={14} className="animate-pulse" /> AI 모바일 트레이닝 처방 코멘트
                    </h4>
                    <p className="text-sm text-gray-300 leading-relaxed">
                      {coachingTip}
                    </p>
                    <div className="mt-3 text-[10px] text-gray-500 flex items-center gap-1.5 border-t border-white/5 pt-2.5">
                      <span>💡 해당 코칭 팁은 입력하신 칼로리 인덱스, 운동 강도(MET), 컨디션 상관성을 분석하여 생성되었습니다.</span>
                    </div>
                  </div>

                </div>

                {/* Footer Controls */}
                <div className="p-6 md:p-8 bg-black/40 border-t border-white/5 flex gap-3 justify-end relative z-10">
                  <button 
                    onClick={() => {
                      if (window.confirm('이 완벽한 운동 기록을 완전히 제거합니까?')) {
                        setLogs(prev => prev.filter(l => l.id !== log.id));
                        setSelectedLogId(null);
                      }
                    }}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 text-xs font-bold text-red-400 hover:bg-red-500/10 border border-red-500/20 px-4 py-2.5 rounded-xl transition-all"
                  >
                    <Trash2 size={13} /> 제거하기
                  </button>
                  <button 
                    onClick={() => setSelectedLogId(null)}
                    className="flex-1 sm:flex-none text-xs font-bold bg-white hover:bg-neutral-200 text-black px-6 py-2.5 rounded-xl transition-all active:scale-95"
                  >
                    목록으로 돌아가기
                  </button>
                </div>
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>

      {/* AI Weekly Health Diagnostics Report Page Backdrop Overlay */}
      <AnimatePresence>
        {showHealthDetail && (() => {
          const stats = getWeeklyDetailedAdvice(weeklyStats.frequency, weeklyStats.totalTime, weeklyStats.totalCalories);
          const feedbackText = aiHealthAnalysis ? aiHealthAnalysis.msg : healthStatus.msg;
          const statusLabel = aiHealthAnalysis ? aiHealthAnalysis.status : healthStatus.status;
          const statusColor = aiHealthAnalysis ? aiHealthAnalysis.color : healthStatus.color;
          const statusIcon = aiHealthAnalysis ? aiHealthAnalysis.icon : healthStatus.icon;
          
          return (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto"
              onClick={() => setShowHealthDetail(false)}
            >
              <motion.div
                initial={{ scale: 0.95, y: 30 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 30 }}
                transition={{ type: "spring", duration: 0.5 }}
                className="w-full max-w-2xl rounded-3xl overflow-hidden border border-neon-green/20 bg-gradient-to-b from-neutral-900 via-zinc-950 to-black text-white my-auto shadow-2xl shadow-neon-green/5"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header Decoration */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#adff2f03_1px,transparent_1px),linear-gradient(to_bottom,#adff2f03_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none"></div>

                <div className="p-6 md:p-8 pb-3 relative border-b border-white/5">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-neon-green/10 flex items-center justify-center border border-neon-green/20 text-neon-green">
                        <Activity size={24} />
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-black tracking-widest text-gray-400 bg-white/5 border border-white/5 px-2.5 py-0.5 rounded-full">
                          AI 체질과학 연구실
                        </span>
                        <h2 className="text-xl md:text-2xl font-black italic tracking-tighter mt-1">
                          주간 심층 <span className="text-neon-green">건강 진단 보고서</span>
                        </h2>
                      </div>
                    </div>
                    <button 
                      onClick={() => setShowHealthDetail(false)}
                      className="p-1.5 bg-white/5 hover:bg-white/10 rounded-full text-gray-400 hover:text-white border border-white/5 transition-colors"
                    >
                      <Plus className="rotate-45" size={18} />
                    </button>
                  </div>
                  
                  {/* Reporting Period */}
                  <div className="mt-3 text-xs text-gray-500 font-bold">
                    보고서 발행 기간: <span className="text-white font-medium">{format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy.MM.dd')} ~ {format(endOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy.MM.dd')}</span>
                  </div>
                </div>

                {/* Main scroll block */}
                <div className="p-6 md:p-8 space-y-6 max-h-[60vh] overflow-y-auto relative z-10">
                  
                  {/* Performance Indicators Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-white/5 border border-white/5 rounded-2xl p-3.5 text-center">
                      <span className="block text-[8px] text-gray-500 font-black tracking-wider uppercase mb-1">매 주 빈도</span>
                      <strong className="text-lg md:text-xl font-black text-neon-green">{weeklyStats.frequency}회</strong>
                    </div>
                    <div className="bg-white/5 border border-white/5 rounded-2xl p-3.5 text-center">
                      <span className="block text-[8px] text-gray-500 font-black tracking-wider uppercase mb-1">누적 시간</span>
                      <strong className="text-lg md:text-xl font-black text-neon-green">{weeklyStats.totalTime}분</strong>
                    </div>
                    <div className="bg-white/5 border border-white/5 rounded-2xl p-3.5 text-center">
                      <span className="block text-[8px] text-gray-500 font-black tracking-wider uppercase mb-1">연태 열량</span>
                      <strong className="text-lg md:text-xl font-black text-neon-green">{weeklyStats.totalCalories} kcal</strong>
                    </div>
                    <div className="bg-white/5 border border-white/5 rounded-2xl p-3.5 text-center">
                      <span className="block text-[8px] text-gray-500 font-black tracking-wider uppercase mb-1">종합 판정</span>
                      <strong className={cn("text-lg md:text-xl font-black inline-flex items-center gap-1", statusColor)}>
                        {statusIcon} {statusLabel}
                      </strong>
                    </div>
                  </div>

                  {/* Comprehensive Diagnosis Message */}
                  <div className="bg-white/5 border border-white/5 rounded-3xl p-5 relative">
                    <h3 className="text-xs font-black uppercase text-gray-400 tracking-widest border-b border-white/5 pb-2.5 mb-3 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-neon-green"></span> 리포트 종합 피드백 요약
                    </h3>
                    <p className="text-sm text-gray-200 leading-relaxed">
                      "{feedbackText}"
                    </p>
                  </div>

                  {/* Metabolic System Indicator status */}
                  <div className="bg-white/5 border border-white/5 rounded-3xl p-5 space-y-3">
                    <h3 className="text-xs font-black uppercase text-gray-400 tracking-widest border-b border-white/5 pb-2.5">신체 능력 바이오 인덱스</h3>
                    
                    <div className="space-y-3.5 text-sm">
                      <div>
                        <div className="flex justify-between items-center mb-1 text-xs font-bold">
                          <span className="text-gray-400">심폐지구력 개발 상태</span>
                          <span className={stats.cardiopulmonaryColor}>{stats.cardiopulmonary}</span>
                        </div>
                        <div className="w-full bg-charcoal h-2 rounded-full overflow-hidden">
                          <div 
                            className={cn(
                              "h-full rounded-full transition-all duration-500",
                              weeklyStats.frequency >= 3 ? "bg-neon-green" : "bg-yellow-500"
                            )} 
                            style={{ width: `${Math.min(100, weeklyStats.frequency * 20)}%` }} 
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-1 text-xs font-bold">
                          <span className="text-gray-400">일일 활동 신진대사율</span>
                          <span className="text-neon-green">{stats.metabolicRate}</span>
                        </div>
                        <div className="w-full bg-charcoal h-2 rounded-full overflow-hidden">
                          <div 
                            className="bg-neon-green h-full rounded-full transition-all duration-500" 
                            style={{ width: `${Math.min(100, (weeklyStats.totalCalories / 1500) * 100)}%` }} 
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-1 text-xs font-bold">
                          <span className="text-gray-400">근원섬유 초과회복도</span>
                          <span className="text-cyan-400">{stats.muscleRecovery}</span>
                        </div>
                        <div className="w-full bg-charcoal h-2 rounded-full overflow-hidden">
                          <div 
                            className="bg-cyan-400 h-full rounded-full transition-all duration-500" 
                            style={{ width: `${weeklyStats.frequency >= 6 ? 40 : weeklyStats.frequency >= 1 ? 85 : 10}%` }} 
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Sports Nutrition Recommendations */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white/5 border border-white/5 rounded-3xl p-5">
                      <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-orange-400"></span> 식단 및 스포츠 영양 처방
                      </h4>
                      <ul className="text-xs text-gray-300 space-y-2.5 leading-relaxed">
                        <li className="flex gap-1.5 items-start">
                          <span className="text-orange-400 shrink-0">•</span>
                          <span><strong>매일 수분 섭취</strong>: 신체 근육 수화 조절을 위해 하루 최소 2.2L 수분량을 분할 보충하세요.</span>
                        </li>
                        <li className="flex gap-1.5 items-start">
                          <span className="text-orange-400 shrink-0">•</span>
                          <span><strong>단백질 동화 마진</strong>: {weeklyStats.frequency >= 3 ? "적극적인 근력 훈련 기간이므로 체중 1kg 당 1.2g~1.5g 단백질을 보충하세요." : "습관 형성 단계이므로 기름기 적은 닭가슴살, 흰살 생선 등을 풍부히 드세요."}</span>
                        </li>
                      </ul>
                    </div>

                    <div className="bg-white/5 border border-white/5 rounded-3xl p-5">
                      <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span> 차주 피지컬 성 전략 어드바이스
                      </h4>
                      <p className="text-xs text-gray-300 leading-relaxed">
                        {weeklyStats.frequency === 0 && "신장에 갑작스러운 스트레스를 피하기 위해 다음 주는 저강도 스트레칭과 주 2회 산책부터 시작해 가뿐히 시동을 걸어주세요."}
                        {weeklyStats.frequency >= 1 && weeklyStats.frequency <= 2 && "신체가 운동에 친밀도를 느꼈습니다. 차주엔 수요일이나 금요일 등 한 세션만 무부하 걷기 및 홈트를 가미해 주 3회로 진척해 보세요."}
                        {weeklyStats.frequency >= 3 && weeklyStats.frequency <= 5 && "가장 모범적인 운동 밸런스 점수입니다. 운동 질적 성장을 위해 평소보다 점진적으로 중량을 5% 올리거나 빠른 보행 영역을 더 확보해 보세요."}
                        {weeklyStats.frequency >= 6 && "과밀된 빈도로 인한 만성 관절 피로 및 역성장이 일어날 타점입니다. 차주 하루 일요일 등은 운동화 끈을 내려놓는 '능동적 휴식'을 처방합니다."}
                      </p>
                    </div>
                  </div>

                </div>

                <div className="p-6 md:p-8 bg-black/40 border-t border-white/5 flex justify-end relative z-10">
                  <button 
                    onClick={() => setShowHealthDetail(false)}
                    className="w-full sm:w-auto text-xs font-bold bg-white hover:bg-neutral-200 text-black px-8 py-2.5 rounded-xl transition-all active:scale-95"
                  >
                    확인 후 대시보드로 복귀
                  </button>
                </div>
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>

      {/* Profile & Goal Settings Dialog Modal */}
      <AnimatePresence>
        {isProfileModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsProfileModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            
            {/* Modal Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', duration: 0.4 }}
              className="relative w-full max-w-md bg-card-bg border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl overflow-y-auto max-h-[90vh] z-10"
            >
              {/* Close Button */}
              <button
                onClick={() => setIsProfileModalOpen(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white bg-charcoal/50 hover:bg-charcoal p-2 rounded-xl border border-white/5 transition-colors focus:outline-none"
              >
                <X size={16} />
              </button>

              <div className="flex items-center gap-2 mb-3">
                <User className="text-neon-green" size={20} />
                <h2 className="text-xl font-bold">프로필 및 운동 목표 설정</h2>
              </div>
              <p className="text-xs text-gray-400 mb-6 font-medium leading-relaxed">
                기본 피지컬 사양과 원하시는 운동 목표를 선택하시면, 그에 맞춰 이상적인 소모 칼로리 및 운동량을 자동 권장해 드립니다.
              </p>

              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <SelectField 
                    label="성별" 
                    value={gender} 
                    onChange={(v) => setGender(v)} 
                    options={GENDER_OPTIONS} 
                  />

                  <SelectField 
                    label="연령대" 
                    value={ageGroup} 
                    onChange={(v) => setAgeGroup(v)} 
                    options={AGE_GROUP_OPTIONS} 
                  />
                </div>

                <SelectField 
                  label="현재 체중 (몸무게)" 
                  value={userWeight.toString()} 
                  onChange={(v) => setUserWeight(Number(v))} 
                  options={WEIGHT_OPTIONS} 
                  suffix="kg"
                />

                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-2">원하는 피트니스 목표</label>
                  <div className="space-y-2">
                    {GOAL_OPTIONS.map((opt) => {
                      const isSelected = workoutGoal === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setWorkoutGoal(opt.value)}
                          className={cn(
                            "w-full text-left p-3 rounded-xl border text-sm font-bold transition-all flex justify-between items-center",
                            isSelected 
                              ? "bg-neon-green/10 text-neon-green border-neon-green/40 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]" 
                              : "bg-charcoal/40 text-gray-400 border-white/5 hover:border-white/20 hover:text-white"
                          )}
                        >
                          <span>{opt.label}</span>
                          {isSelected && <Check size={16} />}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Live dynamic target summary */}
                <div className="bg-charcoal/35 border border-white/5 rounded-2xl p-4.5 space-y-2.5">
                  <div className="text-[10px] uppercase font-black text-gray-500 tracking-wider flex items-center gap-1.5">
                    <Target size={12} className="text-neon-green" />
                    맞춤 지능형 제안 가이드
                  </div>
                  <div className="text-xs text-gray-300 leading-relaxed font-bold">
                    {ageGroup} {gender} ({userWeight}kg) 맞춤 주간 목표:
                  </div>
                  <div className="grid grid-cols-3 gap-2 pt-1 col-span-3">
                    <div className="bg-dark-bg/50 border border-white/5 rounded-lg p-2 text-center">
                      <div className="text-[8px] text-gray-500 font-bold uppercase">운동 빈도</div>
                      <div className="text-xs font-black text-neon-green">{goalMetrics.frequencyGoal}회 / 주</div>
                    </div>
                    <div className="bg-dark-bg/50 border border-white/5 rounded-lg p-2 text-center">
                      <div className="text-[8px] text-gray-500 font-bold uppercase">총 시간</div>
                      <div className="text-xs font-black text-neon-green">{goalMetrics.timeGoal}분</div>
                    </div>
                    <div className="bg-dark-bg/50 border border-white/5 rounded-lg p-2 text-center">
                      <div className="text-[8px] text-gray-500 font-bold uppercase">목표 칼로리</div>
                      <div className="text-xs font-black text-neon-green">{goalMetrics.calorieGoal} kcal</div>
                    </div>
                  </div>
                  <p className="text-[11px] text-gray-400 font-medium leading-relaxed mt-2 italic">
                    "{goalMetrics.description}"
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsProfileModalOpen(false)}
                  className="w-full mt-2 bg-neon-green hover:bg-neon-green/90 text-black font-extrabold text-sm py-3 rounded-xl transition-all shadow-[0_4px_12px_rgba(24,240,120,0.2)] hover:scale-[1.01] focus:outline-none"
                >
                  설정 완료
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
 
      {/* Badge Achievement Details Modal */}
      <AnimatePresence>
        {selectedBadge && (() => {
          const isUnlocked = selectedBadge.unlocked;
          
          // Re-calculate details for the modal
          const totalCount = logs.length;
          const weeklyCalories = weeklyStats.totalCalories;
          const weeklyMinutes = weeklyStats.totalTime;
          
          const currentWeekLogs = logs.filter(l => {
            const start = startOfWeek(new Date(), { weekStartsOn: 1 });
            const end = endOfWeek(new Date(), { weekStartsOn: 1 });
            return isWithinInterval(parseISO(l.date), { start, end });
          });
          const uniqueDaysThisWeek = new Set(currentWeekLogs.map(l => l.date)).size;
          const maxConditionThisWeek = currentWeekLogs.length > 0 ? Math.max(...currentWeekLogs.map(l => l.condition)) : 0;
          const maxConditionAllTime = logs.length > 0 ? Math.max(...logs.map(l => l.condition)) : 0;
          const maxSingleSession = logs.length > 0 ? Math.max(...logs.map(l => l.duration)) : 0;

          // Color scheme maps
          const colorMap: Record<string, { bg: string, text: string, border: string, badgeBg: string, ring: string, shadow: string, glowColor: string, accentText: string }> = {
            cyan: { 
              bg: 'from-cyan-950/40 via-charcoal/80 to-dark-bg/95', 
              text: 'text-cyan-400', 
              border: 'border-cyan-500/30 hover:border-cyan-400/80', 
              badgeBg: 'bg-gradient-to-tr from-cyan-600 via-cyan-400 to-cyan-200',
              ring: 'ring-cyan-500/40',
              shadow: 'shadow-[0_0_35px_rgba(34,211,238,0.3)]',
              glowColor: 'rgba(34,211,238,0.25)',
              accentText: 'text-cyan-450 bg-cyan-500/10 border-cyan-500/20'
            },
            orange: { 
              bg: 'from-orange-950/40 via-charcoal/80 to-dark-bg/95', 
              text: 'text-orange-400', 
              border: 'border-orange-500/30 hover:border-orange-400/80', 
              badgeBg: 'bg-gradient-to-tr from-orange-600 via-orange-400 to-orange-200',
              ring: 'ring-orange-500/40',
              shadow: 'shadow-[0_0_35px_rgba(249,115,22,0.3)]',
              glowColor: 'rgba(249,115,22,0.25)',
              accentText: 'text-orange-450 bg-orange-500/10 border-orange-500/20'
            },
            yellow: { 
              bg: 'from-yellow-950/40 via-charcoal/80 to-dark-bg/95', 
              text: 'text-yellow-400', 
              border: 'border-yellow-500/30 hover:border-yellow-400/80', 
              badgeBg: 'bg-gradient-to-tr from-amber-600 via-yellow-400 to-yellow-200',
              ring: 'ring-yellow-500/40',
              shadow: 'shadow-[0_0_35px_rgba(234,179,8,0.3)]',
              glowColor: 'rgba(234,179,8,0.25)',
              accentText: 'text-yellow-450 bg-yellow-500/10 border-yellow-500/20'
            },
            emerald: { 
              bg: 'from-emerald-950/40 via-charcoal/80 to-dark-bg/95', 
              text: 'text-emerald-400', 
              border: 'border-emerald-500/30 hover:border-emerald-400/80', 
              badgeBg: 'bg-gradient-to-tr from-emerald-600 via-emerald-400 to-teal-200',
              ring: 'ring-emerald-500/40',
              shadow: 'shadow-[0_0_35px_rgba(16,185,129,0.3)]',
              glowColor: 'rgba(16,185,129,0.25)',
              accentText: 'text-emerald-450 bg-emerald-500/10 border-emerald-500/20'
            },
            purple: { 
              bg: 'from-purple-950/40 via-charcoal/80 to-dark-bg/95', 
              text: 'text-purple-400', 
              border: 'border-purple-500/30 hover:border-purple-400/80', 
              badgeBg: 'bg-gradient-to-tr from-purple-600 via-purple-400 to-fuchsia-200',
              ring: 'ring-purple-500/40',
              shadow: 'shadow-[0_0_35px_rgba(168,85,247,0.3)]',
              glowColor: 'rgba(168,85,247,0.25)',
              accentText: 'text-purple-450 bg-purple-500/10 border-purple-500/20'
            },
            pink: { 
              bg: 'from-pink-950/40 via-charcoal/80 to-dark-bg/95', 
              text: 'text-pink-400', 
              border: 'border-pink-500/30 hover:border-pink-400/80', 
              badgeBg: 'bg-gradient-to-tr from-pink-600 via-pink-400 to-pink-200',
              ring: 'ring-pink-500/40',
              shadow: 'shadow-[0_0_35px_rgba(236,72,153,0.3)]',
              glowColor: 'rgba(236,72,153,0.25)',
              accentText: 'text-pink-450 bg-pink-500/10 border-pink-500/20'
            },
          };

          const cl = colorMap[selectedBadge.colorClass] || colorMap.cyan;

          // Compute badge condition requirements and progress %
          let currentValText = "";
          let targetValText = "";
          let progressPercent = 0;
          let progressDetails: { label: string, val: string }[] = [];

          if (selectedBadge.id === 'first_step') {
            currentValText = `${totalCount}개`;
            targetValText = `1개 이상`;
            progressPercent = totalCount >= 1 ? 100 : 0;
            progressDetails = [
              { label: "전체 운동 기록 횟수", val: `${totalCount} 개` },
              { label: "해금 조건 최소 기준", val: "1 개 이상" },
            ];
          } else if (selectedBadge.id === 'calorie_burner') {
            currentValText = `${weeklyCalories} kcal`;
            targetValText = `1,000 kcal`;
            progressPercent = Math.min(100, Math.round((weeklyCalories / 1000) * 100));
            progressDetails = [
              { label: "이번 주 누적 칼로리 소모", val: `${weeklyCalories} kcal` },
              { label: "해금 조건 최소 기준", val: "1,000 kcal" },
            ];
          } else if (selectedBadge.id === 'goal_slayer') {
            currentValText = `${totalGoalProgress}%`;
            targetValText = `100% 이상`;
            progressPercent = Math.min(100, totalGoalProgress);
            progressDetails = [
              { label: "권장 운동량/칼로리 대비 진행률", val: `${totalGoalProgress}%` },
              { label: "해금 조건 최소 기준", val: "100% 이상" },
            ];
          } else if (selectedBadge.id === 'streak_builder') {
            currentValText = `${uniqueDaysThisWeek}일`;
            targetValText = `3일 이상`;
            progressPercent = Math.min(100, Math.round((uniqueDaysThisWeek / 3) * 100));
            progressDetails = [
              { label: "이번 주 실질 운동 일수", val: `${uniqueDaysThisWeek} 일` },
              { label: "해금 조건 최소 기준", val: "주 3일 이상" },
            ];
          } else if (selectedBadge.id === 'limitless') {
            const hasLongSession = logs.some(l => l.duration >= 60);
            currentValText = `${weeklyMinutes}분`;
            targetValText = `180분 (또는 단일 60분)`;
            const timeProgress = Math.min(100, Math.round((weeklyMinutes / 180) * 100));
            progressPercent = hasLongSession || weeklyMinutes >= 180 ? 100 : timeProgress;
            progressDetails = [
              { label: "주간 누적 운동 소요 시간", val: `${weeklyMinutes} 분` },
              { label: "기록 중 가장 긴 세션 시간", val: `${maxSingleSession} 분` },
              { label: "해금 필수 승인 조건", val: "주간 180분 이상 또는 세션 단일 60분 돌파" },
            ];
          } else if (selectedBadge.id === 'zen_soul') {
            currentValText = `${maxConditionThisWeek}점`;
            targetValText = `9점 이상`;
            progressPercent = Math.min(100, Math.round((maxConditionThisWeek / 9) * 100));
            progressDetails = [
              { label: "이번 주 기록 달성 최고 컨디션", val: `${maxConditionThisWeek} 점` },
              { label: "역대 최고로 좋은 컨디션", val: `${maxConditionAllTime} 점` },
              { label: "해금 조건 최소 기준", val: "컨디션 9점 이상 기록" },
            ];
          }

          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              {/* Backdrop with elegant fade-in */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedBadge(null)}
                className="absolute inset-0 bg-black/85 backdrop-blur-md"
              />

              {/* Holographic Embossed Medal Card Container */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 30 }}
                transition={{ type: 'spring', damping: 25, stiffness: 180 }}
                className={cn(
                  "relative w-full max-w-md bg-gradient-to-b border rounded-3xl p-6 md:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-10 overflow-hidden",
                  cl.border,
                  cl.shadow,
                  "from-neutral-900 to-dark-bg"
                )}
              >
                {/* Close Button representing a premium tactile click */}
                <button
                  onClick={() => setSelectedBadge(null)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 p-2.5 rounded-xl border border-white/5 transition-all focus:outline-none"
                >
                  <X size={16} />
                </button>

                {/* Backlighting effect aura */}
                <div 
                  className="absolute -top-20 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full blur-[80px] opacity-25 -z-10 pointer-events-none"
                  style={{ background: cl.glowColor }}
                />

                {/* Main Visual: Giant Embossed interactive Spinning Medal */}
                <div className="flex flex-col items-center text-center mt-4">
                  <motion.div
                    animate={{ 
                      rotateY: isUnlocked ? [0, 360] : 0,
                    }}
                    transition={{ 
                      repeat: Infinity, 
                      repeatDelay: 5,
                      duration: 2.2, 
                      ease: "easeInOut" 
                    }}
                    className={cn(
                      "w-24 h-24 rounded-full flex items-center justify-center relative mb-5 select-none shrink-0 cursor-pointer",
                      isUnlocked ? cn(cl.badgeBg, "text-slate-950 ring-4 ring-offset-4 ring-offset-dark-bg", cl.ring) : "bg-white/5 text-gray-500 border border-white/10"
                    )}
                    style={{
                      boxShadow: isUnlocked ? 'inset 0 4px 8px rgba(255, 255, 255, 0.5), 0 12px 24px rgba(0, 0, 0, 0.4)' : 'inset 0 2px 4px rgba(0,0,0,0.6)'
                    }}
                  >
                    {isUnlocked && (
                      <span className="absolute inset-0 rounded-full animate-ping opacity-25 scale-110 pointer-events-none bg-current" style={{ animationDuration: '3s' }} />
                    )}
                    <div className="relative z-10 drop-shadow-[0_3px_5px_rgba(0,0,0,0.6)]">
                      {renderBadgeIcon(selectedBadge.iconName, 44)}
                    </div>
                  </motion.div>

                  {/* Status Badges Header */}
                  <div className="mb-2">
                    {isUnlocked ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black bg-neon-green/10 text-neon-green uppercase tracking-wider border border-neon-green/30 shadow-[0_0_15px_rgba(24,240,120,0.15)] animate-pulse">
                        🎖️ 마일스톤 획득 완료
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black bg-white/5 text-gray-500 uppercase tracking-widest border border-white/5">
                        🔒 미획득 도전 과제
                      </span>
                    )}
                  </div>

                  {/* Badge Description */}
                  <h3 className="text-2xl font-black text-white tracking-tight mt-1">
                    {selectedBadge.name}
                  </h3>
                  <p className="text-xs text-gray-300 mt-2.5 max-w-sm leading-relaxed px-2 font-medium">
                    {selectedBadge.description}
                  </p>
                </div>

                {/* Progress Details Panel */}
                <div className="bg-charcoal/40 border border-white/5 rounded-2xl p-5 mt-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-black text-gray-500 tracking-wider">나의 달성 통계 현황</span>
                    {isUnlocked ? (
                      <span className="text-[10px] font-black text-neon-green">체크완료 100%</span>
                    ) : (
                      <span className={cn("text-[10px] font-black", cl.text)}>진행률 {progressPercent}%</span>
                    )}
                  </div>

                  {/* Progress Gauge */}
                  <div className="w-full h-2.5 bg-dark-bg rounded-full overflow-hidden border border-white/5 relative">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPercent}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className={cn(
                        "h-full rounded-full transition-all duration-300",
                        isUnlocked ? "bg-neon-green" : cn("bg-gradient-to-r", selectedBadge.colorClass === 'cyan' && 'from-cyan-600 to-cyan-400', selectedBadge.colorClass === 'orange' && 'from-orange-600 to-orange-400', selectedBadge.colorClass === 'yellow' && 'from-amber-600 to-yellow-400', selectedBadge.colorClass === 'emerald' && 'from-emerald-600 to-teal-400', selectedBadge.colorClass === 'purple' && 'from-purple-600 to-fuchsia-400', selectedBadge.colorClass === 'pink' && 'from-pink-600 to-pink-400')
                      )}
                    />
                  </div>

                  {/* Criteria comparative facts lists */}
                  <div className="space-y-2 pt-1 border-t border-white/[0.04]">
                    {progressDetails.map((item, index) => (
                      <div key={index} className="flex items-center justify-between text-xs font-medium">
                        <span className="text-gray-400">{item.label}</span>
                        <span className="text-white font-black">{item.val}</span>
                      </div>
                    ))}
                    <div className="flex items-center justify-between text-xs pt-1.5 border-t border-white/[0.04]">
                      <span className="text-gray-400">훈장 해금 조건</span>
                      <span className={cn("font-black px-2 py-0.5 rounded-md text-[9px] border", cl.accentText)}>
                        {selectedBadge.requirement}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action CTA Button */}
                <div className="mt-6 flex gap-3">
                  <button
                    onClick={() => setSelectedBadge(null)}
                    className={cn(
                      "w-full text-center font-extrabold text-sm py-3 px-5 rounded-xl transition-all shadow-md focus:outline-none",
                      isUnlocked 
                        ? "bg-neon-green hover:bg-neon-green/90 text-black shadow-[0_4px_12px_rgba(24,240,120,0.2)] hover:scale-[1.01]" 
                        : "bg-charcoal text-white hover:bg-charcoal/80"
                    )}
                  >
                    {isUnlocked ? "업적 보상 확인 완료!" : "화이팅! 계속 도전하기"}
                  </button>
                </div>
              </motion.div>
            </div>
          );
        })()}
      </AnimatePresence>

      {/* 주간 운동 성과 공유 모달 */}
      <AnimatePresence>
        {isShareModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsShareModalOpen(false)}
              className="absolute inset-0 bg-black/85 backdrop-blur-md"
            />

            {/* Modal Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', duration: 0.4 }}
              className="relative w-full max-w-md bg-[#0e1117] border border-neon-green/20 rounded-3xl p-5 md:p-6 shadow-2xl overflow-y-auto max-h-[90vh] z-10 text-white"
            >
              {/* Close Button */}
              <button
                onClick={() => setIsShareModalOpen(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white bg-charcoal/50 hover:bg-charcoal p-2 rounded-xl border border-white/5 transition-colors focus:outline-none"
              >
                <X size={16} />
              </button>

              <div className="flex items-center gap-2 mb-3">
                <Share2 className="text-neon-green" size={20} />
                <h2 className="text-lg font-bold">주간 운동 성과 카드 공유</h2>
              </div>
              <p className="text-xs text-gray-400 mb-4 font-medium leading-relaxed">
                피트니스 업적과 주간 목표 달성 지표가 포함된 고화질 소셜 카드가 실시간 생성되었습니다. 아래 버튼들을 통해 저장하고 소셜 미디어로 공유해보세요!
              </p>

              {isGeneratingShareImage ? (
                <div className="w-full h-80 flex flex-col items-center justify-center gap-4 bg-charcoal/20 border border-dashed border-white/10 rounded-2xl">
                  <div className="w-8 h-8 rounded-full border-2 border-neon-green border-t-transparent animate-spin" />
                  <p className="text-xs text-gray-400 font-bold">고해상도 피트니스 디자인 렌더링 중...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {shareImageSrc && (
                    <div className="relative group overflow-hidden rounded-2xl border border-white/10 shadow-lg bg-black">
                      <img 
                        src={shareImageSrc} 
                        alt="Weekly Summary Share Card" 
                        className="w-full max-h-[420px] object-contain mx-auto"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-2 transition-opacity duration-300 pointer-events-none text-center p-4">
                        <Camera className="text-neon-green animate-bounce" size={24} />
                        <span className="text-xs text-white font-bold">모바일에서는 이미지를 길게 누르면<br/>쉽게 직접 사진첩에 저장할 수 있어요!</span>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <button
                      onClick={() => {
                        if (shareImageSrc) {
                          const link = document.createElement('a');
                          link.download = `weekly-fitness-report-${format(new Date(), 'yyyyMMdd')}.png`;
                          link.href = shareImageSrc;
                          link.click();
                        }
                      }}
                      className="w-full flex items-center justify-center gap-2 bg-charcoal hover:bg-charcoal/85 text-white font-extrabold text-xs py-3 rounded-xl border border-white/5 transition-all cursor-pointer"
                    >
                      <Download size={14} /> 이미지 다운로드
                    </button>

                    <button
                      onClick={async () => {
                        if (shareImageSrc) {
                          try {
                            const blob = await (await fetch(shareImageSrc)).blob();
                            const file = new File([blob], 'weekly-fitness-report.png', { type: 'image/png' });
                            if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
                              await navigator.share({
                                files: [file],
                                title: '나의 주간 운동 리포트 👟',
                                text: `이번 주 건강 목표 달성률 ${totalGoalProgress}% 완료! 🎖️ 더 건강해진 나의 운동 기록을 확인해보세요.`,
                              });
                            } else {
                              // Clipboard text fallback
                              await navigator.clipboard.writeText(`👟 나만의 주간 운동 리포트\n🎖️ 이번 주 목표 달성률: ${totalGoalProgress}%\n🔥 칼로리 소모: ${weeklyStats.totalCalories} kcal\n⏱️ 누적 운동: ${weeklyStats.totalTime}분\n내일도 더 건강하게 달릴게요!`);
                              alert('클립보드에 성과 요약 텍스트가 복사되었습니다! 소셜 미디어나 메신저에 붙여넣어 보세요.');
                            }
                          } catch (e) {
                            console.error(e);
                          }
                        }
                      }}
                      className="w-full flex items-center justify-center gap-2 bg-neon-green hover:bg-neon-green/90 text-black font-extrabold text-xs py-3 rounded-xl transition-all shadow-[0_4px_12px_rgba(24,240,120,0.2)] cursor-pointer"
                    >
                      <Share2 size={14} /> 소셜 미디어 공유
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <footer className="max-w-7xl mx-auto mt-12 pt-8 border-t border-white/5 text-center text-gray-600 text-sm pb-12">
        &copy; 2026 PERSONAL WORKOUT DASHBOARD. ALL RIGHTS RESERVED.
      </footer>
    </div>
  );
}

// Global Heuristics & Local Simulated AI Coaches generators
function getCoachingInsight(log: WorkoutLog): string {
  const cond = log.condition;
  const dur = log.duration;
  
  let baseMsg = "";
  
  if (log.type === "수영") {
    const stroke = (log as any).stroke || "수영";
    const distance = (log as any).distance ? `${(log as any).distance}m` : "일정 거리";
    baseMsg = `오늘 ${stroke} 영법으로 총 ${distance}의 강력한 유산소 수중 세션을 성공적으로 완수하셨습니다! 수영은 호흡근과 심폐지구력을 상승시키는 훌륭한 비충격성 전신 스포츠입니다. `;
    if (cond >= 8) {
      baseMsg += `오늘 컨디션 최고치인 ${cond}점을 기록하신 만큼, 림프 순환 및 심혈관 대사 작용이 최고 수준으로 이루어지고 있습니다. 이 좋은 수중 피트니스 주기를 이번 주에 적극 이어가 보시길 지향합니다!`;
    } else if (cond <= 4) {
      baseMsg += `오늘 심신 에너지가 가라앉은 상태(${cond}점)에서 운동을 극복하고 완수한 만큼, 세션 직후 따뜻한 미온액 목욕 및 충분한 이온 전해질 수분량을 취하여 젖산 분해 속도를 적극 복강 활성화시켜 주세요.`;
    } else {
      baseMsg += `부상 없는 어깨 견관절 및 가동 영역 보강을 위해 물속 진입 전후 지상에서 10분 정도 어깨 회전근 스트레칭(dynamic stretch)을 꼭 가미하는 습관을 들여 보십시오.`;
    }
  } else if (log.type === "홈트") {
    const name = (log as any).exerciseName || "기초 맨몸 트레칭";
    const sets = (log as any).sets || 3;
    const reps = (log as any).reps || 10;
    baseMsg = `외부로 나가는 번거로움에 지지 않고 집이라는 친숙한 안식처에서 스스로의 한계를 넘겨 ${name}을 총 ${sets}세트 x ${reps}회 끈기 있게 완수하셨군요! 홈트레이닝은 대뇌 전두엽 기획의 강한 승리입니다. `;
    if (cond >= 8) {
      baseMsg += `기분과 활력이 매우 생생한(${cond}점) 날이므로, 다음 번엔 자극 빈도를 올리기 위해 물통을 가볍게 덤벨 역할로 이용하시거나 탄력 밴드를 결합하신다면 근밀도 깊이에 폭발적인 진보를 가져올 것입니다.`;
    } else {
      baseMsg += `컨디션 ${cond}점 수준에 조화로이 맞춰 무리한 충격각이나 관절 과부하 없이 관용적으로 세션을 무사 충족하신 것은 장기적인 자기관리 리듬 면에서 탁월한 전략입니다.`;
    }
  } else if (log.type === "사이클") {
    const dist = (log as any).distance ? `${(log as any).distance}km` : "실외 고강도";
    baseMsg = `허벅지 페달을 뜨겁게 갈아올려 총 ${dist}의 비장한 거리를 멋지게 도달하셨군요! 사이클 하체 대퇴사두근과 장요근 개입은 신체 최대 노폐물 소모 모터를 기동하는 영리한 스포츠 자극입니다. `;
    if (cond >= 8) {
      baseMsg += `운동 뒤 무릎에 전조 하중이 느껴지지 않는 가뿐한 축복 컨디션(${cond}점)이시라면, 다음엔 1분간 기어를 올리고 폭풍 질주한 뒤 1분간 평소 가벼운 회복을 번갈아 하는 인터벌 기어 전략을 조합해 심폐 효율을 극한으로 올려보길 자극해 봅니다.`;
    } else {
      baseMsg += `신체 가벼움 지수가 힘든 ${cond}점이었음에도 ${log.duration}분간의 야무진 라이딩을 해내셨으니, 대퇴막장근이나 바깥 허벅지가 내일 단단히 뭉치지 않도록 골반 안쪽 폼롤러 정밀 마사지를 10분만 공여하여 다리를 아껴 주세요!`;
    }
  } else if (log.type === "걷기") {
    const steps = (log as any).steps ? `${(log as any).steps.toLocaleString()}걸음` : "시간 단위";
    baseMsg = `척추 기립근을 꼿꼿이 사수하여 가볍게 총 ${steps}의 가보치 높은 발자국 대장정을 무사히 마무리지었습니다! 걷기는 인체 최대 중력 상호 작용이자, 두뇌 스트레스를 가라앉히는 안도 작용입니다. `;
    if (cond >= 8) {
      baseMsg += `기세 좋은 활력 상태(${cond}점)인 만큼, 시속 6km 내외의 활달한 '속보' 단계로 팔을 90도로 흔들며 보행하여, 심근 모터에 가벼운 산소 자극을 적극 가미해 칼로리 소모를 두 배 이끌어가 봐 볼까요?`;
    } else {
      baseMsg += `오늘 다소 지치고 무겁거나 잡념 가득한 날(${cond}점)에, 묵직한 중강도 쇠를 드는 대신 고즈넉하고 평화로운 걸음산책으로 리듬을 고요하게 순환시키신 것은 머리 속 피로 호르몬인 코르티솔 분비를 강력 제어하는 영락없는 수퍼 힐링 초이스였습니다!`;
    }
  } else if (log.type === "헬스장") {
    const part = (log as any).bodyPart || "전신 복합";
    const exercise = (log as any).exercise || "기본 웨이트";
    const weight = (log as any).weight ? `${(log as any).weight}kg` : "자체 체중";
    const sets = (log as any).sets || 4;
    const reps = (log as any).reps || 12;
    baseMsg = `헬스장에 도달해 강건히 ${part} 파트를 저격하여 ${exercise} 종목을 ${weight} 부하에 힘입어 ${sets}세트 x ${reps}회 정량 마이크로 타겟팅 완수한 피트니스 세션을 축하합니다!!! 근골격 밀도 증가와 남성/여성 인슐린 인자 조화의 원천 축입니다. `;
    if (cond >= 8) {
      baseMsg += `정상급 근신경 마인드 머슬 결합을 아주 생생하게 체감하신 날인 만큼, 운동이 완결된 지 40분 안에 근섬유 단백질 아미노산 동화margine을 수확해 갈 수 있게 따뜻한 프로틴 쉐이크 섭취나 영양 공급을 꼭 결부시켜 오늘의 파괴된 근골격을 최고조로 복원하십시오.`;
    } else {
      baseMsg += `컨디션 컨디션이 저하된 ${cond}점 날임에도 요추나 관절 슬관절 정밀 궤적을 엇나가지 않고 부상 사전 차단에 골몰하여 다치지 않고 성수히 훈련을 성사하신 완벽한 리스펙트 빌더 정신이야말로 장기 기량의 보화입니다.`;
    }
  }
  
  return baseMsg;
}

function getWeeklyDetailedAdvice(freq: number, totalTime: number, totalCalories: number) {
  let cardiopulmonary = "평범 수준 유지";
  let cardiopulmonaryColor = "text-yellow-500";
  let metabolicRate = "기초 충족 상태";
  let muscleRecovery = "완전 회복 단계";
  
  if (freq === 0) {
    cardiopulmonary = "비기동 (경고)";
    cardiopulmonaryColor = "text-red-500";
    metabolicRate = "정체 유도 상태";
    muscleRecovery = "장기 방치";
  } else if (freq >= 1 && freq <= 2) {
    cardiopulmonary = "근폐 적응 유도 단계";
    cardiopulmonaryColor = "text-amber-500";
    metabolicRate = "점진적인 활성화 전환";
    muscleRecovery = "신진대사 점근";
  } else if (freq >= 3 && freq <= 5) {
    cardiopulmonary = "최고의 강인성 획득";
    cardiopulmonaryColor = "text-neon-green";
    metabolicRate = "매우 활발 대사 촉진";
    muscleRecovery = "근육 섬유질 자극 완료";
  } else {
    cardiopulmonary = "수장급 심장 지배력";
    cardiopulmonaryColor = "text-cyan-400";
    metabolicRate = "체지방 최대 연소 상태";
    muscleRecovery = "과부하 경계선 진입";
  }
  
  return {
    cardiopulmonary,
    cardiopulmonaryColor,
    metabolicRate,
    muscleRecovery
  };
}

// Sub-components
function InputField({ label, type, value, onChange, placeholder }: { label: string, type: string, value: any, onChange: (v: any) => void, placeholder?: string }) {
  return (
    <div>
      <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">{label}</label>
      <input 
        type={type} 
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-charcoal border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-neon-green transition-colors"
      />
    </div>
  );
}

function SelectField({ label, value, onChange, options, suffix = "" }: { label: string, value: any, onChange: (v: any) => void, options: { value: any, label: string }[], suffix?: string }) {
  return (
    <div>
      <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">{label}</label>
      <select 
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-charcoal border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-neon-green transition-colors text-white cursor-pointer"
      >
        <option value="" className="text-gray-500">선택하세요</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-dark-bg text-white">
            {opt.label}{opt.value !== '' && suffix ? ` ${suffix}` : ''}
          </option>
        ))}
      </select>
    </div>
  );
}

function TextAreaField({ label, value, onChange, placeholder }: { label: string, value: any, onChange: (v: any) => void, placeholder?: string }) {
  return (
    <div>
      <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">{label}</label>
      <textarea 
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={2}
        className="w-full bg-charcoal border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-neon-green transition-colors resize-none"
      />
    </div>
  );
}

function StatCard({ icon, label, value, subValue, progress }: { icon: React.ReactNode, label: string, value: string, subValue?: string, progress?: number }) {
  return (
    <div className="bg-card-bg border border-white/5 rounded-2xl p-4 md:p-5 shadow-lg">
      <div className="flex items-center gap-3 mb-2 md:mb-3">
        <div className="p-1.5 md:p-2 bg-neon-green/10 rounded-lg shrink-0">{icon}</div>
        <span className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wider truncate">{label}</span>
      </div>
      <div className="text-xl md:text-2xl font-black italic mb-1 truncate">{value}</div>
      {subValue && <div className="text-[9px] md:text-[10px] text-gray-500 font-bold truncate">{subValue}</div>}
      {progress !== undefined && (
        <div className="mt-2 md:mt-3">
          <div className="w-full bg-charcoal h-1 md:h-1.5 rounded-full overflow-hidden">
            <div className="bg-neon-green h-full rounded-full" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}
    </div>
  );
}

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
  Sparkles,
  MessageCircle,
  Brain
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
import { GoogleGenAI } from "@google/genai";
import { cn } from './lib/utils';
import { 
  WorkoutLog, 
  WorkoutType, 
  WORKOUT_TYPES, 
  CALORIE_METS 
} from './types';

// Constants
const NEON_GREEN = '#adff2f';
const CHARCOAL = '#333333';
const COLORS = [NEON_GREEN, '#4ade80', '#22c55e', '#16a34a', '#15803d'];

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

  // Form states
  const [formData, setFormData] = useState<any>({});

  // Load data
  useEffect(() => {
    const saved = localStorage.getItem('workout_logs');
    if (saved) {
      try {
        setLogs(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse logs', e);
      }
    }
    const savedProfile = localStorage.getItem('workout_profile_image');
    if (savedProfile) {
      setProfileImage(savedProfile);
    }
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
  }, [logs]);

  useEffect(() => {
    if (profileImage) {
      localStorage.setItem('workout_profile_image', profileImage);
    }
  }, [profileImage]);

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
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `사용자의 현재 기분/상태: "${mood}"
        위 기분에 맞춰서 오늘의 운동을 추천하거나, 휴식을 권장하거나, 따뜻한 격려를 해주는 짤막한 메시지를 작성해줘.
        응답은 반드시 JSON 형식으로 해줘:
        {
          "text": "메시지 내용 (한국어, 친근하고 에너제틱하거나 따뜻한 톤)",
          "type": "rest" | "workout" | "encouragement"
        }
        - 운동하기 싫어하는 기분이면 억지로 시키기보다 공감해주고 가벼운 활동을 제안하거나 쉬어도 된다고 말해줘.
        - 에너지가 넘치면 강도 높은 운동을 추천해줘.
        - 우울하거나 지쳐있으면 정신 건강에 도움이 되는 가벼운 산책이나 스트레칭을 추천해줘.`,
        config: {
          responseMimeType: "application/json"
        }
      });

      const result = JSON.parse(response.text || '{}');
      setAiRecommendation(result);
    } catch (error) {
      console.error("AI Recommendation Error:", error);
      setAiRecommendation({ 
        text: "오류가 발생했지만, 당신의 오늘을 응원합니다! 무리하지 말고 본인의 속도에 맞춰보세요.", 
        type: 'encouragement' 
      });
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleAddRecord = () => {
    const duration = Number(formData.duration || 30);
    const weight = 70; // Assume 70kg for calorie calculation
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
      const calories = Math.round((met * 3.5 * 70 * duration) / 200);
      
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
    <div className="min-h-screen bg-dark-bg text-white p-4 md:p-8 font-sans">
      {/* Header & Notifications */}
      <header className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-6">
            {/* Motivation Profile Section */}
            <div className="relative group">
              <div className="w-20 h-20 rounded-2xl border-2 border-neon-green/30 overflow-hidden bg-charcoal flex items-center justify-center shadow-lg shadow-neon-green/10 group-hover:border-neon-green transition-all">
                {profileImage ? (
                  <img src={profileImage} alt="Motivation" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <Activity className="text-gray-600" size={32} />
                )}
                <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity">
                  <Plus className="text-neon-green" size={24} />
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </label>
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-neon-green rounded-full flex items-center justify-center text-black shadow-lg">
                < Award size={14} />
              </div>
            </div>

            <div>
              <h1 className="text-3xl md:text-4xl font-black italic tracking-tighter flex items-center gap-2">
                <span className="text-neon-green neon-glow">👟</span>
                PERSONAL <span className="text-neon-green">WORKOUT</span> DASHBOARD
              </h1>
              <p className="text-gray-400 mt-1">개인 맞춤형 운동 기록 및 건강 분석</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={loadExampleData}
              className="flex items-center gap-2 px-4 py-2 bg-charcoal hover:bg-charcoal/80 rounded-lg text-sm font-medium transition-all"
            >
              <RefreshCcw size={16} /> 예시 데이터
            </button>
            <button 
              onClick={() => window.print()}
              className="flex items-center gap-2 px-4 py-2 bg-charcoal hover:bg-charcoal/80 rounded-lg text-sm font-medium transition-all"
            >
              <Download size={16} /> PDF 저장
            </button>
            <button 
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2 bg-red-900/30 text-red-400 hover:bg-red-900/50 rounded-lg text-sm font-medium transition-all"
            >
              <Trash2 size={16} /> 초기화
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
          <div className="bg-card-bg border border-white/5 rounded-2xl p-6 shadow-xl">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Plus className="text-neon-green" /> 오늘의 운동 기록
            </h2>
            
            <div className="space-y-4">
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
                      <InputField label="거리 (m)" type="number" value={formData.distance} onChange={v => setFormData({...formData, distance: v})} />
                      <InputField label="레인 수" type="number" value={formData.lanes} onChange={v => setFormData({...formData, lanes: v})} />
                    </div>
                    <InputField label="영법 (자유형/평영 등)" type="text" value={formData.stroke} onChange={v => setFormData({...formData, stroke: v})} />
                  </>
                )}

                {selectedType === '홈트' && (
                  <>
                    <InputField label="종목명" type="text" value={formData.exerciseName} onChange={v => setFormData({...formData, exerciseName: v})} />
                    <div className="grid grid-cols-2 gap-4">
                      <InputField label="세트 수" type="number" value={formData.sets} onChange={v => setFormData({...formData, sets: v})} />
                      <InputField label="횟수" type="number" value={formData.reps} onChange={v => setFormData({...formData, reps: v})} />
                    </div>
                  </>
                )}

                {selectedType === '사이클' && (
                  <>
                    <InputField label="주행 거리 (km)" type="number" value={formData.distance} onChange={v => setFormData({...formData, distance: v})} />
                    <InputField label="소요 시간 (분)" type="number" value={formData.duration} onChange={v => setFormData({...formData, duration: v})} />
                  </>
                )}

                {selectedType === '걷기' && (
                  <>
                    <InputField label="걸음 수" type="number" value={formData.steps} onChange={v => setFormData({...formData, steps: v})} />
                    <InputField label="소요 시간 (분)" type="number" value={formData.duration} onChange={v => setFormData({...formData, duration: v})} />
                  </>
                )}

                {selectedType === '헬스장' && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <InputField label="부위" type="text" placeholder="가슴/등/하체" value={formData.bodyPart} onChange={v => setFormData({...formData, bodyPart: v})} />
                      <InputField label="종목" type="text" value={formData.exercise} onChange={v => setFormData({...formData, exercise: v})} />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <InputField label="무게 (kg)" type="number" value={formData.weight} onChange={v => setFormData({...formData, weight: v})} />
                      <InputField label="세트" type="number" value={formData.sets} onChange={v => setFormData({...formData, sets: v})} />
                      <InputField label="횟수" type="number" value={formData.reps} onChange={v => setFormData({...formData, reps: v})} />
                    </div>
                  </>
                )}

                {/* Common Fields */}
                {!['사이클', '걷기'].includes(selectedType) && (
                  <InputField label="소요 시간 (분)" type="number" value={formData.duration} onChange={v => setFormData({...formData, duration: v})} />
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
              </div>

              <button 
                onClick={handleAddRecord}
                className="w-full bg-neon-green hover:bg-neon-green/90 text-black font-black py-4 rounded-xl shadow-lg shadow-neon-green/20 transition-all active:scale-[0.98] mt-4"
              >
                기록 추가하기
              </button>
            </div>
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
              <div className="text-4xl">{healthStatus.icon}</div>
              <div>
                <div className={cn("text-2xl font-black italic", healthStatus.color)}>
                  건강 {healthStatus.status}
                </div>
                <div className="text-sm text-gray-400">주간 운동 빈도: {weeklyStats.frequency}회</div>
              </div>
            </div>
            
            <p className="text-gray-300 leading-relaxed bg-charcoal/50 p-4 rounded-xl border border-white/5">
              "{healthStatus.msg}"
            </p>

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
                <div className="flex gap-2">
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
                    className="bg-neon-green text-black px-4 py-2 rounded-lg font-bold text-sm hover:bg-neon-green/90 disabled:opacity-50 transition-all flex items-center gap-2"
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
                    {aiRecommendation.text}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </section>

        {/* Right Column: Stats & Dashboard */}
        <section className="lg:col-span-8 space-y-6">
          
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard 
              icon={<Activity className="text-neon-green" />} 
              label="이번 주 운동 시간" 
              value={`${weeklyStats.totalTime}분`} 
              subValue="지난 주 대비 +12%"
            />
            <StatCard 
              icon={<TrendingUp className="text-neon-green" />} 
              label="소모 칼로리" 
              value={`${weeklyStats.totalCalories} kcal`} 
              subValue="추정치 기반"
            />
            <StatCard 
              icon={<CheckCircle2 className="text-neon-green" />} 
              label="목표 달성률" 
              value="75%" 
              progress={75}
            />
          </div>

          {/* Monthly Calendar View */}
          <div className="bg-card-bg border border-white/5 rounded-2xl p-6 shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <CalendarIcon className="text-neon-green" /> 월간 운동 캘린더
              </h3>
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                  className="p-1 hover:bg-charcoal rounded-full transition-colors"
                >
                  <ChevronLeft size={20} />
                </button>
                <span className="font-bold italic text-neon-green">{format(currentMonth, 'yyyy년 MM월')}</span>
                <button 
                  onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                  className="p-1 hover:bg-charcoal rounded-full transition-colors"
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
                      "min-h-[80px] p-2 bg-card-bg transition-colors hover:bg-charcoal/30",
                      !isCurrentMonth && "opacity-20"
                    )}
                  >
                    <div className={cn(
                      "text-xs font-bold mb-1 w-6 h-6 flex items-center justify-center rounded-full",
                      isToday ? "bg-neon-green text-black" : "text-gray-400"
                    )}>
                      {format(day, 'd')}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {dayLogs.map((log, idx) => (
                        <div 
                          key={idx} 
                          title={`${log.type}: ${log.duration}분`}
                          className="w-5 h-5 rounded bg-neon-green/20 text-neon-green flex items-center justify-center"
                        >
                          {getWorkoutIcon(log.type)}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
          <div className="bg-card-bg border border-white/5 rounded-2xl p-6 shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold">최근 운동 기록</h3>
              <span className="text-xs text-gray-500 font-bold uppercase">전체 {logs.length}건</span>
            </div>
            
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
              {logs.length > 0 ? (
                logs.map((log) => (
                  <div key={log.id} className="bg-charcoal/40 border border-white/5 rounded-xl p-4 flex items-center justify-between group hover:border-neon-green/30 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-neon-green/10 flex items-center justify-center text-neon-green">
                        {log.type === '수영' && <Waves size={20} />}
                        {log.type === '홈트' && <Home size={20} />}
                        {log.type === '사이클' && <Bike size={20} />}
                        {log.type === '걷기' && <Footprints size={20} />}
                        {log.type === '헬스장' && <Dumbbell size={20} />}
                      </div>
                      <div>
                        <div className="font-bold flex items-center gap-2">
                          {log.type} 
                          <span className="text-[10px] px-1.5 py-0.5 bg-white/5 rounded text-gray-400">{log.date}</span>
                        </div>
                        <div className="text-xs text-gray-500">
                          {log.duration}분 • {log.calories}kcal • 컨디션 {log.condition}/10
                        </div>
                        {(log.workoutNote || log.bodyNote) && (
                          <div className="mt-2 space-y-1">
                            {log.workoutNote && (
                              <div className="text-[11px] text-gray-300 bg-black/20 px-2 py-1 rounded">
                                <span className="text-neon-green font-bold">운동:</span> {log.workoutNote}
                              </div>
                            )}
                            {log.bodyNote && (
                              <div className="text-[11px] text-gray-300 bg-black/20 px-2 py-1 rounded">
                                <span className="text-neon-green font-bold">몸 상태:</span> {log.bodyNote}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <button 
                      onClick={() => setLogs(logs.filter(l => l.id !== log.id))}
                      className="p-2 text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
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

      <footer className="max-w-7xl mx-auto mt-12 pt-8 border-t border-white/5 text-center text-gray-600 text-sm pb-12">
        &copy; 2026 PERSONAL WORKOUT DASHBOARD. ALL RIGHTS RESERVED.
      </footer>
    </div>
  );
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
    <div className="bg-card-bg border border-white/5 rounded-2xl p-5 shadow-lg">
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2 bg-neon-green/10 rounded-lg">{icon}</div>
        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{label}</span>
      </div>
      <div className="text-2xl font-black italic mb-1">{value}</div>
      {subValue && <div className="text-[10px] text-gray-500 font-bold">{subValue}</div>}
      {progress !== undefined && (
        <div className="mt-3">
          <div className="w-full bg-charcoal h-1.5 rounded-full overflow-hidden">
            <div className="bg-neon-green h-full rounded-full" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}
    </div>
  );
}

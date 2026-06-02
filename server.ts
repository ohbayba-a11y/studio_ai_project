import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Sanitize process.env.GEMINI_API_KEY to remove any literal wrapping quotes
// Initialize server-side Gemini client
console.log("Loading GEMINI_API_KEY from environment...");
const rawApiKey = process.env.GEMINI_API_KEY;
const apiKey = rawApiKey ? rawApiKey.replace(/^["']|["']$/g, "") : undefined;
console.log(`API Key extracted: ${apiKey ? `Present (Length: ${apiKey.length}, Starts with: ${apiKey.substring(0, 6)})` : "Not Found!"}`);

const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// Heuristic rule-based localized AI matching engines
function getLocalRecommendation(mood: string): { text: string; type: "rest" | "workout" | "encouragement"; isFallback: boolean } {
  const normMood = mood.toLowerCase().trim();
  
  if (
    normMood.includes("피곤") || 
    normMood.includes("지쳐") || 
    normMood.includes("졸려") || 
    normMood.includes("힘들") || 
    normMood.includes("아프") ||
    normMood.includes("귀찮") ||
    normMood.includes("쉬고") ||
    normMood.includes("피로")
  ) {
    return {
      type: "rest",
      text: "하루 동안 정말 고생 많으셨습니다! 몸과 마음이 회복 신호를 보내고 있네요. 오늘같이 에너지가 소진된 날에는 무리해서 운동을 강행하기 보다는, 한숨 돌리고 15분 전신 맨몸 골반 스트레칭이나 부드러운 호흡으로 몸의 긴장감을 내려놓기를 강하게 권장합니다. 편히 쉬는 휴식 또한 성장을 위한 매우 훌륭한 운동의 일부분입니다. 💆‍♂️🛌",
      isFallback: true
    };
  }

  if (
    normMood.includes("신나") || 
    normMood.includes("좋") || 
    normMood.includes("에너지") || 
    normMood.includes("기쁜") || 
    normMood.includes("힘차") ||
    normMood.includes("가뿐") ||
    normMood.includes("짱") ||
    normMood.includes("최고") ||
    normMood.includes("상쾌") ||
    normMood.includes("화이팅")
  ) {
    return {
      type: "workout",
      text: "오! 지금 긍정적이고 강인한 기운이 몸 전체에 가득 활성화되어 있네요! 이 기회와 리듬을 완벽히 활용해, 오늘은 심박수를 충분히 끌어올릴 수 있는 인터벌 달리기(스프린트)나, 평소보다 강한 집중력으로 무장한 대근육 위주 장비 운동에 과감히 도전해 보는 것을 추천합니다. 운동 후 차오르는 쾌감과 엔도르핀이 최고의 하루를 완성해 줄 거예요! 🏃‍♂️💪🔥",
      isFallback: true
    };
  }

  if (
    normMood.includes("우울") || 
    normMood.includes("슬프") || 
    normMood.includes("답답") || 
    normMood.includes("화나") ||
    normMood.includes("스트레스") ||
    normMood.includes("짜증") ||
    normMood.includes("귀차") ||
    normMood.includes("다운") ||
    normMood.includes("걱정") ||
    normMood.includes("불안")
  ) {
    return {
      type: "encouragement",
      text: "마음 한구석에 무거운 생각이나 일상의 스트레스가 얹혀서 머리가 조여드는 기분이 드는 날이군요. 그 마음에 아주 깊은 위로와 응원을 전합니다. 오늘은 억지로 스쿼트를 하거나 달릴 필요도 전혀 없습니다. 편안한 트레이닝복으로 갈아입고 좋아하는 음악이나 플레이리스트를 튼 뒤, 바람이 솔솔 부는 곳을 향해 20분만 찬찬히 걸어보세요. 산책을 하면서 몸이 아주 천천히 받아들인 환기가 무거운 걱정 가방을 가볍게 떨어뜨려 줄 테니까요. 늘 응원하고 있습니다! ✨🕊️",
      isFallback: true
    };
  }

  return {
    type: "workout",
    text: `"${mood}" 상태시군요! 일상 속에서 편안하게 활력을 되찾기에 딱 훌륭한 타이밍입니다. 오늘은 거창한 강도 트레이닝 대신, 부상 방지를 가미한 가벼운 고관절 스트레칭과 약 20분의 빠른 걸음 산책, 혹은 체중 운동(플랭크/스쿼트)을 부담 없이 세 세트만 진행하여 부드럽게 혈액순환을 느껴 보는 것은 어떨까요? 몸도 기분도 휠씬 매끄러워질 거예요! 오늘도 파이팅입니다. 👍🌟`,
    isFallback: true
  };
}

function getLocalHealthAnalysis(
  weeklyFrequency: number,
  weeklyDuration: number,
  weeklyCalories: number,
  workoutLogs: any[]
): { status: string; icon: string; color: string; msg: string; isFallback: boolean } {
  const freq = Number(weeklyFrequency) || 0;
  const duration = Number(weeklyDuration) || 0;
  const calories = Number(weeklyCalories) || 0;

  let status = "보통";
  let icon = "🟡";
  let color = "text-yellow-500";
  let msg = "";

  if (freq === 0) {
    status = "적신호";
    icon = "🚨";
    color = "text-red-500";
    msg = "이번 주 아직 기록된 운동량이 없는 것으로 나타났어요! 바쁜 한 주였을 수 있지만 가벼운 면역력 유지 및 신체 자극을 위해, 오늘은 15분 제자리 걸음이나 자기 전 가벼운 전신 폼롤러 스트레칭부터 편히 시작해 보시길 권장해 드립니다. 몸은 작게 시작할 때 가장 안전하게 힘을 얻습니다.";
  } else if (freq >= 1 && freq <= 2) {
    status = "보통";
    icon = "🟡";
    color = "text-yellow-500";
    msg = `일주일에 총 ${freq}회(${duration}분 소모, 약 ${calories} kcal)의 지속을 해내고 계시네요! 운동 근지구력 세포를 올리는 아주 멋지고 영리한 첫 습관 형성 단계입니다. 일상에 조금의 틈을 늘려서 다음 주에는 주 3회 운동으로 빈도를 높여 유산소와 타바타 등을 적절히 교환하며 몸의 성장 변화를 직접 구경해 보시는 것을 적극 추천드립니다.`;
  } else if (freq >= 3 && freq <= 5) {
    status = "좋음";
    icon = "🟢";
    color = "text-neon-green";
    msg = `주 ${freq}회 총 ${duration}분 동안 무려 ${calories} kcal를 열정적으로 소모하고 계십니다! 건강한 신체 대사와 최적의 밸런스를 입증하는 가장 전문적이고 훌륭한 주간 트레이닝 주기에 안착해 계셔요. 규칙적인 근력 자극과 심폐 기능 향상이 동시에 유기적으로 일어나고 있으니 다치지 않게 안전 규칙만 준수하여 멋진 활력을 유지해 보세요!`;
  } else {
    status = "최고";
    icon = "✨";
    color = "text-cyan-400";
    msg = `주 ${freq}회 총 ${duration}분(${calories} kcal 소모)이라는 대단한 초인적 기록을 찍어내셨습니다! 뛰어난 심폐지구력과 열정에 아낌없는 기립 박수를 보냅니다. 다만 이렇게 과밀된 빈도로 매일 채찍질하게 되면 근지구력 과부하 또는 피로 골절이나 오버트레이닝 위험이 발생 가능하오니, 주 1~2회는 아늑하게 몸을 가꾸는 '수동적 휴식'을 루틴에 녹여 몸을 아껴 주십시오.`;
  }

  return {
    status,
    icon,
    color,
    msg,
    isFallback: true
  };
}

// AI Mood Recommendation Endpoint
app.post("/api/gemini/recommendation", async (req, res) => {
  const { mood } = req.body;
  if (!mood) {
    return res.status(400).json({ error: "Mood is required" });
  }

  console.log(`Received Mood Recommendation request. Mood: "${mood}"`);
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `사용자의 현재 기분/상태: "${mood}"
      위 기분에 맞춰서 오늘의 운동을 추천하거나, 휴식을 권장하거나, 따뜻한 격려를 해주는 짤막한 메시지를 작성해줘.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            text: {
              type: Type.STRING,
              description: "메시지 내용 (한국어, 친근하고 에너제틱하거나 따뜻한 톤)",
            },
            type: {
              type: Type.STRING,
              description: "추천 타입: 'rest' (휴식 권장), 'workout' (운동 추천), 'encouragement' (따뜻한 위로/격려)"
            }
          },
          required: ["text", "type"]
        }
      }
    });

    const text = response.text || "{}";
    console.log("Gemini Mood Recommendation Response text:", text);
    const parsed = JSON.parse(text);
    res.json({
      ...parsed,
      isFallback: false
    });
  } catch (error: any) {
    console.error("Gemini Mood Recommendation Error:", error);
    const fallbackData = getLocalRecommendation(mood);
    res.json({
      ...fallbackData,
      rawError: error.message || String(error)
    });
  }
});

// AI Health Analysis Endpoint
app.post("/api/gemini/health-analysis", async (req, res) => {
  const { weeklyFrequency, weeklyDuration, weeklyCalories, workoutLogs } = req.body;

  console.log("Received Health Analysis request with stats:", { weeklyFrequency, weeklyDuration, weeklyCalories });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `사용자의 주간 운동 데이터:
      - 주간 운동 빈도: ${weeklyFrequency || 0}회
      - 주간 총 운동 시간: ${weeklyDuration || 0}분
      - 주간 소모 칼로리: ${weeklyCalories || 0} kcal
      - 최근 운동 로그 목록: ${JSON.stringify(workoutLogs || [])}
      
      이 주간 운동 패턴을 분석하고 종합적인 AI 건강 상태 피드백을 한글로 제공해줘.
      - 규칙적인 유산소, 근력, 유연성 운동 여부에 근거한 전문적이지만 친근한 피드백을 전달해줘.
      - 일주일간 운동 빈도가 너무 적다면 가벼운 걷기 등 실천 가능한 구체적 조언을 포함해줘.
      - 운동 빈도가 너무 많다면(6회 이상) 충분한 회복 시기와 휴식을 권유해줘.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            status: {
              type: Type.STRING,
              description: "건강 상태 단계: 적신호, 보통, 좋음, 최고 중 하나",
            },
            icon: {
              type: Type.STRING,
              description: "상태에 적합한 대표 이모지(🚨, 🟡, 🟢, ✨ 중 하나)",
            },
            color: {
              type: Type.STRING,
              description: "상태에 대응되는 Tailwind CSS 색상 클래스(text-red-500, text-yellow-500, text-neon-green, text-cyan-400 중 하나)",
            },
            msg: {
              type: Type.STRING,
              description: "종합적이고 친근한 건강 피드백 메시지 (한국어로 2~3문장)",
            }
          },
          required: ["status", "icon", "color", "msg"]
        }
      }
    });

    const text = response.text || "{}";
    console.log("Gemini Health Analysis Response text:", text);
    const parsed = JSON.parse(text);
    res.json({
      ...parsed,
      isFallback: false
    });
  } catch (errorByGemini: any) {
    console.error("Gemini Health Analysis Error:", errorByGemini);
    const fallbackData = getLocalHealthAnalysis(
      weeklyFrequency,
      weeklyDuration,
      weeklyCalories,
      workoutLogs
    );
    res.json({
      ...fallbackData,
      rawError: errorByGemini.message || String(errorByGemini)
    });
  }
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();

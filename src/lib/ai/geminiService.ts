import { GoogleGenAI } from '@google/genai';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.GEMINI_API_KEY || '';

let aiClient: GoogleGenAI | null = null;
if (apiKey) {
  try {
    aiClient = new GoogleGenAI({ apiKey });
  } catch (err) {
    console.warn('GoogleGenAI initialization warning:', err);
  }
}

export interface WrestlerPerformancePromptInput {
  wrestlerName: string;
  weightCategory: string;
  style: string;
  recentMatchesCount: number;
  winRate: number;
  strengths: string;
  weaknesses: string;
}

export interface WeightCutPromptInput {
  wrestlerName: string;
  currentWeightKg: number;
  targetWeightKg: number;
  daysUntilWeighIn: number;
  hydrationUSG?: number;
}

export interface TrainingDrillPromptInput {
  focusArea: 'par_terre' | 'standing_throws' | 'clinch_pummeling' | 'conditioning';
  experienceLevel: string;
  durationMinutes: number;
}

/**
 * AI Service 1: Wrestler Technical & Tactical Match Analysis
 */
export async function analyzeWrestlerPerformance(input: WrestlerPerformancePromptInput, lang: string = 'en'): Promise<string> {
  const prompt = `You are an elite Greco-Roman & Freestyle Olympic Wrestling AI Technical Analyst.
Analyze wrestler: ${input.wrestlerName}
Weight Category: ${input.weightCategory} | Style: ${input.style}
Recent Win Rate: ${input.winRate}% over ${input.recentMatchesCount} bouts.
Known Strengths: ${input.strengths}
Areas for Improvement: ${input.weaknesses}

Provide a concise, 3-point tactical debrief and match preparation strategy. Output in ${lang === 'ar' ? 'Arabic' : lang === 'fr' ? 'French' : 'English'}. Include specific Greco-Roman/Freestyle wrestling technique cues.`;

  if (!aiClient) {
    return generateFallbackPerformanceAnalysis(input, lang);
  }

  try {
    const response = await aiClient.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || generateFallbackPerformanceAnalysis(input, lang);
  } catch (error) {
    console.warn('Gemini API call failed, using fallback response:', error);
    return generateFallbackPerformanceAnalysis(input, lang);
  }
}

/**
 * AI Service 2: Safe Weight Cutting & Hydration Guidance
 */
export async function generateWeightManagementAdvice(input: WeightCutPromptInput, lang: string = 'en'): Promise<string> {
  const prompt = `You are a certified Olympic Wrestling Sports Nutritionist and High Performance Physiologist.
Provide safe weight cut advice for wrestler ${input.wrestlerName}:
Current Weight: ${input.currentWeightKg} kg | Target Weight: ${input.targetWeightKg} kg
Time Remaining: ${input.daysUntilWeighIn} days.
Urine Specific Gravity (Hydration): ${input.hydrationUSG || '1.015 (Normal)'}

Provide 3 actionable, medically safe guidelines for weight optimization without compromising explosive muscle power. Output in ${lang === 'ar' ? 'Arabic' : lang === 'fr' ? 'French' : 'English'}.`;

  if (!aiClient) {
    return generateFallbackWeightAdvice(input, lang);
  }

  try {
    const response = await aiClient.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || generateFallbackWeightAdvice(input, lang);
  } catch (error) {
    console.warn('Gemini API call failed, using fallback response:', error);
    return generateFallbackWeightAdvice(input, lang);
  }
}

/**
 * AI Service 3: Custom Wrestling Training Drill Generation
 */
export async function generateCustomTrainingDrills(input: TrainingDrillPromptInput, lang: string = 'en'): Promise<string> {
  const prompt = `You are a Head National Wrestling Coach.
Generate a custom ${input.durationMinutes}-minute training session drill plan for:
Focus Area: ${input.focusArea}
Athlete Experience: ${input.experienceLevel}

Include warmup, technical drill progressions, and high-intensity simulated match conditions. Output in ${lang === 'ar' ? 'Arabic' : lang === 'fr' ? 'French' : 'English'}.`;

  if (!aiClient) {
    return generateFallbackDrills(input, lang);
  }

  try {
    const response = await aiClient.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || generateFallbackDrills(input, lang);
  } catch (error) {
    console.warn('Gemini API call failed, using fallback response:', error);
    return generateFallbackDrills(input, lang);
  }
}

// Fallback Generators for Offline / No API Key environments

function generateFallbackPerformanceAnalysis(input: WrestlerPerformancePromptInput, lang: string): string {
  if (lang === 'ar') {
    return `📊 **تحليل الذكاء الاصطناعي للمصارع ${input.wrestlerName}**:
1. **الالتحام والسيطرة (Clinch Control)**: تعزيز التحكم بالأذرع Underhook وتفادي السلبية في الـ Par Terre.
2. **رميات الصدر والرفع**: التركيز على رمية Souplesse والـ Gut Wrench بسرعة استجابة عالية.
3. **التكتيك الذهني**: الاستفادة من نقاط القوة (${input.strengths}) ومعالجة ثغرة (${input.weaknesses}).`;
  }
  return `📊 **AI Performance Debrief for ${input.wrestlerName}**:
1. **Clinch & Control**: Dominate the chest-to-chest lock with high underhook leverage.
2. **Par Terre Offense**: Explosive hip drive during Gut Wrench execution to secure 2-point turns.
3. **Tactical Gameplan**: Leverage key strength (${input.strengths}) while protecting against (${input.weaknesses}).`;
}

function generateFallbackWeightAdvice(input: WeightCutPromptInput, lang: string): string {
  const diff = Number((input.currentWeightKg - input.targetWeightKg).toFixed(1));
  if (lang === 'ar') {
    return `⚖️ **نصائح الذكاء الاصطناعي لتخفيض الوزن الآمن (${input.wrestlerName})**:
- الوزن المطلوب تخفيضه: ${diff} كجم خلال ${input.daysUntilWeighIn} يوماً.
- التغذية: المحافظة على التغذية المتوازنة واستبدال السكريات بالبروتين النقي.
- الإماهة: تجنب الجفاف الحاد قبل الوزن بـ 24 ساعة لضمان القوة الانفجارية.`;
  }
  return `⚖️ **AI Safe Weight Management Protocol (${input.wrestlerName})**:
- Target Reduction: ${diff} kg over ${input.daysUntilWeighIn} days.
- Nutrition: Maintain clean protein intake and timing to preserve lean muscle tissue.
- Hydration: Keep USG < 1.020 until 18h prior to official weigh-in for optimal power preservation.`;
}

function generateFallbackDrills(input: TrainingDrillPromptInput, lang: string): string {
  if (lang === 'ar') {
    return `🤼 **برنامج التدريب المخصص (${input.durationMinutes} دقيقة - ${input.focusArea})**:
1. **الإحماء (10 د)**: مرونة الرقبة والعمود الفقري وتمارين Pummeling الثنائية.
2. **التمارين الفنية (25 د)**: 5 مجموعات × 6 تكرارات لرميات الصدر والتكنيك الأرضي Par Terre.
3. **محاكاة النزالات (15 د)**: 3 جولات × 3 دقائق بفرض مواقف السلبية والضغط العالي.`;
  }
  return `🤼 **Custom AI Drill Routine (${input.durationMinutes} mins - ${input.focusArea})**:
1. **Warmup (10m)**: Neck mobility, dynamic spine bridges, chest pummeling drills.
2. **Technical Reps (25m)**: 5 sets x 6 reps of Par Terre Gut Wrench & Souplesse chest lock transitions.
3. **Live Match Conditions (15m)**: 3 rounds x 3 mins with forced passivity scenarios.`;
}

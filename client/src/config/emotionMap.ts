export interface EmotionTheme {
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  gradient: string;
  cssClass: string;
}

export const emotionMap: Record<string, EmotionTheme> = {
  trust: {
    name: "Trust",
    primary: "hsl(147, 70%, 52%)",
    secondary: "hsl(147, 70%, 42%)",
    accent: "hsl(147, 70%, 35%)",
    background: "hsl(147, 70%, 97%)",
    text: "hsl(147, 70%, 15%)",
    gradient: "linear-gradient(135deg, hsl(147, 70%, 52%) 0%, hsl(147, 70%, 42%) 100%)",
    cssClass: "emotion-trust"
  },
  excitement: {
    name: "Excitement",
    primary: "hsl(43, 96%, 56%)",
    secondary: "hsl(43, 96%, 46%)",
    accent: "hsl(43, 96%, 36%)",
    background: "hsl(43, 96%, 97%)",
    text: "hsl(43, 96%, 15%)",
    gradient: "linear-gradient(135deg, hsl(43, 96%, 56%) 0%, hsl(43, 96%, 46%) 100%)",
    cssClass: "emotion-excitement"
  },
  relief: {
    name: "Relief",
    primary: "hsl(262, 83%, 68%)",
    secondary: "hsl(262, 83%, 58%)",
    accent: "hsl(262, 83%, 48%)",
    background: "hsl(262, 83%, 97%)",
    text: "hsl(262, 83%, 15%)",
    gradient: "linear-gradient(135deg, hsl(262, 83%, 68%) 0%, hsl(262, 83%, 58%) 100%)",
    cssClass: "emotion-relief"
  },
  confidence: {
    name: "Confidence",
    primary: "hsl(0, 84%, 60%)",
    secondary: "hsl(0, 84%, 50%)",
    accent: "hsl(0, 84%, 40%)",
    background: "hsl(0, 84%, 97%)",
    text: "hsl(0, 84%, 15%)",
    gradient: "linear-gradient(135deg, hsl(0, 84%, 60%) 0%, hsl(0, 84%, 50%) 100%)",
    cssClass: "emotion-confidence"
  },
  calm: {
    name: "Calm",
    primary: "hsl(188, 94%, 43%)",
    secondary: "hsl(188, 94%, 33%)",
    accent: "hsl(188, 94%, 23%)",
    background: "hsl(188, 94%, 97%)",
    text: "hsl(188, 94%, 15%)",
    gradient: "linear-gradient(135deg, hsl(188, 94%, 43%) 0%, hsl(188, 94%, 33%) 100%)",
    cssClass: "emotion-calm"
  }
};

export const getEmotionTheme = (emotion: string): EmotionTheme => {
  return emotionMap[emotion] || emotionMap.trust;
};

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ModuleProps } from "@/types/config";
import { emotionMap } from "@/config/emotionMap";

const QuizModule = ({ emotion, pageConfig }: ModuleProps) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showResults, setShowResults] = useState(false);
  const theme = emotionMap[emotion];

  const questions = [
    {
      question: "What's your current fitness level?",
      options: [
        { id: "beginner", label: "Beginner - Just starting out", score: 1 },
        { id: "intermediate", label: "Intermediate - Some experience", score: 2 },
        { id: "advanced", label: "Advanced - Very experienced", score: 3 }
      ]
    },
    {
      question: "How many days per week can you commit to exercise?",
      options: [
        { id: "1-2", label: "1-2 days", score: 1 },
        { id: "3-4", label: "3-4 days", score: 2 },
        { id: "5+", label: "5+ days", score: 3 }
      ]
    },
    {
      question: "What's your primary fitness goal?",
      options: [
        { id: "weight-loss", label: "Weight Loss", score: 1 },
        { id: "muscle-gain", label: "Muscle Gain", score: 2 },
        { id: "endurance", label: "Endurance", score: 3 }
      ]
    }
  ];

  const handleAnswerChange = (value: string) => {
    setAnswers({ ...answers, [currentQuestion]: value });
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setShowResults(true);
    }
  };

  const calculateScore = () => {
    let totalScore = 0;
    Object.values(answers).forEach(answerId => {
      questions.forEach(question => {
        const option = question.options.find(opt => opt.id === answerId);
        if (option) totalScore += option.score;
      });
    });
    return totalScore;
  };

  const getResultMessage = (score: number) => {
    if (score <= 4) return "Beginner Plan - Start with basic exercises and build your foundation";
    if (score <= 7) return "Intermediate Plan - Ready for more challenging workouts";
    return "Advanced Plan - Push your limits with intense training";
  };

  if (showResults) {
    const score = calculateScore();
    return (
      <Card className="mb-6" style={{ borderColor: theme.primary }}>
        <CardHeader style={{ backgroundColor: theme.background }}>
          <CardTitle style={{ color: theme.text }}>Your Personalized Results</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="text-center">
            <div 
              className="text-6xl font-bold mb-4"
              style={{ color: theme.primary }}
            >
              {score}/9
            </div>
            <h3 className="text-xl font-semibold mb-4">{getResultMessage(score)}</h3>
            <Button
              onClick={() => window.location.href = pageConfig.cta.link}
              style={{ 
                background: theme.gradient,
                color: 'white',
                border: 'none'
              }}
            >
              {pageConfig.cta.text}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6" style={{ borderColor: theme.primary }}>
      <CardHeader style={{ backgroundColor: theme.background }}>
        <CardTitle style={{ color: theme.text }}>
          Question {currentQuestion + 1} of {questions.length}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-6">
          <h3 className="text-lg font-semibold">{questions[currentQuestion].question}</h3>
          
          <RadioGroup
            value={answers[currentQuestion] || ""}
            onValueChange={handleAnswerChange}
          >
            {questions[currentQuestion].options.map((option) => (
              <div key={option.id} className="flex items-center space-x-2">
                <RadioGroupItem value={option.id} id={option.id} />
                <Label htmlFor={option.id} className="cursor-pointer">
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>

          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
              disabled={currentQuestion === 0}
            >
              Previous
            </Button>
            <Button
              onClick={nextQuestion}
              disabled={!answers[currentQuestion]}
              style={{ 
                background: theme.gradient,
                color: 'white',
                border: 'none'
              }}
            >
              {currentQuestion === questions.length - 1 ? "Get Results" : "Next"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuizModule;

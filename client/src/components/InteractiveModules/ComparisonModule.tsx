import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ModuleProps } from "@/types/config";
import { emotionMap } from "@/config/emotionMap";

const ComparisonModule = ({ emotion, pageConfig }: ModuleProps) => {
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const theme = emotionMap[emotion];

  const getComparisonData = () => {
    if (pageConfig.niche === "mental-health") {
      return {
        title: "Anxiety Relief Techniques Comparison",
        items: [
          {
            id: "breathing",
            name: "Deep Breathing",
            effectiveness: 85,
            timeRequired: "2-5 minutes",
            difficulty: "Easy",
            cost: "Free",
            features: ["Immediate relief", "Can be done anywhere", "No equipment needed"]
          },
          {
            id: "meditation",
            name: "Meditation",
            effectiveness: 90,
            timeRequired: "10-20 minutes",
            difficulty: "Medium",
            cost: "Free - $10/month",
            features: ["Long-term benefits", "Improves focus", "Reduces stress"]
          },
          {
            id: "exercise",
            name: "Physical Exercise",
            effectiveness: 78,
            timeRequired: "20-60 minutes",
            difficulty: "Medium",
            cost: "Free - $50/month",
            features: ["Improves mood", "Builds confidence", "Physical health benefits"]
          }
        ]
      };
    } else {
      return {
        title: "Business Growth Strategies",
        items: [
          {
            id: "content-marketing",
            name: "Content Marketing",
            effectiveness: 88,
            timeRequired: "10-20 hours/week",
            difficulty: "Medium",
            cost: "$500-2000/month",
            features: ["Long-term growth", "Builds authority", "SEO benefits"]
          },
          {
            id: "paid-ads",
            name: "Paid Advertising",
            effectiveness: 75,
            timeRequired: "5-10 hours/week",
            difficulty: "Hard",
            cost: "$1000-10000/month",
            features: ["Immediate results", "Scalable", "Measurable ROI"]
          },
          {
            id: "social-media",
            name: "Social Media Marketing",
            effectiveness: 70,
            timeRequired: "15-25 hours/week",
            difficulty: "Easy",
            cost: "$200-1000/month",
            features: ["Brand awareness", "Community building", "Direct engagement"]
          }
        ]
      };
    }
  };

  const comparisonData = getComparisonData();

  return (
    <Card className="mb-6" style={{ borderColor: theme.primary }}>
      <CardHeader style={{ backgroundColor: theme.background }}>
        <CardTitle style={{ color: theme.text }}>{comparisonData.title}</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {comparisonData.items.map((item) => (
            <Card
              key={item.id}
              className={`cursor-pointer transition-all ${
                selectedItem === item.id ? 'ring-2' : ''
              }`}
              style={{ 
                ringColor: selectedItem === item.id ? theme.primary : 'transparent',
                borderColor: selectedItem === item.id ? theme.primary : undefined
              }}
              onClick={() => setSelectedItem(selectedItem === item.id ? null : item.id)}
            >
              <CardContent className="p-4">
                <h3 className="font-semibold mb-2">{item.name}</h3>
                
                <div className="space-y-2 mb-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Effectiveness</span>
                    <Badge 
                      variant="secondary"
                      style={{ 
                        backgroundColor: theme.background,
                        color: theme.text 
                      }}
                    >
                      {item.effectiveness}%
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Time Required</span>
                    <span className="text-sm">{item.timeRequired}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Difficulty</span>
                    <span className="text-sm">{item.difficulty}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Cost</span>
                    <span className="text-sm">{item.cost}</span>
                  </div>
                </div>

                {selectedItem === item.id && (
                  <div className="pt-3 border-t">
                    <h4 className="font-medium mb-2">Key Features:</h4>
                    <ul className="text-sm space-y-1">
                      {item.features.map((feature, index) => (
                        <li key={index} className="flex items-center">
                          <span className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: theme.primary }}></span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
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
};

export default ComparisonModule;

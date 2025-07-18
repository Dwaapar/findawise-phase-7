import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ModuleProps } from "@/types/config";
import { emotionMap } from "@/config/emotionMap";

const CalculatorModule = ({ emotion, pageConfig }: ModuleProps) => {
  const [initialInvestment, setInitialInvestment] = useState<number>(10000);
  const [annualReturn, setAnnualReturn] = useState<number>(7);
  const [years, setYears] = useState<number>(10);
  const [monthlyContribution, setMonthlyContribution] = useState<number>(500);
  const theme = emotionMap[emotion];

  const calculateCompoundInterest = () => {
    const monthlyRate = annualReturn / 100 / 12;
    const totalMonths = years * 12;
    
    // Future value of initial investment
    const futureValueInitial = initialInvestment * Math.pow(1 + monthlyRate, totalMonths);
    
    // Future value of monthly contributions
    const futureValueContributions = monthlyContribution * 
      ((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate);
    
    const totalFutureValue = futureValueInitial + futureValueContributions;
    const totalContributions = initialInvestment + (monthlyContribution * totalMonths);
    const totalGains = totalFutureValue - totalContributions;
    
    return {
      futureValue: totalFutureValue,
      totalContributions,
      totalGains
    };
  };

  const results = calculateCompoundInterest();

  return (
    <Card className="mb-6" style={{ borderColor: theme.primary }}>
      <CardHeader style={{ backgroundColor: theme.background }}>
        <CardTitle style={{ color: theme.text }}>Investment Calculator</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Input Section */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="initial">Initial Investment ($)</Label>
              <Input
                id="initial"
                type="number"
                value={initialInvestment}
                onChange={(e) => setInitialInvestment(Number(e.target.value))}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="monthly">Monthly Contribution ($)</Label>
              <Input
                id="monthly"
                type="number"
                value={monthlyContribution}
                onChange={(e) => setMonthlyContribution(Number(e.target.value))}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="return">Annual Return (%)</Label>
              <Input
                id="return"
                type="number"
                step="0.1"
                value={annualReturn}
                onChange={(e) => setAnnualReturn(Number(e.target.value))}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="years">Investment Period (Years)</Label>
              <Input
                id="years"
                type="number"
                value={years}
                onChange={(e) => setYears(Number(e.target.value))}
                className="mt-1"
              />
            </div>
          </div>

          {/* Results Section */}
          <div className="space-y-4">
            <div 
              className="p-4 rounded-lg"
              style={{ backgroundColor: theme.background }}
            >
              <h3 className="font-semibold mb-3" style={{ color: theme.text }}>
                Projected Results
              </h3>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Total Contributions:</span>
                  <span className="font-semibold">
                    ${results.totalContributions.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span>Total Gains:</span>
                  <span 
                    className="font-semibold"
                    style={{ color: theme.primary }}
                  >
                    ${results.totalGains.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                  </span>
                </div>
                
                <div className="flex justify-between text-lg font-bold pt-2 border-t">
                  <span>Final Value:</span>
                  <span style={{ color: theme.primary }}>
                    ${results.futureValue.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                  </span>
                </div>
              </div>
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
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CalculatorModule;

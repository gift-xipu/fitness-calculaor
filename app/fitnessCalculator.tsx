"use client"

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Activity, Heart, Leaf } from 'lucide-react';

const FitnessCalculator = () => {
  const [calculationType, setCalculationType] = useState('bmr');
  const [formData, setFormData] = useState({
    weight: '',
    height: '',
    age: '',
    gender: 'male',
    waist: '',
    neck: '',
    hip: '',
    activityLevel: 'sedentary',
    drinks: '',
    alcoholContent: '',
    hours: '',
    macroRatio: 'balanced'
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/fitness', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          calculation: calculationType,
          ...formData
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Calculation failed');
      }
      setResult(data.result);
    } catch (error) {
      setError(error.message);
      console.error('Calculation failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const renderFields = () => {
    const commonFields = (
      <>
        <div className="space-y-2">
          <label className="text-sm font-medium">Gender</label>
          <Select name="gender" onValueChange={(value) => setFormData(prev => ({ ...prev, gender: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </>
    );

    switch (calculationType) {
      case 'bmr':
      case 'bmi':
      case 'calorieNeeds':
      case 'tdee':
        return (
          <>
            {commonFields}
            <Input
              type="number"
              name="weight"
              placeholder="Weight (kg)"
              value={formData.weight}
              onChange={handleInputChange}
              className="mt-2"
            />
            <Input
              type="number"
              name="height"
              placeholder="Height (cm)"
              value={formData.height}
              onChange={handleInputChange}
              className="mt-2"
            />
            <Input
              type="number"
              name="age"
              placeholder="Age"
              value={formData.age}
              onChange={handleInputChange}
              className="mt-2"
            />
            {(calculationType === 'calorieNeeds' || calculationType === 'tdee') && (
              <Select 
                name="activityLevel" 
                onValueChange={(value) => setFormData(prev => ({ ...prev, activityLevel: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Activity Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sedentary">Sedentary</SelectItem>
                  <SelectItem value="light">Light Activity</SelectItem>
                  <SelectItem value="moderate">Moderate Activity</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="very_active">Very Active</SelectItem>
                </SelectContent>
              </Select>
            )}
          </>
        );
      case 'bfp':
        return (
          <>
            {commonFields}
            <Input
              type="number"
              name="waist"
              placeholder="Waist (cm)"
              value={formData.waist}
              onChange={handleInputChange}
              className="mt-2"
            />
            <Input
              type="number"
              name="neck"
              placeholder="Neck (cm)"
              value={formData.neck}
              onChange={handleInputChange}
              className="mt-2"
            />
            {formData.gender === 'female' && (
              <Input
                type="number"
                name="hip"
                placeholder="Hip (cm)"
                value={formData.hip}
                onChange={handleInputChange}
                className="mt-2"
              />
            )}
            <Input
              type="number"
              name="height"
              placeholder="Height (cm)"
              value={formData.height}
              onChange={handleInputChange}
              className="mt-2"
            />
          </>
        );
      case 'macros':
        return (
          <>
            <Input
              type="number"
              name="weight"
              placeholder="Daily Calories"
              value={formData.weight}
              onChange={handleInputChange}
              className="mt-2"
            />
            <Select 
              name="macroRatio" 
              onValueChange={(value) => setFormData(prev => ({ ...prev, macroRatio: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Macro Ratio" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="balanced">Balanced (30/40/30)</SelectItem>
                <SelectItem value="low_carb">Low Carb (40/20/40)</SelectItem>
                <SelectItem value="high_protein">High Protein (40/30/30)</SelectItem>
              </SelectContent>
            </Select>
          </>
        );
      case 'bac':
        return (
          <>
            {commonFields}
            <Input
              type="number"
              name="drinks"
              placeholder="Number of drinks"
              value={formData.drinks}
              onChange={handleInputChange}
              className="mt-2"
            />
            <Input
              type="number"
              name="alcoholContent"
              placeholder="Alcohol content (%)"
              value={formData.alcoholContent}
              onChange={handleInputChange}
              className="mt-2"
            />
            <Input
              type="number"
              name="weight"
              placeholder="Weight (kg)"
              value={formData.weight}
              onChange={handleInputChange}
              className="mt-2"
            />
            <Input
              type="number"
              name="hours"
              placeholder="Hours since first drink"
              value={formData.hours}
              onChange={handleInputChange}
              className="mt-2"
            />
          </>
        );
      default:
        return null;
    }
  };

  const formatResult = (result: any) => {
    if (result === null) return '';
    
    switch (calculationType) {
      case 'bmr':
        return `BMR: ${Math.round(result)} calories/day`;
      case 'bmi':
        return `BMI: ${result.toFixed(1)}`;
      case 'bfp':
        return `Body Fat Percentage: ${result.toFixed(1)}%`;
      case 'idealBodyWeight':
        return `Ideal Body Weight: ${Math.round(result)} kg`;
      case 'calorieNeeds':
        return `Daily Calorie Needs: ${Math.round(result)} calories`;
      case 'tdee':
        return `TDEE: ${Math.round(result)} calories/day`;
      case 'macros':
        return `Protein: ${result.protein}g, Carbs: ${result.carbs}g, Fats: ${result.fats}g`;
      case 'bac':
        return `Blood Alcohol Content: ${(result * 100).toFixed(3)}%`;
      default:
        return JSON.stringify(result);
    }
  };

  const getCalculationDescription = (type) => {
    const descriptions = {
      bmr: "Basal Metabolic Rate (BMR) is the number of calories your body burns while performing basic life-sustaining functions like breathing, circulation, and cell production.",
      bmi: "Body Mass Index (BMI) is a simple measurement using your weight and height to work out if your weight is healthy. However, it doesn't account for muscle mass.",
      bfp: "Body Fat Percentage (BFP) measures the amount of body fat as a proportion of your body weight. This helps assess your overall fitness level and health risks.",
      idealBodyWeight: "Ideal Body Weight estimates a healthy weight range based on your height and gender. It's a general guideline and may not apply to athletes or elderly.",
      calorieNeeds: "Daily Calorie Needs calculates how many calories you should consume daily based on your BMR and activity level to maintain your current weight.",
      tdee: "Total Daily Energy Expenditure (TDEE) is the total number of calories you burn each day, including physical activity and basic bodily functions.",
      macros: "Macro Calculator determines the ideal ratio of proteins, carbohydrates, and fats you should consume based on your daily calorie needs and fitness goals.",
      bac: "Blood Alcohol Content (BAC) estimates the percentage of alcohol in your bloodstream based on consumption, weight, gender, and time elapsed."
    };
    return descriptions[type] || "";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4 md:p-8">
      <Card className="w-full max-w-2xl mx-auto shadow-lg border-t-4 border-t-green-500 bg-white/90 backdrop-blur-sm">
        <CardHeader className="space-y-4 text-center">
          <div className="flex items-center justify-center space-x-2">
            <Activity className="w-6 h-6 text-green-500" />
            <Heart className="w-6 h-6 text-red-400" />
            <Leaf className="w-6 h-6 text-green-400" />
          </div>
          <CardTitle className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            Fitness Calculator
          </CardTitle>
          <p className="text-gray-600">Calculate your health and fitness metrics</p>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Select
                name="calculationType"
                onValueChange={(value) => {
                  setCalculationType(value);
                  setResult(null);
                  setError('');
                }}
              >
                <SelectTrigger className="bg-white border-2 border-green-100 focus:ring-green-500 h-12">
                  <SelectValue placeholder="Select calculation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bmr">🔥 Basal Metabolic Rate (BMR)</SelectItem>
                  <SelectItem value="bmi">📏 Body Mass Index (BMI)</SelectItem>
                  <SelectItem value="bfp">📊 Body Fat Percentage (BFP)</SelectItem>
                  <SelectItem value="idealBodyWeight">⚖️ Ideal Body Weight</SelectItem>
                  <SelectItem value="calorieNeeds">🍎 Calorie Needs</SelectItem>
                  <SelectItem value="tdee">⚡ Total Daily Energy Expenditure (TDEE)</SelectItem>
                  <SelectItem value="macros">🥑 Macro Calculator</SelectItem>
                  <SelectItem value="bac">🧪 Blood Alcohol Content (BAC)</SelectItem>
                </SelectContent>
              </Select>
              
              {calculationType && (
                <div className="mt-2 p-4 bg-blue-50 rounded-lg border border-blue-100">
                  <p className="text-sm text-blue-800">
                    {getCalculationDescription(calculationType)}
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-4 bg-green-50/50 p-6 rounded-lg border border-green-100">
              {renderFields()}
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-[1.02]"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Calculating...</span>
                </div>
              ) : (
                'Calculate'
              )}
            </Button>

            {error && (
              <Alert variant="destructive" className="bg-red-50 border-red-200">
                <AlertDescription className="text-red-800">{error}</AlertDescription>
              </Alert>
            )}

            {result !== null && !error && (
              <Alert className="bg-green-50 border-green-200">
                <AlertDescription className="text-lg font-semibold text-green-800 text-center py-2">
                  {formatResult(result)}
                </AlertDescription>
              </Alert>
            )}
          </form>
        </CardContent>
      </Card>

      <div className="mt-6 text-center text-sm text-gray-500">
        <p>Stay healthy, stay fit! 💪</p>
      </div>
    </div>
  );
};

export default FitnessCalculator;
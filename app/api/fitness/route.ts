// app/api/fitness/route.ts
import { NextResponse } from 'next/server';

// Helper function to ensure number inputs
const parseNumber = (value: string | undefined): number => {
  const num = Number(value);
  return isNaN(num) ? 0 : num;
};

// BMR calculation using Mifflin-St Jeor Equation
const calculateBMR = (weight: number, height: number, age: number, gender: string): number => {
  const base = 10 * weight + 6.25 * height - 5 * age;
  return gender.toLowerCase() === 'male' ? base + 5 : base - 161;
};

// BMI calculation
const calculateBMI = (weight: number, height: number): number => {
  const heightInMeters = height / 100;
  return weight / (heightInMeters * heightInMeters);
};

// Body Fat Percentage using U.S. Navy Method
const calculateBFP = (waist: number, neck: number, height: number, gender: string, hip?: number): number => {
  if (gender.toLowerCase() === 'male') {
    return 495 / (1.0324 - 0.19077 * Math.log10(waist - neck) + 0.15456 * Math.log10(height)) - 450;
  }
  return 495 / (1.29579 - 0.35004 * Math.log10(waist + hip! - neck) + 0.22100 * Math.log10(height)) - 450;
};

// Ideal Body Weight using Hamwi formula
const calculateIdealWeight = (height: number, gender: string): number => {
  const heightInInches = height / 2.54;
  const baseHeight = 60;
  const extraInches = Math.max(0, heightInInches - baseHeight);
  
  if (gender.toLowerCase() === 'male') {
    return 48.0 + 2.7 * extraInches;
  }
  return 45.5 + 2.2 * extraInches;
};

// Calorie Needs based on BMR and activity level
const calculateCalorieNeeds = (bmr: number, activityLevel: string): number => {
  const activityMultipliers: { [key: string]: number } = {
    'sedentary': 1.2,
    'light': 1.375,
    'moderate': 1.55,
    'active': 1.725,
    'very_active': 1.9
  };
  return bmr * (activityMultipliers[activityLevel] || 1.2);
};

// TDEE calculation
const calculateTDEE = (bmr: number, activityLevel: string): number => {
  return calculateCalorieNeeds(bmr, activityLevel);
};

// Macro calculation
const calculateMacros = (calories: number, ratio: string): { protein: number; carbs: number; fats: number } => {
  const ratios: { [key: string]: [number, number, number] } = {
    'balanced': [0.3, 0.4, 0.3],      // 30/40/30 (protein/carbs/fat)
    'low_carb': [0.4, 0.2, 0.4],      // 40/20/40
    'high_protein': [0.4, 0.3, 0.3],  // 40/30/30
  };
  
  const [proteinRatio, carbRatio, fatRatio] = ratios[ratio] || ratios['balanced'];
  
  return {
    protein: Math.round((calories * proteinRatio) / 4),  // 4 calories per gram of protein
    carbs: Math.round((calories * carbRatio) / 4),       // 4 calories per gram of carbs
    fats: Math.round((calories * fatRatio) / 9)          // 9 calories per gram of fat
  };
};

// BAC calculation using Widmark formula
const calculateBAC = (
  drinks: number,
  alcohol_content: number,
  weight: number,
  hours: number,
  gender: string
): number => {
  const genderConstant = gender.toLowerCase() === 'male' ? 0.68 : 0.55;
  const alcoholConsumed = drinks * alcohol_content * 29.5735; // Convert oz to ml
  const bac = ((alcoholConsumed * 0.789 * 100) / (weight * 1000 * genderConstant)) - (0.015 * hours);
  return Math.max(0, bac);
};

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const {
      calculation,
      weight,
      height,
      age,
      gender,
      waist,
      neck,
      hip,
      activityLevel,
      drinks,
      alcoholContent,
      hours,
      macroRatio
    } = data;

    let result;

    switch (calculation) {
      case 'bmr':
        result = calculateBMR(parseNumber(weight), parseNumber(height), parseNumber(age), gender);
        break;
      case 'bmi':
        result = calculateBMI(parseNumber(weight), parseNumber(height));
        break;
      case 'bfp':
        result = calculateBFP(
          parseNumber(waist),
          parseNumber(neck),
          parseNumber(height),
          gender,
          parseNumber(hip)
        );
        break;
      case 'idealBodyWeight':
        result = calculateIdealWeight(parseNumber(height), gender);
        break;
      case 'calorieNeeds':
        const bmr = calculateBMR(parseNumber(weight), parseNumber(height), parseNumber(age), gender);
        result = calculateCalorieNeeds(bmr, activityLevel);
        break;
      case 'tdee':
        const baseBMR = calculateBMR(parseNumber(weight), parseNumber(height), parseNumber(age), gender);
        result = calculateTDEE(baseBMR, activityLevel);
        break;
      case 'macros':
        const calories = parseNumber(weight);
        result = calculateMacros(calories, macroRatio);
        break;
      case 'bac':
        result = calculateBAC(
          parseNumber(drinks),
          parseNumber(alcoholContent),
          parseNumber(weight),
          parseNumber(hours),
          gender
        );
        break;
      default:
        throw new Error('Invalid calculation type');
    }

    return NextResponse.json({ result });
  } catch (error) {
    return NextResponse.json(
      { error: 'Calculation failed', message: (error as Error).message },
      { status: 400 }
    );
  }
}
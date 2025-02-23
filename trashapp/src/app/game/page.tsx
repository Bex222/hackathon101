"use client"; // Enables client-side interactivity

import { useState } from "react";
import Link from "next/link";

interface Option {
  label: string;
  value: number; // 1 = Best/Low Impact, higher numbers = Higher Impact
}

interface Question {
  category: string;
  question: string;
  options: Option[];
  tips: Record<number, string>; // Map each answer value to a tip
}

const questions: Question[] = [
  // 2. Waste at Home
  {
    category: "Waste Management",
    question: "How do you handle waste at home?",
    options: [
      { label: "Recycle and compost", value: 1 },
      { label: "Recycle but don’t compost", value: 2 },
      { label: "Don’t separate waste", value: 3 },
      { label: "Throw everything away", value: 4 },
    ],
    tips: {
      1: "Excellent! Separating waste and composting reduces landfill and provides organic fertilizer.",
      2: "Good job recycling, but adding composting would further reduce waste.",
      3: "Not separating waste leads to inefficient recycling. Consider sorting your trash.",
      4: "Throwing everything away significantly increases landfill and environmental harm.",
    },
  },
  // 3. Daily Travel
  {
    category: "Transportation",
    question: "How do you travel daily?",
    options: [
      { label: "Use public transport, bike, or walk", value: 1 },
      { label: "Carpool or drive a hybrid/electric vehicle", value: 2 },
      { label: "Mostly drive my own car", value: 3 },
      { label: "Drive frequently for short trips", value: 4 },
    ],
    tips: {
      1: "Excellent choice for reducing emissions and congestion.",
      2: "Good—carpooling or using efficient vehicles minimizes your impact.",
      3: "Driving alone increases emissions. Look for alternatives when possible.",
      4: "Frequent short trips add up; try to combine errands or use public transit.",
    },
  },
  // 4. Groceries
  {
    category: "Food Purchasing",
    question: "How do you buy groceries?",
    options: [
      { label: "Buy local and use reusable bags", value: 1 },
      { label: "Buy some local produce and use some plastic bags", value: 2 },
      { label: "Buy packaged foods and use disposable bags", value: 3 },
      { label: "Buy pre-packaged foods and always use plastic bags", value: 4 },
    ],
    tips: {
      1: "Great! Supporting local markets and reusables minimizes packaging waste.",
      2: "Better than fully packaged, but try to use fewer plastic bags.",
      3: "Packaged foods increase waste—consider fresh, local options.",
      4: "High packaging waste. Opt for local produce and reusable options whenever possible.",
    },
  },
  // 5. Cleaning Products
  {
    category: "Household Products",
    question: "What kind of cleaning products do you use?",
    options: [
      { label: "Use eco-friendly, non-toxic cleaners", value: 1 },
      { label: "Use some eco-friendly, but also regular cleaners", value: 2 },
      { label: "Mostly use regular cleaning products", value: 3 },
      { label: "Use harsh chemical cleaners often", value: 4 },
    ],
    tips: {
      1: "Excellent! Eco-friendly cleaners are safer for both the environment and your health.",
      2: "A mix is okay, but switching entirely to eco-friendly products is best.",
      3: "Using mostly regular products increases chemical waste. Consider greener alternatives.",
      4: "Harsh chemicals can be very damaging. Look for non-toxic, sustainable cleaning options.",
    },
  },
  // 6. Food Waste
  {
    category: "Food Waste",
    question: "How do you manage food waste?",
    options: [
      { label: "Compost food scraps and minimize waste", value: 1 },
      { label: "Throw away food scraps, but try not to waste much", value: 2 },
      { label: "Waste a lot of food", value: 3 },
      { label: "Don’t think about food waste", value: 4 },
    ],
    tips: {
      1: "Excellent! Composting not only reduces waste but also creates nutrient-rich soil.",
      2: "Some effort is made, but planning meals better could reduce waste even more.",
      3: "High food waste can be reduced by planning and proper storage.",
      4: "Ignoring food waste contributes to environmental harm. Consider mindful consumption.",
    },
  },
  // 7. Old Electronics
  {
    category: "Electronics Disposal",
    question: "How do you dispose of old electronics?",
    options: [
      { label: "Recycle them properly", value: 1 },
      { label: "Sell or donate them", value: 2 },
      { label: "Throw them away", value: 3 },
      { label: "Keep them forever", value: 4 },
    ],
    tips: {
      1: "Great choice! Proper recycling recovers valuable materials.",
      2: "Good—extending the life of electronics through donation or sale is beneficial.",
      3: "Throwing away electronics harms the environment. Look for proper disposal options.",
      4: "Holding on indefinitely isn’t ideal; consider recycling if they’re not in use.",
    },
  },
  // 8. Plastic Packaging
  {
    category: "Packaging",
    question: "How do you handle plastic packaging?",
    options: [
      { label: "Avoid plastic and use reusable containers", value: 1 },
      { label: "Try to reduce plastic, but still buy some", value: 2 },
      { label: "Often buy items with plastic packaging", value: 3 },
      { label: "Buy a lot of plastic-packaged items", value: 4 },
    ],
    tips: {
      1: "Excellent! Avoiding plastic greatly reduces waste and pollution.",
      2: "Good effort, but further reduction in plastic use would be beneficial.",
      3: "Frequent plastic use increases waste; consider reusables where possible.",
      4: "High reliance on plastic is detrimental. Seek alternatives to reduce your impact.",
    },
  },
];

export default function ImpactPage() {
  // Track current question index and answers
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>(Array(questions.length).fill(0));
  const [submitted, setSubmitted] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];

  const handleOptionChange = (value: number) => {
    const updated = [...answers];
    updated[currentQuestionIndex] = value;
    setAnswers(updated);
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  // Save survey results to localStorage, then submit.
  const handleSubmit = () => {
    localStorage.setItem("surveyResults", JSON.stringify(answers));
    setSubmitted(true);
  };

  // Calculate overall score and maximum possible score.
  let totalScore = 0;
  let maxScore = 0;
  questions.forEach((q, index) => {
    const chosenValue = q.options.find((opt) => opt.value === answers[index])?.value || 0;
    const questionMax = Math.max(...q.options.map((o) => o.value));
    totalScore += chosenValue;
    maxScore += questionMax;
  });
  const scorePercent = Math.round((totalScore / maxScore) * 100);

  if (submitted) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center p-4 sm:p-8">
        <header className="mb-8 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold">Your Overall Results</h1>
          <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-300">
            Score: {totalScore} / {maxScore} ({scorePercent}%)
          </p>
        </header>
        <div className="mb-6">
          <h3 className="text-xl font-bold mb-2">Personalized Insights</h3>
          {questions.map((q, i) => {
            const userAnswer = answers[i];
            const userTip = q.tips[userAnswer];
            return (
              <div key={i} className="mb-4 p-4 border-b border-gray-200 dark:border-gray-700">
                <p className="font-semibold">{q.question}</p>
                <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                  {userTip || "No specific tip available for this answer."}
                </p>
              </div>
            );
          })}
        </div>
        <div className="flex flex-col gap-4 items-center">
          <Link
            href="/tracker"
            className="px-6 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded transition transform hover:scale-105"
          >
            Go to Tracker
          </Link>
          <button
            onClick={() => setSubmitted(false)}
            className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded transition transform hover:scale-105"
          >
            Retake Quiz
          </button>
        </div>
        <footer className="mt-10 text-center text-sm text-gray-600 dark:text-gray-400">
          © {new Date().getFullYear()} Environmental Impact Quiz
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center p-4 sm:p-8">
      <header className="mb-8 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold">Environmental Impact Quiz</h1>
        <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-300">
          Answer the questions below to see personalized insights on how your choices impact the environment.
        </p>
      </header>

      <div className="max-w-2xl w-full p-4 bg-white dark:bg-gray-800 rounded shadow">
        <h2 className="text-lg font-semibold mb-2">{currentQuestion.category}</h2>
        <p className="mb-3">{currentQuestion.question}</p>
        <div className="flex flex-col gap-2">
          {currentQuestion.options.map((opt, idx) => (
            <label key={idx} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name={question-${currentQuestionIndex}}
                value={opt.value}
                checked={answers[currentQuestionIndex] === opt.value}
                onChange={() => handleOptionChange(opt.value)}
                className="accent-green-600"
              />
              <span>{opt.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex justify-between max-w-2xl w-full mt-6">
        <button
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
          className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded disabled:opacity-50"
        >
          Previous
        </button>
        {currentQuestionIndex < questions.length - 1 ? (
          <button
            onClick={handleNext}
            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded"
          >
            Next
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded"
          >
            Submit
          </button>
        )}
      </div>

      <footer className="mt-10 text-center text-sm text-gray-600 dark:text-gray-400">
        © {new Date().getFullYear()} Environmental Impact Quiz
      </footer>
    </div>
  );
}
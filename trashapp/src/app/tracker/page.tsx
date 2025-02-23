"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Task {
  id: string;
  description: string;
  done: boolean;
}

interface DayTracker {
  day: number;
  tasks: Task[];
}

const tasksByCategory: Record<string, string[]> = {
  "Waste Management": ["Separate your waste", "Compost organic waste"],
  Transportation: ["Use public transport or carpool", "Walk or bike for short trips"],
  "Food Purchasing": ["Bring reusable bags", "Buy local produce"],
  "Household Products": ["Switch to eco-friendly cleaners", "Avoid harsh chemical cleaners"],
  "Food Waste": ["Plan meals to reduce waste", "Compost food scraps"],
  "Electronics Disposal": ["Recycle old electronics properly", "Donate unused electronics"],
  Packaging: ["Avoid plastic packaging", "Use reusable containers"],
};

export default function TrackerPage() {
  const [trackerData, setTrackerData] = useState<DayTracker[]>([]);
  const [surveyResults, setSurveyResults] = useState<number[] | null>(null);
  const [overallProgress, setOverallProgress] = useState(0);
  const [strikes, setStrikes] = useState(0);

  // Load survey results from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("surveyResults");
    if (stored) {
      const results = JSON.parse(stored) as number[];
      setSurveyResults(results);
    }
  }, []);

  // Generate tasks for the tracker based on survey results
  useEffect(() => {
    if (!surveyResults) return;

    // Our survey covers 7 categories in this order:
    // [Waste Management, Transportation, Food Purchasing, Household Products, Food Waste, Electronics Disposal, Packaging]
    const categoryKeys = [
      "Waste Management",
      "Transportation",
      "Food Purchasing",
      "Household Products",
      "Food Waste",
      "Electronics Disposal",
      "Packaging",
    ];
    // For each category, if the answer is greater than 1 (i.e. needs improvement), add its tasks.
    const improvementCategories = categoryKeys.filter((_, idx) => surveyResults[idx] > 1);

    let tasks: string[] = [];
    improvementCategories.forEach((cat) => {
      const catTasks = tasksByCategory[cat];
      if (catTasks) {
        tasks = tasks.concat(catTasks);
      }
    });
    // If the user is already doing great (no improvement tasks), provide a default task.
    if (tasks.length === 0) {
      tasks = ["Maintain your great habits", "Share your sustainability tips with others"];
    }

    // Create tracker data for 30 days; each day will have the same set of tasks (all initially not done).
    const data: DayTracker[] = [];
    for (let day = 1; day <= 30; day++) {
      const dayTasks = tasks.map((desc, index) => ({
        id: `${day}-${index}`,
        description: desc,
        done: false,
      }));
      data.push({ day, tasks: dayTasks });
    }
    setTrackerData(data);
  }, [surveyResults]);

  // Toggle a task's completion state for a given day
  const toggleTask = (dayIndex: number, taskId: string) => {
    const updatedData = trackerData.map((day, idx) => {
      if (idx === dayIndex) {
        return {
          ...day,
          tasks: day.tasks.map((task) =>
            task.id === taskId ? { ...task, done: !task.done } : task
          ),
        };
      }
      return day;
    });
    setTrackerData(updatedData);
    calculateProgress(updatedData);
  };

  // Calculate overall progress and strike count
  const calculateProgress = (data: DayTracker[]) => {
    const totalTasks = data.reduce((sum, day) => sum + day.tasks.length, 0);
    const completedTasks = data.reduce(
      (sum, day) => sum + day.tasks.filter((task) => task.done).length,
      0
    );
    const progress = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;
    setOverallProgress(progress);

    // Define strikes as days with less than 50% tasks completed
    const strikeCount = data.filter(
      (day) => day.tasks.filter((task) => task.done).length < day.tasks.length / 2
    ).length;
    setStrikes(strikeCount);
  };

  useEffect(() => {
    calculateProgress(trackerData);
  }, [trackerData]);

  if (!surveyResults) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p>Please complete the survey first.</p>
        <Link href="/game" className="underline text-blue-600">
          Go to Survey
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-8">
      {/* Top Section */}
      <div className="mb-8 space-y-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
          <h2 className="text-xl font-bold mb-2">Learn More About Your Impact</h2>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Discover how your daily habits affect the environment and learn actionable tips to improve your sustainability.
          </p>
          <Link href="/learn-more" className="mt-2 inline-block px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded">
            Learn More
          </Link>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded shadow flex justify-around items-center">
          <div>
            <p className="text-lg font-bold">{overallProgress}%</p>
            <p className="text-sm text-gray-600 dark:text-gray-300">Tasks Completed</p>
          </div>
          <div>
            <p className="text-lg font-bold">{strikes}</p>
            <p className="text-sm text-gray-600 dark:text-gray-300">Strike(s)</p>
          </div>
          <div>
            <Link href="/game" className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded">
              Retake Survey
            </Link>
          </div>
        </div>
      </div>

      {/* Tracker Grid */}
      <h2 className="text-2xl font-bold mb-4 text-center">30-Day Sustainability Tracker</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {trackerData.map((day, index) => (
          <div key={day.day} className="bg-white dark:bg-gray-800 p-4 rounded shadow">
            <h3 className="font-bold mb-2">Day {day.day}</h3>
            <ul>
              {day.tasks.map((task) => (
                <li key={task.id} className="flex items-center mb-1">
                  <input
                    type="checkbox"
                    checked={task.done}
                    onChange={() => toggleTask(index, task.id)}
                    className="mr-2 accent-green-600"
                  />
                  <span className={task.done ? "line-through" : ""}>{task.description}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Overall Progress Footer */}
      <div className="mt-8 text-center">
        <p className="text-lg font-bold">Overall Completion: {overallProgress}%</p>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Strike count (days with less than 50% tasks completed): {strikes}
        </p>
      </div>
    </div>
  );
}
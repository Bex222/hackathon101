"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Task {
  id: string;
  description: string;
  done: boolean;
  selected?: boolean; // Used during challenge selection
}

interface DayTracker {
  day: number;
  tasks: Task[];
  confirmed: boolean; // Whether the challenges for the day have been confirmed
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
  const [streak, setStreak] = useState(0);
  const [showImpact, setShowImpact] = useState(false);

  // Load survey results from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("surveyResults");
    if (stored) {
      const results = JSON.parse(stored) as number[];
      setSurveyResults(results);
    }
  }, []);

  // Generate tasks based on survey results
  const generateTasks = () => {
    if (!surveyResults) return [];
    const categoryKeys = [
      "Waste Management",
      "Transportation",
      "Food Purchasing",
      "Household Products",
      "Food Waste",
      "Electronics Disposal",
      "Packaging",
    ];
    const improvementCategories = categoryKeys.filter((_, idx) => surveyResults[idx] >= 3);
    let tasks: string[] = [];
    improvementCategories.forEach((cat) => {
      const catTasks = tasksByCategory[cat];
      if (catTasks) {
        tasks = tasks.concat(catTasks);
      }
    });
    if (tasks.length === 0) {
      tasks = ["Maintain your great habits", "Share your sustainability tips with others"];
    }
    // Return task objects with default flags
    return tasks.map((desc, index) => ({
      id: `${Date.now()}-${index}`, // Unique id based on timestamp and index
      description: desc,
      done: false,
      selected: false,
    }));
  };

  // Initialize trackerData with one day if surveyResults exist and no day has been created yet
  useEffect(() => {
    if (surveyResults && trackerData.length === 0) {
      const tasks = generateTasks();
      const initialDay: DayTracker = { day: 1, tasks: tasks, confirmed: false };
      setTrackerData([initialDay]);
    }
  }, [surveyResults]);

  // Compute overall progress using confirmed days only
  const computeProgress = (data: DayTracker[]) => {
    let totalTasks = 0;
    let completedTasks = 0;
    data.forEach((day) => {
      if (day.confirmed) {
        totalTasks += day.tasks.length;
        completedTasks += day.tasks.filter((task) => task.done).length;
      }
    });
    return totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;
  };

  // Compute streak using only confirmed days.
  // The streak is the count of consecutive successful confirmed days (i.e. >=50% tasks done)
  // from the latest confirmed day backwards. If there is no confirmed day, or the last confirmed day
  // is unsuccessful, the streak is 0.
  const computeStreak = (data: DayTracker[]) => {
    // Only consider confirmed days
    const confirmedDays = data.filter((day) => day.confirmed);
    if (confirmedDays.length === 0) return 0;

    let currentStreak = 0;
    // Start from the latest confirmed day and count backwards
    for (let i = confirmedDays.length - 1; i >= 0; i--) {
      const day = confirmedDays[i];
      const success = day.tasks.filter((t) => t.done).length >= day.tasks.length / 2;
      if (success) {
        currentStreak++;
      } else {
        break;
      }
    }
    return currentStreak;
  };

  // Recalculate overall progress and streak when trackerData changes
  useEffect(() => {
    const progress = computeProgress(trackerData);
    setOverallProgress(progress);
    setStreak(computeStreak(trackerData));
  }, [trackerData]);

  // Toggle task completion (for confirmed days)
  const toggleTaskCompletion = (dayIndex: number, taskId: string) => {
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
  };

  // Toggle task selection during the challenge selection phase for the current day
  const toggleTaskSelection = (taskId: string) => {
    const currentDayIndex = trackerData.length - 1;
    const updatedData = trackerData.map((day, idx) => {
      if (idx === currentDayIndex && !day.confirmed) {
        return {
          ...day,
          tasks: day.tasks.map((task) =>
            task.id === taskId ? { ...task, selected: !task.selected } : task
          ),
        };
      }
      return day;
    });
    setTrackerData(updatedData);
  };

  // Confirm the challenge selection for the current day
  const confirmChallenges = () => {
    const currentDayIndex = trackerData.length - 1;
    const currentDay = trackerData[currentDayIndex];
    const selectedTasks = currentDay.tasks.filter((task) => task.selected);
    if (selectedTasks.length === 0) {
      alert("Please select at least one challenge for today.");
      return;
    }
    const updatedDay: DayTracker = {
      ...currentDay,
      confirmed: true,
      // Keep only the selected tasks for the day
      tasks: selectedTasks.map((task) => ({ ...task, done: false })),
    };
    const updatedTracker = [...trackerData];
    updatedTracker[currentDayIndex] = updatedDay;
    setTrackerData(updatedTracker);
  };

  // Add a new day to the tracker
  const addNewDay = () => {
    const newDayNumber = trackerData.length + 1;
    const tasks = generateTasks();
    const newDay: DayTracker = { day: newDayNumber, tasks: tasks, confirmed: false };
    setTrackerData([...trackerData, newDay]);
  };

  // Display all days; all previous days remain visible and affect progress/streak.
  const displayedDays = trackerData;

  // Calculate trees planted for the impact description (1 tree per 10% progress)
  const treesPlanted = Math.floor(overallProgress / 10);

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
            Discover how your daily habits affect the environment.
          </p>
          <button
            onClick={() => setShowImpact(!showImpact)}
            className="mt-2 inline-block px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded"
          >
            Learn More
          </button>
          {showImpact && (
            <div className="mt-4 p-4 bg-green-100 text-green-800 rounded">
              Your efforts are equivalent to planting {treesPlanted} tree{treesPlanted !== 1 ? "s" : ""}!
            </div>
          )}
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded shadow flex justify-around items-center">
          <div>
            <p className="text-lg font-bold">{overallProgress}%</p>
            <p className="text-sm text-gray-600 dark:text-gray-300">Tasks Completed</p>
          </div>
          <div>
            <p className="text-lg font-bold">{streak}</p>
            <p className="text-sm text-gray-600 dark:text-gray-300">Streak</p>
          </div>
          <div>
            <Link href="/game" className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded">
              Retake Survey
            </Link>
          </div>
        </div>
      </div>

      {/* Tracker Days */}
      <h2 className="text-2xl font-bold mb-4 text-center">Sustainability Tracker</h2>
      <div className="space-y-8">
        {displayedDays.map((day, index) => {
          // Only the latest day is editable.
          const isCurrentDay = index === trackerData.length - 1;
          return (
            <div key={day.day} className="bg-white dark:bg-gray-800 p-4 rounded shadow">
              <h3 className="font-bold mb-2">Day {day.day}</h3>
              {isCurrentDay && !day.confirmed ? (
                // Challenge selection interface for the current day
                <div>
                  <p className="mb-2">Select the challenges you want to complete today:</p>
                  <ul>
                    {day.tasks.map((task) => (
                      <li key={task.id} className="flex items-center mb-1">
                        <input
                          type="checkbox"
                          checked={task.selected || false}
                          onChange={() => toggleTaskSelection(task.id)}
                          className="mr-2 accent-green-600"
                        />
                        <span>{task.description}</span>
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={confirmChallenges}
                    className="mt-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded"
                  >
                    Submit Challenges
                  </button>
                </div>
              ) : (
                // Display tasks; checkboxes enabled only for the current day.
                <ul>
                  {day.tasks.map((task) => (
                    <li key={task.id} className="flex items-center mb-1">
                      <input
                        type="checkbox"
                        checked={task.done}
                        onChange={() =>
                          isCurrentDay
                            ? toggleTaskCompletion(trackerData.length - 1, task.id)
                            : null
                        }
                        className="mr-2 accent-green-600"
                        disabled={!isCurrentDay}
                      />
                      <span className={task.done ? "line-through" : ""}>{task.description}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>

      {/* New Day Button */}
      <div className="mt-8 flex justify-center">
        <button
          onClick={addNewDay}
          className="px-6 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded transition transform hover:scale-105"
        >
          New Day
        </button>
      </div>

      {/* Overall Progress Footer */}
      <div className="mt-8 text-center">
        <p className="text-lg font-bold">Overall Completion: {overallProgress}%</p>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Streak: {streak} day{streak !== 1 ? "s" : ""}
        </p>
      </div>
    </div>
  );
}

// src/app/game/page.tsx
"use client"; // Enables client-side rendering for interactivity
import { useState } from "react";
import GameCard from "@/components/GameCard";
import Scoreboard from "@/components/Scoreboard";

interface Item {
  id: number;
  name: string;
  image: string;
  recyclable: boolean;
  info: string; // educational info to show after guessing
}

const items: Item[] = [
  {
    id: 1,
    name: "Plastic Bottle",
    image: "/plastic-bottle.jpg",
    recyclable: true,
    info: "Plastic bottles are recyclable – please rinse before recycling!",
  },
  {
    id: 2,
    name: "Styrofoam Cup",
    image: "/styrofoam-cup.jpg",
    recyclable: false,
    info: "Styrofoam is not accepted by most recycling facilities.",
  },
  // ... add more items as needed
];

export default function GamePage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState("");

  const currentItem = items[currentIndex];

  const handleGuess = (guess: boolean) => {
    const correct = guess === currentItem.recyclable;
    if (correct) {
      setScore(score + 1);
      setFeedback("Correct! " + currentItem.info);
    } else {
      setFeedback("Oops, that's not right. " + currentItem.info);
    }
  };

  const handleNext = () => {
    setFeedback("");
    if (currentIndex < items.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Restart or show final score if needed
      alert(`Game over! Your score: ${score}/${items.length}`);
      setCurrentIndex(0);
      setScore(0);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center p-8">
      <Header title="Recyclable or not?" />
      <Scoreboard score={score} total={items.length} />
      <GameCard item={currentItem} onGuess={handleGuess} />
      {feedback && (
        <div className="mt-4 p-4 bg-gray-200 dark:bg-gray-700 rounded shadow transition-all">
          {feedback}
        </div>
      )}
      {feedback && (
        <button
          onClick={handleNext}
          className="mt-6 px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded transition transform hover:scale-105"
        >
          Next
        </button>
      )}
      <Footer />
    </div>
  );
}

// Dummy header and footer for illustration (you can create these as separate components too)
function Header({ title }: { title: string }) {
  return (
    <header className="mb-8">
      <h1 className="text-4xl font-bold">{title}</h1>
    </header>
  );
}

function Footer() {
  return (
    <footer className="mt-10 text-sm text-gray-600">
      © {new Date().getFullYear()} Recyclable or not? Game
    </footer>
  );
}

// src/components/Scoreboard.tsx
export default function Scoreboard({
    score,
    total,
  }: {
    score: number;
    total: number;
  }) {
    return (
      <div className="mb-6 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg shadow text-center">
        <p className="text-lg font-medium">
          Score: <span className="font-bold">{score}</span> / {total}
        </p>
      </div>
    );
  }
  
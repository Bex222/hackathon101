// src/components/GameCard.tsx
"use client";
import Image from "next/image";

interface Item {
  id: number;
  name: string;
  image: string;
  recyclable: boolean;
  info: string;
}

interface GameCardProps {
  item: Item;
  onGuess: (guess: boolean) => void;
}

export default function GameCard({ item, onGuess }: GameCardProps) {
  return (
    <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden transform transition duration-500 hover:scale-105">
      <div className="relative h-64">
        <Image
          src={item.image}
          alt={item.name}
          layout="fill"
          objectFit="cover"
          className="object-center"
        />
      </div>
      <div className="p-6">
        <h2 className="text-2xl font-semibold mb-4">{item.name}</h2>
        <div className="flex justify-around">
          <button
            onClick={() => onGuess(true)}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded transition transform hover:scale-105"
          >
            Recyclable
          </button>
          <button
            onClick={() => onGuess(false)}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded transition transform hover:scale-105"
          >
            Not Recyclable
          </button>
        </div>
      </div>
    </div>
  );
}

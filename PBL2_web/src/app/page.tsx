"use client";

import { useState } from "react";
import Header from "@/app/_components/Header";
import ToolCard from "@/app/_components/ToolCard";
import { Tool } from "@/app/types/tool";

export default function Home() {
  const [tools, setTools] = useState<Tool[]>([
    {
      id: 1,
      name: "3mmドリル",
      stock: 5,
      quantity: 0,
    },
    {
      id: 2,
      name: "5mmドリル",
      stock: 2,
      quantity: 0,
    },
    {
      id: 3,
      name: "8mmドリル",
      stock: 3,
      quantity: 0,
    },
  ]);

  const increase = (id: number) => {
    setTools((prev) =>
      prev.map((tool) =>
        tool.id === id
          ? {
              ...tool,
              quantity: tool.quantity + 1,
            }
          : tool,
      ),
    );
  };

  const decrease = (id: number) => {
    setTools((prev) =>
      prev.map((tool) =>
        tool.id === id && tool.quantity > 0
          ? {
              ...tool,
              quantity: tool.quantity - 1,
            }
          : tool,
      ),
    );
  };

  const handleUnlock = async () => {
    const response = await fetch("/api/unlock", {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify(tools),
    });

    const data = await response.json();

    console.log(data);
  };

  return (
    <main className="min-h-screen bg-gray-100">
      <Header />

      <div className="mx-auto max-w-3xl p-6">
        <div className="space-y-4">
          {tools.map((tool) => (
            <ToolCard
              key={tool.id}
              tool={tool}
              onIncrease={() => increase(tool.id)}
              onDecrease={() => decrease(tool.id)}
            />
          ))}
        </div>

        <button onClick={handleUnlock} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          開錠する
        </button>

      </div>
    </main>
  );
}

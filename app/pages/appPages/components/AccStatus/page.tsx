"use client";
import React, { useState, useEffect } from "react";
import { BsPersonFill, BsDiagram3 } from "react-icons/bs";

interface AccStatusProps {
  name: string;
  title: string;
  image: string;
  followers: number;
  projects: string | number;
  target: number;
}

export default function AccStatusBar({
  name,
  title,
  image,
  followers,
  projects,
  target,
}: AccStatusProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= target) {
          clearInterval(interval);
          return target;
        }
        return prev + 2;
      });
    }, 20);
    return () => clearInterval(interval);
  }, [target]);

  return (
    <div className="w-[500px] h-max rounded-[10px] bg-[#f9f9f9]">
      <div className="flex gap-[20px] p-[10px] leading-[1.5] items-center">
        <img
          src={image}
          alt={name}
          className="w-[60px] h-[60px] rounded-full object-cover"
        />
        <div>
          <h3 className="font-semibold">{name}</h3>
          <p className="text-sm text-gray-600">{title}</p>

          <div className="flex gap-[20px] mt-2">
            <div className="flex gap-[10px] rounded-[10px] bg-white p-[6px] items-center">
              <BsPersonFill size={20} color="black" />
              <p>{followers}</p>
            </div>
            <div className="flex gap-[10px] rounded-[10px] bg-white p-[6px] items-center">
              <BsDiagram3 size={20} color="black" />
              <p>{projects}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="w-450 max-w-lg mx-auto p-3 mt-[-20px]">
        <div className="flex justify-between mb-1 text-sm text-gray-800">
          <span className="font-medium">Profile Score :</span>
          <span className="font-semibold">{progress}%</span>
        </div>
        <div className="w-full bg-gray-200 border border-gray-300 rounded-full h-[8px] overflow-hidden">
          <div
            className="bg-orange-500 h-[8px] rounded-full transition-all duration-200"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}

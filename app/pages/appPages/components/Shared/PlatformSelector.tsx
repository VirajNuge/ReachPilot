"use client";

import React from "react";
import { motion } from "framer-motion";
import { IconType } from "react-icons";
import {
  BsLinkedin,
  BsFacebook,
  BsTwitterX,
  BsInstagram,
  BsPinterest,
} from "react-icons/bs";

export type Platform =
  | "linkedin"
  | "facebook"
  | "twitter"
  | "instagram"
  | "pinterest";

interface PlatformConfig {
  id: Platform;
  name: string;
  icon: IconType;
  color: string;
  placeholder: string;
  urlPattern: RegExp;
}

export const PLATFORMS: PlatformConfig[] = [
  {
    id: "linkedin",
    name: "LinkedIn",
    icon: BsLinkedin,
    color: "#0A66C2",
    placeholder: "https://linkedin.com/in/username",
    urlPattern: /linkedin\.com\/(in|company)\/[\w-]+/i,
  },
  {
    id: "facebook",
    name: "Facebook",
    icon: BsFacebook,
    color: "#1877F2",
    placeholder: "https://facebook.com/username",
    urlPattern: /facebook\.com\/[\w.-]+/i,
  },
  {
    id: "twitter",
    name: "X",
    icon: BsTwitterX,
    color: "#000000",
    placeholder: "https://x.com/username",
    urlPattern: /(twitter|x)\.com\/[\w]+/i,
  },
  {
    id: "instagram",
    name: "Instagram",
    icon: BsInstagram,
    color: "#E4405F",
    placeholder: "https://instagram.com/username",
    urlPattern: /instagram\.com\/[\w._]+/i,
  },
  // {
  //   id: "pinterest",
  //   name: "Pinterest",
  //   icon: BsPinterest,
  //   color: "#E60023",
  //   placeholder: "https://pinterest.com/username",
  //   urlPattern: /pinterest\.com\/[\w]+/i,
  // },
];

interface PlatformSelectorProps {
  selected: Platform;
  onSelect: (platform: Platform) => void;
  className?: string;
}

export const PlatformSelector: React.FC<PlatformSelectorProps> = ({
  selected,
  onSelect,
  className = "",
}) => {
  return (
    <div className={`mb-8 ${className}`}>
      <p className="text-sm text-gray-500 mb-3 text-center">Select Platform</p>
      <div className="flex justify-center gap-2">
        {PLATFORMS.map((platform, index) => (
          <motion.button
            key={platform.id}
            onClick={() => onSelect(platform.id)}
            className={`w-[52px] h-[52px] rounded-[14px] border border-transparent flex items-center justify-center cursor-pointer transition-all duration-200 ease-[cubic-bezier(0.2,0.8,0.2,1)] relative ${
              selected === platform.id
                ? "shadow-[0_4px_12px_-2px_rgba(0,0,0,0.1),0_2px_6px_-1px_rgba(0,0,0,0.06)] scale-105 after:absolute after:inset-[-3px] after:rounded-[17px] after:border-2 after:border-current after:opacity-10"
                : "hover:bg-gray-100 hover:-translate-y-0.5"
            }`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.2 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{
              backgroundColor:
                selected === platform.id ? platform.color : "#f5f5f5",
              color: selected === platform.id ? "white" : "#666",
            }}
            title={platform.name}
          >
            <platform.icon size={20} />
          </motion.button>
        ))}
      </div>
    </div>
  );
};

// Utility to get platform config
export const getPlatformConfig = (id: Platform): PlatformConfig => {
  return PLATFORMS.find((p) => p.id === id) || PLATFORMS[0];
};

// Validate URL for platform
export const validatePlatformUrl = (
  url: string,
  platform: Platform,
): boolean => {
  const config = getPlatformConfig(platform);
  return config.urlPattern.test(url);
};

export default PlatformSelector;

"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";

const transition = {
  type: "spring" as const,
  mass: 0.5,
  damping: 11.5,
  stiffness: 100,
  restDelta: 0.001,
  restSpeed: 0.001,
};

export const MenuItem = ({
  setActive,
  active,
  item,
  children,
}: {
  setActive: (item: string) => void;
  active: string | null;
  item: string;
  children?: React.ReactNode;
}) => {
  return (
    <div onMouseEnter={() => setActive(item)} className="relative ">
      <motion.p
        transition={{ duration: 0.3 }}
        className="cursor-pointer text-black hover:opacity-[0.9] dark:text-white"
      >
        {item}
      </motion.p>
      {active !== null && (
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={transition}
        >
          {active === item && (
            <div className="absolute top-[calc(100%_+_1.2rem)] left-1/2 transform -translate-x-1/2 pt-4">
              <motion.div
                transition={transition}
                layoutId="active"
                className="bg-white dark:bg-black backdrop-blur-sm rounded-2xl overflow-hidden border border-black/[0.2] dark:border-white/[0.2] shadow-xl"
              >
                <motion.div layout className="w-max h-full p-4">
                  {children}
                </motion.div>
              </motion.div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export const Menu = ({
  setActive,
  children,
}: {
  setActive: (item: string | null) => void;
  children: React.ReactNode;
}) => {
  return (
    <nav
      onMouseLeave={() => setActive(null)}
      className="relative rounded-full border border-transparent dark:bg-black dark:border-white/[0.2] bg-white shadow-input flex justify-center space-x-4 px-8 py-6 "
    >
      {children}
    </nav>
  );
};

export const ProductItem = ({
  title,
  description,
  href,
  src,
}: {
  title: string;
  description: string;
  href: string;
  src: string;
}) => {
  return (
    <a href={href} className="flex space-x-2">
      <Image
        src={src}
        width={140}
        height={70}
        alt={title}
        className="shrink-0 rounded-md shadow-2xl"
      />
      <div>
        <h4 className="text-xl font-bold mb-1 text-black dark:text-white">
          {title}
        </h4>
        <p className="text-neutral-700 text-sm max-w-[10rem] dark:text-neutral-300">
          {description}
        </p>
      </div>
    </a>
  );
};

export const HoveredLink = ({ children, ...rest }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => {
  return (
    <a
      {...rest}
      className="text-neutral-700 dark:text-neutral-200 hover:text-black "
    >
      {children}
    </a>
  );
};

export default function Header() {
  const [active, setActive] = useState<string | null>(null);

  return (
    <header className="fixed left-1/2 top-4 z-50 w-[95%] max-w-7xl -translate-x-1/2 rounded-full border border-border/50 bg-black/20 backdrop-blur-lg">
      <div className="mx-auto flex items-center justify-between gap-4 px-6 py-3">
        {/* Logo Section */}
        <div className="flex items-center gap-2">
          <Image
            src="/shadersLogo.png"
            alt="Logo"
            width={40}
            height={40}
            className="rounded-sm"
          />
          <Image
            src="/shadersBanner.png"
            alt="Banner"
            width={120}
            height={40}
            className="rounded-md"
          />
        </div>

        {/* Social Links Section */}
        <div className="flex gap-2">
          <a
            target="_blank"
            href="https://github.com"
            className="border flex-shrink-0 bg-primary text-primary-foreground w-10 h-10 grid place-content-center rounded-md hover:opacity-80 transition-opacity"
          >
            <Image
              src="/landing-page-assets/github-svgrepo-com.svg"
              alt="GitHub"
              width={20}
              height={20}
            />
          </a>

          <a
            target="_blank"
            href="https://x.com/harsh_and_shubham"
            className="border flex-shrink-0 bg-primary text-primary-foreground w-10 h-10 grid place-content-center rounded-md hover:opacity-80 transition-opacity"
          >
            <Image
              src="/landing-page-assets/twitter-x.svg"
              alt="Twitter"
              width={16}
              height={16}
            />
          </a>
        </div>
      </div>
    </header>
  );
}

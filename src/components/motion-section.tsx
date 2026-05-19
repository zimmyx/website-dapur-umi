"use client";

import { motion, type MotionProps } from "framer-motion";
import { fadeInUp } from "@/lib/animations";

type MotionSectionProps = MotionProps &
  React.HTMLAttributes<HTMLElement> & {
    children: React.ReactNode;
  };

export function MotionSection({ children, ...props }: MotionSectionProps) {
  return (
    <motion.section
      variants={fadeInUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      {...props}
    >
      {children}
    </motion.section>
  );
}

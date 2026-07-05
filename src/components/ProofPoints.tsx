import { motion } from "framer-motion";

interface ProofPoint {
  label?: string;
  text: string;
}

interface Props {
  points: ProofPoint[];
}

const EASE_OUT_EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1];

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08, delayChildren: 0.3 },
  },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE_OUT_EXPO } },
};

export default function ProofPoints({ points }: Props) {
  return (
    <motion.ul
      className="mt-6 flex max-w-[700px] flex-col gap-3"
      initial="hidden"
      animate="show"
      variants={container}
    >
      {points.map((point) => (
        <motion.li key={point.text} className="flex gap-3 text-[16px] leading-[1.5] text-whiteout/80" variants={item}>
          <span className="mt-[9px] h-1 w-1 shrink-0 rounded-full bg-signal-blue" />
          <span>
            {point.label && <strong className="font-medium text-whiteout">{point.label} </strong>}
            {point.text}
          </span>
        </motion.li>
      ))}
    </motion.ul>
  );
}

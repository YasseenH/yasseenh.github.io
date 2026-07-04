import { motion } from "framer-motion";

interface Props {
  src: string;
  alt: string;
  width: number;
  height: number;
}

const EASE_OUT_EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1];

export default function FloatingPhoto({ src, alt, width, height }: Props) {
  return (
    <motion.div
      className="relative mx-auto w-full max-w-[280px] shrink-0 lg:max-w-[340px]"
      initial={{ opacity: 0, y: 24, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.8, delay: 0.3, ease: EASE_OUT_EXPO }}
    >
      <div aria-hidden="true" className="absolute -inset-8 -z-10 rounded-full bg-twilight-blue/20 blur-3xl" />

      <motion.div
        animate={{ y: [0, -14, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="overflow-hidden rounded-images border border-whiteout/15 shadow-[0_30px_80px_-20px_rgba(255,255,255,0.18)]"
      >
        <img src={src} alt={alt} width={width} height={height} className="block h-auto w-full" />
      </motion.div>
    </motion.div>
  );
}

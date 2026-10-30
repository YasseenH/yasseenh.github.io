import { motion, useReducedMotion } from "framer-motion";

interface Props {
  src: string;
  alt: string;
  width: number;
  height: number;
}

export default function FloatingPhoto({ src, alt, width, height }: Props) {
  const reduced = useReducedMotion();
  return (
    <div className="portrait-wrap">
      <div aria-hidden="true" className="portrait-glow" />
      <motion.div
        initial={false}
        animate={{ y: reduced ? 0 : [0, -14, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="portrait-frame"
      >
        <img
          src={src}
          alt={alt}
          width={width}
          height={height}
          className="block h-auto w-full"
        />
      </motion.div>
    </div>
  );
}

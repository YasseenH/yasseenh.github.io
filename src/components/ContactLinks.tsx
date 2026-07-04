import { motion } from "framer-motion";

interface ContactLink {
  label: string;
  value: string;
  href: string;
}

interface Props {
  links: ContactLink[];
}

const EASE_OUT_EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1];

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08, delayChildren: 0.2 },
  },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE_OUT_EXPO } },
};

export default function ContactLinks({ links }: Props) {
  return (
    <motion.ul className="mt-8 flex flex-col gap-4" initial="hidden" animate="show" variants={container}>
      {links.map((link) => (
        <motion.li key={link.href} variants={item}>
          <motion.a
            href={link.href}
            className="inline-flex items-baseline gap-3 border-b-2 border-signal-blue pb-1 no-underline"
            whileHover={{ x: 6 }}
            transition={{ duration: 0.2, ease: EASE_OUT_EXPO }}
          >
            <span className="text-[13px] font-medium uppercase tracking-wide text-whiteout/50">{link.label}</span>
            <span className="text-[16px] font-medium text-signal-blue">{link.value}</span>
          </motion.a>
        </motion.li>
      ))}
    </motion.ul>
  );
}

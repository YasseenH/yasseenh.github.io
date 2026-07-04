import { motion } from "framer-motion";

interface Props {
  name: string;
  stack: string;
  year?: string;
  links?: string[];
  bullets: string[];
  delay?: number;
}

const EASE_OUT_EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1];

export default function ProjectCard({ name, stack, year, links, bullets, delay = 0 }: Props) {
  return (
    <motion.article
      className="rounded-cards bg-haze p-5 text-ink"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{ duration: 0.6, delay, ease: EASE_OUT_EXPO }}
      whileHover={{ y: -4, backgroundColor: "#ffffff" }}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h3 className="text-[20px] font-medium leading-[1.4]">{name}</h3>
        {year && <p className="text-[13px] leading-[1.5] text-ink/60">{year}</p>}
      </div>

      <p className="mt-2 text-[13px] leading-[1.5] text-ink/60">{stack}</p>

      {links && links.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {links.map((link) => (
            <span key={link} className="rounded-pills bg-ink/[0.06] px-3 py-1 text-[13px] font-medium text-ink/70">
              {link}
            </span>
          ))}
        </div>
      )}

      <ul className="mt-4 flex flex-col gap-2">
        {bullets.map((bullet) => (
          <li key={bullet} className="flex gap-3 text-[16px] leading-[1.5] text-ink/80">
            <span className="mt-[9px] h-1 w-1 shrink-0 rounded-full bg-ink/40" />
            <span>{bullet}</span>
          </li>
        ))}
      </ul>
    </motion.article>
  );
}

import { motion } from "framer-motion";

interface Props {
  company: string;
  role: string;
  location: string;
  dates: string;
  bullets?: string[];
  note?: string;
  delay?: number;
}

const EASE_OUT_EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1];

export default function JobEntry({ company, role, location, dates, bullets, note, delay = 0 }: Props) {
  return (
    <motion.article
      className="rounded-cards bg-haze p-5 text-ink"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{ duration: 0.6, delay, ease: EASE_OUT_EXPO }}
      whileHover={{ y: -4, backgroundColor: "#ffffff" }}
    >
      <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
        <h3 className="text-[20px] font-medium leading-[1.4]">
          {company} – {role}
        </h3>
        <p className="text-[13px] leading-[1.5] text-ink/60">{dates}</p>
      </div>
      <p className="mt-1 text-[13px] leading-[1.5] text-ink/60">{location}</p>

      {note && <p className="mt-4 text-[16px] leading-[1.5] text-ink/80">{note}</p>}

      {bullets && bullets.length > 0 && (
        <ul className="mt-4 flex flex-col gap-2">
          {bullets.map((bullet) => (
            <li key={bullet} className="flex gap-3 text-[16px] leading-[1.5] text-ink/80">
              <span className="mt-[9px] h-1 w-1 shrink-0 rounded-full bg-ink/40" />
              <span>{bullet}</span>
            </li>
          ))}
        </ul>
      )}
    </motion.article>
  );
}

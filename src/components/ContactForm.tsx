import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";

const FORM_ENDPOINT = "https://formspree.io/f/mzzpdlke";

type Status = "idle" | "submitting" | "success" | "error";

const inputClass =
  "rounded-inputs border border-whiteout/15 bg-whiteout/5 px-[10px] py-[10px] text-[16px] text-whiteout placeholder:text-whiteout/40 transition-colors focus:border-signal-blue focus:outline-none focus:ring-1 focus:ring-signal-blue";
const labelClass = "text-[13px] font-medium uppercase tracking-wide text-whiteout/50";

export default function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    const form = e.currentTarget;
    try {
      const res = await fetch(FORM_ENDPOINT, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" },
      });
      if (res.ok) {
        setStatus("success");
        form.reset();
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-cards border border-whiteout/15 bg-whiteout/5 p-5 text-whiteout">
        <p className="text-[16px] font-medium">Thanks for reaching out — I'll get back to you soon.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="name" className={labelClass}>
            Name
          </label>
          <input id="name" name="name" type="text" required placeholder="Your name" className={inputClass} />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className={labelClass}>
            Email
          </label>
          <input id="email" name="email" type="email" required placeholder="you@example.com" className={inputClass} />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="message" className={labelClass}>
          Message
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          placeholder="What's up?"
          className={`${inputClass} resize-none`}
        />
      </div>

      {status === "error" && (
        <p className="text-[14px] text-whiteout/70">Something went wrong — try emailing me directly instead.</p>
      )}

      <motion.button
        type="submit"
        disabled={status === "submitting"}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        className="mt-1 w-full rounded-buttons border border-whiteout/15 bg-whiteout/5 py-3 text-[14px] font-medium text-whiteout transition-colors hover:border-whiteout hover:bg-whiteout hover:text-ink disabled:opacity-50"
      >
        {status === "submitting" ? "Sending…" : "Send Message"}
      </motion.button>
    </form>
  );
}

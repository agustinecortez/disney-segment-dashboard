// Placeholder — full implementation in Step 11.

import { DISNEY_CONFIG } from "@/lib/disneyData";

export default function Footer() {
  return (
    <footer
      className="w-full border-t px-6 py-3"
      style={{
        borderColor: "var(--color-border)",
        backgroundColor: "var(--color-bg-subtle)",
      }}
    >
      <p
        className="text-xs leading-relaxed"
        style={{ color: "var(--color-text-tertiary)" }}
      >
        {DISNEY_CONFIG.sourceDisclosure}
      </p>
    </footer>
  );
}

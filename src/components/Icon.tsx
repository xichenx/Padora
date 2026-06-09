import { ICON_PATHS } from "../lib/constants";

interface IconProps {
  name: keyof typeof ICON_PATHS | string;
  size?: number;
}

export function Icon({ name, size = 17 }: IconProps) {
  const d = ICON_PATHS[name] ?? "";
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {d.split("M").filter(Boolean).map((seg, i) => (
        <path key={i} d={`M${seg}`} />
      ))}
    </svg>
  );
}

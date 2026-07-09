import type { ReactNode } from "react";

export type PetTile = {
  id: string;
  name: string;
  color: string;
  accent: string;
  icon: ReactNode;
};

function Face({ children, color, accent }: { children: ReactNode; color: string; accent: string }) {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" className="pet-svg">
      <circle cx="32" cy="34" r="22" fill={color} />
      <circle cx="24" cy="31" r="3" fill="#263238" />
      <circle cx="40" cy="31" r="3" fill="#263238" />
      <path
        d="M27 42c3 3 7 3 10 0"
        fill="none"
        stroke="#263238"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <circle cx="32" cy="37" r="3" fill={accent} />
      {children}
    </svg>
  );
}

export const PET_TILES: PetTile[] = [
  {
    id: "cat",
    name: "猫",
    color: "#f6c177",
    accent: "#d45d5d",
    icon: (
      <Face color="#f6c177" accent="#d45d5d">
        <path
          d="M16 23 21 9l10 12M48 23 43 9 33 21"
          fill="#f6c177"
          stroke="#263238"
          strokeWidth="3"
        />
      </Face>
    )
  },
  {
    id: "dog",
    name: "狗",
    color: "#c99564",
    accent: "#7f5539",
    icon: (
      <Face color="#c99564" accent="#7f5539">
        <ellipse cx="14" cy="30" rx="7" ry="13" fill="#8a5a44" />
        <ellipse cx="50" cy="30" rx="7" ry="13" fill="#8a5a44" />
      </Face>
    )
  },
  {
    id: "rabbit",
    name: "兔",
    color: "#f7dfe5",
    accent: "#e78284",
    icon: (
      <Face color="#f7dfe5" accent="#e78284">
        <ellipse cx="23" cy="13" rx="6" ry="14" fill="#f7dfe5" stroke="#263238" strokeWidth="3" />
        <ellipse cx="41" cy="13" rx="6" ry="14" fill="#f7dfe5" stroke="#263238" strokeWidth="3" />
      </Face>
    )
  },
  {
    id: "hamster",
    name: "仓鼠",
    color: "#e8b86d",
    accent: "#f28f3b",
    icon: (
      <Face color="#e8b86d" accent="#f28f3b">
        <circle cx="16" cy="24" r="8" fill="#f2d59b" />
        <circle cx="48" cy="24" r="8" fill="#f2d59b" />
      </Face>
    )
  },
  {
    id: "bird",
    name: "鸟",
    color: "#7bc7d6",
    accent: "#f4a261",
    icon: (
      <Face color="#7bc7d6" accent="#f4a261">
        <path d="M32 36 24 43h16Z" fill="#f4a261" />
        <path d="M15 35c-7 2-9 10-4 14 5-2 9-6 11-13" fill="#55a6b5" />
      </Face>
    )
  },
  {
    id: "fish",
    name: "鱼",
    color: "#67b7dc",
    accent: "#ffb703",
    icon: (
      <svg viewBox="0 0 64 64" aria-hidden="true" className="pet-svg">
        <path d="M12 33c10-14 28-14 40 0-12 14-30 14-40 0Z" fill="#67b7dc" />
        <path d="M52 33 61 22v22Z" fill="#2a9d8f" />
        <circle cx="25" cy="29" r="3" fill="#263238" />
        <path
          d="M31 41c4-2 7-5 8-10"
          fill="none"
          stroke="#ffb703"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
    )
  },
  {
    id: "turtle",
    name: "龟",
    color: "#70a288",
    accent: "#4f772d",
    icon: (
      <svg viewBox="0 0 64 64" aria-hidden="true" className="pet-svg">
        <ellipse cx="33" cy="35" rx="20" ry="17" fill="#70a288" />
        <circle cx="52" cy="32" r="8" fill="#a3b18a" />
        <circle cx="54" cy="30" r="2" fill="#263238" />
        <path
          d="M23 24 43 46M43 24 23 46M33 19v32"
          stroke="#4f772d"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
    )
  },
  {
    id: "fox",
    name: "狐",
    color: "#e76f51",
    accent: "#fff1d6",
    icon: (
      <Face color="#e76f51" accent="#fff1d6">
        <path
          d="M14 24 21 9l9 13M50 24 43 9l-9 13"
          fill="#e76f51"
          stroke="#263238"
          strokeWidth="3"
        />
        <path d="M21 40c6 7 16 7 22 0" fill="#fff1d6" />
      </Face>
    )
  },
  {
    id: "bear",
    name: "熊",
    color: "#9c6644",
    accent: "#ddb892",
    icon: (
      <Face color="#9c6644" accent="#ddb892">
        <circle cx="17" cy="18" r="8" fill="#9c6644" />
        <circle cx="47" cy="18" r="8" fill="#9c6644" />
      </Face>
    )
  },
  {
    id: "panda",
    name: "熊猫",
    color: "#f8f9fa",
    accent: "#111827",
    icon: (
      <Face color="#f8f9fa" accent="#111827">
        <circle cx="17" cy="18" r="8" fill="#111827" />
        <circle cx="47" cy="18" r="8" fill="#111827" />
        <ellipse cx="24" cy="31" rx="7" ry="5" fill="#111827" />
        <ellipse cx="40" cy="31" rx="7" ry="5" fill="#111827" />
      </Face>
    )
  },
  {
    id: "chick",
    name: "雏鸟",
    color: "#ffd166",
    accent: "#f77f00",
    icon: (
      <Face color="#ffd166" accent="#f77f00">
        <path d="M32 9 27 19h10Z" fill="#f77f00" />
        <path d="M32 36 25 42h14Z" fill="#f77f00" />
      </Face>
    )
  },
  {
    id: "frog",
    name: "蛙",
    color: "#80b918",
    accent: "#2b9348",
    icon: (
      <Face color="#80b918" accent="#2b9348">
        <circle cx="21" cy="18" r="8" fill="#80b918" stroke="#263238" strokeWidth="3" />
        <circle cx="43" cy="18" r="8" fill="#80b918" stroke="#263238" strokeWidth="3" />
      </Face>
    )
  }
];

export function getPetTile(tileId: string): PetTile {
  return PET_TILES.find((tile) => tile.id === tileId) ?? PET_TILES[0];
}

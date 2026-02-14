import { motion } from "framer-motion";
import type { Collaborator } from "@/hooks/use-presence";

export function LiveCursors({
  collaborators,
}: {
  collaborators: Collaborator[];
}) {
  return (
    <div className="pointer-events-none fixed inset-0 z-100 overflow-hidden">
      {collaborators.map((collab) => {
        if (!collab.cursor) return null;

        return (
          <motion.div
            key={collab.id}
            className="absolute top-0 left-0 flex flex-col pointer-events-none"
            animate={{ x: collab.cursor.x, y: collab.cursor.y }}
            transition={{
              type: "spring",
              damping: 30,
              mass: 0.8,
              stiffness: 250,
            }}
          >
            <CursorIcon color={collab.color} />
            <div
              className="px-2 py-1 ml-4 mt-1 rounded-full text-xs text-white font-medium whitespace-nowrap shadow-md"
              style={{ backgroundColor: collab.color }}
            >
              {collab.name}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

function CursorIcon({ color }: { color: string }) {
  return (
    <svg
      width="24"
      height="36"
      viewBox="0 0 24 36"
      fill="none"
      stroke="white"
      strokeWidth="2"
      className="drop-shadow-md"
    >
      <path
        d="M5.65376 21.0069L2.34861 3.23554C1.96781 1.18731 4.15549 -0.347576 5.89201 0.751688L21.7515 10.7937C23.5593 11.9383 23.3614 14.6648 21.4111 15.4851L14.7358 18.293C14.2818 18.484 13.916 18.8413 13.7126 19.2921L10.8242 25.6961C9.97159 27.587 7.15555 27.2435 6.77977 25.2227L5.65376 21.0069Z"
        fill={color}
      />
    </svg>
  );
}

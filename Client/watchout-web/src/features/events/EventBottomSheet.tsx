import { useEffect, useRef, useState } from "react";
import type { Event } from "@/utils/types";
import { CommentList } from "./comments/CommentList";
import { Pictures } from "./comments/Pictures";
import { EventDetails } from "./comments/EventDetails";

type EventBottomSheetProps = {
  event: Event;
};

export const EventBottomSheet = ({ event }: EventBottomSheetProps) => {
  const [visible, setVisible] = useState(false);
  const bottomSheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setVisible(true);
    bottomSheetRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  return (
    <div
      ref={bottomSheetRef}
      className={`fixed bottom-0 left-0 right-0 max-h-[40vh] bg-white rounded-t-xl shadow-[0_-2px_16px_rgba(0,0,0,0.1)] overflow-y-auto p-4 z-[1000]
        transition-all duration-500
        ${visible ? "translate-y-0" : "translate-y-full"}
      `}
      style={{ willChange: "transform" }}
    >
      <div className="flex flex-col gap-8">
        <div>
          <EventDetails event={event} />
          <hr className="mt-8" />
        </div>
        <div>
          <CommentList eventId={event.id} />
          <hr className="mt-8" />
        </div>
        <Pictures />
      </div>
    </div>
  );
};

import React, { useEffect } from "react";
import { useGetEventTypes } from "@/features/events/event-types/event-types.hooks";

type EventType = { id: number; name: string; icon: string } | null;

type EventSelectionModalProps = {
  isVisible: boolean;
  setIsVisible: (visible: boolean) => void;
  eventType: EventType;
  setEventType: (eventType: EventType) => void;
};

export const EventTypeSelectionModal: React.FC<EventSelectionModalProps> = ({
  isVisible,
  setIsVisible,
  eventType,
  setEventType,
}) => {
  const { data: eventTypes } = useGetEventTypes();

  useEffect(() => {
    if (!isVisible) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsVisible(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isVisible, setIsVisible]);

  if (!isVisible) return null;

  return (
    <div style={styles.overlay} onClick={() => setIsVisible(false)}>
      <div
        role="dialog"
        aria-modal="true"
        style={styles.modal}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={styles.title}>Wybierz rodzaj zdarzenia</h2>

        <div style={styles.scrollContainer}>
          {eventTypes?.map((type) => {
            const selected = eventType?.id === type.id;
            return (
              <div
                key={type.id}
                onClick={() => {
                  setEventType(type);
                  setIsVisible(false);
                }}
                style={{
                  ...styles.card,
                  ...(selected ? styles.selectedCard : eventType ? styles.dimmed : {}),
                }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    setEventType(type);
                    setIsVisible(false);
                  }
                }}
              >
                <div style={styles.cardContent}>
                  {type.icon ? (
                    <img src={type.icon} alt="" style={styles.icon} />
                  ) : (
                    <div style={styles.iconPlaceholder} />
                  )}
                  <span style={selected ? styles.selectedText : undefined}>{type.name}</span>
                </div>
              </div>
            );
          })}
        </div>

        <button type="button" onClick={() => setIsVisible(false)} style={styles.cancelButton}>
          Anuluj
        </button>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    padding: 20,
  },
  modal: {
    width: "100%",
    maxWidth: 560,
    background: "white",
    borderRadius: 8,
    padding: 16,
    boxSizing: "border-box",
    boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
  },
  title: {
    margin: "0 0 8px 0",
    fontSize: 20,
    fontWeight: 600,
    textAlign: "center",
  },
  scrollContainer: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    maxHeight: "60vh",
    overflowY: "auto",
    padding: 2,
  },
  card: {
    cursor: "pointer",
    borderRadius: 6,
    padding: 8,
    background: "#fff",
    border: "1px solid #eee",
  },
  dimmed: {
    opacity: 0.7,
  },
  selectedCard: {
    outline: "2px solid #6200ee",
    backgroundColor: "#e3d7ff",
  },
  cardContent: {
    display: "flex",
    alignItems: "center",
    gap: 16,
  },
  icon: {
    width: 48,
    height: 48,
    objectFit: "cover",
    borderRadius: 6,
  },
  iconPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 6,
    background: "#ddd",
  },
  selectedText: {
    fontWeight: "700",
  },
  cancelButton: {
    marginTop: 16,
    padding: "8px 12px",
    borderRadius: 6,
    background: "transparent",
    border: "1px solid #ccc",
    cursor: "pointer",
  },
};

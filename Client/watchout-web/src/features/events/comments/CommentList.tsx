import React from "react";
import { useComments } from "./useComments";

type CommentListProps = {
  eventId: number;
};

export const CommentList: React.FC<CommentListProps> = ({ eventId }) => {
  const { data: comments, isFetching } = useComments(eventId);

  if (isFetching) {
    return <div>Ładowanie komentarzy...</div>;
  }

  return (
    <div>
      <h2 style={{ fontWeight: 700, fontSize: 24 }}>
        Komentarze ({comments?.length ?? 0})
      </h2>

      {comments?.length === 0 ? (
        <div style={{ textAlign: "center", marginTop: 32 }}>
          <div style={{ fontSize: 64, color: "#bbb" }}>💬</div>
          <div>Jeszcze nikt nie skomentował tego zdarzenia</div>
        </div>
      ) : (
        <div
          style={{
            marginTop: 16,
            padding: "0 12px",
            maxHeight: 400,
            overflowY: "auto",
          }}
        >
          {comments?.map((item) => (
            <div
              key={item.id}
              style={{
                padding: 12,
                marginBottom: 12,
                borderRadius: 8,
                background: "#fff",
                boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
              }}
            >
              <div style={{ fontWeight: "bold", marginBottom: 4 }}>
                {item.author.name}
              </div>
              <div>{item.content}</div>
              <div style={{ fontSize: 12, color: "#666", marginTop: 8 }}>
                {new Date(item.createdOn).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

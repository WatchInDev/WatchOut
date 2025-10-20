import React from 'react';

export const Pictures = () => {
  const mockImages = [
    'https://picsum.photos/300/200?random=1',
    'https://picsum.photos/300/200?random=2',
    'https://picsum.photos/300/200?random=3',
  ];

  return (
    <div>
      <div style={{ fontWeight: 'bold', fontSize: 24, marginBottom: 16 }}>Zdjęcia</div>
      {mockImages.map((url, idx) => (
        <div
          key={idx}
          style={{
            marginBottom: 16,
            height: 200,
            padding: 8,
            borderRadius: 8,
            background: '#fff',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
          }}
        >
          <div style={{ padding: 4 }}>Zdjęcie {idx + 1}</div>
          <img
            src={url}
            alt={`Zdjęcie ${idx + 1}`}
            style={{ width: '100%', height: 150, borderRadius: 8, objectFit: 'cover' }}
          />
        </div>
      ))}
    </div>
  );
};

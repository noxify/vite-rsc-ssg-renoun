import * as React from 'react';

export default function RenounLayout({ children }: { children: React.ReactNode }) {
  return (
    <section style={{ border: '2px solid #ccc', padding: 16 }}>
      <h2>Renoun Layout</h2>
      {children}
    </section>
  );
}

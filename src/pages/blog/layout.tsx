import * as React from 'react';

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <section style={{ border: '2px solid #ccc', padding: 16 }}>
      <h2>Blog Layout</h2>
      {children}
    </section>
  );
}

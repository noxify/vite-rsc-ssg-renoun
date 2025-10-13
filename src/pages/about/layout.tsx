import * as React from 'react';

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ border: '2px dashed #f90', padding: 16 }}>
      <h2>About Layout</h2>
      {children}
    </div>
  );
}

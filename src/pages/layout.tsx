import * as React from "react";
import { RootProvider } from "renoun";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RootProvider>
      <html lang="en">
        <head>
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>RSC MDX SSG</title>
        </head>
        <body>
          <header
            style={{ display: "flex", alignItems: "center", gap: "1rem" }}
          >
            <h1>
              <a href="/">RSC + MDX + SSG</a>
            </h1>
          </header>
          <main>{children}</main>
        </body>
      </html>
    </RootProvider>
  );
}

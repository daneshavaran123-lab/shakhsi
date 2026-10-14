import type { Metadata } from "next";

import KeystaticApp from "./keystatic";

export const metadata: Metadata = {
  title: "پنل مدیریت",
  robots: { index: false, follow: false },
};

export default function KeystaticLayout() {
  return (
    <html lang="fa">
      <body>
        <KeystaticApp />
      </body>
    </html>
  );
}

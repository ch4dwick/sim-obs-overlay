import type { Metadata } from "next";
import "../globals.css";


export const metadata: Metadata = {
  title: "FlightSim Status",
  description: "An OBS Studio overlay specifically made for flight sim streaming",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main>
      <header className="px-6">
        OBS Overlay
      </header>
      <main>{children}</main>
    </main>
  );
}

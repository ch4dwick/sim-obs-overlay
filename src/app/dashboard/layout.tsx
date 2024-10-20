import type { Metadata } from "next";
// import "../globals.css";
import { NavLinks } from "./navlinks";


export const metadata: Metadata = {
    title: "FlightSim OBS Overlay",
    description: "An OBS Studio overlay specifically made for flight sim streaming",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div>
            <header className="px-6">
                Dashboard
            </header>
            <NavLinks />
            <main>{children}</main>
        </div>
    );
}

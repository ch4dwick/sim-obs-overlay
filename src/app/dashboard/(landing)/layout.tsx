import type { Metadata } from "next";
import { NavLinks } from "./navlinks";


export const metadata: Metadata = {
    title: "Landing",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div>
            <NavLinks />
            <main>{children}</main>
        </div>
    );
}

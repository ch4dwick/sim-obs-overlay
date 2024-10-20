'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'

export function NavLinks() {
    const pathname = usePathname()

    return (
        <div className="md:container md:mx-auto">
            <nav>
                <Link className={`link ${pathname === '/dashboard/title' ? 'px-2 active' : 'px-2'}`} href="/dashboard/title">Title</Link>
                <Link className={`link ${pathname === '/dashboard/rate' ? 'px-2 active' : 'px-2'}`} href="/dashboard/rate">Rate</Link>
                <Link className={`link ${pathname === '/dashboard/ldg-speed' ? 'px-2 active' : 'px-2'}`} href="/dashboard/ldg-speed">Speed</Link>
                <Link className={`link ${pathname === '/dashboard/attitude' ? 'px-2 active' : 'px-2'}`} href="/dashboard/attitude">Attitude</Link>

            </nav>
        </div>
    )
}

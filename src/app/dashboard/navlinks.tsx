'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'

export function NavLinks() {
    const pathname = usePathname()

    return (
        <div>
            <nav>
                <Link className={`link ${pathname === '/dashboard/flight' ? 'px-2 active' : 'px-2'}`} href="/dashboard/flight">Flight</Link>
                <Link className={`link ${pathname === '/dashboard/general' ? 'px-2 active' : 'px-2'}`} href="/dashboard/general">General</Link>
                <Link className={`link ${pathname === '/dashboard/widgets' ? 'px-2 active' : 'px-2'}`} href="/dashboard/widgets">Widgets</Link>
                <Link className={`link ${pathname === '/dashboard/progress' ? 'px-2 active' : 'px-2'}`} href="/dashboard/progress">Progress</Link>
                <Link className={`link ${pathname === '/dashboard/landing' ? 'px-2 active' : 'px-2'}`} href="/dashboard/landing">Landing</Link>
            </nav>
        </div>
    )
}

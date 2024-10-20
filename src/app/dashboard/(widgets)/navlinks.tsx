'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'

export function NavLinks() {
    const pathname = usePathname()

    return (
        <div className="md:container md:mx-auto">
            <nav>
                <Link className={`link ${pathname === '/dashboard/callsign' ? 'px-2 active' : 'px-2'}`} href="/dashboard/callsign">Callsign</Link>
                <Link className={`link ${pathname === '/dashboard/network' ? 'px-2 active' : 'px-2'}`} href="/dashboard/network">Network</Link>
                <Link className={`link ${pathname === '/dashboard/speed' ? 'px-2 active' : 'px-2'}`} href="/dashboard/speed">Speed</Link>
                <Link className={`link ${pathname === '/dashboard/heading' ? 'px-2 active' : 'px-2'}`} href="/dashboard/heading">Heading</Link>
                <Link className={`link ${pathname === '/dashboard/altitude' ? 'px-2 active' : 'px-2'}`} href="/dashboard/altitude">Altitude</Link>
                <Link className={`link ${pathname === '/dashboard/wind' ? 'px-2 active' : 'px-2'}`} href="/dashboard/wind">Wind</Link>
                <Link className={`link ${pathname === '/dashboard/temp' ? 'px-2 active' : 'px-2'}`} href="/dashboard/temp">Temperature</Link>
                <Link className={`link ${pathname === '/dashboard/perf' ? 'px-2 active' : 'px-2'}`} href="/dashboard/perf">Performance</Link>
            </nav>
        </div>
    )
}

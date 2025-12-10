// /lib/clientAuth.js
'use client';

import { useRouter } from 'next/navigation';
import { logout as coreLogout } from '@/lib/auth';

export function useClientLogout() {
    const router = useRouter();

    const logoutAndRedirect = () => {
        coreLogout();
        router.push('/');
    };

    return logoutAndRedirect;
}

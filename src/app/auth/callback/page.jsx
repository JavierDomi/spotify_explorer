// app/auth/callback/page.tsx
import { Suspense } from 'react';
import CallbackContent from './CallbackContent';

export default function CallbackPage() {
    return (
        <Suspense
            fallback={
                <div className="flex items-center justify-center min-h-screen bg-gray-900">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
                        <p className="text-white text-xl">Autenticando...</p>
                    </div>
                </div>
            }
        >
            <CallbackContent />
        </Suspense>
    );
}

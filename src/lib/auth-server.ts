import { cookies } from 'next/headers';

export async function checkInternalAccess() {
    const cookieStore = await cookies();
    const hasAccess = cookieStore.get('internal_access')?.value === 'true';
    return hasAccess;
}

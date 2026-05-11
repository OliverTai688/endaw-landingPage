/**
 * GET /api/bff/v1/music-packages/[id]/fields
 *
 * Returns registration fields for a music package.
 * Music packages don't have a Content record, so fields are stored
 * under the instrument's corresponding Content (if any) or returned empty.
 *
 * For now: returns empty array (music packages use the same RegistrationField
 * linked via contentId — future enhancement to link via packageId directly).
 */
import { NextResponse } from 'next/server';

export async function GET() {
  // Music packages currently have no registration fields (contentId-based fields
  // are for Content model items). Return empty so the checkout skips Step 3.
  return NextResponse.json({ success: true, data: [] });
}

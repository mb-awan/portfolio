import { User } from '@/models/User';
import { NextResponse } from 'next/server';

import { handleApiError } from '@/lib/api/route-error';
import { issueOtp } from '@/lib/auth/issue-otp';
import { connectMongo } from '@/lib/db/mongoose';
import { resendVerificationSchema } from '@/lib/validation/auth';

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = resendVerificationSchema.parse(await request.json());
    await connectMongo();

    const user = await User.findOne({ email: body.email.toLowerCase() });
    if (user && !user.emailVerified) {
      await issueOtp(user._id.toString(), user.email, 'EMAIL_VERIFY');
    }

    return NextResponse.json({
      message: 'If an unverified account exists for this email, a new code has been sent.',
    });
  } catch (error: unknown) {
    return handleApiError(error);
  }
}

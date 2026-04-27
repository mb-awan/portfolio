import { User } from '@/models/User';
import { NextResponse } from 'next/server';

import { handleApiError } from '@/lib/api/route-error';
import { issueOtp } from '@/lib/auth/issue-otp';
import { connectMongo } from '@/lib/db/mongoose';
import { forgotPasswordSchema } from '@/lib/validation/auth';

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = forgotPasswordSchema.parse(await request.json());
    await connectMongo();

    const user = await User.findOne({ email: body.email.toLowerCase() });
    if (user && user.emailVerified) {
      await issueOtp(user._id.toString(), user.email, 'PASSWORD_RESET');
    }

    return NextResponse.json({
      message: 'If an account exists for this email, a reset code has been sent.',
    });
  } catch (error: unknown) {
    return handleApiError(error);
  }
}

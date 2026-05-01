import { User } from '@/models/User';
import { NextResponse } from 'next/server';

import { handleApiError, jsonError } from '@/lib/api/route-error';
import { issueOtp } from '@/lib/auth/issue-otp';
import { hashPassword } from '@/lib/auth/password';
import { connectMongo } from '@/lib/db/mongoose';
import { registerSchema } from '@/lib/validation/auth';

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = registerSchema.parse(await request.json());
    await connectMongo();

    const existing = await User.findOne({ email: body.email.toLowerCase() });
    if (existing) {
      return jsonError('An account with this email already exists', 409);
    }

    const passwordHash = await hashPassword(body.password);
    const user = await User.create({
      address: {
        city: body.address.city.trim(),
        country: body.address.country.trim(),
        district: body.address.district.trim(),
        province: body.address.province.trim(),
        zipCode: body.address.zipCode.trim(),
      },
      email: body.email.toLowerCase(),
      emailVerified: false,
      location: '',
      name: body.name,
      passwordHash,
      phone: body.phone.trim(),
    });

    await issueOtp(user._id.toString(), user.email, 'EMAIL_VERIFY');

    return NextResponse.json(
      {
        message: 'Account created. Check your email for a verification code.',
        userId: user._id.toString(),
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    return handleApiError(error);
  }
}

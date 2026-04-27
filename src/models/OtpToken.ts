import mongoose, { type InferSchemaType, Schema, model, models } from 'mongoose';

export const OTP_PURPOSES = ['EMAIL_VERIFY', 'PASSWORD_RESET'] as const;
export type OtpPurpose = (typeof OTP_PURPOSES)[number];

const otpTokenSchema = new Schema(
  {
    expiresAt: { index: true, required: true, type: Date },
    hash: { required: true, type: String },
    purpose: { enum: OTP_PURPOSES, required: true, type: String },
    userId: { ref: 'User', required: true, type: Schema.Types.ObjectId },
  },
  { timestamps: true }
);

otpTokenSchema.index({ purpose: 1, userId: 1 }, { unique: true });

export type OtpTokenDocument = {
  _id: mongoose.Types.ObjectId;
} & InferSchemaType<typeof otpTokenSchema>;

export const OtpToken = models.OtpToken ?? model('OtpToken', otpTokenSchema);

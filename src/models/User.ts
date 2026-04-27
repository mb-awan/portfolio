import mongoose, { type InferSchemaType, Schema, model, models } from 'mongoose';

const userSchema = new Schema(
  {
    bio: { default: '', maxlength: 2000, trim: true, type: String },
    email: { lowercase: true, required: true, trim: true, type: String, unique: true },
    emailVerified: { default: false, type: Boolean },
    imageUrl: { default: null, type: String },
    name: { maxlength: 120, required: true, trim: true, type: String },
    passwordHash: { required: true, type: String },
    tfaEnabled: { default: false, type: Boolean },
    tfaSecret: { default: null, type: String },
    tfaSetupSecret: { default: null, type: String },
  },
  { timestamps: true }
);

export type UserDocument = {
  _id: mongoose.Types.ObjectId;
} & InferSchemaType<typeof userSchema>;

export const User = models.User ?? model('User', userSchema);

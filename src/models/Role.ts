import mongoose, { type InferSchemaType, Schema, model, models } from 'mongoose';

const roleSchema = new Schema(
  {
    description: { default: '', maxlength: 500, trim: true, type: String },
    isSystem: { default: false, type: Boolean },
    name: { maxlength: 120, required: true, trim: true, type: String },
    permissionKeys: { default: () => [], type: [String] },
    slug: { lowercase: true, maxlength: 64, required: true, trim: true, type: String, unique: true },
  },
  { timestamps: true }
);

export type RoleDocument = {
  _id: mongoose.Types.ObjectId;
} & InferSchemaType<typeof roleSchema>;

export const Role = models.Role ?? model('Role', roleSchema);

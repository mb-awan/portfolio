import mongoose, { type InferSchemaType, Schema, model, models } from 'mongoose';

const permissionSchema = new Schema(
  {
    description: { required: true, trim: true, type: String },
    key: { required: true, trim: true, type: String, unique: true },
    module: { required: true, trim: true, type: String },
    sortOrder: { default: 0, type: Number },
  },
  { timestamps: true }
);

export type PermissionDocument = {
  _id: mongoose.Types.ObjectId;
} & InferSchemaType<typeof permissionSchema>;

export const Permission = models.Permission ?? model('Permission', permissionSchema);

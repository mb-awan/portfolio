import mongoose, { type InferSchemaType, Schema, model, models } from 'mongoose';

const postalAddressSchema = new Schema(
  {
    city: { default: '', maxlength: 120, trim: true, type: String },
    country: { default: '', maxlength: 120, trim: true, type: String },
    district: { default: '', maxlength: 120, trim: true, type: String },
    province: { default: '', maxlength: 120, trim: true, type: String },
    zipCode: { default: '', maxlength: 32, trim: true, type: String },
  },
  { _id: false }
);

const educationEntrySchema = new Schema(
  {
    degree: { default: '', maxlength: 200, trim: true, type: String },
    endYear: { max: 2100, min: 1900, type: Number },
    field: { default: '', maxlength: 200, trim: true, type: String },
    institution: { default: '', maxlength: 200, trim: true, type: String },
    notes: { default: '', maxlength: 1000, trim: true, type: String },
    startYear: { max: 2100, min: 1900, type: Number },
  },
  { _id: false }
);

const experienceEntrySchema = new Schema(
  {
    company: { default: '', maxlength: 200, trim: true, type: String },
    description: { default: '', maxlength: 2000, trim: true, type: String },
    employmentType: { default: '', maxlength: 80, trim: true, type: String },
    endDate: { default: '', maxlength: 40, trim: true, type: String },
    location: { default: '', maxlength: 200, trim: true, type: String },
    startDate: { default: '', maxlength: 40, trim: true, type: String },
    title: { default: '', maxlength: 200, trim: true, type: String },
  },
  { _id: false }
);

const businessDetailsSchema = new Schema(
  {
    companyName: { default: '', maxlength: 200, trim: true, type: String },
    description: { default: '', maxlength: 2000, trim: true, type: String },
    industry: { default: '', maxlength: 120, trim: true, type: String },
    role: { default: '', maxlength: 120, trim: true, type: String },
    website: { default: '', maxlength: 500, trim: true, type: String },
  },
  { _id: false }
);

const socialLinkSchema = new Schema(
  {
    platform: { maxlength: 40, required: true, trim: true, type: String },
    url: { maxlength: 500, required: true, trim: true, type: String },
  },
  { _id: false }
);

const userSchema = new Schema(
  {
    address: { default: () => ({}), type: postalAddressSchema },
    bio: { default: '', maxlength: 2000, trim: true, type: String },
    businessDetails: { default: undefined, type: businessDetailsSchema },
    education: { default: () => [], type: [educationEntrySchema] },
    email: { lowercase: true, required: true, trim: true, type: String, unique: true },
    emailVerified: { default: false, type: Boolean },
    experience: { default: () => [], type: [experienceEntrySchema] },
    gender: {
      default: '',
      enum: ['', 'female', 'male', 'non_binary', 'other', 'prefer_not_say'],
      type: String,
    },
    imageUrl: { default: null, type: String },
    /** @deprecated Prefer `address`; kept for legacy Mongo documents */
    location: { default: '', maxlength: 200, trim: true, type: String },
    name: { maxlength: 120, required: true, trim: true, type: String },
    passwordHash: { required: true, type: String },
    phone: { default: '', maxlength: 30, trim: true, type: String },
    role: { default: null, ref: 'Role', type: Schema.Types.ObjectId },
    socialLinks: { default: () => [], type: [socialLinkSchema] },
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

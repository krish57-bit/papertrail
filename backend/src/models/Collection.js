import mongoose from 'mongoose';

const collectionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true, maxlength: 100 },
    description: { type: String, default: '', maxlength: 500 },
    papers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Paper' }],
    isPublic: { type: Boolean, default: false, index: true },
    slug: { type: String, unique: true, sparse: true, index: true },
  },
  { timestamps: true }
);

collectionSchema.pre('save', function (next) {
  if (this.isPublic && !this.slug) {
    const base = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 40);
    this.slug = `${base}-${Math.random().toString(36).slice(2, 8)}`;
  }
  next();
});

export const Collection = mongoose.model('Collection', collectionSchema);

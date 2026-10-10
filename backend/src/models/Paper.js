import mongoose from 'mongoose';

const paperSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    openalexId: { type: String, index: true },
    doi: { type: String, index: true },
    title: { type: String, required: true, trim: true },
    authors: [{ type: String }],
    abstract: { type: String, default: '' },
    year: { type: Number, index: true },
    venue: { type: String, default: '' },
    citationsCount: { type: Number, default: 0 },
    concepts: [{ type: String }],
    referencedWorks: [{ type: String }],
    url: { type: String, default: '' },

    status: {
      type: String,
      enum: ['want-to-read', 'reading', 'read'],
      default: 'want-to-read',
      index: true,
    },
    tags: [{ type: String, lowercase: true, trim: true }],
    notes: { type: String, default: '' },
    rating: { type: Number, min: 0, max: 5, default: 0 },
    isHighlight: { type: Boolean, default: false },
    readAt: { type: Date, default: null },
  },
  { timestamps: true }
);

paperSchema.index({ user: 1, openalexId: 1 }, { unique: true, partialFilterExpression: { openalexId: { $type: 'string' } } });
paperSchema.index({ user: 1, title: 'text', abstract: 'text', tags: 'text' });

paperSchema.virtual('readingDebtDays').get(function () {
  if (this.status === 'read') return 0;
  const ms = Date.now() - new Date(this.createdAt).getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
});

paperSchema.set('toJSON', { virtuals: true });

export const Paper = mongoose.model('Paper', paperSchema);

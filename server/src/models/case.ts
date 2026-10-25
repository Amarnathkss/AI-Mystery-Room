import { Schema, model } from 'mongoose';

const caseSchema = new Schema({
  id: { type: String, required: true, unique: true, index: true },
  owner: { type: String, required: true, index: true },
  storyInput: { type: String, required: true },
  difficulty: { type: String, required: true },
  tone: { type: String, required: true },
  status: { type: String, required: true, index: true },
  progress: { type: Schema.Types.Mixed, required: true },
  createdAt: { type: String, required: true },
  expiresAt: { type: Date, required: true, index: { expires: 0 } },
  title: String,
  intro: String,
  incidentSummary: String,
  setting: String,
  suspects: { type: [Schema.Types.Mixed], default: [] },
  evidence: { type: [Schema.Types.Mixed], default: [] },
  publicTimeline: { type: [Schema.Types.Mixed], default: [] },
  solution: { type: Schema.Types.Mixed, select: false },
  accusation: { type: Schema.Types.Mixed }
}, { versionKey: false });

caseSchema.index({ owner: 1, createdAt: -1 });

export const CaseModel = model('MysteryCase', caseSchema);

const mongoose = require('mongoose');

const speakerSchema = new mongoose.Schema({
  name: String,
  words: Number,
  lines: Number,
  percentage: Number,
  tag: { type: String, enum: ['dominant', 'balanced', 'minimal'] }
}, { _id: false });

const actionItemSchema = new mongoose.Schema({
  text: String,
  owner: String,
  from: String,
  done: { type: Boolean, default: false }
}, { _id: true });

const unresolvedSchema = new mongoose.Schema({
  text: String,
  from: String,
  resolved: { type: Boolean, default: false }
}, { _id: true });

const meetingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true },
  transcript: { type: String, required: true },
  date: { type: Date, default: Date.now },
  participants: [speakerSchema],
  actionItems: [actionItemSchema],
  unresolvedTopics: [unresolvedSchema],
  topicClusters: { type: Map, of: [String] },
  dominantSpeaker: String,
  dominantPct: Number,
  insight: String,
  totalWords: Number,
  createdAt: { type: Date, default: Date.now }
});

meetingSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Meeting', meetingSchema);

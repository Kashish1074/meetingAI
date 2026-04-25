const Meeting = require('../models/Meeting');
const { analyzeTranscript } = require('./analyzerEngine');

// POST /api/meetings/analyze  — analyze without saving
const analyzeMeeting = async (req, res, next) => {
  try {
    const { transcript } = req.body;
    if (!transcript || transcript.trim().length < 20)
      return res.status(400).json({ message: 'Transcript too short' });
    const result = analyzeTranscript(transcript);
    res.json(result);
  } catch (err) { next(err); }
};

// POST /api/meetings  — analyze and save
const createMeeting = async (req, res, next) => {
  try {
    const { title, transcript, date } = req.body;
    if (!title || !transcript)
      return res.status(400).json({ message: 'Title and transcript are required' });

    const analysis = analyzeTranscript(transcript);
    const meeting = await Meeting.create({
      user: req.user._id,
      title,
      transcript,
      date: date || Date.now(),
      ...analysis
    });
    res.status(201).json(meeting);
  } catch (err) { next(err); }
};

// GET /api/meetings
const getMeetings = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [meetings, total] = await Promise.all([
      Meeting.find({ user: req.user._id })
        .select('-transcript')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Meeting.countDocuments({ user: req.user._id })
    ]);

    res.json({ meetings, total, page, pages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
};

// GET /api/meetings/:id
const getMeeting = async (req, res, next) => {
  try {
    const meeting = await Meeting.findOne({ _id: req.params.id, user: req.user._id });
    if (!meeting) return res.status(404).json({ message: 'Meeting not found' });
    res.json(meeting);
  } catch (err) { next(err); }
};

// PATCH /api/meetings/:id/action/:itemId
const toggleActionItem = async (req, res, next) => {
  try {
    const meeting = await Meeting.findOne({ _id: req.params.id, user: req.user._id });
    if (!meeting) return res.status(404).json({ message: 'Meeting not found' });

    const item = meeting.actionItems.id(req.params.itemId);
    if (!item) return res.status(404).json({ message: 'Action item not found' });
    item.done = !item.done;
    await meeting.save();
    res.json(meeting);
  } catch (err) { next(err); }
};

// PATCH /api/meetings/:id/unresolved/:itemId
const toggleUnresolved = async (req, res, next) => {
  try {
    const meeting = await Meeting.findOne({ _id: req.params.id, user: req.user._id });
    if (!meeting) return res.status(404).json({ message: 'Meeting not found' });

    const item = meeting.unresolvedTopics.id(req.params.itemId);
    if (!item) return res.status(404).json({ message: 'Topic not found' });
    item.resolved = !item.resolved;
    await meeting.save();
    res.json(meeting);
  } catch (err) { next(err); }
};

// DELETE /api/meetings/:id
const deleteMeeting = async (req, res, next) => {
  try {
    const meeting = await Meeting.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!meeting) return res.status(404).json({ message: 'Meeting not found' });
    res.json({ message: 'Meeting deleted' });
  } catch (err) { next(err); }
};

// GET /api/meetings/stats/summary
const getStats = async (req, res, next) => {
  try {
    const meetings = await Meeting.find({ user: req.user._id }).select('actionItems unresolvedTopics participants dominantSpeaker');
    const totalMeetings = meetings.length;
    const totalActions = meetings.reduce((s, m) => s + m.actionItems.length, 0);
    const doneActions = meetings.reduce((s, m) => s + m.actionItems.filter(a => a.done).length, 0);
    const totalUnresolved = meetings.reduce((s, m) => s + m.unresolvedTopics.filter(u => !u.resolved).length, 0);

    const dominanceMap = {};
    for (const m of meetings) {
      if (m.dominantSpeaker) dominanceMap[m.dominantSpeaker] = (dominanceMap[m.dominantSpeaker] || 0) + 1;
    }
    const topDominant = Object.entries(dominanceMap).sort((a, b) => b[1] - a[1])[0];

    res.json({
      totalMeetings,
      totalActions,
      doneActions,
      pendingActions: totalActions - doneActions,
      totalUnresolved,
      topDominantSpeaker: topDominant ? topDominant[0] : null,
      topDominantCount: topDominant ? topDominant[1] : 0
    });
  } catch (err) { next(err); }
};

module.exports = {
  analyzeMeeting, createMeeting, getMeetings, getMeeting,
  toggleActionItem, toggleUnresolved, deleteMeeting, getStats
};

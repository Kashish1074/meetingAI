const TOPIC_CLUSTERS = {
  'timeline & planning': ['launch','date','q3','q4','deadline','schedule','timeline','runway','sprint','release','delay','milestone','roadmap'],
  'budget & finance': ['budget','cost','pricing','finance','revenue','spend','approval','invoice','payment','expense','roi'],
  'technical': ['api','integration','bug','deploy','build','code','technical','issue','error','fix','system','infra','database','server'],
  'marketing & design': ['marketing','deck','brief','agency','brand','campaign','design','content','copy','creative','social','ads'],
  'team & process': ['team','meeting','agenda','review','standup','process','workflow','assign','ownership','sync','ownership']
};

const ACTION_SIGNALS = [
  'can you','will you','please','need to','should','must','have to',
  'by friday','by eod','this week','by monday',"i'll","you'll",
  'send it','handle that','take care','follow up','own the','update the',
  'do that','take action','responsible for','assigned to'
];

const UNRESOLVED_SIGNALS = [
  "haven't",'still open','not yet','up in the air','unresolved','tbd',
  'pending',"don't know",'unclear','no one','table it','revisit',
  'not confirmed','not sure','outstanding','no decision',"hasn't",
  'blocked','stuck on','not resolved','open question','to be decided'
];

function parseSpeakers(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const speakers = {};
  const parsed = [];

  for (const line of lines) {
    const m = line.match(/^([A-Za-z][A-Za-z\s]{0,20}):\s*(.+)/);
    if (m) {
      const name = m[1].trim();
      const msg = m[2].trim();
      if (!speakers[name]) speakers[name] = { lines: 0, words: 0, messages: [] };
      speakers[name].lines++;
      speakers[name].words += msg.split(/\s+/).length;
      speakers[name].messages.push(msg);
      parsed.push({ name, msg });
    }
  }
  return { speakers, parsed };
}

function detectActionItems(parsed) {
  const items = [];
  const seen = new Set();

  for (const { name, msg } of parsed) {
    const low = msg.toLowerCase();
    for (const signal of ACTION_SIGNALS) {
      if (low.includes(signal)) {
        if (seen.has(msg)) break;
        seen.add(msg);

        let owner = name;
        const addressed = parsed.find(p =>
          low.includes(p.name.toLowerCase()) && p.name !== name
        );
        if (addressed) owner = addressed.name;
        items.push({ text: msg, owner, from: name });
        break;
      }
    }
  }
  return items.slice(0, 8);
}

function detectUnresolved(parsed) {
  const items = [];
  const seen = new Set();

  for (const { name, msg } of parsed) {
    const low = msg.toLowerCase();
    for (const signal of UNRESOLVED_SIGNALS) {
      if (low.includes(signal)) {
        if (seen.has(msg)) break;
        seen.add(msg);
        items.push({ text: msg, from: name });
        break;
      }
    }
  }
  return items.slice(0, 6);
}

function detectClusters(text) {
  const low = text.toLowerCase();
  const result = {};
  for (const [cluster, kws] of Object.entries(TOPIC_CLUSTERS)) {
    const hits = kws.filter(k => low.includes(k));
    if (hits.length > 0) result[cluster] = hits.slice(0, 5);
  }
  return result;
}

function analyzeTranscript(transcript) {
  const { speakers, parsed } = parseSpeakers(transcript);
  const speakerNames = Object.keys(speakers);
  const totalWords = Object.values(speakers).reduce((s, v) => s + v.words, 0) || 1;

  const participants = speakerNames
    .sort((a, b) => speakers[b].words - speakers[a].words)
    .map(name => {
      const pct = (speakers[name].words / totalWords) * 100;
      let tag = 'balanced';
      if (pct > 40) tag = 'dominant';
      else if (pct < 8) tag = 'minimal';
      return { name, words: speakers[name].words, lines: speakers[name].lines, percentage: Math.round(pct), tag };
    });

  const dominant = participants[0];
  const dominantName = dominant?.name || 'Unknown';
  const dominantPct = dominant?.percentage || 0;

  const silentCount = participants.filter(p => p.tag === 'minimal').length;
  const insightParts = [
    `${dominantName} drove ${dominantPct}% of the conversation.`,
    silentCount > 0 ? `${silentCount} participant${silentCount > 1 ? 's were' : ' was'} largely silent — consider trimming the invite list.` : '',
    dominantPct > 55
      ? 'High dominance suggests a facilitation issue — structured turn-taking or a pre-shared agenda may help.'
      : 'Participation was reasonably distributed.'
  ].filter(Boolean).join(' ');

  return {
    participants,
    actionItems: detectActionItems(parsed),
    unresolvedTopics: detectUnresolved(parsed),
    topicClusters: detectClusters(transcript),
    dominantSpeaker: dominantName,
    dominantPct,
    insight: insightParts,
    totalWords
  };
}

module.exports = { analyzeTranscript };

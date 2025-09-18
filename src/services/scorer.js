const openaiClient = require("../lib/openaiClient");

const DECISION_KEYWORDS = [
  "head",
  "director",
  "vp",
  "vice president",
  "chief",
  "ceo",
  "cto",
  "coo",
  "founder",
  "owner",
  "president",
];
const INFLUENCER_KEYWORDS = [
  "manager",
  "lead",
  "senior",
  "principal",
  "product",
  "growth",
  "marketing",
  "sales",
];

// Rule layer up to 50 points
function computeRuleScore(lead, offer) {
  let score = 0;
  const breakdown = { role: 0, industry: 0, completeness: 0 };

  const roleLower = (lead.role || "").toLowerCase();
  if (DECISION_KEYWORDS.some((k) => roleLower.includes(k))) {
    breakdown.role = 20;
  } else if (INFLUENCER_KEYWORDS.some((k) => roleLower.includes(k))) {
    breakdown.role = 10;
  }

  // Industry match logic
  const ideal = (offer.ideal_use_cases || []).map((s) => s.toLowerCase());
  const industry = (lead.industry || "").toLowerCase();
  if (industry && ideal.some((i) => i === industry)) {
    breakdown.industry = 20;
  } else if (
    industry &&
    ideal.some(
      (i) =>
        industry.includes(i) ||
        i.includes(industry) ||
        i.split(" ").some((tok) => industry.includes(tok))
    )
  ) {
    breakdown.industry = 10;
  }

  if (
    lead.name &&
    lead.role &&
    lead.company &&
    lead.industry &&
    lead.location &&
    lead.linkedin_bio
  ) {
    breakdown.completeness = 10;
  }

  score = breakdown.role + breakdown.industry + breakdown.completeness;
  return { score, breakdown };
}

// (High=50, Medium=30, Low=10)
async function aiClassify(lead, offer) {
  // Build a prompt
  const system = `You are a concise sales intent classifier. Return JSON only, exactly one JSON object with keys:
  {"intent":"High"|"Medium"|"Low","explanation":"1-2 sentence explanation"}
  Do not add any other text, commentary, or markdown.`;

  const user = `Offer: ${JSON.stringify(offer)}
Lead: ${JSON.stringify(lead)}
Question: Based on the offer and the prospect details, classify buying intent (High/Medium/Low) and give a 1-2 sentence explanation.`;

  try {
    const raw = await openaiClient.chatCompletion([
      { role: "system", content: system },
      { role: "user", content: user },
    ]);

    let parsed = null;
    try {
      parsed = JSON.parse(raw);
    } catch (e) {
      const m = raw.match(/\{[\s\S]*\}/);
      if (m) parsed = JSON.parse(m[0]);
      else {
        //   find High/Medium/Low words
        const t = raw.toLowerCase();
        const label = t.includes("high")
          ? "High"
          : t.includes("medium")
          ? "Medium"
          : "Low";
        parsed = { intent: label, explanation: (raw || "").slice(0, 200) };
      }
    }

    let aiPoints = 10;
    if (parsed.intent === "High") aiPoints = 50;
    else if (parsed.intent === "Medium") aiPoints = 30;
    else aiPoints = 10;

    return { intent: parsed.intent, explanation: parsed.explanation, aiPoints };
  } catch (err) {
    // (safe fallback)
    return {
      intent: "Medium",
      explanation: "AI unavailable — fallback to medium intent.",
      aiPoints: 30,
    };
  }
}

async function scoreAll(leads, offer) {
  if (!offer) throw new Error("Offer required");
  const results = [];
  for (const lead of leads) {
    const { score: ruleScore, breakdown } = computeRuleScore(lead, offer);
    const ai = await aiClassify(lead, offer);
    const finalScore = ruleScore + ai.aiPoints;
    const intent = ai.intent;
    const reasoning = `Rule: ${ruleScore} (${JSON.stringify(breakdown)}). AI: ${
      ai.explanation
    }`;

    results.push({
      name: lead.name,
      role: lead.role,
      company: lead.company,
      industry: lead.industry,
      intent,
      score: finalScore,
      reasoning,
      ai_explanation: ai.explanation,
    });
  }
  return results;
}

module.exports = { computeRuleScore, aiClassify, scoreAll };

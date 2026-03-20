// api/mastery.js — Vercel Serverless Function
// Requires env variable: RIOT_API_KEY

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  const API_KEY = process.env.RIOT_API_KEY;
  if (!API_KEY) {
    return res.status(500).json({ error: "RIOT_API_KEY non configurée sur le serveur." });
  }

  const { gameName, tagLine, region } = req.query;
  if (!gameName || !tagLine || !region) {
    return res.status(400).json({ error: "Paramètres manquants : gameName, tagLine, region." });
  }

  const routingMap = {
    euw1: "europe", eun1: "europe", tr1: "europe", ru: "europe",
    na1: "americas", br1: "americas", la1: "americas", la2: "americas",
    kr: "asia", jp1: "asia",
    oc1: "sea", sg2: "sea", tw2: "sea", vn2: "sea", ph2: "sea",
  };
  const routing = routingMap[region.toLowerCase()] ?? "europe";
  const regionLower = region.toLowerCase();
  const headers = { "X-Riot-Token": API_KEY, "Accept": "application/json" };

  try {
    // 1. PUUID via Riot Account API
    const accountUrl =
      `https://${routing}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/` +
      `${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`;

    const accountRes = await fetch(accountUrl, { headers });
    if (!accountRes.ok) {
      let msg = `Erreur API Riot (compte) : ${accountRes.status}`;
      try { const j = await accountRes.json(); if (j?.status?.message) msg = j.status.message; } catch {}
      return res.status(accountRes.status).json({ error: msg });
    }
    const account = await accountRes.json();
    const { puuid, gameName: riotName, tagLine: riotTag } = account;

    // 2. Profile icon via Summoner API
    let profileIconId = 1;
    let summonerLevel = 0;
    try {
      const sumRes = await fetch(
        `https://${regionLower}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}`,
        { headers }
      );
      if (sumRes.ok) {
        const sum = await sumRes.json();
        profileIconId = sum.profileIconId ?? 1;
        summonerLevel = sum.summonerLevel ?? 0;
      }
    } catch {}

    // 3. All champion masteries
    const masteryRes = await fetch(
      `https://${regionLower}.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-puuid/${puuid}`,
      { headers }
    );
    if (!masteryRes.ok) {
      let msg = `Erreur API Riot (mastery) : ${masteryRes.status}`;
      try { const j = await masteryRes.json(); if (j?.status?.message) msg = j.status.message; } catch {}
      return res.status(masteryRes.status).json({ error: msg });
    }
    const masteries = await masteryRes.json();

    return res.status(200).json({ puuid, gameName: riotName, tagLine: riotTag, profileIconId, summonerLevel, masteries });

  } catch (e) {
    console.error("mastery handler error:", e);
    return res.status(500).json({ error: `Erreur serveur : ${e.message}` });
  }
}

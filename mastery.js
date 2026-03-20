export default async function handler(req, res) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const RIOT_API_KEY = process.env.RIOT_API_KEY;

  if (!RIOT_API_KEY) {
    return res.status(500).json({
      error: "RIOT_API_KEY environment variable is not set.",
    });
  }

  const { gameName, tagLine, region } = req.query;

  if (!gameName || !tagLine || !region) {
    return res
      .status(400)
      .json({ error: "Missing gameName, tagLine or region parameters." });
  }

  // Region to routing value map
  const routingMap = {
    euw1: "europe",
    eun1: "europe",
    tr1: "europe",
    ru: "europe",
    na1: "americas",
    br1: "americas",
    la1: "americas",
    la2: "americas",
    kr: "asia",
    jp1: "asia",
    oc1: "sea",
    sg2: "sea",
    tw2: "sea",
    vn2: "sea",
    ph2: "sea",
  };

  const routing = routingMap[region.toLowerCase()] || "europe";

  try {
    // 1. Get PUUID from Riot ID
    const accountUrl = `https://${routing}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`;

    const accountRes = await fetch(accountUrl, {
      headers: { "X-Riot-Token": RIOT_API_KEY },
    });

    if (!accountRes.ok) {
      const err = await accountRes.json().catch(() => ({}));
      return res.status(accountRes.status).json({
        error:
          err?.status?.message ||
          `Riot API error (account lookup): ${accountRes.status}`,
      });
    }

    const account = await accountRes.json();
    const puuid = account.puuid;

    // 2. Get champion masteries by PUUID (top 200 or all)
    const masteryUrl = `https://${region.toLowerCase()}.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-puuid/${puuid}`;

    const masteryRes = await fetch(masteryUrl, {
      headers: { "X-Riot-Token": RIOT_API_KEY },
    });

    if (!masteryRes.ok) {
      const err = await masteryRes.json().catch(() => ({}));
      return res.status(masteryRes.status).json({
        error:
          err?.status?.message ||
          `Riot API error (mastery): ${masteryRes.status}`,
      });
    }

    const masteries = await masteryRes.json();

    return res.status(200).json({ puuid, masteries });
  } catch (e) {
    return res.status(500).json({ error: e.message || "Internal server error" });
  }
}

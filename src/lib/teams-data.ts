// src/lib/teams-data.ts
// Dades reals dels equips de la Champions League
// Escuts via Wikimedia Commons upload.wikimedia.org (URLs directes verificades)

export const CHAMPIONS_TEAMS = [
  // ── GRUP A ──────────────────────────────────────────────────────
  {
    name: "Real Madrid",
    shortName: "RMA",
    logo: "https://upload.wikimedia.org/wikipedia/en/5/56/Real_Madrid_CF.svg",
    country: "Espanya",
    group: "A",
  },
  {
    name: "Borussia Dortmund",
    shortName: "BVB",
    logo: "https://upload.wikimedia.org/wikipedia/commons/6/67/Borussia_Dortmund_logo.svg",
    country: "Alemanya",
    group: "A",
  },
  {
    name: "Club Brugge",
    shortName: "CLU",
    logo: "https://upload.wikimedia.org/wikipedia/en/a/a2/Club_Brugge_KV_logo.svg",
    country: "Bèlgica",
    group: "A",
  },
  {
    name: "Dinamo Zagreb",
    shortName: "DZG",
    logo: "https://upload.wikimedia.org/wikipedia/en/b/b3/GNK_Dinamo_Zagreb.svg",
    country: "Croàcia",
    group: "A",
  },

  // ── GRUP B ──────────────────────────────────────────────────────
  {
    name: "Bayern Munich",
    shortName: "BAY",
    logo: "https://upload.wikimedia.org/wikipedia/commons/1/1b/FC_Bayern_M%C3%BCnchen_logo_%282017%29.svg",
    country: "Alemanya",
    group: "B",
  },
  {
    name: "Atlético Madrid",
    shortName: "ATM",
    logo: "https://upload.wikimedia.org/wikipedia/en/f/f4/Atletico_Madrid_2017_logo.svg",
    country: "Espanya",
    group: "B",
  },
  {
    name: "Galatasaray",
    shortName: "GAL",
    logo: "https://upload.wikimedia.org/wikipedia/en/8/8c/Galatasaray_S.K._logo.svg",
    country: "Turquia",
    group: "B",
  },
  {
    name: "FC Copenhagen",
    shortName: "FCK",
    logo: "https://upload.wikimedia.org/wikipedia/en/f/fc/FC_Copenhagen_crest.svg",
    country: "Dinamarca",
    group: "B",
  },

  // ── GRUP C ──────────────────────────────────────────────────────
  {
    name: "Manchester City",
    shortName: "MCI",
    logo: "https://upload.wikimedia.org/wikipedia/en/e/eb/Manchester_City_FC_badge.svg",
    country: "Anglaterra",
    group: "C",
  },
  {
    name: "RB Leipzig",
    shortName: "RBL",
    logo: "https://upload.wikimedia.org/wikipedia/en/0/04/RB_Leipzig_2014_logo.svg",
    country: "Alemanya",
    group: "C",
  },
  {
    name: "Crvena zvezda",
    shortName: "CZV",
    logo: "https://upload.wikimedia.org/wikipedia/en/e/e4/FK_Crvena_Zvezda_logo.svg",
    country: "Sèrbia",
    group: "C",
  },
  {
    name: "Young Boys",
    shortName: "YBB",
    logo: "https://upload.wikimedia.org/wikipedia/en/9/94/BSC_Young_Boys_logo.svg",
    country: "Suïssa",
    group: "C",
  },

  // ── GRUP D ──────────────────────────────────────────────────────
  {
    name: "Inter Milan",
    shortName: "INT",
    logo: "https://upload.wikimedia.org/wikipedia/commons/0/05/FC_Internazionale_Milano_2021.svg",
    country: "Itàlia",
    group: "D",
  },
  {
    name: "Real Sociedad",
    shortName: "RSO",
    logo: "https://upload.wikimedia.org/wikipedia/en/f/f1/Real_Sociedad_logo.svg",
    country: "Espanya",
    group: "D",
  },
  {
    name: "Benfica",
    shortName: "BEN",
    logo: "https://upload.wikimedia.org/wikipedia/en/8/8e/Sport_Lisboa_e_Benfica.svg",
    country: "Portugal",
    group: "D",
  },
  {
    name: "Salzburg",
    shortName: "SAL",
    logo: "https://upload.wikimedia.org/wikipedia/en/0/00/FC_Red_Bull_Salzburg.svg",
    country: "Àustria",
    group: "D",
  },

  // ── GRUP E ──────────────────────────────────────────────────────
  {
    name: "Arsenal",
    shortName: "ARS",
    logo: "https://upload.wikimedia.org/wikipedia/en/5/53/Arsenal_FC.svg",
    country: "Anglaterra",
    group: "E",
  },
  {
    name: "PSV Eindhoven",
    shortName: "PSV",
    logo: "https://upload.wikimedia.org/wikipedia/en/0/05/PSV_Eindhoven.svg",
    country: "Països Baixos",
    group: "E",
  },
  {
    name: "Sevilla",
    shortName: "SEV",
    logo: "https://upload.wikimedia.org/wikipedia/en/3/3b/Sevilla_fc_logo.svg",
    country: "Espanya",
    group: "E",
  },
  {
    name: "Lens",
    shortName: "LEN",
    logo: "https://upload.wikimedia.org/wikipedia/en/8/81/RC_Lens_logo.svg",
    country: "França",
    group: "E",
  },

  // ── GRUP F ──────────────────────────────────────────────────────
  {
    name: "Paris Saint-Germain",
    shortName: "PSG",
    logo: "https://upload.wikimedia.org/wikipedia/en/a/a7/Paris_Saint-Germain_F.C..svg",
    country: "França",
    group: "F",
  },
  {
    name: "AC Milan",
    shortName: "ACM",
    logo: "https://upload.wikimedia.org/wikipedia/commons/d/d0/Logo_of_AC_Milan.svg",
    country: "Itàlia",
    group: "F",
  },
  {
    name: "Newcastle United",
    shortName: "NEW",
    logo: "https://upload.wikimedia.org/wikipedia/en/5/56/Newcastle_United_Logo.svg",
    country: "Anglaterra",
    group: "F",
  },
  {
    name: "Dortmund",
    shortName: "BVB",
    logo: "https://upload.wikimedia.org/wikipedia/commons/6/67/Borussia_Dortmund_logo.svg",
    country: "Alemanya",
    group: "F",
  },

  // ── GRUP G ──────────────────────────────────────────────────────
  {
    name: "Manchester United",
    shortName: "MUN",
    logo: "https://upload.wikimedia.org/wikipedia/en/7/7a/Manchester_United_FC_crest.svg",
    country: "Anglaterra",
    group: "G",
  },
  {
    name: "Bayern Munich",
    shortName: "FCB",
    logo: "https://upload.wikimedia.org/wikipedia/commons/1/1b/FC_Bayern_M%C3%BCnchen_logo_%282017%29.svg",
    country: "Alemanya",
    group: "G",
  },
  {
    name: "FC Porto",
    shortName: "POR",
    logo: "https://upload.wikimedia.org/wikipedia/en/f/f1/FC_Porto.svg",
    country: "Portugal",
    group: "G",
  },
  {
    name: "Copenhagen",
    shortName: "FCK",
    logo: "https://upload.wikimedia.org/wikipedia/en/f/fc/FC_Copenhagen_crest.svg",
    country: "Dinamarca",
    group: "G",
  },

  // ── GRUP H ──────────────────────────────────────────────────────
  {
    name: "FC Barcelona",
    shortName: "FCB",
    logo: "https://upload.wikimedia.org/wikipedia/en/4/47/FC_Barcelona_%28crest%29.svg",
    country: "Espanya",
    group: "H",
  },
  {
    name: "FC Porto",
    shortName: "FCP",
    logo: "https://upload.wikimedia.org/wikipedia/en/f/f1/FC_Porto.svg",
    country: "Portugal",
    group: "H",
  },
  {
    name: "Shakhtar Donetsk",
    shortName: "SHA",
    logo: "https://upload.wikimedia.org/wikipedia/en/a/ab/FC_Shakhtar_Donetsk.svg",
    country: "Ucraïna",
    group: "H",
  },
  {
    name: "Royal Antwerp",
    shortName: "ANT",
    logo: "https://upload.wikimedia.org/wikipedia/en/3/33/Royal_Antwerp_FC_logo.svg",
    country: "Bèlgica",
    group: "H",
  },
];

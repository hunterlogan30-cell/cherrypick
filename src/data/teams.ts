import { NbaTeamInfo } from '../types/nba';

export const NBA_TEAMS: Record<string, NbaTeamInfo> = {
  PHI: {
    abbr: 'PHI',
    city: 'Philadelphia',
    name: '76ers',
    gradient: 'linear-gradient(225deg, #EB1616 0%, #1E14EA 100%)',
    horizontalGradient: 'linear-gradient(90deg, #F00909 0%, #3014D8 100%)',
    chartGradient: 'linear-gradient(245.1deg, #EB1616 31.7%, #1E14EA 100%)',
    glowGradient:
      'radial-gradient(89.17% 100% at 50% 0%, rgba(236, 9, 13, 0.2) 0%, rgba(53, 20, 211, 0.2) 100%), #0F1013',
    primaryColor: '#EB1616',
    secondaryColor: '#1E14EA',
  },
  NYK: {
    abbr: 'NYK',
    city: 'New York',
    name: 'Knicks',
    gradient: 'linear-gradient(225deg, #1E14EA 0%, #F66409 100%)',
    horizontalGradient: 'linear-gradient(90deg, #1E14EA 0%, #F66409 100%)',
    chartGradient: 'linear-gradient(243.84deg, #1E14EA 0%, #F66409 67.06%)',
    glowGradient:
      'radial-gradient(89.17% 100% at 50% 0%, rgba(246, 100, 9, 0.2) 0%, rgba(30, 20, 234, 0.2) 100%), #0F1013',
    primaryColor: '#F66409',
    secondaryColor: '#1E14EA',
  },
  LAL: {
    abbr: 'LAL',
    city: 'Los Angeles',
    name: 'Lakers',
    gradient: 'linear-gradient(225deg, #EBDA16 0%, #9C14EA 100%)',
    horizontalGradient: 'linear-gradient(90deg, #EBDA16 0%, #9C14EA 100%)',
    chartGradient: 'linear-gradient(245deg, #EBDA16 0%, #9C14EA 100%)',
    glowGradient:
      'radial-gradient(89.17% 100% at 50% 0%, rgba(235, 218, 22, 0.2) 0%, rgba(156, 20, 234, 0.2) 100%), #0F1013',
    primaryColor: '#EBDA16',
    secondaryColor: '#9C14EA',
  },
  GSW: {
    abbr: 'GSW',
    city: 'Golden State',
    name: 'Warriors',
    gradient: 'linear-gradient(225deg, #1E14EA 0%, #FFCE7E 100%)',
    horizontalGradient: 'linear-gradient(90deg, #1E14EA 0%, #FFCE7E 100%)',
    chartGradient: 'linear-gradient(245deg, #1E14EA 0%, #FFCE7E 100%)',
    glowGradient:
      'radial-gradient(89.17% 100% at 50% 0%, rgba(30, 20, 234, 0.2) 0%, rgba(255, 206, 126, 0.2) 100%), #0F1013',
    primaryColor: '#1E14EA',
    secondaryColor: '#FFCE7E',
  },
  MIL: {
    abbr: 'MIL',
    city: 'Milwaukee',
    name: 'Bucks',
    gradient: 'linear-gradient(225deg, #00471B 0%, #EEE1C6 100%)',
    horizontalGradient: 'linear-gradient(90deg, #00471B 0%, #EEE1C6 100%)',
    chartGradient: 'linear-gradient(245deg, #00471B 0%, #EEE1C6 100%)',
    glowGradient:
      'radial-gradient(89.17% 100% at 50% 0%, rgba(0, 71, 27, 0.25) 0%, rgba(238, 225, 198, 0.15) 100%), #0F1013',
    primaryColor: '#00471B',
    secondaryColor: '#EEE1C6',
  },
  BOS: {
    abbr: 'BOS',
    city: 'Boston',
    name: 'Celtics',
    gradient: 'linear-gradient(225deg, #008248 0%, #BA9653 85.1%)',
    horizontalGradient: 'linear-gradient(90deg, #008248 0%, #BA9653 100%)',
    chartGradient: 'linear-gradient(245deg, #008248 0%, #BA9653 100%)',
    glowGradient:
      'radial-gradient(89.17% 100% at 50% 0%, rgba(0, 130, 72, 0.22) 0%, rgba(186, 150, 83, 0.18) 100%), #0F1013',
    primaryColor: '#008248',
    secondaryColor: '#BA9653',
  },
  OKC: {
    abbr: 'OKC',
    city: 'Oklahoma City',
    name: 'Thunder',
    gradient: 'linear-gradient(225deg, #ED210A 0%, #0076B4 100%)',
    horizontalGradient: 'linear-gradient(90deg, #ED210A 0%, #0076B4 100%)',
    chartGradient: 'linear-gradient(245deg, #ED210A 0%, #0076B4 100%)',
    glowGradient:
      'radial-gradient(89.17% 100% at 50% 0%, rgba(237, 33, 10, 0.2) 0%, rgba(0, 118, 180, 0.2) 100%), #0F1013',
    primaryColor: '#ED210A',
    secondaryColor: '#0076B4',
  },
  SAS: {
    abbr: 'SAS',
    city: 'San Antonio',
    name: 'Spurs',
    gradient: 'linear-gradient(225deg, #141A1C 0%, #DCE2E5 100%)',
    horizontalGradient: 'linear-gradient(90deg, #141A1C 0%, #DCE2E5 100%)',
    chartGradient: 'linear-gradient(245deg, #141A1C 0%, #DCE2E5 100%)',
    glowGradient:
      'radial-gradient(89.17% 100% at 50% 0%, rgba(220, 226, 229, 0.2) 0%, rgba(20, 26, 28, 0.2) 100%), #0F1013',
    primaryColor: '#DCE2E5',
    secondaryColor: '#141A1C',
  },
  MIA: {
    abbr: 'MIA',
    city: 'Miami',
    name: 'Heat',
    gradient: 'linear-gradient(225deg, #A40524 17.79%, #EAA617 100%)',
    horizontalGradient: 'linear-gradient(90deg, #A40524 0%, #EAA617 100%)',
    chartGradient: 'linear-gradient(245deg, #A40524 17.79%, #EAA617 100%)',
    glowGradient:
      'radial-gradient(89.17% 100% at 50% 0%, rgba(164, 5, 36, 0.22) 0%, rgba(234, 166, 23, 0.18) 100%), #0F1013',
    primaryColor: '#A40524',
    secondaryColor: '#EAA617',
  },
  CLE: {
    abbr: 'CLE',
    city: 'Cleveland',
    name: 'Cavaliers',
    gradient: 'linear-gradient(225deg, #FCA400 0%, #680431 100%)',
    horizontalGradient: 'linear-gradient(90deg, #FCA400 0%, #680431 100%)',
    chartGradient: 'linear-gradient(245deg, #FCA400 0%, #680431 100%)',
    glowGradient:
      'radial-gradient(89.17% 100% at 50% 0%, rgba(252, 164, 0, 0.2) 0%, rgba(104, 4, 49, 0.22) 100%), #0F1013',
    primaryColor: '#FCA400',
    secondaryColor: '#680431',
  },
  ATL: {
    abbr: 'ATL',
    city: 'Atlanta',
    name: 'Hawks',
    gradient: 'linear-gradient(225deg, #FFFFFF 0%, #DE3B42 100%)',
    horizontalGradient: 'linear-gradient(90deg, #FFFFFF 0%, #DE3B42 100%)',
    chartGradient: 'linear-gradient(245deg, #FFFFFF 0%, #DE3B42 100%)',
    glowGradient:
      'radial-gradient(89.17% 100% at 50% 0%, rgba(222, 59, 66, 0.22) 0%, rgba(255, 255, 255, 0.14) 100%), #0F1013',
    primaryColor: '#DE3B42',
    secondaryColor: '#FFFFFF',
  },
  BKN: {
    abbr: 'BKN',
    city: 'Brooklyn',
    name: 'Nets',
    gradient: 'linear-gradient(225deg, #FFFFFF 0%, #2D2925 100%)',
    horizontalGradient: 'linear-gradient(90deg, #FFFFFF 0%, #2D2925 100%)',
    chartGradient: 'linear-gradient(245deg, #FFFFFF 0%, #2D2925 100%)',
    glowGradient:
      'radial-gradient(89.17% 100% at 50% 0%, rgba(255, 255, 255, 0.18) 0%, rgba(45, 41, 37, 0.22) 100%), #0F1013',
    primaryColor: '#FFFFFF',
    secondaryColor: '#2D2925',
  },
  CHA: {
    abbr: 'CHA',
    city: 'Charlotte',
    name: 'Hornets',
    gradient: 'linear-gradient(225deg, #148CA6 0%, #1C145E 78.85%)',
    horizontalGradient: 'linear-gradient(90deg, #148CA6 0%, #1C145E 100%)',
    chartGradient: 'linear-gradient(245deg, #148CA6 0%, #1C145E 78.85%)',
    glowGradient:
      'radial-gradient(89.17% 100% at 50% 0%, rgba(20, 140, 166, 0.22) 0%, rgba(28, 20, 94, 0.22) 100%), #0F1013',
    primaryColor: '#148CA6',
    secondaryColor: '#1C145E',
  },
  CHI: {
    abbr: 'CHI',
    city: 'Chicago',
    name: 'Bulls',
    gradient: 'linear-gradient(225deg, #C02236 0%, #2D2925 100%)',
    horizontalGradient: 'linear-gradient(90deg, #C02236 0%, #2D2925 100%)',
    chartGradient: 'linear-gradient(245deg, #C02236 0%, #2D2925 100%)',
    glowGradient:
      'radial-gradient(89.17% 100% at 50% 0%, rgba(192, 34, 54, 0.22) 0%, rgba(45, 41, 37, 0.22) 100%), #0F1013',
    primaryColor: '#C02236',
    secondaryColor: '#2D2925',
  },
  DEN: {
    abbr: 'DEN',
    city: 'Denver',
    name: 'Nuggets',
    gradient:
      'linear-gradient(225deg, #0E223F 0%, #76693E 46.15%, #FEC53D 100%)',
    horizontalGradient:
      'linear-gradient(90deg, #0E223F 0%, #76693E 46.15%, #FEC53D 100%)',
    chartGradient:
      'linear-gradient(245deg, #0E223F 0%, #76693E 46.15%, #FEC53D 100%)',
    glowGradient:
      'radial-gradient(89.17% 100% at 50% 0%, rgba(254, 197, 61, 0.2) 0%, rgba(14, 34, 63, 0.22) 100%), #0F1013',
    primaryColor: '#FEC53D',
    secondaryColor: '#0E223F',
  },
  DET: {
    abbr: 'DET',
    city: 'Detroit',
    name: 'Pistons',
    gradient: 'linear-gradient(225deg, #C61533 0%, #1F4488 78.85%)',
    horizontalGradient: 'linear-gradient(90deg, #C61533 0%, #1F4488 100%)',
    chartGradient: 'linear-gradient(245deg, #C61533 0%, #1F4488 78.85%)',
    glowGradient:
      'radial-gradient(89.17% 100% at 50% 0%, rgba(198, 21, 51, 0.22) 0%, rgba(31, 68, 136, 0.22) 100%), #0F1013',
    primaryColor: '#C61533',
    secondaryColor: '#1F4488',
  },
  IND: {
    abbr: 'IND',
    city: 'Indiana',
    name: 'Pacers',
    gradient: 'linear-gradient(225deg, #FAB339 0%, #091F3E 87.5%)',
    horizontalGradient: 'linear-gradient(90deg, #FAB339 0%, #091F3E 100%)',
    chartGradient: 'linear-gradient(245deg, #FAB339 0%, #091F3E 87.5%)',
    glowGradient:
      'radial-gradient(89.17% 100% at 50% 0%, rgba(250, 179, 57, 0.2) 0%, rgba(9, 31, 62, 0.22) 100%), #0F1013',
    primaryColor: '#FAB339',
    secondaryColor: '#091F3E',
  },
  LAC: {
    abbr: 'LAC',
    city: 'LA',
    name: 'Clippers',
    gradient: 'linear-gradient(225deg, #1F4488 0%, #C61533 100%)',
    horizontalGradient: 'linear-gradient(90deg, #1F4488 0%, #C61533 100%)',
    chartGradient: 'linear-gradient(245deg, #1F4488 0%, #C61533 100%)',
    glowGradient:
      'radial-gradient(89.17% 100% at 50% 0%, rgba(31, 68, 136, 0.22) 0%, rgba(198, 21, 51, 0.22) 100%), #0F1013',
    primaryColor: '#1F4488',
    secondaryColor: '#C61533',
  },
  DAL: {
    abbr: 'DAL',
    city: 'Dallas',
    name: 'Mavericks',
    gradient: 'linear-gradient(225deg, #137EC2 0%, #FEFEFE 100%)',
    horizontalGradient: 'linear-gradient(90deg, #137EC2 0%, #FEFEFE 100%)',
    chartGradient: 'linear-gradient(245deg, #137EC2 0%, #FEFEFE 100%)',
    glowGradient:
      'radial-gradient(89.17% 100% at 50% 0%, rgba(19, 126, 194, 0.22) 0%, rgba(254, 254, 254, 0.16) 100%), #0F1013',
    primaryColor: '#137EC2',
    secondaryColor: '#FEFEFE',
  },
  MEM: {
    abbr: 'MEM',
    city: 'Memphis',
    name: 'Grizzlies',
    gradient: 'linear-gradient(225deg, #5E77A7 0%, #12183E 87.5%)',
    horizontalGradient: 'linear-gradient(90deg, #5E77A7 0%, #12183E 100%)',
    chartGradient: 'linear-gradient(245deg, #5E77A7 0%, #12183E 87.5%)',
    glowGradient:
      'radial-gradient(89.17% 100% at 50% 0%, rgba(94, 119, 167, 0.22) 0%, rgba(18, 24, 62, 0.22) 100%), #0F1013',
    primaryColor: '#5E77A7',
    secondaryColor: '#12183E',
  },
  MIN: {
    abbr: 'MIN',
    city: 'Minnesota',
    name: 'Timberwolves',
    gradient: 'linear-gradient(225deg, #032B59 0%, #7CBF4A 100%)',
    horizontalGradient: 'linear-gradient(90deg, #032B59 0%, #7CBF4A 100%)',
    chartGradient: 'linear-gradient(245deg, #032B59 0%, #7CBF4A 100%)',
    glowGradient:
      'radial-gradient(89.17% 100% at 50% 0%, rgba(124, 191, 74, 0.2) 0%, rgba(3, 43, 89, 0.22) 100%), #0F1013',
    primaryColor: '#7CBF4A',
    secondaryColor: '#032B59',
  },
  NOP: {
    abbr: 'NOP',
    city: 'New Orleans',
    name: 'Pelicans',
    gradient: 'linear-gradient(225deg, #032B59 0%, #B3965D 100%)',
    horizontalGradient: 'linear-gradient(90deg, #032B59 0%, #B3965D 100%)',
    chartGradient: 'linear-gradient(245deg, #032B59 0%, #B3965D 100%)',
    glowGradient:
      'radial-gradient(89.17% 100% at 50% 0%, rgba(179, 150, 93, 0.2) 0%, rgba(3, 43, 89, 0.22) 100%), #0F1013',
    primaryColor: '#B3965D',
    secondaryColor: '#032B59',
  },
  ORL: {
    abbr: 'ORL',
    city: 'Orlando',
    name: 'Magic',
    gradient: 'linear-gradient(225deg, #C4CDD3 12.5%, #1179BD 100%)',
    horizontalGradient: 'linear-gradient(90deg, #C4CDD3 0%, #1179BD 100%)',
    chartGradient: 'linear-gradient(245deg, #C4CDD3 12.5%, #1179BD 100%)',
    glowGradient:
      'radial-gradient(89.17% 100% at 50% 0%, rgba(17, 121, 189, 0.22) 0%, rgba(196, 205, 211, 0.16) 100%), #0F1013',
    primaryColor: '#1179BD',
    secondaryColor: '#C4CDD3',
  },
  PHX: {
    abbr: 'PHX',
    city: 'Phoenix',
    name: 'Suns',
    gradient: 'linear-gradient(225deg, #F79F31 0%, #390157 100%)',
    horizontalGradient: 'linear-gradient(90deg, #F79F31 0%, #390157 100%)',
    chartGradient: 'linear-gradient(245deg, #F79F31 0%, #390157 100%)',
    glowGradient:
      'radial-gradient(89.17% 100% at 50% 0%, rgba(247, 159, 49, 0.22) 0%, rgba(57, 1, 87, 0.22) 100%), #0F1013',
    primaryColor: '#F79F31',
    secondaryColor: '#390157',
  },
  POR: {
    abbr: 'POR',
    city: 'Portland',
    name: 'Trail Blazers',
    gradient: 'linear-gradient(225deg, #DE3C43 0%, #FFFFFF 100%)',
    horizontalGradient: 'linear-gradient(90deg, #DE3C43 0%, #FFFFFF 100%)',
    chartGradient: 'linear-gradient(245deg, #DE3C43 0%, #FFFFFF 100%)',
    glowGradient:
      'radial-gradient(89.17% 100% at 50% 0%, rgba(222, 60, 67, 0.22) 0%, rgba(255, 255, 255, 0.14) 100%), #0F1013',
    primaryColor: '#DE3C43',
    secondaryColor: '#FFFFFF',
  },
  HOU: {
    abbr: 'HOU',
    city: 'Houston',
    name: 'Rockets',
    gradient: 'linear-gradient(225deg, #FFFFFF 0%, #C02236 62.02%)',
    horizontalGradient: 'linear-gradient(90deg, #FFFFFF 0%, #C02236 100%)',
    chartGradient: 'linear-gradient(245deg, #FFFFFF 0%, #C02236 62.02%)',
    glowGradient:
      'radial-gradient(89.17% 100% at 50% 0%, rgba(192, 34, 54, 0.22) 0%, rgba(255, 255, 255, 0.14) 100%), #0F1013',
    primaryColor: '#C02236',
    secondaryColor: '#FFFFFF',
  },
  SAC: {
    abbr: 'SAC',
    city: 'Sacramento',
    name: 'Kings',
    gradient: 'linear-gradient(225deg, #592F7F 0%, #5C666F 100%)',
    horizontalGradient: 'linear-gradient(90deg, #592F7F 0%, #5C666F 100%)',
    chartGradient: 'linear-gradient(245deg, #592F7F 0%, #5C666F 100%)',
    glowGradient:
      'radial-gradient(89.17% 100% at 50% 0%, rgba(89, 47, 127, 0.25) 0%, rgba(92, 102, 111, 0.18) 100%), #0F1013',
    primaryColor: '#592F7F',
    secondaryColor: '#5C666F',
  },
  TOR: {
    abbr: 'TOR',
    city: 'Toronto',
    name: 'Raptors',
    gradient: 'linear-gradient(225deg, #CC1744 26.92%, #FFFFFF 100%)',
    horizontalGradient: 'linear-gradient(90deg, #CC1744 0%, #FFFFFF 100%)',
    chartGradient: 'linear-gradient(245deg, #CC1744 26.92%, #FFFFFF 100%)',
    glowGradient:
      'radial-gradient(89.17% 100% at 50% 0%, rgba(204, 23, 68, 0.22) 0%, rgba(255, 255, 255, 0.14) 100%), #0F1013',
    primaryColor: '#CC1744',
    secondaryColor: '#FFFFFF',
  },
  UTA: {
    abbr: 'UTA',
    city: 'Utah',
    name: 'Jazz',
    gradient: 'linear-gradient(225deg, #F7A031 0%, #2C5035 62.02%)',
    horizontalGradient: 'linear-gradient(90deg, #F7A031 0%, #2C5035 100%)',
    chartGradient: 'linear-gradient(245deg, #F7A031 0%, #2C5035 62.02%)',
    glowGradient:
      'radial-gradient(89.17% 100% at 50% 0%, rgba(247, 160, 49, 0.2) 0%, rgba(44, 80, 53, 0.22) 100%), #0F1013',
    primaryColor: '#F7A031',
    secondaryColor: '#2C5035',
  },
  WAS: {
    abbr: 'WAS',
    city: 'Washington',
    name: 'Wizards',
    gradient: 'linear-gradient(225deg, #032B59 31.25%, #DF1D3B 100%)',
    horizontalGradient: 'linear-gradient(90deg, #032B59 0%, #DF1D3B 100%)',
    chartGradient: 'linear-gradient(245deg, #032B59 31.25%, #DF1D3B 100%)',
    glowGradient:
      'radial-gradient(89.17% 100% at 50% 0%, rgba(223, 29, 59, 0.22) 0%, rgba(3, 43, 89, 0.22) 100%), #0F1013',
    primaryColor: '#DF1D3B',
    secondaryColor: '#032B59',
  },
};

// Exact 30-team order from Figma Frame 48 (389x970px)
export const ALL_TEAM_ORDER = [
  'PHI',
  'NYK',
  'LAL',
  'GSW',
  'MIL',
  'BOS',
  'OKC',
  'SAS',
  'MIA',
  'CLE',
  'ATL',
  'BKN',
  'CHA',
  'CHI',
  'DEN',
  'DET',
  'IND',
  'LAC',
  'DAL',
  'MEM',
  'MIN',
  'NOP',
  'ORL',
  'PHX',
  'POR',
  'HOU',
  'SAC',
  'TOR',
  'UTA',
  'WAS',
];

export const FEATURED_TEAM_ORDER = ALL_TEAM_ORDER;

export function getTeamInfo(abbr: string): NbaTeamInfo {
  const normalized = abbr?.toUpperCase().trim();
  const aliasMap: Record<string, string> = {
    GS: 'GSW',
    NY: 'NYK',
    SA: 'SAS',
    NO: 'NOP',
    UTAH: 'UTA',
    WSH: 'WAS',
    PHO: 'PHX',
  };
  const key = aliasMap[normalized] || normalized;
  return (
    NBA_TEAMS[key] || {
      abbr: normalized || 'NBA',
      city: normalized || 'NBA',
      name: 'Team',
      gradient: 'linear-gradient(225deg, #EB1616 0%, #1E14EA 100%)',
      horizontalGradient: 'linear-gradient(90deg, #F00909 0%, #3014D8 100%)',
      chartGradient: 'linear-gradient(245.1deg, #EB1616 31.7%, #1E14EA 100%)',
      glowGradient:
        'radial-gradient(89.17% 100% at 50% 0%, rgba(236, 9, 13, 0.2) 0%, rgba(53, 20, 211, 0.2) 100%), #0F1013',
      primaryColor: '#EB1616',
      secondaryColor: '#1E14EA',
    }
  );
}

export interface TeamStarPlayer {
  name: string;
  jersey: string;
  pts: number;
  reb: number;
  ast: number;
  scoringPlay: string;
  altPlay: string;
}

export const TEAM_STAR_ROSTERS: Record<string, [TeamStarPlayer, TeamStarPlayer]> = {
  PHI: [
    { name: 'Tyrese Maxey', jersey: '0', pts: 32, reb: 4, ast: 7, scoringPlay: 'Maxey step-back 3-pointer', altPlay: 'Maxey fast-break layup' },
    { name: 'Joel Embiid', jersey: '21', pts: 28, reb: 11, ast: 4, scoringPlay: 'Embiid fadeaway jumper', altPlay: 'Embiid offensive putback' },
  ],
  NYK: [
    { name: 'Jalen Brunson', jersey: '11', pts: 29, reb: 3, ast: 8, scoringPlay: 'Brunson pull-up mid-range', altPlay: 'Brunson driving scoop layup' },
    { name: 'Karl-Anthony Towns', jersey: '32', pts: 24, reb: 12, ast: 3, scoringPlay: 'Towns corner 3-pointer', altPlay: 'Towns two-handed slam' },
  ],
  LAL: [
    { name: 'Anthony Davis', jersey: '3', pts: 28, reb: 13, ast: 3, scoringPlay: 'Davis alley-oop slam', altPlay: 'Davis emphatic block' },
    { name: 'Austin Reaves', jersey: '15', pts: 23, reb: 5, ast: 6, scoringPlay: 'Reaves pull-up 3-pointer', altPlay: 'Reaves driving floater' },
  ],
  GSW: [
    { name: 'Stephen Curry', jersey: '30', pts: 31, reb: 5, ast: 6, scoringPlay: 'Curry 30-foot 3-pointer', altPlay: 'Curry off-ball catch & shoot' },
    { name: 'Jonathan Kuminga', jersey: '00', pts: 22, reb: 6, ast: 3, scoringPlay: 'Kuminga explosive baseline slam', altPlay: 'Kuminga driving and-one' },
  ],
  BOS: [
    { name: 'Jayson Tatum', jersey: '0', pts: 30, reb: 8, ast: 5, scoringPlay: 'Tatum sidestep 3-pointer', altPlay: 'Tatum pull-up jumper' },
    { name: 'Jaylen Brown', jersey: '7', pts: 26, reb: 6, ast: 4, scoringPlay: 'Brown transition windmill dunk', altPlay: 'Brown driving floater' },
  ],
  MIA: [
    { name: 'Bam Adebayo', jersey: '13', pts: 22, reb: 11, ast: 5, scoringPlay: 'Adebayo rim-rocking slam', altPlay: 'Adebayo hook shot' },
    { name: 'Tyler Herro', jersey: '14', pts: 24, reb: 5, ast: 6, scoringPlay: 'Herro step-back 3-pointer', altPlay: 'Herro driving floater' },
  ],
  CHI: [
    { name: 'Coby White', jersey: '0', pts: 28, reb: 6, ast: 7, scoringPlay: 'White pull-up 3-pointer', altPlay: 'White crossover pull-up 3' },
    { name: 'Zach LaVine', jersey: '8', pts: 26, reb: 5, ast: 5, scoringPlay: 'LaVine high-flying slam', altPlay: 'LaVine fast-break dunk' },
  ],
  DEN: [
    { name: 'Nikola Jokić', jersey: '15', pts: 29, reb: 14, ast: 11, scoringPlay: 'Jokić Sombor shuffle jumper', altPlay: 'Jokić full-court touchdown pass' },
    { name: 'Jamal Murray', jersey: '27', pts: 23, reb: 4, ast: 7, scoringPlay: 'Murray step-back mid-range', altPlay: 'Murray clutch 3-pointer' },
  ],
  MIL: [
    { name: 'Giannis Antetokounmpo', jersey: '34', pts: 33, reb: 12, ast: 6, scoringPlay: 'Antetokounmpo eurostep slam', altPlay: 'Antetokounmpo chase-down block' },
    { name: 'Damian Lillard', jersey: '0', pts: 26, reb: 4, ast: 7, scoringPlay: 'Lillard logo 3-pointer', altPlay: 'Lillard step-back three' },
  ],
  OKC: [
    { name: 'Shai Gilgeous-Alexander', jersey: '2', pts: 31, reb: 6, ast: 6, scoringPlay: 'Gilgeous-Alexander driving layup', altPlay: 'Gilgeous-Alexander snatch-back jumper' },
    { name: 'Jalen Williams', jersey: '8', pts: 21, reb: 5, ast: 5, scoringPlay: 'Williams baseline one-handed jam', altPlay: 'Williams pull-up 3-pointer' },
  ],
  SAS: [
    { name: 'Victor Wembanyama', jersey: '1', pts: 26, reb: 12, ast: 4, scoringPlay: 'Wembanyama step-back 3-pointer', altPlay: 'Wembanyama soaring putback dunk' },
    { name: 'Chris Paul', jersey: '3', pts: 14, reb: 4, ast: 9, scoringPlay: 'Paul mid-range elbow jumper', altPlay: 'Paul pocket pass assist' },
  ],
  CLE: [
    { name: 'Donovan Mitchell', jersey: '45', pts: 28, reb: 5, ast: 6, scoringPlay: 'Mitchell explosive driving dunk', altPlay: 'Mitchell deep pull-up 3' },
    { name: 'Darius Garland', jersey: '10', pts: 22, reb: 3, ast: 8, scoringPlay: 'Garland floating teardrop', altPlay: 'Garland step-back three' },
  ],
  DAL: [
    { name: 'Luka Dončić', jersey: '77', pts: 34, reb: 9, ast: 10, scoringPlay: 'Dončić step-back corner 3', altPlay: 'Dončić no-look dime' },
    { name: 'Kyrie Irving', jersey: '11', pts: 26, reb: 4, ast: 5, scoringPlay: 'Irving acrobatic English layup', altPlay: 'Irving pull-up mid-range' },
  ],
  MIN: [
    { name: 'Anthony Edwards', jersey: '5', pts: 29, reb: 6, ast: 5, scoringPlay: 'Edwards posterizing slam dunk', altPlay: 'Edwards pull-up 3-pointer' },
    { name: 'Julius Randle', jersey: '30', pts: 22, reb: 9, ast: 5, scoringPlay: 'Randle physical bully-ball layup', altPlay: 'Randle top-of-key three' },
  ],
  PHX: [
    { name: 'Kevin Durant', jersey: '35', pts: 28, reb: 7, ast: 4, scoringPlay: 'Durant unguardable pull-up jumper', altPlay: 'Durant fadeaway 18-footer' },
    { name: 'Devin Booker', jersey: '1', pts: 26, reb: 4, ast: 7, scoringPlay: 'Booker mid-range baseline turnaround', altPlay: 'Booker catch-and-shoot three' },
  ],
  IND: [
    { name: 'Tyrese Haliburton', jersey: '0', pts: 22, reb: 4, ast: 11, scoringPlay: 'Haliburton pull-up transition 3', altPlay: 'Haliburton jump-pass dime' },
    { name: 'Pascal Siakam', jersey: '43', pts: 24, reb: 8, ast: 4, scoringPlay: 'Siakam spin-move floater', altPlay: 'Siakam fast-break layup' },
  ],
  MEM: [
    { name: 'Ja Morant', jersey: '12', pts: 27, reb: 5, ast: 8, scoringPlay: 'Morant gravity-defying windmill', altPlay: 'Morant 360 driving layup' },
    { name: 'Jaren Jackson Jr.', jersey: '13', pts: 22, reb: 7, ast: 2, scoringPlay: 'Jackson Jr. trailing 3-pointer', altPlay: 'Jackson Jr. swatted block' },
  ],
  SAC: [
    { name: "De'Aaron Fox", jersey: '5', pts: 27, reb: 4, ast: 6, scoringPlay: 'Fox lightning fast-break layup', altPlay: 'Fox clutch mid-range jumper' },
    { name: 'Domantas Sabonis', jersey: '10', pts: 20, reb: 13, ast: 8, scoringPlay: 'Sabonis physical putback hook', altPlay: 'Sabonis handoff assist' },
  ],
  ORL: [
    { name: 'Paolo Banchero', jersey: '5', pts: 28, reb: 8, ast: 5, scoringPlay: 'Banchero driving and-one power dunk', altPlay: 'Banchero step-back mid-range' },
    { name: 'Franz Wagner', jersey: '22', pts: 22, reb: 5, ast: 4, scoringPlay: 'Wagner eurostep driving layup', altPlay: 'Wagner corner 3-pointer' },
  ],
  HOU: [
    { name: 'Alperen Şengün', jersey: '28', pts: 23, reb: 10, ast: 6, scoringPlay: 'Şengün spinning dream-shake hook', altPlay: 'Şengün bounce pass assist' },
    { name: 'Jalen Green', jersey: '4', pts: 22, reb: 5, ast: 4, scoringPlay: 'Green high-wire driving slam', altPlay: 'Green side-step three' },
  ],
  LAC: [
    { name: 'James Harden', jersey: '1', pts: 23, reb: 6, ast: 9, scoringPlay: 'Harden patented step-back 3', altPlay: 'Harden lob assist' },
    { name: 'Norman Powell', jersey: '24', pts: 22, reb: 3, ast: 2, scoringPlay: 'Powell corner catch & shoot 3', altPlay: 'Powell driving straight-line dunk' },
  ],
  ATL: [
    { name: 'Trae Young', jersey: '11', pts: 26, reb: 3, ast: 11, scoringPlay: 'Young 32-foot logo bomb', altPlay: 'Young floater off the glass' },
    { name: 'Jalen Johnson', jersey: '1', pts: 20, reb: 9, ast: 5, scoringPlay: 'Johnson rim-shaking alley-oop', altPlay: 'Johnson transition coast-to-coast' },
  ],
  NOP: [
    { name: 'Zion Williamson', jersey: '1', pts: 27, reb: 8, ast: 5, scoringPlay: 'Williamson thunderous two-handed slam', altPlay: 'Williamson freight-train layup' },
    { name: 'Brandon Ingram', jersey: '14', pts: 23, reb: 5, ast: 5, scoringPlay: 'Ingram high-release mid-range jumper', altPlay: 'Ingram pull-up three' },
  ],
  CHA: [
    { name: 'LaMelo Ball', jersey: '1', pts: 28, reb: 6, ast: 8, scoringPlay: 'Ball deep step-back 3-pointer', altPlay: 'Ball no-look wraparound assist' },
    { name: 'Brandon Miller', jersey: '24', pts: 22, reb: 5, ast: 3, scoringPlay: 'Miller silky pull-up jumper', altPlay: 'Miller fast-break dunk' },
  ],
  TOR: [
    { name: 'Scottie Barnes', jersey: '4', pts: 23, reb: 8, ast: 6, scoringPlay: 'Barnes power driving dunk', altPlay: 'Barnes no-look dish' },
    { name: 'RJ Barrett', jersey: '9', pts: 22, reb: 6, ast: 4, scoringPlay: 'Barrett strong left-handed layup', altPlay: 'Barrett transition three' },
  ],
  BKN: [
    { name: 'Cam Thomas', jersey: '24', pts: 26, reb: 3, ast: 4, scoringPlay: 'Thomas contested pull-up 3', altPlay: 'Thomas driving tough floater' },
    { name: 'Cameron Johnson', jersey: '2', pts: 18, reb: 5, ast: 3, scoringPlay: 'Johnson quick-trigger corner 3', altPlay: 'Johnson transition layup' },
  ],
  DET: [
    { name: 'Cade Cunningham', jersey: '2', pts: 25, reb: 6, ast: 8, scoringPlay: 'Cunningham poised mid-range pull-up', altPlay: 'Cunningham driving and-one' },
    { name: 'Jaden Ivey', jersey: '23', pts: 20, reb: 4, ast: 4, scoringPlay: 'Ivey blazing fast-break slam', altPlay: 'Ivey pull-up three' },
  ],
  POR: [
    { name: 'Anfernee Simons', jersey: '1', pts: 24, reb: 3, ast: 5, scoringPlay: 'Simons deep pull-up 3-pointer', altPlay: 'Simons acrobatic runner' },
    { name: 'Jerami Grant', jersey: '9', pts: 21, reb: 4, ast: 2, scoringPlay: 'Grant slashing baseline jam', altPlay: 'Grant corner three' },
  ],
  UTA: [
    { name: 'Lauri Markkanen', jersey: '23', pts: 26, reb: 9, ast: 2, scoringPlay: 'Markkanen trailing 3-pointer', altPlay: 'Markkanen one-handed tomahawk' },
    { name: 'Collin Sexton', jersey: '2', pts: 20, reb: 3, ast: 5, scoringPlay: 'Sexton relentless driving layup', altPlay: 'Sexton mid-range jumper' },
  ],
  WAS: [
    { name: 'Jordan Poole', jersey: '13', pts: 23, reb: 3, ast: 5, scoringPlay: 'Poole deep off-the-dribble 3', altPlay: 'Poole crossover hesitation layup' },
    { name: 'Kyle Kuzma', jersey: '0', pts: 21, reb: 7, ast: 4, scoringPlay: 'Kuzma step-back corner three', altPlay: 'Kuzma driving baseline runner' },
  ],
};

export function getTeamStars(abbr: string): [TeamStarPlayer, TeamStarPlayer] {
  const normalized = abbr?.toUpperCase().trim();
  const aliasMap: Record<string, string> = {
    GS: 'GSW',
    NY: 'NYK',
    SA: 'SAS',
    NO: 'NOP',
    UTAH: 'UTA',
    WSH: 'WAS',
    PHO: 'PHX',
  };
  const key = aliasMap[normalized] || normalized;
  return (
    TEAM_STAR_ROSTERS[key] || [
      { name: 'Star Player', jersey: '0', pts: 25, reb: 6, ast: 6, scoringPlay: 'pull-up jumper', altPlay: 'fast-break layup' },
      { name: 'Key Contributor', jersey: '11', pts: 20, reb: 5, ast: 4, scoringPlay: 'driving layup', altPlay: 'corner three' },
    ]
  );
}

export const KNOWN_SUPERSTAR_TEAMS: Record<string, string> = {
  'Jaylen Brown': 'BOS',
  'Jayson Tatum': 'BOS',
  'Derrick White': 'BOS',
  'Joel Embiid': 'PHI',
  'Tyrese Maxey': 'PHI',
  'Paul George': 'PHI',
  'Jalen Brunson': 'NYK',
  'Karl-Anthony Towns': 'NYK',
  'LeBron James': 'LAL',
  'Anthony Davis': 'LAL',
  'Austin Reaves': 'LAL',
  'Stephen Curry': 'GSW',
  'Jonathan Kuminga': 'GSW',
  'Giannis Antetokounmpo': 'MIL',
  'Damian Lillard': 'MIL',
  'Nikola Jokić': 'DEN',
  'Nikola Jokic': 'DEN',
  'Jamal Murray': 'DEN',
  'Luka Dončić': 'DAL',
  'Luka Doncic': 'DAL',
  'Kyrie Irving': 'DAL',
  'Shai Gilgeous-Alexander': 'OKC',
  'Victor Wembanyama': 'SAS',
  'Chris Paul': 'SAS',
  'Donovan Mitchell': 'CLE',
  'Darius Garland': 'CLE',
  'Anthony Edwards': 'MIN',
  'Julius Randle': 'MIN',
  'Devin Booker': 'PHX',
  'Kevin Durant': 'PHX',
  'Ja Morant': 'MEM',
  'Tyrese Haliburton': 'IND',
  'Pascal Siakam': 'IND',
  'De\'Aaron Fox': 'SAC',
  'Domantas Sabonis': 'SAC',
  'Zion Williamson': 'NOP',
  'Brandon Ingram': 'NOP',
  'Paolo Banchero': 'ORL',
  'Franz Wagner': 'ORL',
  'Trae Young': 'ATL',
  'Alperen Şengün': 'HOU',
  'Alperen Sengun': 'HOU',
  'James Harden': 'LAC',
  'Lauri Markkanen': 'UTA',
  'Cam Thomas': 'BKN',
  'LaMelo Ball': 'CHA',
  'Scottie Barnes': 'TOR',
  'Cade Cunningham': 'DET',
  'Jaden Ivey': 'DET',
  'Jordan Poole': 'WAS',
  'Anfernee Simons': 'POR',
  'Coby White': 'CHI',
  'Zach LaVine': 'CHI',
  'Bam Adebayo': 'MIA',
  'Tyler Herro': 'MIA',
};

export function sanitizePlayerNameForGame(
  name: string,
  teamAbbr: string,
  awayTeam: string,
  homeTeam: string
): string {
  const playerRealTeam = KNOWN_SUPERSTAR_TEAMS[name];
  if (playerRealTeam && playerRealTeam !== awayTeam && playerRealTeam !== homeTeam) {
    const star = getTeamStars(teamAbbr)?.[0];
    return star ? star.name : name;
  }
  return name;
}

export function sanitizeTextForGame(
  text: string,
  teamAbbr: string,
  awayTeam: string,
  homeTeam: string
): string {
  let result = text;
  for (const [playerName, playerTeam] of Object.entries(KNOWN_SUPERSTAR_TEAMS)) {
    if (playerTeam !== awayTeam && playerTeam !== homeTeam && result.includes(playerName)) {
      const star = getTeamStars(teamAbbr)?.[0];
      const replacement = star ? star.name : 'Player';
      result = result.replaceAll(playerName, replacement);
    }
  }
  return result;
}

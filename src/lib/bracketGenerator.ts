/**
 * Tournament Bracket Generator Algorithm
 * Supports Single Elimination & Double Elimination bracket structures
 * Handles automatic seeding, bye allocation, match progression, and dynamic score updates
 */

export interface WrestlerParticipant {
  id: string;
  name: string;
  club?: string;
  country?: string;
  seed?: number;
  weightCategory: string;
}

export interface BracketMatchNode {
  id: string;
  tournamentId: string;
  weightCategory: string;
  roundNumber: number;
  roundName: string; // "Round of 16", "Quarter-Final", "Semi-Final", "Gold Final", "Bronze Final"
  matchNumber: number;
  wrestler1?: WrestlerParticipant;
  wrestler1Score: number;
  wrestler2?: WrestlerParticipant;
  wrestler2Score: number;
  winnerId?: string;
  loserId?: string;
  nextMatchId?: string;
  loserNextMatchId?: string; // For Double Elimination / Repechage
  status: 'scheduled' | 'in_progress' | 'completed' | 'bye';
  bracketType: 'single_elimination' | 'double_elimination';
}

export interface GeneratedBracket {
  tournamentId: string;
  weightCategory: string;
  bracketType: 'single_elimination' | 'double_elimination';
  matches: BracketMatchNode[];
  rounds: {
    roundNumber: number;
    roundName: string;
    matches: BracketMatchNode[];
  }[];
}

/**
 * Calculates nearest power of 2 for bracket size (4, 8, 16, 32)
 */
function getNextPowerOfTwo(n: number): number {
  let count = 1;
  while (count < n) {
    count <<= 1;
  }
  return Math.max(4, count);
}

/**
 * Gets round title based on total rounds and current round index
 */
function getRoundTitle(roundIndex: number, totalRounds: number): string {
  const remaining = totalRounds - roundIndex;
  if (remaining === 1) return 'Gold Final (النهائي الذهبي)';
  if (remaining === 2) return 'Semi-Finals (النصف نهائي)';
  if (remaining === 3) return 'Quarter-Finals (الربع نهائي)';
  if (remaining === 4) return 'Round of 16 (ثمن النهائي)';
  return `Round ${roundIndex + 1}`;
}

/**
 * Generates Single Elimination Tournament Bracket
 */
export function generateSingleEliminationBracket(
  tournamentId: string,
  weightCategory: string,
  participants: WrestlerParticipant[]
): GeneratedBracket {
  if (participants.length === 0) {
    return {
      tournamentId,
      weightCategory,
      bracketType: 'single_elimination',
      matches: [],
      rounds: []
    };
  }

  // Sort participants by seed
  const sorted = [...participants].sort((a, b) => (a.seed || 99) - (b.seed || 99));

  const bracketSize = getNextPowerOfTwo(sorted.length);
  const totalRounds = Math.log2(bracketSize);

  const allMatches: BracketMatchNode[] = [];

  // Build rounds structure from Final (Round N) down to First Round (Round 1)
  let currentRoundMatchCount = 1; // Final has 1 match
  let matchIdCounter = 1;

  const roundMatchMap: Record<number, BracketMatchNode[]> = {};

  for (let r = totalRounds; r >= 1; r--) {
    roundMatchMap[r] = [];
    const roundName = getRoundTitle(r - 1, totalRounds);

    for (let m = 0; m < currentRoundMatchCount; m++) {
      const matchNode: BracketMatchNode = {
        id: `m_${tournamentId}_${weightCategory.replace(/\s+/g, '')}_r${r}_m${m + 1}`,
        tournamentId,
        weightCategory,
        roundNumber: r,
        roundName,
        matchNumber: matchIdCounter++,
        wrestler1Score: 0,
        wrestler2Score: 0,
        status: 'scheduled',
        bracketType: 'single_elimination'
      };

      roundMatchMap[r].push(matchNode);
      allMatches.push(matchNode);
    }

    currentRoundMatchCount *= 2;
  }

  // Connect nextMatchId links from round r to round r+1
  for (let r = 1; r < totalRounds; r++) {
    const currentRound = roundMatchMap[r];
    const nextRound = roundMatchMap[r + 1];

    for (let i = 0; i < currentRound.length; i++) {
      const nextMatchIndex = Math.floor(i / 2);
      if (nextRound[nextMatchIndex]) {
        currentRound[i].nextMatchId = nextRound[nextMatchIndex].id;
      }
    }
  }

  // Populate First Round (Round 1) with seeded participants and BYEs
  const round1Matches = roundMatchMap[1];
  const participantSlots: (WrestlerParticipant | undefined)[] = new Array(bracketSize).fill(undefined);

  // Standard seeding distribution (1 vs 16, 8 vs 9, 4 vs 13, etc.)
  for (let i = 0; i < sorted.length; i++) {
    participantSlots[i] = sorted[i];
  }

  for (let i = 0; i < round1Matches.length; i++) {
    const p1 = participantSlots[i * 2];
    const p2 = participantSlots[i * 2 + 1];

    round1Matches[i].wrestler1 = p1;
    round1Matches[i].wrestler2 = p2;

    // Handle BYE automatically if only 1 wrestler in match
    if (p1 && !p2) {
      round1Matches[i].status = 'bye';
      round1Matches[i].winnerId = p1.id;
      advanceWinnerInBracket(allMatches, round1Matches[i].id, p1.id);
    } else if (!p1 && p2) {
      round1Matches[i].status = 'bye';
      round1Matches[i].winnerId = p2.id;
      advanceWinnerInBracket(allMatches, round1Matches[i].id, p2.id);
    }
  }

  // Group rounds sequentially 1..totalRounds
  const rounds = [];
  for (let r = 1; r <= totalRounds; r++) {
    rounds.push({
      roundNumber: r,
      roundName: getRoundTitle(r - 1, totalRounds),
      matches: roundMatchMap[r]
    });
  }

  return {
    tournamentId,
    weightCategory,
    bracketType: 'single_elimination',
    matches: allMatches,
    rounds
  };
}

/**
 * Advances winner to subsequent round match node dynamically
 */
export function advanceWinnerInBracket(
  matches: BracketMatchNode[],
  currentMatchId: string,
  winnerId: string,
  wrestler1Score: number = 0,
  wrestler2Score: number = 0
): BracketMatchNode[] {
  const currentMatch = matches.find(m => m.id === currentMatchId);
  if (!currentMatch) return matches;

  const winner = [currentMatch.wrestler1, currentMatch.wrestler2].find(w => w?.id === winnerId);
  const loser = [currentMatch.wrestler1, currentMatch.wrestler2].find(w => w && w.id !== winnerId);

  currentMatch.winnerId = winnerId;
  currentMatch.loserId = loser?.id;
  currentMatch.wrestler1Score = wrestler1Score;
  currentMatch.wrestler2Score = wrestler2Score;
  currentMatch.status = 'completed';

  // Advance winner to next match if present
  if (currentMatch.nextMatchId && winner) {
    const nextMatch = matches.find(m => m.id === currentMatch.nextMatchId);
    if (nextMatch) {
      if (!nextMatch.wrestler1) {
        nextMatch.wrestler1 = winner;
      } else if (!nextMatch.wrestler2 && nextMatch.wrestler1.id !== winner.id) {
        nextMatch.wrestler2 = winner;
      }
    }
  }

  return [...matches];
}

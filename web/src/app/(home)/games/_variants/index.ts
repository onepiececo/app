import { character } from "./character";
import { clue } from "./clue";
import { connections } from "./connections";
import type { Game } from "./shared";

// Games rebuilt into the variant workflow so far. The rest are being reworked one at a time.
export const GAMES: Game[] = [clue, connections, character];

import { GoogleGenAI } from "@google/genai";
import { GameState, Player } from '../types';

const getAiClient = () => {
  if (!process.env.API_KEY) {
    console.error("API Key is missing");
    return null;
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const generateGameCommentary = async (gameState: GameState): Promise<string> => {
  const ai = getAiClient();
  if (!ai) return "Omlouváme se, AI komentátor není momentálně k dispozici (chybí API klíč).";

  // Calculate totals for context
  const totals: Record<string, number> = {};
  gameState.players.forEach(p => totals[p.id] = 0);
  
  gameState.rounds.forEach(round => {
    Object.entries(round.scores).forEach(([pid, score]) => {
      if (totals[pid] !== undefined) {
        totals[pid] += score;
      }
    });
  });

  const playerSummaries = gameState.players.map(p => {
    return `${p.name}: ${totals[p.id]} bodů`;
  }).join(', ');

  const prompt = `
    Jsi vtipný, sarkastický, ale přátelský sportovní komentátor.
    Komentuješ právě probíhající hru s přáteli.
    
    Zde je stav hry:
    Název hry: ${gameState.gameName}
    Počet odehraných kol: ${gameState.rounds.length}
    Aktuální skóre: ${playerSummaries}

    Napiš krátký (max 3 věty) komentář o tom, kdo vyhrává, kdo prohrává, nebo povzbuď toho, kdo je poslední. Použij český jazyk. Buď trochu dramatický.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "Zajímavá hra!";
  } catch (error) {
    console.error("Error generating commentary:", error);
    return "AI komentátor se ztratil v číslech. Zkuste to později.";
  }
};
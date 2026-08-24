import statistics from './statistics'
import mlAlgorithms from './mlAlgorithms'
import deployment from './deployment'
import recsys from './recsys'

// Starter decks shipped with the app, importable into the user's sheet in one tap.
// Ordered to match how the interview topics are usually studied.
export const STARTER_DECKS = [statistics, mlAlgorithms, deployment, recsys]

export const STARTER_CARD_COUNT = STARTER_DECKS.reduce((n, d) => n + d.cards.length, 0)

// Flattens the decks into rows ready for the flashcards sheet.
export function starterCards() {
  return STARTER_DECKS.flatMap(d => d.cards.map(c => ({ deck: d.deck, front: c.front, back: c.back })))
}

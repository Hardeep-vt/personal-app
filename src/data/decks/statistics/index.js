import core from './core'
import probability from './probability'
import distributions from './distributions'
import estimation from './estimation'
import testing from './testing'
import regression from './regression'
import causal from './causal'
import experiments from './experiments'
import evaluation from './evaluation'
import pitfalls from './pitfalls'

// One deck, split across themed files purely for maintainability. Order runs from
// foundations to applied, which is roughly the order the topics build on each other —
// review shuffles anyway, but the deck list and card list read in this order.
export default {
  deck: 'Statistics for ML',
  cards: [
    ...core,
    ...probability,
    ...distributions,
    ...estimation,
    ...testing,
    ...regression,
    ...causal,
    ...experiments,
    ...evaluation,
    ...pitfalls,
  ],
}

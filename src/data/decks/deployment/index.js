import core from './core'
import serving from './serving'
import pipelines from './pipelines'
import monitoring from './monitoring'
import scaling from './scaling'
import lifecycle from './lifecycle'
import llmops from './llmops'

// One deck, split across themed files purely for maintainability. Order runs from the
// original core set through serving, data pipelines, monitoring, scaling, lifecycle
// and governance, and finally LLM-specific operations.
export default {
  deck: 'ML Deployment (MLOps)',
  cards: [
    ...core,
    ...serving,
    ...pipelines,
    ...monitoring,
    ...scaling,
    ...lifecycle,
    ...llmops,
  ],
}

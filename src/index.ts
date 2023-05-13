import request, { Command } from '@gosen/request'
import diff from '@gosen/diff'
import { execute } from '@gosen/dom'

class GosenCall extends HTMLElement {
  private _reqNum = 0
  private _state = [] as Command[]

  constructor() {
    super()
  }

  static get observedAttributes() {
    return ['href']
  }

  async connectedCallback() {
    const href = this.getAttribute('href')

    if (!this.isConnected || !href) {
      return
    }

    const reqNum = ++this._reqNum

    this.classList.add('gosen-loading')
    const { commands } = await request(href, {
      window: this.ownerDocument.defaultView,
    })

    if (reqNum !== this._reqNum) {
      return
    }

    this.classList.remove('gosen-loading')
    const diffed = diff(this._state, commands)

    this._state = commands.map(c => 'tx' in c ? {
      ...c,
      tx: undefined,
    } : c)

    await execute(this.ownerDocument, diffed)
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    if (name === 'href' && oldValue !== newValue) {
      this.connectedCallback()
    }
  }
}

export type GosenCallDefinitionOptions = {
  name?: string,
  window?: Window,
}

export const defineGosenCall = (options?: GosenCallDefinitionOptions) => {
  const { name = 'gosen-call', window: w = window } = options || {}
  w.customElements.define(name, GosenCall)
}

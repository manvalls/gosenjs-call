import request from '@gosen/request'
import { execute } from '@gosen/dom'

class GosenCall extends HTMLElement {
  private _reqNum = 0

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
    await execute(this.ownerDocument, commands)
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

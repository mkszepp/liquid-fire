import Component from '@glimmer/component';
import { action } from '@ember/object';
import { defer } from 'rsvp';
import { inject as service } from '@ember/service';
import './liquid-sync.css';

export default class LiquidSyncComponent extends Component {
  @service liquidFireChildren;
  @service('liquid-fire-transitions') _transitionMap;

  _lfDefer = [];

  @action
  setup(element) {
    this.element = element;
    this.pauseLiquidFire();
  }

  @action
  destroyElement() {
    this.ready();
  }

  @action
  ready() {
    this.resumeLiquidFire();
  }

  pauseLiquidFire() {
    const context = this.liquidFireChildren.closest(this.element);
    if (context) {
      const def = new defer();
      const tmap = this._transitionMap;
      tmap.incrementRunningTransitions();
      def.promise.finally(() => tmap.decrementRunningTransitions());
      this._lfDefer.push(def);
      context._waitForMe(def.promise);
    }
  }

  @action
  resumeLiquidFire() {
    const def = this._lfDefer.pop();
    if (def) {
      def.resolve();
    }
  }
}

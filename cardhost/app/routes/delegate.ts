import Route from '@ember/routing/route';
import { inject } from '@ember/service';
import CardsService, { Card } from '../services/cards';

export default class Delegate extends Route {
  @inject declare cards: CardsService;

  model(params: { pathname: string; url?: string }): Promise<Card> {
    if (params.url) {
      return this.cards.load(params.url, 'isolated');
    } else {
      return this.cards.loadForRoute('/' + params.pathname);
    }
  }
}

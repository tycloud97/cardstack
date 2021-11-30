import Mocha from 'mocha';
import { createRegistry, HubServer } from '../../main';
import CardCache from '../../services/card-cache';
import { Container, Registry } from '@cardstack/di';
import { TestCardCacheConfig, resolveCard } from './cards';
import supertest from 'supertest';
import { default as CardServiceFactory, CardService, INSECURE_CONTEXT } from '../../services/card-service';

import tmp from 'tmp';
import { TEST_REALM } from '@cardstack/core/tests/helpers/fixtures';
import { BASE_REALM_CONFIG, DEMO_REALM_CONFIG } from '../../services/realms-config';
import { RealmConfig } from '@cardstack/core/src/interfaces';
tmp.setGracefulCleanup();

interface InternalContext {
  registry?: Registry;
}
let contextMap = new WeakMap<object, InternalContext>();
function contextFor(mocha: object): InternalContext {
  let internal = contextMap.get(mocha);
  if (!internal) {
    internal = {};
    contextMap.set(mocha, internal);
  }
  return internal;
}

export function registry(context: object): Registry {
  let internal = contextFor(context);
  if (!internal.registry) {
    internal.registry = createRegistry();

    if (process.env.COMPILER) {
      internal.registry.register('card-cache-config', TestCardCacheConfig);
    }
  }
  return internal.registry;
}

export function setupHub(mochaContext: Mocha.Suite) {
  let container: Container;
  let server: HubServer;
  let cardCache: CardCache;
  let cardCacheConfig: TestCardCacheConfig;
  let testRealmDir: string;

  let currentCardService: CardServiceFactory | undefined;
  let cardServiceProxy = new Proxy(
    {},
    {
      get(_target, propertyName) {
        if (!process.env.COMPILER) {
          throw new Error(`compiler flag not active`);
        }
        if (!currentCardService) {
          throw new Error(`tried to use cardService outside of an active test`);
        }
        return (currentCardService.as(INSECURE_CONTEXT) as any)[propertyName];
      },
    }
  );

  mochaContext.beforeEach(async function () {
    let reg = registry(this);

    if (process.env.COMPILER) {
      testRealmDir = tmp.dirSync().name;
      reg.register(
        'realmsConfig',
        class TestRealmsConfig {
          realms: RealmConfig[] = [BASE_REALM_CONFIG, DEMO_REALM_CONFIG, { url: TEST_REALM, directory: testRealmDir }];
        }
      );
    }

    container = new Container(reg);

    if (process.env.COMPILER) {
      cardCache = await container.lookup('card-cache');
      cardCacheConfig = (await container.lookup('card-cache-config')) as TestCardCacheConfig;
      currentCardService = await container.lookup('card-service');
    }

    server = await container.lookup('hubServer');
  });

  mochaContext.afterEach(async function () {
    await container.teardown();
    currentCardService = undefined;
  });

  return {
    getContainer() {
      return container;
    },
    cards: cardServiceProxy as CardService,
    request() {
      return supertest(server.app.callback());
    },
    getCardCache(): CardCache {
      return cardCache;
    },
    resolveCard(module: string): string {
      return resolveCard(cardCacheConfig.root, module);
    },
    get realm() {
      return TEST_REALM;
    },
    getRealmDir(): string {
      return testRealmDir;
    },
  };
}

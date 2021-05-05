import type Koa from 'koa';
import supertest from 'supertest';
import QUnit from 'qunit';
import { templateOnlyComponentTemplate } from '@cardstack/core/tests/helpers/templates';
import { setupCardCache } from '@cardstack/server/tests/helpers/cache';
import {
  RealmHelper,
  setupRealms,
} from '@cardstack/server/tests/helpers/realm';
import { Server } from '@cardstack/server/src/server';

QUnit.module('POST /cards/<card-id>', function (hooks) {
  let realm: RealmHelper;
  let server: Koa;

  function getCard(cardURL: string) {
    return supertest(server.callback()).get(
      `/cards/${encodeURIComponent(cardURL)}`
    );
  }

  function postCard(cardURL: string, payload: any) {
    return supertest(server.callback())
      .post(`/cards/${encodeURIComponent(cardURL)}`)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .send(payload);
  }

  let { resolveCard, getCardCacheDir } = setupCardCache(hooks);
  let { createRealm, getRealms } = setupRealms(hooks);

  hooks.beforeEach(async function () {
    realm = createRealm('my-realm');
    realm.addCard('post', {
      'card.json': {
        schema: 'schema.js',
        isolated: 'isolated.js',
      },
      'schema.js': `
        import { contains } from "@cardstack/types";
        import string from "https://cardstack.com/base/string";
        export default class Post {
          @contains(string)
          title;
          @contains(string)
          body;
        }
      `,
      'isolated.js': templateOnlyComponentTemplate(
        '<h1><@model.title/></h1><article><@model.body/></article>'
      ),
    });

    // setting up a card cache directory that is also a resolvable node_modules
    // package with the appropriate exports rules
    server = (
      await Server.create({
        cardCacheDir: getCardCacheDir(),
        realms: getRealms(),
      })
    ).app;
  });

  QUnit.test(
    'returns a 404 when trying to adopt from a card that doesnt exist',
    async function (assert) {
      assert.expect(0);
      await postCard('https://my-realm/car0', {
        adoptsFrom: '../car',
        data: {
          vin: '123',
        },
      }).expect(404);
    }
  );

  QUnit.test(
    'can create a new card that adopts off an another card',
    async function (assert) {
      let response = await postCard('https://my-realm/post0', {
        adoptsFrom: '../post',
        data: {
          title: 'Hello World',
          body: 'First post.',
        },
      })
        .expect('Content-Type', /json/)
        .expect(201);

      assert.deepEqual(response.body.data?.attributes, {
        title: 'Hello World',
        body: 'First post.',
      });
      let componentModule = response.body.data?.meta.componentModule;
      assert.ok(componentModule, 'should have componentModule');
      assert.ok(resolveCard(componentModule), 'component module is resolvable');

      await getCard('https://my-realm/post0').expect(200);
    }
  );

  QUnit.test(
    'errors when you try to post attributes that dont exist on parent card',
    async function (assert) {
      assert.expect(0);
      await postCard('https://my-realm/post0', {
        adoptsFrom: '../post',
        data: {
          pizza: 'Hello World',
        },
      })
        .expect(400)
        .expect({
          errors: [
            {
              status: 400,
              title:
                'Field(s) "pizza" does not exist on card "https://my-realm/post0"',
            },
          ],
        });
    }
  );
});

import { Job, TaskSpec } from 'graphile-worker';
import { registry, setupHub } from '../helpers/server';
import NotifyMerchantClaim, {
  MerchantClaimsQueryResult,
  MERCHANT_CLAIM_EXPIRY_TIME,
} from '../../tasks/notify-merchant-claim';
import { expect } from 'chai';
import sentryTestkit from 'sentry-testkit';
import * as Sentry from '@sentry/node';
import waitFor from '../utils/wait-for';

const { testkit, sentryTransport } = sentryTestkit();

type TransactionInformation = MerchantClaimsQueryResult['data']['merchantClaims'][number];

const mockData: {
  value: TransactionInformation | undefined;
  queryReturnValue: MerchantClaimsQueryResult;
} = {
  value: undefined,
  get queryReturnValue() {
    return {
      data: {
        timestamp: '0', // because timestamp is 0, the sendBy will be the expiry time
        merchantClaims: this.value ? [this.value] : [],
      },
    };
  },
};

class StubCardPay {
  async gqlQuery(_network: string, _query: string, _variables: { txn: string }) {
    return mockData.queryReturnValue;
  }

  async waitForSubgraphIndex(_txnHash: string) {
    return;
  }
}
let addedJobIdentifiers: string[] = [];
let addedJobPayloads: string[] = [];

class StubWorkerClient {
  async addJob(identifier: string, payload?: any, _spec?: TaskSpec): Promise<Job> {
    addedJobIdentifiers.push(identifier);
    addedJobPayloads.push(payload);
    return Promise.resolve({} as Job);
  }
}

let merchantInfoShouldError = false;

class StubMerchantInfo {
  async getMerchantInfo(_did: string) {
    if (merchantInfoShouldError) {
      throw new Error('Simulated error fetching merchant info');
    } else {
      return {
        name: 'Mandello',
      };
    }
  }
}

class StubNotificationPreferenceService {
  async getEligiblePushClientIds(_ownerAddress: string, _notificationType: string) {
    return ['123', '456'];
  }
}

describe('NotifyMerchantClaimTask', function () {
  this.beforeEach(function () {
    mockData.value = undefined;
    merchantInfoShouldError = false;
    registry(this).register('cardpay', StubCardPay);
    registry(this).register('merchant-info', StubMerchantInfo);
    registry(this).register('worker-client', StubWorkerClient);
    registry(this).register('notification-preference-service', StubNotificationPreferenceService);
  });
  let { getContainer } = setupHub(this);

  this.afterEach(async function () {
    addedJobIdentifiers = [];
    addedJobPayloads = [];
  });

  it('adds a send-notifications job for the merchant’s owner', async function () {
    mockData.value = {
      timestamp: '0',
      merchantSafe: {
        id: 'merchant-safe-address',
        infoDid: 'did:cardstack:1m1C1LK4xoVSyybjNRcLB4APbc07954765987f62',
        merchant: {
          id: 'eoa-address',
        },
      },
      amount: '1155000000000000000000',
      token: {
        symbol: 'DAI.CPXD',
      },
    };
    let task = (await getContainer().lookup('notify-merchant-claim')) as NotifyMerchantClaim;

    await task.perform('a');
    // debugger;
    expect(addedJobIdentifiers).to.deep.equal(['send-notifications', 'send-notifications']);
    expect(addedJobPayloads).to.deep.equal([
      {
        notificationBody: 'You just claimed 1155 DAI.CPXD from your Mandello business account',
        notificationId: 'sokol::a::123::eoa-address',
        notificationData: {
          notificationType: 'merchant_claim',
          transactionInformation: JSON.stringify({
            merchantId: 'merchant-safe-address',
          }),
          ownerAddress: 'eoa-address',
          network: 'sokol',
        },
        notificationType: 'merchant_claim',
        pushClientId: '123',
        sendBy: MERCHANT_CLAIM_EXPIRY_TIME,
      },
      {
        notificationBody: 'You just claimed 1155 DAI.CPXD from your Mandello business account',
        notificationId: 'sokol::a::456::eoa-address',
        notificationData: {
          notificationType: 'merchant_claim',
          transactionInformation: JSON.stringify({
            merchantId: 'merchant-safe-address',
          }),
          ownerAddress: 'eoa-address',
          network: 'sokol',
        },
        notificationType: 'merchant_claim',
        pushClientId: '456',
        sendBy: MERCHANT_CLAIM_EXPIRY_TIME,
      },
    ]);
  });

  it('omits the merchant name and logs an error when fetching it fails', async function () {
    Sentry.init({
      dsn: 'https://acacaeaccacacacabcaacdacdacadaca@sentry.io/000001',
      release: 'test',
      tracesSampleRate: 1,
      transport: sentryTransport,
    });

    merchantInfoShouldError = true;
    mockData.value = {
      timestamp: '0',
      merchantSafe: {
        id: 'merchant-safe-address',
        infoDid: 'did:cardstack:1m1C1LK4xoVSyybjNRcLB4APbc07954765987f62',
        merchant: {
          id: 'eoa-address',
        },
      },
      amount: '1155000000000000000000',
      token: {
        symbol: 'DAI.CPXD',
      },
    };

    let task = (await getContainer().lookup('notify-merchant-claim')) as NotifyMerchantClaim;

    await task.perform('a');

    expect(addedJobIdentifiers).to.deep.equal(['send-notifications', 'send-notifications']);

    expect(addedJobPayloads).to.deep.equal([
      {
        notificationBody: 'You just claimed 1155 DAI.CPXD from your business account',
        notificationId: 'sokol::a::123::eoa-address',
        notificationData: {
          notificationType: 'merchant_claim',
          transactionInformation: JSON.stringify({
            merchantId: 'merchant-safe-address',
          }),
          ownerAddress: 'eoa-address',
          network: 'sokol',
        },
        notificationType: 'merchant_claim',
        pushClientId: '123',
        sendBy: MERCHANT_CLAIM_EXPIRY_TIME,
      },
      {
        notificationBody: 'You just claimed 1155 DAI.CPXD from your business account',
        notificationId: 'sokol::a::456::eoa-address',
        notificationData: {
          notificationType: 'merchant_claim',
          transactionInformation: JSON.stringify({
            merchantId: 'merchant-safe-address',
          }),
          ownerAddress: 'eoa-address',
          network: 'sokol',
        },
        notificationType: 'merchant_claim',
        pushClientId: '456',
        sendBy: MERCHANT_CLAIM_EXPIRY_TIME,
      },
    ]);

    await waitFor(() => testkit.reports().length > 0);

    expect(testkit.reports()[0].tags).to.deep.equal({
      action: 'notify-merchant-claim',
    });
  });

  it('omits the merchant name when there is no DID', async function () {
    mockData.value = {
      timestamp: '0',
      merchantSafe: {
        id: 'merchant-safe-address',
        infoDid: undefined,
        merchant: {
          id: 'eoa-address',
        },
      },
      amount: '1155000000000000000000',
      token: {
        symbol: 'DAI.CPXD',
      },
    };

    let task = (await getContainer().lookup('notify-merchant-claim')) as NotifyMerchantClaim;

    await task.perform('a');

    expect(addedJobIdentifiers).to.deep.equal(['send-notifications', 'send-notifications']);

    expect(addedJobPayloads).to.deep.equal([
      {
        notificationBody: 'You just claimed 1155 DAI.CPXD from your business account',
        notificationId: 'sokol::a::123::eoa-address',
        notificationData: {
          notificationType: 'merchant_claim',
          transactionInformation: JSON.stringify({
            merchantId: 'merchant-safe-address',
          }),
          ownerAddress: 'eoa-address',
          network: 'sokol',
        },
        notificationType: 'merchant_claim',
        pushClientId: '123',
        sendBy: MERCHANT_CLAIM_EXPIRY_TIME,
      },
      {
        notificationBody: 'You just claimed 1155 DAI.CPXD from your business account',
        notificationId: 'sokol::a::456::eoa-address',
        notificationData: {
          notificationType: 'merchant_claim',
          transactionInformation: JSON.stringify({
            merchantId: 'merchant-safe-address',
          }),
          ownerAddress: 'eoa-address',
          network: 'sokol',
        },
        notificationType: 'merchant_claim',
        pushClientId: '456',
        sendBy: MERCHANT_CLAIM_EXPIRY_TIME,
      },
    ]);
  });

  it('throws when the transaction is not found on the subgraph', async function () {
    let task = (await getContainer().lookup('notify-merchant-claim')) as NotifyMerchantClaim;

    return expect(task.perform('a'))
      .to.be.rejectedWith(`Subgraph did not return information for merchant claim with transaction hash: "a"`)
      .then(() => {
        expect(addedJobIdentifiers).to.deep.equal([]);
        expect(addedJobPayloads).to.deep.equal([]);
      });
  });
});

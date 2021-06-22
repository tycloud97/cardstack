import Component from '@glimmer/component';
import { getOwner } from '@ember/application';
import { WorkflowMessage } from '@cardstack/web-client/models/workflow/workflow-message';
import NetworkAwareWorkflowMessage from '@cardstack/web-client/components/workflow-thread/network-aware-message';
import { Workflow, cardbot } from '@cardstack/web-client/models/workflow';
import { Milestone } from '@cardstack/web-client/models/workflow/milestone';
import { WorkflowCard } from '@cardstack/web-client/models/workflow/workflow-card';
import PostableCollection from '@cardstack/web-client/models/workflow/postable-collection';
import Layer1Network from '@cardstack/web-client/services/layer1-network';
import Layer2Network from '@cardstack/web-client/services/layer2-network';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { WorkflowPostable } from '@cardstack/web-client/models/workflow/workflow-postable';

class DepositWorkflow extends Workflow {
  name = 'Reserve Pool Deposit';
  milestones = [
    new Milestone({
      title: 'Connect mainnet wallet',
      postables: [
        new WorkflowMessage({
          author: cardbot,
          message: "Hi there, we're happy to see you!",
        }),
        new WorkflowMessage({
          author: cardbot,
          message: `In order to make a deposit, you need to connect two wallets:

  * **Ethereum mainnet wallet:**

      Linked to the Ethereum blockchain on mainnet
  * **xDai chain wallet:**

      Linked to the xDai blockchain for low-cost transactions
`,
        }),
        new WorkflowMessage({
          author: cardbot,
          message: `The funds you wish to deposit must be available in your mainnet wallet, so that you can add
        them to the reserve pool on mainnet. Once you have made your deposit, an equivalent amount of
        tokens will be minted and added to your xDai chain wallet.`,
        }),
        new NetworkAwareWorkflowMessage({
          author: cardbot,
          message: `Looks like you've already connected your Ethereum mainnet wallet, which you can see below.
          Please continue with the next step of this workflow.`,
          includeIf() {
            return (this as NetworkAwareWorkflowMessage).hasLayer1Account;
          },
        }),
        new WorkflowCard({
          author: cardbot,
          componentName: 'card-pay/layer-one-connect-card',
        }),
      ],
      completedDetail: 'Mainnet wallet connected',
    }),
    new Milestone({
      title: 'Connect xDai chain wallet',
      postables: [
        new NetworkAwareWorkflowMessage({
          author: cardbot,
          message: `Looks like you've already connected your xDai chain wallet, which you can see below.
          Please continue with the next step of this workflow.`,
          includeIf() {
            return (this as NetworkAwareWorkflowMessage).hasLayer2Account;
          },
        }),
        new NetworkAwareWorkflowMessage({
          author: cardbot,
          message: `You have connected your Ethereum mainnet wallet. Now it's time to connect your xDai chain
          wallet via your Card Wallet mobile app. If you don't have the app installed, please do so now.`,
          includeIf() {
            return !(this as NetworkAwareWorkflowMessage).hasLayer2Account;
          },
        }),
        new NetworkAwareWorkflowMessage({
          author: cardbot,
          message: `Once you have installed the app, open the app and add an existing wallet/account or create a
          new wallet/account. Use your account to scan this QR code, which will connect your account
          with Card Pay.`,
          includeIf() {
            return !(this as NetworkAwareWorkflowMessage).hasLayer2Account;
          },
        }),
        new WorkflowCard({
          author: cardbot,
          componentName: 'card-pay/layer-two-connect-card',
        }),
      ],
      completedDetail: 'xDai chain wallet connected',
    }),
    new Milestone({
      title: 'Deposit into reserve pool',
      postables: [
        new WorkflowMessage({
          author: cardbot,
          message:
            "Let's get down to business. Please choose the asset you would like to deposit into the CARD Protocol's reserve pool.",
        }),
        new WorkflowCard({
          author: cardbot,
          componentName: 'card-pay/deposit-workflow/transaction-setup',
        }),
        new WorkflowMessage({
          author: cardbot,
          message: 'How many tokens would you like to deposit?',
        }),
        new WorkflowCard({
          author: cardbot,
          componentName: 'card-pay/deposit-workflow/transaction-amount',
        }),
      ],
      completedDetail: 'Deposited into reserve pool',
    }),
    new Milestone({
      title: 'Receive tokens on xDai',
      postables: [
        new WorkflowMessage({
          author: cardbot,
          message:
            "Congrats! Now that you have deposited funds into the CARD Protocol's reserve pool, your token will be bridged to the xDai blockchain. You can check the status below.",
        }),
        new WorkflowCard({
          author: cardbot,
          componentName: 'card-pay/deposit-workflow/transaction-status',
        }),
      ],
      completedDetail: 'Tokens received on xDai',
    }),
  ];
  epilogue = new PostableCollection([
    new WorkflowMessage({
      author: cardbot,
      message: 'Thank you for your contribution!',
    }),
    new WorkflowCard({
      author: cardbot,
      componentName: 'card-pay/deposit-workflow/confirmation',
    }),
    new WorkflowMessage({
      author: cardbot,
      message: 'This is the remaining balance in your Ethereum mainnet wallet:',
    }),
    new WorkflowCard({
      author: cardbot,
      componentName: 'card-pay/layer-one-connect-card',
    }),
    new WorkflowCard({
      author: cardbot,
      componentName: 'card-pay/deposit-workflow/next-steps',
    }),
  ]);
  cancelationMessages = new PostableCollection([
    // currently we only cancel because of disconnections from either wallet
    new WorkflowMessage({
      author: cardbot,
      message:
        'It looks like your wallet(s) got disconnected. If you still want to deposit funds, please start again by connecting your wallet(s).',
      includeIf() {
        return (
          (this as WorkflowPostable).workflow?.session.state
            .cancelationReason === 'DISCONNECTED'
        );
      },
    }),
    new WorkflowCard({
      author: cardbot,
      componentName: 'card-pay/deposit-workflow/workflow-canceled-cta',
      includeIf() {
        return (
          (this as WorkflowPostable).workflow?.session.state
            .cancelationReason === 'DISCONNECTED'
        );
      },
    }),
  ]);

  constructor(owner: unknown) {
    super(owner);
    this.attachWorkflow();
  }
}

class DepositWorkflowComponent extends Component {
  @service declare layer1Network: Layer1Network;
  @service declare layer2Network: Layer2Network;

  workflow!: DepositWorkflow;
  constructor(owner: unknown, args: {}) {
    super(owner, args);
    this.workflow = new DepositWorkflow(getOwner(this));
  }

  @action onDisconnect() {
    this.workflow.session.update('cancelationReason', 'DISCONNECTED');
    this.workflow.cancel();
  }
}

export default DepositWorkflowComponent;

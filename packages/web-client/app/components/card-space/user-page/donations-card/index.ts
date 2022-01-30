import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import CardSpaceUserData from '@cardstack/web-client/services/card-space-user-data';

const CardStates = {
  DEFAULT: 'default',
  EDITING: 'editing',
  SUBMITTING: 'submitting',
} as const;

export default class UserPageDonationsCardComponent extends Component {
  @service declare cardSpaceUserData: CardSpaceUserData;
  @tracked state: typeof CardStates[keyof typeof CardStates] =
    CardStates.DEFAULT;

  get showInViewMode() {
    const { donationDescription, donationTitle } =
      this.cardSpaceUserData.currentUserData;

    return donationDescription || donationTitle;
  }

  get donationDescription() {
    return this.cardSpaceUserData.currentUserData.donationDescription;
  }

  get donationTitle() {
    return this.cardSpaceUserData.currentUserData.donationTitle;
  }

  get donationSuggestionAmountList() {
    return [
      this.cardSpaceUserData.currentUserData.donationSuggestionAmount1,
      this.cardSpaceUserData.currentUserData.donationSuggestionAmount2,
      this.cardSpaceUserData.currentUserData.donationSuggestionAmount3,
      this.cardSpaceUserData.currentUserData.donationSuggestionAmount4,
    ].filter((v) => v);
  }

  get isSubmitting() {
    return this.state === CardStates.SUBMITTING;
  }

  get isEditing() {
    return (
      this.state === CardStates.EDITING || this.state === CardStates.SUBMITTING
    );
  }

  @action onClickEdit() {
    this.state = CardStates.EDITING;
  }

  @action async save() {
    try {
      this.state = CardStates.SUBMITTING;
      await new Promise<void>((resolve) => setTimeout(resolve, 1000));
      this.state = CardStates.DEFAULT;
    } catch (e) {
      this.state = CardStates.EDITING;
    }
  }

  @action onEndEdit() {
    this.state = CardStates.DEFAULT;
  }
}

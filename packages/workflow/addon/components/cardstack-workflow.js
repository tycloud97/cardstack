import Ember from 'ember';
import layout from '../templates/components/cardstack-workflow';

const { inject, computed } = Ember;

export default Ember.Component.extend({
  layout,
  classNames:  ['cardstack-workflow'],
  workflow:    inject.service('cardstack-workflow'),

  groupedMessages:  computed.readOnly('workflow.groupedMessages'),
  unhandled:        computed.readOnly('workflow.unhandledItems'),

  selectedTag:    '',
  messagesWithSelectedTag: computed('unhandled.@each.tag', 'selectedTag', function() {
    return this.get('unhandled').filterBy('tag', this.get('selectedTag'));
  }),

  todaysMessageCount: computed.readOnly('workflow.todaysUnhandledMessages.length'),
  selectedMessage: computed.readOnly('workflow.selectedMessage'),

  actions: {
    selectTag(tag) {
      this.set('selectedTag', tag);
      this.get('workflow').clearSelectedMessage();
    }
  }
});

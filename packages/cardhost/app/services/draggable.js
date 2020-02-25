import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { fieldTypeMappings, fieldComponents } from '../utils/mappings';

export default class DraggableService extends Service {
  @tracked field;
  @tracked card;
  @tracked dropzone;
  @tracked dragging;
  @tracked fieldComponents = fieldComponents;

  fieldTypeMappings = fieldTypeMappings;
  ghostElementId = 'ghost-element';

  /**
   * Sets the currently dragged field
   */
  setField(field) {
    this.field = field;
  }

  /**
   * Gets the currently dragged field
   */
  getField() {
    return this.field;
  }

  /**
   * Clears the dragged field
   */
  clearField() {
    this.field = null;
  }

  /**
   * Sets the card of the currently dragged field
   */
  setCard(card) {
    this.card = card;
  }

  /**
   * Gets the current card
   */
  getCard() {
    return this.card;
  }

  /**
   * Clears the dragged card
   */
  clearCard() {
    this.card = null;
  }

  /**
   * Set the hovered drop zone
   */
  setDropzone(element) {
    this.dropzone = element;
    this.triggerEvent(element, 'mouseenter');
  }

  /**
   * Get the hovered drop zone
   */
  getDropzone() {
    return this.dropzone;
  }

  /**
   * Clear the dropzone
   */
  clearDropzone() {
    if (this.dropzone) {
      this.triggerEvent(this.dropzone, 'mouseleave');
      this.dropzone = null;
    }
  }

  /**
   * Set the dragging flag
   */
  setDragging(val) {
    this.dragging = val;
  }

  /**
   * Check if dragging
   */
  get isDragging() {
    return this.dragging;
  }

  get newFieldName() {
    /**
      Returns field name in the form field-12, incrementing from the highest
      existing field number. Ex: if the highest is field-15, this will return
      field-16. If there are no fields, it returns field-1.
    */
    let existingFields = this.card.isolatedFields.map(field => field.name);
    let autogeneratedFieldNames = existingFields.filter(item => /^field-\d+$/.test(item));
    let fieldNumbers = autogeneratedFieldNames.map(item => Number(item.split('-')[1]));
    let newNumber = fieldNumbers.length ? Math.max(...fieldNumbers) + 1 : 1;
    return `field-${newNumber}`;
  }

  /**
   * Drop
   */
  drop() {
    if (this.dropzone && this.field) {
      this.triggerEvent(this.dropzone, 'mouseup');
    }
  }

  triggerEvent(el, type) {
    var e = document.createEvent('HTMLEvents');
    e.initEvent(type, false, true);
    el.dispatchEvent(e);
  }

  // TODO determine whether we are dragging a catalog field
  // or an actual field
  @action
  clickDraggable(field, card, event) {
    console.log('CLICK', event.target);
    if (!this.isDragging && !this.justDropped) {
      this.beginDragging(field, card, event);
    } else {
      this.setDragging(false);
    }
  }

  @action
  beginDragging(field, card, dragEvent) {
    // we're clicking on a draggable that's already being dragged
    if (this.isDragging) {
      return;
    }

    let dragState;
    let self = this;

    if (!dragEvent) {
      dragEvent = card;
      this.setCard(field.card);
    } else {
      this.setCard(card);
    }
    console.log('MOUSE DOWN');

    function stopMouse() {
      console.log('MOUSE UP');
      field.dragState = dragState = null;
      let dropzone = self.getDropzone();
      if (dropzone) {
        self.drop();
        field.dropTo = dropzone;

        // this tells the click event that follows not to do anything
        self.justDropped = true;
        setTimeout(function() {
          self.justDropped = false;
        }, 1000);
      } else {
        // we mouseup somewhere that isn't a dropzone
      }
      self.clearField();

      // we do this so that we can animate the field back to the left edge
      self.fieldComponents = self.fieldComponents.map(obj => obj); // oh glimmer, you so silly...

      // remove ghost element from DOM
      let ghostEl = document.getElementById('ghost-element');
      if (ghostEl) {
        ghostEl.remove();
      }

      window.removeEventListener('mousemove', updateMouse);
      window.removeEventListener('mouseup', stopMouse);
      return false;
    }

    function updateMouse(event) {
      // console.log('MOUSE MOVE');
      dragState.latestPointerX = event.x;
      dragState.latestPointerY = event.y;

      self.setDragging(true);

      let elemsBelow = document.elementsFromPoint(event.clientX, event.clientY);

      // this can happen when you drag the mouse outside the viewport
      if (!elemsBelow.length) {
        return;
      }

      let dropzoneBelow = elemsBelow.find(el => el.classList.contains('drop-zone'));
      let currentDropzone = self.getDropzone();

      if (currentDropzone !== dropzoneBelow) {
        if (currentDropzone) {
          self.clearDropzone();
        }
        if (dropzoneBelow) {
          self.setDropzone(dropzoneBelow);
        }
      }
    }

    if (dragEvent instanceof KeyboardEvent) {
      // This is a keyboard-controlled "drag" instead of a real mouse
      // drag.
      dragState = {
        usingKeyboard: true,
        xStep: 0,
        yStep: 0,
      };
    } else {
      dragState = {
        usingKeyboard: false,
        initialPointerX: dragEvent.x,
        initialPointerY: dragEvent.y,
        latestPointerX: dragEvent.x,
        latestPointerY: dragEvent.y,
      };
      window.addEventListener('mouseup', stopMouse);
      window.addEventListener('mousemove', updateMouse);
    }
    field.dragState = dragState;
    this.setField(field);
    this.fieldComponents = this.fieldComponents.map(obj => obj); // oh glimmer, you so silly...
  }

  @action dropField(position, onStartDrop, onFinishDrop, evt) {
    let draggedField = this.getField();

    if (!draggedField) {
      return;
    }

    onStartDrop(evt);

    let field;

    if (draggedField.name) {
      let fieldName = draggedField.name;
      if (fieldName) {
        let card = draggedField.card;
        field = card.getField(fieldName);
        let newPosition = field.position < position ? position - 1 : position;
        card.moveField(field, newPosition);
      }
    } else {
      field = this.card.addField({
        type: this.fieldTypeMappings[draggedField.type],
        position: position,
        name: this.newFieldName,
        neededWhenEmbedded: false,
      });
    }

    this.clearField();
    this.clearCard();
    this.clearDropzone();
    this.setDragging(false);

    onFinishDrop(field, evt);
  }
}

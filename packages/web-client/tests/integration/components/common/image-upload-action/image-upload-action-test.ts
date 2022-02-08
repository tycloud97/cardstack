import { module } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { find, render, triggerEvent, waitFor } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { mockPngUpload } from '@cardstack/web-client/components/common/image-upload-action';

mockPngUpload;

const INPUT = '[data-test-image-upload-action-file-input]';

let imageDataUri =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

let image: File;

module(
  'Integration | Component | common/image-upload-action',
  function (hooks) {
    setupRenderingTest(hooks);

    hooks.before(async function () {
      image = await fetch(imageDataUri)
        .then((res) => res.blob())
        .then((blob) => {
          return new File([blob], 'image.png', { type: 'image/png' });
        });
    });

    // it calls the onUpload callback upon successful file upload
    // it yields a startUpload callback that triggers a click event on the hidden input if useEditor is false

    // <-- useEditor -->
    // it opens an editor upon successful file upload
    // it calls onUpload callback for editor save
    // it does not call the onUpload callback if the editor is closed without saving
    // it calls the onError callback for validation errors
    // it calls onError callback for errors in

    // it yields a preview for the image editor
    // it validates images that are uploaded
  }
);

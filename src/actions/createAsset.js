import { secureApiCall, showSuccessDialog, showErrorDialog } from 'nexus-module';

/**
 * Create a social post asset following the Distordia Social Post Standard.
 * Uses JSON format with proper field definitions per social-standard.json.
 *
 * @param {Object} postData - The post data
 * @param {string} postData.text - Post content (max 512 chars)
 * @param {string} [postData.replyTo] - Address of post being replied to
 * @param {string} [postData.quote] - Address of post being quoted
 * @param {string} [postData.cw] - Content warning text
 * @param {Function} [onSuccess] - Success callback
 * @param {Function} [onError] - Error callback
 */
export const createPost = async (postData, onSuccess = () => {}, onError = () => {}) => {
  try {
    if (!postData.text || !postData.text.trim()) {
      showErrorDialog({
        message: 'Post cannot be empty',
        note: 'Please enter some text for your post.',
      });
      return;
    }

    if (postData.text.length > 512) {
      showErrorDialog({
        message: 'Post too long',
        note: 'Maximum 512 characters allowed.',
      });
      return;
    }

    // Build JSON fields per Distordia Social Post Standard
    const json = [
      {
        name: 'distordia-type',
        type: 'string',
        value: 'distordia-post',
        mutable: false,
        maxlength: 16,
      },
      {
        name: 'distordia-status',
        type: 'string',
        value: 'official',
        mutable: true,
        maxlength: 16,
      },
      {
        name: 'text',
        type: 'string',
        value: postData.text,
        mutable: false,
        maxlength: 512,
      },
      {
        name: 'cw',
        type: 'string',
        value: postData.cw || '',
        mutable: false,
        maxlength: 64,
      },
      {
        name: 'reply-to',
        type: 'string',
        value: postData.replyTo || '',
        mutable: false,
        maxlength: 64,
      },
      {
        name: 'quote',
        type: 'string',
        value: postData.quote || '',
        mutable: false,
        maxlength: 64,
      },
      {
        name: 'repost',
        type: 'string',
        value: '',
        mutable: false,
        maxlength: 64,
      },
      {
        name: 'tags',
        type: 'string',
        value: postData.tags || '',
        mutable: false,
        maxlength: 128,
      },
      {
        name: 'lang',
        type: 'string',
        value: 'en',
        mutable: false,
        maxlength: 2,
      },
    ];

    const result = await secureApiCall('assets/create/asset', {
      format: 'JSON',
      json: JSON.stringify(json),
    });

    showSuccessDialog({
      message: 'Post Published',
      note: `Your post is now on-chain. TX: ${result.txid?.slice(0, 16)}...`,
    });

    onSuccess(result);
    return result;
  } catch (error) {
    showErrorDialog({
      message: 'Failed to create post',
      note: error?.message || 'Unknown error',
    });

    onError(error);
    throw error;
  }
};

import mime from 'mime';

import { api } from './api';
import { getStaticFileHref } from './static';

// ------------------------------------------------------------------------------------------------------------
// serializePostContent
// ------------------------------------------------------------------------------------------------------------

export async function serializePostContent(editorContent, post) {
  const tempContentElement = document.createElement('div');
  tempContentElement.innerHTML = editorContent;

  const images = [...tempContentElement.querySelectorAll('img')];
  const referencedAttachments = [];
  const newAttachmentFiles = [];

  for (let idx = 0; idx < images.length; idx++) {
    const image = images[idx];
    if (image.hasAttribute('attachment-instanceid')) {
      const instanceId = image.getAttribute('attachment-instanceid');
      if (referencedAttachments.indexOf(instanceId) < 0) {
        referencedAttachments.push(instanceId);
      }
    }

    const src = image.getAttribute('src');
    if (src.startsWith('blob:')) {
      const blob = await fetch(src).then(r => r.blob());
      newAttachmentFiles.push(blob);

      image.removeAttribute('src');
    }
    const instanceId = (post?.attachmentInstanceCount || 0) + idx;
    image.setAttribute('attachment-instanceid', instanceId);
  }

  const content = tempContentElement.innerHTML;
  tempContentElement.remove();

  return { content, newAttachmentFiles, referencedAttachments };
}

// ------------------------------------------------------------------------------------------------------------
// deserializePostContent
// ------------------------------------------------------------------------------------------------------------

export function deserializePostContent(post) {
  if (!post) {
    return undefined;
  }

  const viewElement = document.createElement('div');
  viewElement.innerHTML = post.content;

  const attachmentImages = viewElement.querySelectorAll('img[attachment-instanceid]');
  for (const attachmentImage of attachmentImages) {
    const attachmentInstanceId = parseInt(attachmentImage.getAttribute('attachment-instanceid'));
    if (attachmentInstanceId === NaN) {
      continue;
    }

    const attachment = post.attachments.find(attachment => attachment.instanceId === attachmentInstanceId);
    if (!attachment) {
      continue;
    }

    const attachmentHref = getAttachmentHref(attachment);
    attachmentImage.setAttribute('src', attachmentHref);
  }
  const deserializedPostContent = viewElement.innerHTML;
  viewElement.remove();

  return deserializedPostContent;
}

// ------------------------------------------------------------------------------------------------------------
// createPost
// ------------------------------------------------------------------------------------------------------------

export async function createPost(title, content, categoryId, axiosConfig = undefined) {
  const serializedData = await serializePostContent(content, 0);

  const formData = new FormData();
  for (const newAttachmentFile of serializedData.newAttachmentFiles) {
    formData.append('attachments[]', newAttachmentFile);
  }

  formData.append('title', title);
  formData.append('categoryId', categoryId);
  formData.append('content', serializedData.content);

  return api.post('/post', formData, axiosConfig);
}

// ------------------------------------------------------------------------------------------------------------
// updatePost
// ------------------------------------------------------------------------------------------------------------

export async function updatePost(post, title, content, categoryId, axiosConfig = undefined) {
  const serializedData = await serializePostContent(content, post.attachmentInstanceCount);

  const formData = new FormData();
  for (const newAttachmentFile of serializedData.newAttachmentFiles) {
    formData.append('attachments[]', newAttachmentFile);
  }

  formData.append('title', title);
  formData.append('categoryId', categoryId);
  formData.append('content', serializedData.content);
  formData.append('referencedAttachments', JSON.stringify(serializedData.referencedAttachments));

  return api.patch('/post/' + post.id, formData, axiosConfig);
}

// ------------------------------------------------------------------------------------------------------------
// getAttachmentUrl
// ------------------------------------------------------------------------------------------------------------

export function getAttachmentHref(attachment) {
  const attachmentExt = mime.getExtension(attachment.mimeType);
  return getStaticFileHref(`attachments/${attachment.fileId}.${attachmentExt}`);
}

import urljoin from 'url-join';

// ------------------------------------------------------------------------------------------------------------
// getAttachmentHref
// ------------------------------------------------------------------------------------------------------------

export function getStaticFileHref(relativeFilePath) {
  return urljoin('/static', relativeFilePath);
}

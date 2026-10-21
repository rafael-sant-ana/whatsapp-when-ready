/**
 * The isolated content script and the page-world script can't share
 * variables, but both see the DOM. This attribute on <html> is set while
 * sounds should be muted.
 */
export const MUTE_ATTRIBUTE = 'data-wwr-mute';

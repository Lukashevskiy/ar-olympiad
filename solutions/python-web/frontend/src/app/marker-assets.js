import pattern1Url from '../../../../assets/pattern-1.patt?url';
import pattern2Url from '../../../../assets/pattern-2.patt?url';
import pattern3Url from '../../../../assets/pattern-3.patt?url';
import pattern4Url from '../../../../assets/pattern-4.patt?url';
import pattern5Url from '../../../../assets/pattern-5.patt?url';

export const FIELD_MARKER_DEFINITIONS = [
  { id: 'field-nw', patternUrl: pattern1Url, size: 0.16 },
  { id: 'field-ne', patternUrl: pattern2Url, size: 0.16 },
  { id: 'field-se', patternUrl: pattern3Url, size: 0.16 },
  { id: 'field-sw', patternUrl: pattern4Url, size: 0.16 }
];

export const LIGHT_MARKER_DEFINITION = {
  id: 'light-main',
  patternUrl: pattern5Url,
  size: 0.16
};

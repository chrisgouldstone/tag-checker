interface Tag {
  name: string;
  type: TagType;
}

export interface ValidationResult {
  valid: boolean,
  reason?: string,
}

enum TagType {
  CLOSING_TAG = 'CLOSING_TAG',
  OPENING_TAG = 'OPENING_TAG',
}

export class TagValidator {
  // https://github.com/taoqf/node-html-parser/blob/bb25db74539542f5c76a31e5d2951024d9c756b0/src/nodes/html.ts#L902
  private static tagPattern = /<!--[^]*?(?=-->)-->|<(\/?)([a-z][-.:0-9_a-z]*)\s*([^>]*?)(\/?)>/ig;

  /**
   * takes a input string, validates the tags inside and returns a @type{ValidationResult}
   */
  static validate(input: string): ValidationResult {
    const validationResult: ValidationResult = {
      valid: true,
      reason: this.getValidationReason(true, undefined, undefined),
    };

    const matchedTags: string[] = <string[]> input.match(TagValidator.tagPattern);
    if (!matchedTags) return validationResult;

    const tags: Tag[] = this.convertToReadableTag(this.filterSelfClosing(matchedTags));

    /**
     * loops backwards through tag list removing the tag pairs as it comes across them
     * the nextTag and previousTag variables are not backwards like the loop is
     */
    for (let i = tags.length - 1; i >= 0; i--) {
      const currentTag = tags[i];
      const nextTag = tags[i + 1];
      const previousTag = tags[i - 1];

      if (previousTag && currentTag.type === TagType.CLOSING_TAG && previousTag.type === TagType.OPENING_TAG && currentTag.name === previousTag.name) {
        tags.splice(i - 1, 2);
        i--;
      }
      if (nextTag && currentTag.type === TagType.OPENING_TAG && nextTag.type === TagType.CLOSING_TAG && currentTag.name === nextTag.name) {
        tags.splice(i, 2);
      }
    }

    /**
     * if there are tags left over it means that there are tags don't have closing/opening tags or nesting is incorrect
     * TODO the error case does not give out the correct tags (should be a closing tag but is a opening tag or incorrect tag names all together)
     */
    if (tags.length !== 0) {
      validationResult.valid = false;
      validationResult.reason = this.getValidationReason(false, tags[0], tags[1]);
    }
    return validationResult;
  }

  /**
   * converts the tag strings to a easier to work with format
   * if the validator should work for tags that are longer than a single string this is the only function that should need to be changed
   */
  private static convertToReadableTag(tags: string[]): Tag[] {
    return tags.map((tag) => {
      if (tag.indexOf('/') === 1) {
        return { name: tag[2], type: TagType.CLOSING_TAG };
      }
      return { name: tag[1], type: TagType.OPENING_TAG };
    });
  }

  /**
   * takes the array of tag strings and filters out all self closing tags as they are not need for the check
   */
  private static filterSelfClosing(tags: string[]): string[] {
    return tags.filter((tag) => !tag.includes('/') || tag.indexOf('/') === 1);
  }

  /**
   * creates the @type{ValidationResult} reason
   */
  private static getValidationReason(valid: boolean, tag1?: Tag, tag2?: Tag): string {
    if (valid) {
      return 'Correctly tagged';
    }
    return `expected ${this.getTagFromReadableTag(tag1)} found ${this.getTagFromReadableTag(tag2)}`;
  }

  /**
   * returns a tag string from the @type{Tag}
   */
  private static getTagFromReadableTag(tag?: Tag): string {
    if (tag) {
      return `<${tag.type === TagType.CLOSING_TAG ? '/' : ''}${tag.name}>`;
    }
    return '#';
  }
}

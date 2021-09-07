interface Tag {
  name: string;
  type: TagType;
  skippable: boolean;
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

  static validate(input: string): ValidationResult {
    const validationResult: ValidationResult = {
      valid: true,
      reason: this.getValidationResponse(true, undefined, undefined),
    };

    const matchedTags: string[] = <string[]> input.match(TagValidator.tagPattern);
    if (!matchedTags) return validationResult;

    const tags: Tag[] = this.convertToReadableTag(this.filterSelfClosing(matchedTags));

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

    if (tags.length !== 0) {
      validationResult.valid = false;
      validationResult.reason = this.getValidationResponse(false, tags[0], tags[1]);
    }
    return validationResult;
  }

  private static convertToReadableTag(tags: string[]): Tag[] {
    return tags.map((tag) => {
      if (tag.indexOf('/') === 1) {
        return { name: tag[2], type: TagType.CLOSING_TAG, skippable: false };
      }
      return { name: tag[1], type: TagType.OPENING_TAG, skippable: false };
    });
  }

  private static filterSelfClosing(tags: string[]): string[] {
    return tags.filter((tag) => !tag.includes('/') || tag.indexOf('/') === 1);
  }

  private static getValidationResponse(valid: boolean, tag1?: Tag, tag2?: Tag): string {
    if (valid) {
      return 'Correctly tagged';
    }
    return `expected ${this.getTagFromReadableTag(tag1)} found ${this.getTagFromReadableTag(tag2)}`;
  }

  private static getTagFromReadableTag(tag?: Tag): string {
    if (tag) {
      return `<${tag.type === TagType.CLOSING_TAG ? '/' : ''}${tag.name}>`;
    }
    return '#';
  }
}

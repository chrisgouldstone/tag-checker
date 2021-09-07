import { TagValidator } from './validator';

describe('Tag Validation', () => {
  [
    {
      input: 'The following text<C><B>is centred and in boldface</B></C>',
      output: {
        valid: true,
        reason: expect.any(String),
      },
    },
    {
      input: '<B>This <\\g>is <B>boldface</B> in <<*> a</B> <\\6> <<d>sentence',
      output: {
        valid: false,
        reason: expect.any(String),
      },
    },
    {
      input: '<B><C> This should be centred and in boldface, but the tags are wrongly nested </B></C>',
      output: {
        valid: false,
        reason: expect.any(String),
      },
    },
    {
      input: '<B>This should be in boldface, but there is an extra closing tag</B></C>',
      output: {
        valid: false,
        reason: expect.any(String),
      },
    },
    {
      input: '<B><C>This should be centred and in boldface, but there is a missing closing tag</C>',
      output: {
        valid: false,
        reason: expect.any(String),
      },
    },
    {
      input: ' self closin <c /> self closin close <s/> The following text<C><B>is centred and in boldface</B></C>B>This <\\\\g>is',
      output: {
        valid: true,
        reason: expect.any(String),
      },
    },
    {
      input: '<A><B></B><C></C></A><D></D>',
      output: {
        valid: true,
        reason: expect.any(String),
      },
    },
    {
      input: '<A><B></B><C><G></C></A><G></G></D>',
      output: {
        valid: false,
        reason: expect.any(String),
      },
    },
    {
      input: 'normal string no tags',
      output: {
        valid: true,
        reason: expect.any(String),
      },
    },
  ].forEach(({ input, output }, index) => {
    it(`should validate text case #${index}`, () => {
      expect(TagValidator.validate(input)).toEqual(output);
    });
  });
});

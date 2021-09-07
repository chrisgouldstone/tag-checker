import { TagValidator } from './validator';

const input = process.argv[2];
if (input) {
  const result = TagValidator.validate(input);
  console.log(result.reason);
} else {
  console.log('error no input found');
}

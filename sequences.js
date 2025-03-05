function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateRandomArray(length, min, max) {
  return Array.from({ length }, () => getRandomInt(min, max));
}

const FORWARD = [
  generateRandomArray(4, 1, 9),
  generateRandomArray(4, 1, 9),
  generateRandomArray(5, 1, 9),
  generateRandomArray(5, 1, 9),
  generateRandomArray(6, 1, 9),
  generateRandomArray(6, 1, 9),
  generateRandomArray(7, 1, 9),
  generateRandomArray(7, 1, 9),
  generateRandomArray(8, 1, 9),
  generateRandomArray(8, 1, 9),
  generateRandomArray(9, 1, 9),
  generateRandomArray(9, 1, 9),
  generateRandomArray(10, 1, 9),
  generateRandomArray(10, 1, 9),
  generateRandomArray(11, 1, 9),
  generateRandomArray(11, 1, 9),
];

const BACKWARD = [
  generateRandomArray(2, 1, 9),
  generateRandomArray(2, 1, 9),
  generateRandomArray(2, 1, 9),
  generateRandomArray(2, 1, 9),
  generateRandomArray(3, 1, 9),
  generateRandomArray(3, 1, 9),
  generateRandomArray(4, 1, 9),
  generateRandomArray(4, 1, 9),
  generateRandomArray(5, 1, 9),
  generateRandomArray(5, 1, 9),
  generateRandomArray(6, 1, 9),
  generateRandomArray(6, 1, 9),
  generateRandomArray(7, 1, 9),
  generateRandomArray(7, 1, 9),
  generateRandomArray(8, 1, 9),
  generateRandomArray(8, 1, 9),
];

const SEQUENCING = [
  generateRandomArray(2, 0, 9),
  generateRandomArray(2, 0, 9),
  generateRandomArray(3, 0, 9),
  generateRandomArray(3, 0, 9),
  generateRandomArray(4, 0, 9),
  generateRandomArray(4, 0, 9),
  generateRandomArray(5, 0, 9),
  generateRandomArray(5, 0, 9),
  generateRandomArray(6, 0, 9),
  generateRandomArray(6, 0, 9),
  generateRandomArray(7, 0, 9),
  generateRandomArray(7, 0, 9),
  generateRandomArray(8, 0, 9),
  generateRandomArray(8, 0, 9),
  generateRandomArray(9, 0, 9),
  generateRandomArray(9, 0, 9),
];

export const SEQUENCES = {
  FORWARD,
  BACKWARD,
  SEQUENCING,
};

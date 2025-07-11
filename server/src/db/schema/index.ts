// Barrel file — concept where there is a file, such as the index, that exports all the files within its folder

import { questions } from "./questions.ts";
import { rooms } from "./rooms.ts";

export const schema = {
  rooms,
  questions,
};

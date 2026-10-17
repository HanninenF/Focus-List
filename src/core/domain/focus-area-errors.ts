export class FocusAreaAlreadyExistsError extends Error {
  constructor() {
    super("Focus area already exists");
    this.name = "FocusAreaAlreadyExistsError";
  }
}

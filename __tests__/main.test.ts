import { createModule } from "../src/main";

const css = `
.button {
  cursor: pointer;
}

.button:hover {
  cursor: crosshair;
}

.button--state-pending {
  cursor: progress;
}

.button--state-error {
  cursor: help;
}

.button--active {
  cursor: grab;
}

.button__icon {
  display: inline-block;
}

.button__icon--state-pending {
  display: block;
}

.button__icon--state-error {
  display: none;
}

.button__special {
  color: red;
}

.button__special--active {
  color: hotpink;
}

.button__special--state-pending {
  color: orange;
}

.button__special--state-ok {
  color: green;
}

.button__special--state-error {
  color: purple;
}

.anotherBlock {
  display: table;
}

@media (min-width: 32em) {
  .button {
    cursor: unset;
  }
  .button__icon {
    display: inline-flex;
  }
}
`;

describe("createModule()", () => {
  test("test-all", () => {
    expect(createModule(css)).toStrictEqual({
      button: { state: ["pending", "error"], active: true },
      button__icon: { state: ["pending", "error"] },
      button__special: { active: true, state: ["pending", "ok", "error"] },
      anotherBlock: {},
    });
  });
});

import { createModule } from "./main";

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

@media (min-width: 32em) {
  .button {
    cursor: unset;
  }
  .button__icon {
    display: inline-flex;
  }
}
`;

console.log(JSON.stringify(createModule(css)));

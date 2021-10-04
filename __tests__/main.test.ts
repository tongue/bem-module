import { addModifier, classNamesToBemElement } from "../src/main";

describe("addModifier()", () => {
  test("with modifier value", () => {
    expect(addModifier("test--state-active")).toStrictEqual({
      state: ["active"],
    });
  });
  test("with existing modifier value", () => {
    expect(addModifier("test--state-active", ["pending"])).toStrictEqual({
      state: ["pending", "active"],
    });
  });
  test("with non-unique existing modifier value", () => {
    expect(
      addModifier("test--state-active", ["pending", "active"])
    ).toStrictEqual({
      state: ["pending", "active"],
    });
  });
  test("with boolean modifier value", () => {
    expect(addModifier("test--active")).toStrictEqual({
      active: true,
    });
  });
});

describe("classNamesToBemElement()", () => {
  test("with existing values element name", () => {
    expect(
      classNamesToBemElement(["test", {}], "test--state-active")
    ).toStrictEqual(["test", { state: ["active"] }]);
  });
  test("with no existing values element name", () => {
    expect(
      classNamesToBemElement([undefined, undefined], "test--state-active")
    ).toStrictEqual(["test", { state: ["active"] }]);
  });
  test("with no modifier selector", () => {
    expect(
      classNamesToBemElement([undefined, undefined], "test")
    ).toStrictEqual(["test", {}]);
  });
});

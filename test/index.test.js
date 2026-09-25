const { test } = require("node:test");
const assert = require("node:assert/strict");

test("environment smoke check", () => {
  assert.equal(typeof process.version, "string");
  assert.match(process.version, /^v\d+\./);
});

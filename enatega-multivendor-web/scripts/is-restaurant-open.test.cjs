const assert = require("node:assert/strict");
const { afterEach, test } = require("node:test");

process.env.TS_NODE_COMPILER_OPTIONS = JSON.stringify({
  module: "CommonJS",
  moduleResolution: "Node",
});
require("ts-node/register/transpile-only");

const {
  isRestaurantOpen,
} = require("../lib/utils/constants/isRestaurantOpen.ts");

const RealDate = Date;

function setCurrentTime(hours, minutes) {
  global.Date = class extends RealDate {
    constructor(...args) {
      if (args.length) {
        super(...args);
        return;
      }

      super(2026, 6, 24, hours, minutes);
    }
  };
}

afterEach(() => {
  global.Date = RealDate;
});

test("accepts array and string opening-time formats at their boundaries", () => {
  const openingTimes = [
    {
      day: "FRI",
      times: [
        { startTime: ["09", "00"], endTime: ["12", "00"] },
        { startTime: "13:00", endTime: "18:00" },
      ],
    },
  ];

  for (const [hours, minutes] of [
    [9, 0],
    [12, 0],
    [13, 0],
    [18, 0],
  ]) {
    setCurrentTime(hours, minutes);
    assert.equal(isRestaurantOpen(openingTimes), true);
  }
});

test("returns false outside every opening slot", () => {
  const openingTimes = [
    {
      day: "FRI",
      times: [
        { startTime: ["09", "00"], endTime: ["12", "00"] },
        { startTime: "13:00", endTime: "18:00" },
      ],
    },
  ];

  for (const [hours, minutes] of [
    [8, 59],
    [12, 1],
    [18, 1],
  ]) {
    setCurrentTime(hours, minutes);
    assert.equal(isRestaurantOpen(openingTimes), false);
  }
});

test("availability flags override otherwise valid opening times", () => {
  setCurrentTime(10, 0);
  const openingTimes = [
    {
      day: "FRI",
      times: [{ startTime: "09:00", endTime: "18:00" }],
    },
  ];

  assert.equal(isRestaurantOpen({ isAvailable: false, openingTimes }), false);
  assert.equal(isRestaurantOpen({ isActive: false, openingTimes }), false);
  assert.equal(
    isRestaurantOpen({
      isAvailable: true,
      isActive: true,
      openingTimes,
    }),
    true,
  );
});

test("rejects missing, malformed, and wrong-day schedules", () => {
  setCurrentTime(10, 0);

  assert.equal(isRestaurantOpen(null), false);
  assert.equal(isRestaurantOpen([]), false);
  assert.equal(
    isRestaurantOpen([
      {
        day: "THU",
        times: [{ startTime: "09:00", endTime: "18:00" }],
      },
    ]),
    false,
  );
  assert.equal(
    isRestaurantOpen([
      {
        day: "FRI",
        times: [
          { startTime: ["invalid"], endTime: ["18", "00"] },
          { startTime: "09:00", endTime: "invalid" },
        ],
      },
    ]),
    false,
  );
});

import { test } from "node:test";
import assert from "node:assert/strict";
import {
  IN_USE_TTL_MS, claimInUse, readInUse, readPreferred, releaseInUse, resolveSelection,
  takenByOther, toCameraOptions, videoConstraints, writePreferred,
} from "../src/features/smartAttendance/utils/cameraDevices.js";

const memory = () => {
  const data = new Map();
  return { getItem: (k) => data.get(k) ?? null, setItem: (k, v) => data.set(k, String(v)), removeItem: (k) => data.delete(k) };
};
const blocked = { getItem() { throw new Error("blocked"); }, setItem() { throw new Error("blocked"); }, removeItem() { throw new Error("blocked"); } };

test("toCameraOptions keeps only video inputs, names unlabelled ones and drops duplicates and id-less ones", () => {
  const options = toCameraOptions([
    { kind: "audioinput", deviceId: "m", label: "Mic" },
    { kind: "videoinput", deviceId: "a", label: "  Front  " },
    { kind: "videoinput", deviceId: "a", label: "Front again" },
    { kind: "videoinput", deviceId: "b", label: "" },
    { kind: "videoinput", deviceId: "", label: "Hidden" },
  ]);
  assert.deepEqual(options, [{ deviceId: "a", label: "Front" }, { deviceId: "b", label: "Camera 2" }]);
  assert.deepEqual(toCameraOptions(undefined), []);
});

test("videoConstraints asks for an exact camera, else the facing mode", () => {
  assert.deepEqual(videoConstraints({ deviceId: "a" }).deviceId, { exact: "a" });
  assert.equal(videoConstraints({ deviceId: "a" }).facingMode, undefined);
  assert.equal(videoConstraints({}).facingMode, "user");
  assert.equal(videoConstraints({ facingMode: "environment" }).facingMode, "environment");
});

test("each role remembers its own camera, and blocked storage is harmless", () => {
  const s = memory();
  writePreferred(s, "entry", "a");
  writePreferred(s, "exit", "b");
  assert.equal(readPreferred(s, "entry"), "a");
  assert.equal(readPreferred(s, "exit"), "b");
  writePreferred(s, "exit", null);
  assert.equal(readPreferred(s, "exit"), null);
  assert.equal(readPreferred(blocked, "entry"), null);
  assert.doesNotThrow(() => writePreferred(blocked, "entry", "a"));
  assert.doesNotThrow(() => claimInUse(blocked, "entry", "a"));
  assert.deepEqual(readInUse(blocked), { entry: null, exit: null });
});

test("a claim counts while fresh and expires when not refreshed", () => {
  const s = memory();
  claimInUse(s, "exit", "b", 1000);
  assert.equal(readInUse(s, 1000 + IN_USE_TTL_MS).exit, "b");
  assert.equal(readInUse(s, 1001 + IN_USE_TTL_MS).exit, null);
});

test("releasing one role leaves the other's claim", () => {
  const s = memory();
  claimInUse(s, "entry", "a", 1000);
  claimInUse(s, "exit", "b", 1000);
  releaseInUse(s, "exit");
  assert.deepEqual(readInUse(s, 1000), { entry: "a", exit: null });
  releaseInUse(s, "entry");
  assert.deepEqual(readInUse(s, 1000), { entry: null, exit: null });
});

test("garbage in storage is ignored", () => {
  const s = memory();
  s.setItem("smarttrack.cameraInUse", "{not json");
  assert.deepEqual(readInUse(s), { entry: null, exit: null });
  s.setItem("smarttrack.cameraInUse", JSON.stringify({ entry: { deviceId: 5, at: "x" }, exit: null }));
  assert.deepEqual(readInUse(s), { entry: null, exit: null });
});

test("takenByOther names the other role using a camera, never the caller's own", () => {
  const inUse = { entry: "a", exit: null };
  assert.equal(takenByOther(inUse, "exit", "a"), "entry");
  assert.equal(takenByOther(inUse, "entry", "a"), null);
  assert.equal(takenByOther(inUse, "exit", "b"), null);
  assert.equal(takenByOther(inUse, "exit", null), null);
});

test("resolveSelection keeps the remembered camera, else moves off the other role's", () => {
  const options = [{ deviceId: "a", label: "A" }, { deviceId: "b", label: "B" }];
  const idle = { entry: null, exit: null };
  assert.equal(resolveSelection({ options, preferred: "b", role: "exit", inUse: idle }), "b");
  assert.equal(resolveSelection({ options, preferred: "gone", role: "exit", inUse: idle }), "a");
  assert.equal(resolveSelection({ options, preferred: "a", role: "exit", inUse: { entry: "a", exit: null } }), "b");
  assert.equal(resolveSelection({ options: [options[0]], preferred: "a", role: "exit", inUse: { entry: "a", exit: null } }), null);
  assert.equal(resolveSelection({ options: [], preferred: null, role: "exit", inUse: idle }), null);
});

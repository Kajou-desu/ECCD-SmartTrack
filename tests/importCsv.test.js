import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { parseStudentCsv, MAX_IMPORT_ROWS } from "../src/features/students/utils/importCsv.js";

const KNOWN = [
  "firstName", "lastName", "birthday", "gender", "address", "session", "status",
  "motherName", "fatherName", "guardianName", "guardianPhone",
];
const HEAD = "firstName,lastName,birthday,gender,address,session,motherName";
const parse = (text) => parseStudentCsv(text, KNOWN);

describe("parseStudentCsv", () => {
  it("accepts a file with only a mother's name (no guardianName/guardianPhone columns)", () => {
    const rows = parse(`${HEAD}\nAna,Cruz,2022-03-15,female,12 Main St,morning,Maria Cruz`);
    assert.equal(rows[0].motherName, "Maria Cruz");
  });

  it("strips the BOM Excel adds to 'CSV UTF-8', so the first header still matches", () => {
    const rows = parse(`\uFEFF${HEAD}\nAna,Cruz,2022-03-15,female,12 Main St,morning,Maria`);
    assert.equal(rows[0].firstName, "Ana");
  });

  it("matches headers case-insensitively and ignores spaces/underscores", () => {
    const rows = parse("First Name,LAST_NAME,Birthday,Gender,Address,Mother Name\nAna,Cruz,2022-03-15,female,12 Main,Maria");
    assert.deepEqual(Object.keys(rows[0]), ["firstName", "lastName", "birthday", "gender", "address", "motherName"]);
  });

  it("detects semicolon-delimited files", () => {
    const rows = parse("firstName;lastName;birthday;gender;address;motherName\nAna;Cruz;2022-03-15;female;12 Main St;Maria");
    assert.equal(rows[0].address, "12 Main St");
  });

  it("rejects duplicate headers instead of silently overwriting", () => {
    assert.throws(() => parse(`${HEAD},firstname\nA,B,2022-03-15,male,x,am,M,Z`), /more than once/);
  });

  it("rejects a row with extra cells (unquoted comma) and names the row", () => {
    assert.throws(
      () => parse(`${HEAD}\nAna,Cruz,2022-03-15,female,12 Main St, Angeles,morning,Maria`),
      /Row 2 has more values/,
    );
  });

  it("allows a trailing empty cell", () => {
    assert.doesNotThrow(() => parse(`${HEAD}\nAna,Cruz,2022-03-15,female,12 Main St,morning,Maria,`));
  });

  it("reports missing required columns, and a file with no parent/guardian name column", () => {
    assert.throws(() => parse("firstName,lastName\nA,B"), /Missing CSV columns: birthday, gender, address/);
    assert.throws(() => parse("firstName,lastName,birthday,gender,address\nA,B,2022-03-15,male,x"), /at least one of these columns/);
  });

  it("rejects a non-UTF-8 file with advice, not a mangled import", () => {
    assert.throws(() => parse(`${HEAD}\nPe\uFFFDa,Cruz,2022-03-15,female,x,am,M`), /UTF-8/);
  });

  it("rejects more than the server's row limit before uploading", () => {
    const body = Array.from({ length: MAX_IMPORT_ROWS + 1 }, () => "A,B,2022-03-15,male,x,am,M").join("\n");
    assert.throws(() => parse(`${HEAD}\n${body}`), /limit is 500/);
  });

  it("maps friendly values to the ones the server accepts", () => {
    const [row] = parse("firstName,lastName,birthday,gender,address,session,status,motherName\nA,B,2022-3-5,M,x,PM,Active,Mom");
    assert.equal(row.gender, "male");
    assert.equal(row.session, "afternoon");
    assert.equal(row.status, "active");
    assert.equal(row.birthday, "2022-03-05");
  });

  it("does NOT guess ambiguous dates or unknown values — they are left for the server to name", () => {
    const [row] = parse("firstName,lastName,birthday,gender,address,session,motherName\nA,B,15/03/2022,robot,x,night,Mom");
    assert.equal(row.birthday, "15/03/2022");
    assert.equal(row.gender, "robot");
    assert.equal(row.session, "night");
  });

  it("leaves blank session/status blank (the server default applies)", () => {
    const [row] = parse("firstName,lastName,birthday,gender,address,session,status,motherName\nA,B,2022-03-15,male,x,,,Mom");
    assert.equal(row.session, "");
    assert.equal(row.status, "");
  });

  it("keeps quoted commas and escaped quotes inside a cell", () => {
    const [row] = parse(`${HEAD}\nAna,"Cruz, Jr.",2022-03-15,female,"12 ""Main"" St, Angeles",morning,Maria`);
    assert.equal(row.lastName, "Cruz, Jr.");
    assert.equal(row.address, '12 "Main" St, Angeles');
  });
});

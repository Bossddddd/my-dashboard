import { describe, it, expect } from "vitest";
import { matchesSearchText, sortedArray } from "../../lib/utils";

describe("utils", () => {
  describe("matchesSearchText", () => {
    it("should return true if query is found in any of the values", () => {
      expect(matchesSearchText("hello", "hello world", "foo")).toBe(true);
      expect(matchesSearchText("world", "hello world", "foo")).toBe(true);
    });

    it("should return false if query is not found in any of the values", () => {
      expect(matchesSearchText("bar", "hello world", "foo")).toBe(false);
    });

    it("should be case-insensitive", () => {
      expect(matchesSearchText("HELLO", "hello world", "foo")).toBe(true);
      expect(matchesSearchText("hello", "HELLO WORLD", "foo")).toBe(true);
    });

    it("should handle null or undefined values safely", () => {
      expect(matchesSearchText("hello", null, undefined, "hello")).toBe(true);
      expect(matchesSearchText("hello", null, undefined)).toBe(false);
    });

    it("should match numbers when converted to strings", () => {
      expect(matchesSearchText("123", "foo", 12345)).toBe(true);
    });
  });

  describe("sortedArray", () => {
    const data = [
      { id: 1, name: "Charlie", age: 30 },
      { id: 2, name: "Alice", age: 25 },
      { id: 3, name: "Bob", age: 35 },
    ];

    it("should return the original array if no field is provided", () => {
      expect(sortedArray(data, "", "asc")).toEqual(data);
    });

    it("should sort strings in ascending order", () => {
      const sorted = sortedArray(data, "name", "asc");
      expect(sorted[0].name).toBe("Alice");
      expect(sorted[1].name).toBe("Bob");
      expect(sorted[2].name).toBe("Charlie");
    });

    it("should sort strings in descending order", () => {
      const sorted = sortedArray(data, "name", "desc");
      expect(sorted[0].name).toBe("Charlie");
      expect(sorted[1].name).toBe("Bob");
      expect(sorted[2].name).toBe("Alice");
    });

    it("should sort numbers in ascending order", () => {
      const sorted = sortedArray(data, "age", "asc");
      expect(sorted[0].age).toBe(25);
      expect(sorted[1].age).toBe(30);
      expect(sorted[2].age).toBe(35);
    });

    it("should sort numbers in descending order", () => {
      const sorted = sortedArray(data, "age", "desc");
      expect(sorted[0].age).toBe(35);
      expect(sorted[1].age).toBe(30);
      expect(sorted[2].age).toBe(25);
    });

    it("should handle null or undefined values during sorting", () => {
      const dataWithNulls = [
        { name: "B" },
        { name: null },
        { name: "A" },
      ];
      const sorted = sortedArray(dataWithNulls, "name", "asc");
      // null becomes "", which comes before "A"
      expect(sorted[0].name).toBe(null);
      expect(sorted[1].name).toBe("A");
      expect(sorted[2].name).toBe("B");
    });
  });
});

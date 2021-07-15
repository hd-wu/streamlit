/**
 * @license
 * Copyright 2018-2021 Streamlit Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Utf8Vector, util } from "apache-arrow"
import { IndexTypeName, Quiver } from "src/lib/Quiver"
import {
  // Types
  CATEGORICAL,
  DATETIME,
  FLOAT64,
  INT64,
  INTERVAL,
  PERIOD,
  RANGE,
  UINT64,
  UNICODE,
  // Special cases
  EMPTY,
  MULTI,
  STYLER,
  DISPLAY_VALUES,
  FEWER_COLUMNS,
  DIFFERENT_COLUMN_TYPES,
} from "src/lib/mocks/arrow"

describe("Quiver", () => {
  describe("Public methods", () => {
    describe("Without Styler", () => {
      const mockElement = { data: UNICODE }
      const q = new Quiver(mockElement)

      test("cssId", () => {
        expect(q.cssId).toBeUndefined()
      })

      test("cssStyles", () => {
        expect(q.cssStyles).toBeUndefined()
      })

      test("caption", () => {
        expect(q.caption).toBeUndefined()
      })

      test("dimensions", () => {
        expect(q.dimensions).toStrictEqual({
          headerRows: 1,
          headerColumns: 1,
          dataRows: 2,
          dataColumns: 2,
          rows: 3,
          columns: 3,
        })
      })
    })

    describe("With Styler", () => {
      const mockElement = {
        data: STYLER,
        styler: {
          uuid: "FAKE_UUID",
          styles: "FAKE_CSS",
          displayValues: DISPLAY_VALUES,
          caption: "FAKE_CAPTION",
        },
      }
      const q = new Quiver(mockElement)

      test("cssId", () => {
        expect(q.cssId).toEqual("T_FAKE_UUID")
      })

      test("cssStyles", () => {
        expect(q.cssStyles).toEqual("FAKE_CSS")
      })

      test("caption", () => {
        expect(q.caption).toEqual("FAKE_CAPTION")
      })

      test("dimensions", () => {
        expect(q.dimensions).toStrictEqual({
          headerRows: 1,
          headerColumns: 1,
          dataRows: 2,
          dataColumns: 2,
          rows: 3,
          columns: 3,
        })
      })
    })

    describe("getCell", () => {
      const mockElement = { data: UNICODE }
      const q = new Quiver(mockElement)

      test("blank cell", () => {
        expect(q.getCell(0, 0)).toStrictEqual({
          type: "blank",
          cssClass: "blank",
          content: "",
        })
      })

      test("index cell", () => {
        expect(q.getCell(1, 0)).toStrictEqual({
          type: "index",
          cssClass: "row_heading level0 row0",
          cssId: undefined,
          content: "i1",
          contentType: {
            pandas_type: IndexTypeName.UnicodeIndex,
            numpy_type: "object",
            meta: null,
          },
        })
      })

      test("columns cell", () => {
        expect(q.getCell(0, 1)).toStrictEqual({
          type: "columns",
          cssClass: "col_heading level0 col0",
          content: "c1",
          contentType: {
            pandas_type: "unicode",
            numpy_type: "object",
          },
        })
      })

      test("data cell", () => {
        expect(q.getCell(1, 2)).toStrictEqual({
          type: "data",
          cssClass: "data row0 col1",
          cssId: undefined,
          content: "1",
          contentType: {
            pandas_type: "unicode",
            numpy_type: "object",
            meta: null,
          },
          displayContent: undefined,
        })
      })

      it("throws an exception if row index is out of range", () => {
        expect(() => q.getCell(5, 0)).toThrow("Row index is out of range.")
      })

      it("throws an exception if column index is out of range", () => {
        expect(() => q.getCell(0, 5)).toThrow("Column index is out of range.")
      })
    })

    describe("getType", () => {
      describe("uses numpy_type", () => {
        test("period", () => {
          const mockElement = { data: PERIOD }
          const q = new Quiver(mockElement)
          const indexType = q.types.index[0]

          expect(Quiver.getTypeName(indexType)).toEqual("period[Q-DEC]")
        })

        test("interval", () => {
          const mockElement = { data: INTERVAL }
          const q = new Quiver(mockElement)
          const indexType = q.types.index[0]

          expect(Quiver.getTypeName(indexType)).toEqual(
            "interval[int64, right]"
          )
        })
      })

      describe("uses pandas_type", () => {
        test("categorical", () => {
          const mockElement = { data: CATEGORICAL }
          const q = new Quiver(mockElement)
          const indexType = q.types.index[0]

          expect(Quiver.getTypeName(indexType)).toEqual(
            IndexTypeName.CategoricalIndex
          )
        })

        test("datetime", () => {
          const mockElement = { data: DATETIME }
          const q = new Quiver(mockElement)
          const indexType = q.types.index[0]

          expect(Quiver.getTypeName(indexType)).toEqual(
            IndexTypeName.DatetimeIndex
          )
        })

        test("float64", () => {
          const mockElement = { data: FLOAT64 }
          const q = new Quiver(mockElement)
          const indexType = q.types.index[0]

          expect(Quiver.getTypeName(indexType)).toEqual(
            IndexTypeName.Float64Index
          )
        })

        test("int64", () => {
          const mockElement = { data: INT64 }
          const q = new Quiver(mockElement)
          const indexType = q.types.index[0]

          expect(Quiver.getTypeName(indexType)).toEqual(
            IndexTypeName.Int64Index
          )
        })

        test("range", () => {
          const mockElement = { data: RANGE }
          const q = new Quiver(mockElement)
          const indexType = q.types.index[0]

          expect(Quiver.getTypeName(indexType)).toEqual(
            IndexTypeName.RangeIndex
          )
        })

        test("uint64", () => {
          const mockElement = { data: UINT64 }
          const q = new Quiver(mockElement)
          const indexType = q.types.index[0]

          expect(Quiver.getTypeName(indexType)).toEqual(
            IndexTypeName.UInt64Index
          )
        })

        test("unicode", () => {
          const mockElement = { data: UNICODE }
          const q = new Quiver(mockElement)
          const indexType = q.types.index[0]

          expect(Quiver.getTypeName(indexType)).toEqual(
            IndexTypeName.UnicodeIndex
          )
        })
      })
    })

    describe("format", () => {
      test("null", () => {
        expect(Quiver.format(null)).toEqual("<NA>")
      })

      test("string", () => {
        expect(Quiver.format("foo")).toEqual("foo")
      })

      test("boolean", () => {
        expect(Quiver.format(true)).toEqual("true")
      })

      test("float64", () => {
        expect(
          Quiver.format(1.25, {
            pandas_type: "float64",
            numpy_type: "float64",
          })
        ).toEqual("1.2500")
      })

      test("int64", () => {
        const mockElement = { data: INT64 }
        const q = new Quiver(mockElement)
        const { content } = q.getCell(1, 2)
        expect(
          Quiver.format(content, {
            pandas_type: "int64",
            numpy_type: "int64",
          })
        ).toEqual("1")
      })

      test("uint64", () => {
        const mockElement = { data: UINT64 }
        const q = new Quiver(mockElement)
        const { content } = q.getCell(1, 2)
        expect(
          Quiver.format(content, {
            pandas_type: "uint64",
            numpy_type: "uint64",
          })
        ).toEqual("2")
      })

      test("bytes", () => {
        expect(
          Quiver.format(new Uint8Array([1, 2, 3]), {
            pandas_type: "bytes",
            numpy_type: "bytes",
          })
        ).toEqual("1,2,3")
      })

      test("date", () => {
        expect(
          Quiver.format(new Date(1970, 0, 1), {
            pandas_type: "date",
            numpy_type: "object",
          })
        ).toEqual("1970-01-01")
      })

      test("datetime", () => {
        expect(
          Quiver.format(0, {
            pandas_type: "datetime",
            numpy_type: "datetime64[ns]",
          })
        ).toEqual("1970-01-01T00:00:00")
      })

      test("datetimetz", () => {
        expect(
          Quiver.format(0, {
            pandas_type: "datetimetz",
            numpy_type: "datetime64[ns]",
            meta: { timezone: "Europe/Moscow" },
          })
        ).toEqual("1970-01-01T03:00:00+03:00")
      })

      test("list[unicode]", () => {
        expect(
          Quiver.format(Utf8Vector.from(["foo", "bar", "baz"]), {
            pandas_type: "list[unicode]",
            numpy_type: "object",
          })
        ).toEqual('["foo","bar","baz"]')
      })
    })

    describe("isEmpty", () => {
      it("returns true if a DataFrame is empty", () => {
        const mockElement = { data: EMPTY }
        const q = new Quiver(mockElement)

        expect(q.isEmpty()).toBe(true)
      })

      it("returns false if a DataFrame is not empty", () => {
        const mockElement = { data: UNICODE }
        const q = new Quiver(mockElement)

        expect(q.isEmpty()).toBe(false)
      })
    })
  })

  describe("Display", () => {
    describe("Pandas index types", () => {
      test("categorical", () => {
        const mockElement = { data: CATEGORICAL }
        const q = new Quiver(mockElement)

        expect(q.index).toEqual([["i1"], ["i2"]])
        expect(q.columns).toEqual([["c1", "c2"]])
        expect(q.data).toEqual([
          ["foo", util.BN.new(new Int32Array([100, 0]))],
          ["bar", util.BN.new(new Int32Array([200, 0]))],
        ])
        expect(q.types).toEqual({
          index: [
            {
              pandas_type: IndexTypeName.CategoricalIndex,
              numpy_type: "int8",
              meta: {
                num_categories: 3,
                ordered: false,
              },
            },
          ],
          data: [
            {
              pandas_type: "unicode",
              numpy_type: "object",
              meta: null,
            },
            {
              pandas_type: "int64",
              numpy_type: "int64",
              meta: null,
            },
          ],
        })
      })

      test("datetime", () => {
        const mockElement = { data: DATETIME }
        const q = new Quiver(mockElement)

        expect(q.index).toEqual([[978220800000], [1009756800000]])
        expect(q.columns).toEqual([
          ["2000-12-31 00:00:00", "2001-12-31 00:00:00"],
        ])
        expect(q.data).toEqual([
          [
            new Date("2020-01-02T00:00:00.000Z"),
            new Date("2020-10-20T00:00:00.000Z"),
          ],
          [
            new Date("2020-01-02T00:00:00.000Z"),
            new Date("2020-10-20T00:00:00.000Z"),
          ],
        ])
        expect(q.types).toEqual({
          index: [
            {
              pandas_type: IndexTypeName.DatetimeIndex,
              numpy_type: "datetime64[ns]",
              meta: null,
            },
          ],
          data: [
            {
              pandas_type: "date",
              numpy_type: "object",
              meta: null,
            },
            {
              pandas_type: "date",
              numpy_type: "object",
              meta: null,
            },
          ],
        })
      })

      test("float64", () => {
        const mockElement = { data: FLOAT64 }
        const q = new Quiver(mockElement)

        expect(q.index).toEqual([[1.24], [2.35]])
        expect(q.columns).toEqual([["1.24", "2.35"]])
        expect(q.data).toEqual([
          [1.2, 1.3],
          [1.4, 1.5],
        ])
        expect(q.types).toEqual({
          index: [
            {
              pandas_type: IndexTypeName.Float64Index,
              numpy_type: IndexTypeName.Float64Index,
              meta: null,
            },
          ],
          data: [
            {
              pandas_type: "float64",
              numpy_type: "float64",
              meta: null,
            },
            {
              pandas_type: "float64",
              numpy_type: "float64",
              meta: null,
            },
          ],
        })
      })

      test("int64", () => {
        const mockElement = { data: INT64 }
        const q = new Quiver(mockElement)

        expect(q.index).toEqual([
          [util.BN.new(new Int32Array([1, 0]))],
          [util.BN.new(new Int32Array([2, 0]))],
        ])
        expect(q.columns).toEqual([["1", "2"]])
        expect(q.data).toEqual([
          [
            util.BN.new(new Int32Array([0, 0])),
            util.BN.new(new Int32Array([1, 0])),
          ],
          [
            util.BN.new(new Int32Array([2, 0])),
            util.BN.new(new Int32Array([3, 0])),
          ],
        ])
        expect(q.types).toEqual({
          index: [
            {
              pandas_type: IndexTypeName.Int64Index,
              numpy_type: IndexTypeName.Int64Index,
              meta: null,
            },
          ],
          data: [
            {
              pandas_type: "int64",
              numpy_type: "int64",
              meta: null,
            },
            {
              pandas_type: "int64",
              numpy_type: "int64",
              meta: null,
            },
          ],
        })
      })

      test("range", () => {
        const mockElement = { data: RANGE }
        const q = new Quiver(mockElement)

        expect(q.index).toEqual([[0], [1]])
        expect(q.columns).toEqual([["0", "1"]])
        expect(q.data).toEqual([
          ["foo", "1"],
          ["bar", "2"],
        ])
        expect(q.types).toEqual({
          index: [
            {
              pandas_type: IndexTypeName.RangeIndex,
              numpy_type: IndexTypeName.RangeIndex,
              meta: {
                start: 0,
                step: 1,
                stop: 2,
                kind: "range",
                name: null,
              },
            },
          ],
          data: [
            {
              pandas_type: "unicode",
              numpy_type: "object",
              meta: null,
            },
            {
              pandas_type: "unicode",
              numpy_type: "object",
              meta: null,
            },
          ],
        })
      })

      test("uint64", () => {
        const mockElement = { data: UINT64 }
        const q = new Quiver(mockElement)

        expect(q.index).toEqual([
          [util.BN.new(new Int32Array([1, 0]), false)],
          [util.BN.new(new Int32Array([2, 0]), false)],
        ])
        expect(q.columns).toEqual([["1", "2"]])
        expect(q.data).toEqual([
          [
            util.BN.new(new Int32Array([1, 0])),
            util.BN.new(new Int32Array([2, 0])),
          ],
          [
            util.BN.new(new Int32Array([3, 0])),
            util.BN.new(new Int32Array([4, 0])),
          ],
        ])
        expect(q.types).toEqual({
          index: [
            {
              pandas_type: IndexTypeName.UInt64Index,
              numpy_type: IndexTypeName.UInt64Index,
              meta: null,
            },
          ],
          data: [
            {
              pandas_type: "int64",
              numpy_type: "int64",
              meta: null,
            },
            {
              pandas_type: "int64",
              numpy_type: "int64",
              meta: null,
            },
          ],
        })
      })

      test("unicode", () => {
        const mockElement = { data: UNICODE }
        const q = new Quiver(mockElement)

        expect(q.index).toEqual([["i1"], ["i2"]])
        expect(q.columns).toEqual([["c1", "c2"]])
        expect(q.data).toEqual([
          ["foo", "1"],
          ["bar", "2"],
        ])
        expect(q.types).toEqual({
          index: [
            {
              pandas_type: IndexTypeName.UnicodeIndex,
              numpy_type: "object",
              meta: null,
            },
          ],
          data: [
            {
              pandas_type: "unicode",
              numpy_type: "object",
              meta: null,
            },
            {
              pandas_type: "unicode",
              numpy_type: "object",
              meta: null,
            },
          ],
        })
      })
    })

    describe("Special cases", () => {
      test("empty", () => {
        const mockElement = { data: EMPTY }
        const q = new Quiver(mockElement)

        expect(q.dimensions).toStrictEqual({
          headerRows: 1,
          headerColumns: 1,
          dataRows: 0,
          dataColumns: 0,
          rows: 1,
          columns: 1,
        })

        expect(q.index).toEqual([])
        expect(q.columns).toEqual([])
        expect(q.data).toEqual([])
        expect(q.types).toEqual({
          index: [{ pandas_type: "empty", numpy_type: "object", meta: null }],
          data: [],
        })
      })

      test("multi-index", () => {
        const mockElement = { data: MULTI }
        const q = new Quiver(mockElement)

        expect(q.index).toEqual([
          [util.BN.new(new Int32Array([1, 0])), "red"],
          [util.BN.new(new Int32Array([2, 0])), "blue"],
        ])
        expect(q.columns).toEqual([
          ["1", "2"],
          ["red", "blue"],
        ])
        expect(q.data).toEqual([
          ["foo", "1"],
          ["bar", "2"],
        ])
        expect(q.types).toEqual({
          index: [
            {
              pandas_type: IndexTypeName.Int64Index,
              numpy_type: "int64",
              meta: null,
            },
            {
              pandas_type: IndexTypeName.UnicodeIndex,
              numpy_type: "object",
              meta: null,
            },
          ],
          data: [
            {
              pandas_type: "unicode",
              numpy_type: "object",
              meta: null,
            },
            {
              pandas_type: "unicode",
              numpy_type: "object",
              meta: null,
            },
          ],
        })
      })

      test("styler", () => {
        const mockElement = {
          data: STYLER,
          styler: {
            uuid: "FAKE_UUID",
            styles: "FAKE_CSS",
            caption: "FAKE_CAPTION",
            displayValues: DISPLAY_VALUES,
          },
        }
        const q = new Quiver(mockElement)

        expect(q.index).toEqual([[0], [1]])
        expect(q.columns).toEqual([["0", "1"]])
        expect(q.data).toEqual([
          [
            util.BN.new(new Int32Array([1, 0])),
            util.BN.new(new Int32Array([2, 0])),
          ],
          [
            util.BN.new(new Int32Array([3, 0])),
            util.BN.new(new Int32Array([4, 0])),
          ],
        ])
        expect(q.types).toEqual({
          index: [
            {
              pandas_type: IndexTypeName.RangeIndex,
              numpy_type: IndexTypeName.RangeIndex,
              meta: {
                start: 0,
                step: 1,
                stop: 2,
                kind: "range",
                name: null,
              },
            },
          ],
          data: [
            {
              pandas_type: "int64",
              numpy_type: "int64",
              meta: null,
            },
            {
              pandas_type: "int64",
              numpy_type: "int64",
              meta: null,
            },
          ],
        })
        // Check display values.
        expect(q.getCell(1, 1).displayContent).toEqual("1")
        expect(q.getCell(1, 2).displayContent).toEqual("2")
        expect(q.getCell(2, 1).displayContent).toEqual("3")
        expect(q.getCell(2, 2).displayContent).toEqual("4")
      })
    })
  })

  describe("Add rows", () => {
    describe("Pandas index types", () => {
      test("categorical", () => {
        const mockElement = { data: CATEGORICAL }
        const q = new Quiver(mockElement)

        q.addRows(q)

        expect(q.index).toEqual([["i1"], ["i2"], ["i1"], ["i2"]])
        expect(q.columns).toEqual([["c1", "c2"]])
        expect(q.data).toEqual([
          ["foo", util.BN.new(new Int32Array([100, 0]))],
          ["bar", util.BN.new(new Int32Array([200, 0]))],
          ["foo", util.BN.new(new Int32Array([100, 0]))],
          ["bar", util.BN.new(new Int32Array([200, 0]))],
        ])
        expect(q.types).toEqual({
          index: [
            {
              pandas_type: IndexTypeName.CategoricalIndex,
              numpy_type: "int8",
              meta: {
                num_categories: 3,
                ordered: false,
              },
            },
          ],
          data: [
            {
              pandas_type: "unicode",
              numpy_type: "object",
              meta: null,
            },
            {
              pandas_type: "int64",
              numpy_type: "int64",
              meta: null,
            },
          ],
        })
      })

      test("datetime", () => {
        const mockElement = { data: DATETIME }
        const q = new Quiver(mockElement)

        q.addRows(q)

        expect(q.index).toEqual([
          [978220800000],
          [1009756800000],
          [978220800000],
          [1009756800000],
        ])
        expect(q.columns).toEqual([
          ["2000-12-31 00:00:00", "2001-12-31 00:00:00"],
        ])
        expect(q.data).toEqual([
          [
            new Date("2020-01-02T00:00:00.000Z"),
            new Date("2020-10-20T00:00:00.000Z"),
          ],
          [
            new Date("2020-01-02T00:00:00.000Z"),
            new Date("2020-10-20T00:00:00.000Z"),
          ],
          [
            new Date("2020-01-02T00:00:00.000Z"),
            new Date("2020-10-20T00:00:00.000Z"),
          ],
          [
            new Date("2020-01-02T00:00:00.000Z"),
            new Date("2020-10-20T00:00:00.000Z"),
          ],
        ])
        expect(q.types).toEqual({
          index: [
            {
              pandas_type: IndexTypeName.DatetimeIndex,
              numpy_type: "datetime64[ns]",
              meta: null,
            },
          ],
          data: [
            {
              pandas_type: "date",
              numpy_type: "object",
              meta: null,
            },
            {
              pandas_type: "date",
              numpy_type: "object",
              meta: null,
            },
          ],
        })
      })

      test("float64", () => {
        const mockElement = { data: FLOAT64 }
        const q = new Quiver(mockElement)

        q.addRows(q)

        expect(q.index).toEqual([[1.24], [2.35], [1.24], [2.35]])
        expect(q.columns).toEqual([["1.24", "2.35"]])
        expect(q.data).toEqual([
          [1.2, 1.3],
          [1.4, 1.5],
          [1.2, 1.3],
          [1.4, 1.5],
        ])
        expect(q.types).toEqual({
          index: [
            {
              pandas_type: IndexTypeName.Float64Index,
              numpy_type: IndexTypeName.Float64Index,
              meta: null,
            },
          ],
          data: [
            {
              pandas_type: "float64",
              numpy_type: "float64",
              meta: null,
            },
            {
              pandas_type: "float64",
              numpy_type: "float64",
              meta: null,
            },
          ],
        })
      })

      test("int64", () => {
        const mockElement = { data: INT64 }
        const q = new Quiver(mockElement)

        q.addRows(q)

        expect(q.index).toEqual([
          [util.BN.new(new Int32Array([1, 0]))],
          [util.BN.new(new Int32Array([2, 0]))],
          [util.BN.new(new Int32Array([1, 0]))],
          [util.BN.new(new Int32Array([2, 0]))],
        ])
        expect(q.columns).toEqual([["1", "2"]])
        expect(q.data).toEqual([
          [
            util.BN.new(new Int32Array([0, 0])),
            util.BN.new(new Int32Array([1, 0])),
          ],
          [
            util.BN.new(new Int32Array([2, 0])),
            util.BN.new(new Int32Array([3, 0])),
          ],
          [
            util.BN.new(new Int32Array([0, 0])),
            util.BN.new(new Int32Array([1, 0])),
          ],
          [
            util.BN.new(new Int32Array([2, 0])),
            util.BN.new(new Int32Array([3, 0])),
          ],
        ])
        expect(q.types).toEqual({
          index: [
            {
              pandas_type: IndexTypeName.Int64Index,
              numpy_type: IndexTypeName.Int64Index,
              meta: null,
            },
          ],
          data: [
            {
              pandas_type: "int64",
              numpy_type: "int64",
              meta: null,
            },
            {
              pandas_type: "int64",
              numpy_type: "int64",
              meta: null,
            },
          ],
        })
      })

      test("range", () => {
        const mockElement = { data: RANGE }
        const q = new Quiver(mockElement)

        q.addRows(q)

        expect(q.index).toEqual([[0], [1], [2], [3]])
        expect(q.columns).toEqual([["0", "1"]])
        expect(q.data).toEqual([
          ["foo", "1"],
          ["bar", "2"],
          ["foo", "1"],
          ["bar", "2"],
        ])
        expect(q.types).toEqual({
          index: [
            {
              pandas_type: IndexTypeName.RangeIndex,
              numpy_type: IndexTypeName.RangeIndex,
              meta: {
                start: 0,
                step: 1,
                stop: 4,
                kind: "range",
                name: null,
              },
            },
          ],
          data: [
            {
              pandas_type: "unicode",
              numpy_type: "object",
              meta: null,
            },
            {
              pandas_type: "unicode",
              numpy_type: "object",
              meta: null,
            },
          ],
        })
      })

      test("uint64", () => {
        const mockElement = { data: UINT64 }
        const q = new Quiver(mockElement)

        q.addRows(q)

        expect(q.index).toEqual([
          [util.BN.new(new Int32Array([1, 0]), false)],
          [util.BN.new(new Int32Array([2, 0]), false)],
          [util.BN.new(new Int32Array([1, 0]), false)],
          [util.BN.new(new Int32Array([2, 0]), false)],
        ])
        expect(q.columns).toEqual([["1", "2"]])
        expect(q.data).toEqual([
          [
            util.BN.new(new Int32Array([1, 0])),
            util.BN.new(new Int32Array([2, 0])),
          ],
          [
            util.BN.new(new Int32Array([3, 0])),
            util.BN.new(new Int32Array([4, 0])),
          ],
          [
            util.BN.new(new Int32Array([1, 0])),
            util.BN.new(new Int32Array([2, 0])),
          ],
          [
            util.BN.new(new Int32Array([3, 0])),
            util.BN.new(new Int32Array([4, 0])),
          ],
        ])
        expect(q.types).toEqual({
          index: [
            {
              pandas_type: IndexTypeName.UInt64Index,
              numpy_type: IndexTypeName.UInt64Index,
              meta: null,
            },
          ],
          data: [
            {
              pandas_type: "int64",
              numpy_type: "int64",
              meta: null,
            },
            {
              pandas_type: "int64",
              numpy_type: "int64",
              meta: null,
            },
          ],
        })
      })

      test("unicode", () => {
        const mockElement = { data: UNICODE }
        const q = new Quiver(mockElement)

        q.addRows(q)

        expect(q.index).toEqual([["i1"], ["i2"], ["i1"], ["i2"]])
        expect(q.columns).toEqual([["c1", "c2"]])
        expect(q.data).toEqual([
          ["foo", "1"],
          ["bar", "2"],
          ["foo", "1"],
          ["bar", "2"],
        ])
        expect(q.types).toEqual({
          index: [
            {
              pandas_type: IndexTypeName.UnicodeIndex,
              numpy_type: "object",
              meta: null,
            },
          ],
          data: [
            {
              pandas_type: "unicode",
              numpy_type: "object",
              meta: null,
            },
            {
              pandas_type: "unicode",
              numpy_type: "object",
              meta: null,
            },
          ],
        })
      })
    })

    describe("Special cases", () => {
      test("multi-index", () => {
        const mockElement = { data: MULTI }
        const q = new Quiver(mockElement)

        q.addRows(q)

        expect(q.index).toEqual([
          [util.BN.new(new Int32Array([1, 0])), "red"],
          [util.BN.new(new Int32Array([2, 0])), "blue"],
          [util.BN.new(new Int32Array([1, 0])), "red"],
          [util.BN.new(new Int32Array([2, 0])), "blue"],
        ])
        expect(q.columns).toEqual([
          ["1", "2"],
          ["red", "blue"],
        ])
        expect(q.data).toEqual([
          ["foo", "1"],
          ["bar", "2"],
          ["foo", "1"],
          ["bar", "2"],
        ])
        expect(q.types).toEqual({
          index: [
            {
              pandas_type: IndexTypeName.Int64Index,
              numpy_type: IndexTypeName.Int64Index,
              meta: null,
            },
            {
              pandas_type: IndexTypeName.UnicodeIndex,
              numpy_type: "object",
              meta: null,
            },
          ],
          data: [
            {
              pandas_type: "unicode",
              numpy_type: "object",
              meta: null,
            },
            {
              pandas_type: "unicode",
              numpy_type: "object",
              meta: null,
            },
          ],
        })
      })

      test("DataFrames with different column types", () => {
        const mockElement1 = { data: UNICODE }
        const mockElement2 = { data: DIFFERENT_COLUMN_TYPES }
        const q1 = new Quiver(mockElement1)
        const q2 = new Quiver(mockElement2)

        q1.addRows(q2)

        expect(q1.index).toEqual([["i1"], ["i2"], ["i1"], ["i2"]])
        expect(q1.columns).toEqual([["c1", "c2"]])
        expect(q1.data).toEqual([
          ["foo", "1"],
          ["bar", "2"],
          ["baz", "1"],
          ["qux", "2"],
        ])
        expect(q1.types).toEqual({
          index: [
            {
              pandas_type: IndexTypeName.UnicodeIndex,
              numpy_type: "object",
              meta: null,
            },
          ],
          data: [
            {
              pandas_type: "unicode",
              numpy_type: "object",
              meta: null,
            },
            {
              pandas_type: "unicode",
              numpy_type: "object",
              meta: null,
            },
          ],
        })
      })

      it("shows df2 if df1 is empty", () => {
        const mockElement1 = { data: EMPTY }
        const mockElement2 = { data: UNICODE }
        const q1 = new Quiver(mockElement1)
        const q2 = new Quiver(mockElement2)

        q1.addRows(q2)
        expect(q1).toEqual(q2)
      })

      it("shows df1 if df2 is empty", () => {
        const mockElement1 = { data: EMPTY }
        const mockElement2 = { data: UNICODE }
        const q1 = new Quiver(mockElement1)
        const q2 = new Quiver(mockElement2)

        q2.addRows(q1)
        expect(q2).toEqual(q2)
      })

      it("shows an empty DataFrame if both df1 and df2 are empty", () => {
        const mockElement = { data: EMPTY }
        const q1 = new Quiver(mockElement)
        const q2 = new Quiver(mockElement)

        q1.addRows(q2)
        expect(q1.isEmpty()).toBe(true)
      })

      it("uses df1 columns if df2 has more columns than df1", () => {
        const mockElement1 = { data: FEWER_COLUMNS }
        const mockElement2 = { data: UNICODE }
        const q1 = new Quiver(mockElement1)
        const q2 = new Quiver(mockElement2)

        q1.addRows(q2)

        expect(q1.index).toEqual([["i1"], ["i2"], ["i1"], ["i2"]])
        expect(q1.columns).toEqual([["c1"]])
        expect(q1.data).toEqual([["foo"], ["bar"], ["foo"], ["bar"]])
        expect(q1.types).toEqual({
          index: [
            {
              pandas_type: IndexTypeName.UnicodeIndex,
              numpy_type: "object",
              meta: null,
            },
          ],
          data: [
            {
              pandas_type: "unicode",
              numpy_type: "object",
              meta: null,
            },
          ],
        })
      })

      it("throws an error if df1 has more columns than df2", () => {
        const mockElement1 = { data: UNICODE }
        const mockElement2 = { data: FEWER_COLUMNS }
        const q1 = new Quiver(mockElement1)
        const q2 = new Quiver(mockElement2)

        expect(() => q1.addRows(q2)).toThrowErrorMatchingSnapshot()
      })

      it("throws an error if one of the DataFrames has Styler", () => {
        const mockElement1 = {
          data: STYLER,
          styler: {
            uuid: "FAKE_UUID",
            styles: "FAKE_CSS",
            caption: "FAKE_CAPTION",
            displayValues: DISPLAY_VALUES,
          },
        }
        const mockElement2 = { data: UNICODE }
        const q1 = new Quiver(mockElement1)
        const q2 = new Quiver(mockElement2)

        expect(() => q1.addRows(q2)).toThrowErrorMatchingSnapshot()
        expect(() => q2.addRows(q1)).toThrowErrorMatchingSnapshot()
      })

      it("throws an error if DataFrames have different index types", () => {
        const mockElement1 = { data: UNICODE }
        const mockElement2 = { data: RANGE }
        const q1 = new Quiver(mockElement1)
        const q2 = new Quiver(mockElement2)

        expect(() => q1.addRows(q2)).toThrowErrorMatchingSnapshot()
      })

      it("throws an error if DataFrames have different data types", () => {
        const mockElement1 = { data: UNICODE }
        const mockElement2 = { data: INT64 }
        const q1 = new Quiver(mockElement1)
        const q2 = new Quiver(mockElement2)

        expect(() => q1.addRows(q2)).toThrowErrorMatchingSnapshot()
      })
    })
  })
})
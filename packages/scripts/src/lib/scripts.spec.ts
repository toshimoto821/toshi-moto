// import { scripts } from "./scripts";
import { createMarkdownTable } from "./util/injectImagesToChangelog";
// import { getTag } from "./util/injectImagesToChangelog";

describe("scripts", () => {
  it("markdown table", () => {
    const result = createMarkdownTable(
      ["one", "two", "three", "four", "five"],
      "hash",
      3
    );
    console.log(result);
    expect(result.length).toEqual(665);
  });
});

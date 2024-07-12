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
    expect(result.length).toEqual(618);
  });
  // it("should get tags", async () => {
  //   const tag = await getTag("a717bc832119d244ab669c909f428abc40d44cef");
  //   console.log(JSON.stringify(tag));
  //   expect(tag[0]).toEqual("web-ui-1.6.2");
  // });
});

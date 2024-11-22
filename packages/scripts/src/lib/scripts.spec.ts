// import { scripts } from "./scripts";
import { createMarkdownTable } from "./util/injectImagesToChangelog";
// import { getTag } from "./util/injectImagesToChangelog";

describe("scripts", () => {
  it("markdown table", () => {
    const result = createMarkdownTable(
      ["https://api.webshotarchive.com/api/image/id/86d2e951-eaf5-4008-853c-bc9827945273.png", 
      "https://api.webshotarchive.com/api/image/id/86d2e951-eaf5-4008-853c-bc9827945273.png", 
      "https://api.webshotarchive.com/api/image/id/86d2e951-eaf5-4008-853c-bc9827945273.png"],
      "hash",
      3
    );
    console.log(result);
    expect(result.length).toEqual(345);
  });
});

import { scripts } from "./scripts";
// import { getTag } from "./util/injectImagesToChangelog";
describe("scripts", () => {
  it("should work", () => {
    expect(scripts()).toEqual("scripts");
  });
  // it("should get tags", async () => {
  //   const tag = await getTag("a717bc832119d244ab669c909f428abc40d44cef");
  //   console.log(JSON.stringify(tag));
  //   expect(tag[0]).toEqual("web-ui-1.6.2");
  // });
});

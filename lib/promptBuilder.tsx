import { GeneratorFormState } from "@/app/pages/appPages/[id]/postGenerator/page";
import { buildSinglePostPrompt } from "./singlePostPrompt";
import { buildCarouselPostPrompt } from "./carouselPostPrompt";

export const buildSocialMediaPrompt = (state: GeneratorFormState) => {
  if (state.postType === "SINGLE") {
    return buildSinglePostPrompt(state);
  }

  if (state.postType === "CAROUSEL") {
    return buildCarouselPostPrompt(state);
  }

  return "";
};

// utils/promptGenerator.js

export const generatePrompt = (topic, type) => {
  // 1. Common instructions for both types
  const baseRules = `
    You are an expert social media content creator. 
    Topic: "${topic}"
    Strictly output VALID JSON only. No markdown formatting, no intro text.
  `;

  // 2. Logic for SINGLE POST (1 Image)
  if (type === "single") {
    return `${baseRules}
    Create a high-impact Single Image Post.
    
    Required JSON Structure:
    {
      "type": "single",
      "headline": "A short, punchy title for the image",
      "content": "The main text overlay for the image (max 15 words)",
      "caption": "A engaging caption for the post body including hashtags",
      "visual_description": "A highly detailed AI image generation prompt for the background."
    }`;
  }

  // 3. Logic for CAROUSEL (4 Slides)
  if (type === "carousel") {
    return `${baseRules}
    Create a pedagogical Carousel Post with exactly 4 slides.
    
    Required JSON Structure:
    {
      "type": "carousel",
      "main_caption": "The caption for the post body with hashtags",
      "slides": [
        {
          "slide_number": 1,
          "headline": "Hook/Title for this slide",
          "content": "Educational content for this slide (max 30 words)",
          "visual_description": "AI prompt for this specific slide's background"
        },
        {
          "slide_number": 2,
          // ... content for slide 2
        },
        {
          "slide_number": 3,
          // ... content for slide 3
        },
        {
          "slide_number": 4,
          // ... content for slide 4 (Outro/Call to Action)
        }
      ]
    }`;
  }
};

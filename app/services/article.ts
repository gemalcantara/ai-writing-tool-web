import { ArticleState } from '../types/article';
import { generateArticle } from '../helpers/openaiApi';

export const handleParseJson = (text: string) => {
  try {
    const jsonMatch = text.match(/{[\s\S]*}/);
    if (jsonMatch) {
      const jsonString = jsonMatch[0];
      return JSON.parse(jsonString);
    }
    throw new Error("No JSON found in the input string");
  } catch (error) {
    console.error("Failed to parse JSON:", error);
    return null;
  }
};

export const generateAndSaveArticle = async (state: ArticleState, constellationMode?: boolean) => {
  const formData = { sections: state.inputFields, main: state.inputFieldStaticArticle };
  const prompt = formData.main.articlePrompt
    .replace("{{client_guidelines}}", formData.main.clientGuideline)
    .replace("{{article_instructions}}", formData.main.instruction)
    .replace("{{keywords}}", formData.main.keywords);

  const articleSections = state.inputFields.map((section, index) => {
    const joinedLinks = section.links.map(item => item.link).join(', ');
    return `
    Section: ${index + 1}
    Section Heading: ${section.headingLevel}
    Section Title: ${section.sectionTitle}
    Section Details: ${section.description}
    Section Links: ${joinedLinks}
    `;
  });


  const articleData = await generateArticle(
    prompt, 
    JSON.stringify(articleSections),
    constellationMode ? 'constellation' : 'client'
  );

  const outlineToSave = {
    title: state.outlineMetaData.title,
    meta_description: state.outlineMetaData.meta_description,
    slug: state.outlineMetaData.slug,
    sections: state.inputFields,
    mode: constellationMode
  };
  console.log(outlineToSave);

  const outlineFields = { 
    inputFieldStaticOutline: state.inputFieldStaticOutline,
    inputFieldStaticArticle: state.inputFieldStaticArticle,
    linkFields: state.linkFields,
    inputFields: state.inputFields 
  };

  const historyData = await createHistory(
    articleData,
    state.pageTitle,
    'user@example.com',
    outlineToSave,
    outlineFields
  );

  return { articleData, historyData };
};

export const createHistory = async (
  output: string,
  article_title: string,
  created_by: string,
  outline: object,
  outlineFields: object
) => {
  try {
    const response = await fetch('/api/articles', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        created_by,
        article_output: output,
        article_title,
        outline,
        outline_input_data: outlineFields
      }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to save article history');
    }

    return await response.json();
  } catch (error: any) {
    throw new Error(error.message);
  }
};
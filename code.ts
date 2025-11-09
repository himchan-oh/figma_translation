// Show the UI
figma.showUI(__html__, { width: 320, height: 480 });

interface TextNodeInfo {
  node: TextNode;
  originalText: string;
}

// Language names mapping
const languageNames: { [key: string]: string } = {
  'ko': 'Korean',
  'en': 'English',
  'ja': 'Japanese',
  'zh-CN': 'Chinese (Simplified)',
  'zh-TW': 'Chinese (Traditional)',
  'es': 'Spanish',
  'fr': 'French',
  'de': 'German',
  'it': 'Italian',
  'pt': 'Portuguese',
  'ru': 'Russian',
  'ar': 'Arabic',
  'hi': 'Hindi',
  'th': 'Thai',
  'vi': 'Vietnamese'
};

// Recursively find all text nodes in a node
function findAllTextNodes(node: SceneNode): TextNode[] {
  const textNodes: TextNode[] = [];

  if (node.type === 'TEXT') {
    textNodes.push(node);
  }

  if ('children' in node) {
    for (const child of node.children) {
      textNodes.push(...findAllTextNodes(child));
    }
  }

  return textNodes;
}

// Translate text using Gemini API
async function translateWithGemini(
  text: string,
  targetLanguage: string,
  apiKey: string
): Promise<string> {
  const languageName = languageNames[targetLanguage] || targetLanguage;

  const prompt = `Translate the following text to ${languageName}. Only return the translated text, nothing else. Do not add quotes or explanations.\n\nText to translate: ${text}`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 1000,
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`API request failed: ${response.status} - ${errorData}`);
    }

    const data = await response.json();

    if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
      return data.candidates[0].content.parts[0].text.trim();
    } else {
      throw new Error('Invalid response from Gemini API');
    }
  } catch (error) {
    throw new Error(`Translation failed: ${error.message}`);
  }
}

// Replace text in a text node while preserving styles
async function replaceTextPreservingStyle(node: TextNode, newText: string) {
  try {
    // Load all fonts used in the text node
    const fontNames = new Set<string>();
    const len = node.characters.length;

    for (let i = 0; i < len; i++) {
      const fontName = node.getRangeFontName(i, i + 1) as FontName;
      fontNames.add(`${fontName.family}|||${fontName.style}`);
    }

    // Load all unique fonts
    for (const fontKey of fontNames) {
      const [family, style] = fontKey.split('|||');
      await figma.loadFontAsync({ family, style });
    }

    // Replace the text
    node.characters = newText;
  } catch (error) {
    console.error('Error replacing text:', error);
    throw error;
  }
}

// Main translation handler
figma.ui.onmessage = async (msg) => {
  if (msg.type === 'translate') {
    const { apiKey, targetLanguage } = msg;

    try {
      // Check if a frame is selected
      const selection = figma.currentPage.selection;

      if (selection.length === 0) {
        figma.ui.postMessage({
          type: 'no-selection'
        });
        return;
      }

      // Collect all text nodes from selected nodes
      const allTextNodes: TextNode[] = [];

      for (const node of selection) {
        allTextNodes.push(...findAllTextNodes(node));
      }

      if (allTextNodes.length === 0) {
        figma.ui.postMessage({
          type: 'translation-error',
          error: '선택한 프레임에 텍스트가 없습니다'
        });
        return;
      }

      // Translate each text node
      let translatedCount = 0;

      for (const textNode of allTextNodes) {
        const originalText = textNode.characters;

        if (originalText.trim() === '') {
          continue; // Skip empty text nodes
        }

        try {
          // Translate the text
          const translatedText = await translateWithGemini(
            originalText,
            targetLanguage,
            apiKey
          );

          // Replace text while preserving style
          await replaceTextPreservingStyle(textNode, translatedText);
          translatedCount++;

          // Add a small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
          console.error(`Failed to translate text node: ${error.message}`);
          // Continue with other nodes even if one fails
        }
      }

      if (translatedCount > 0) {
        figma.ui.postMessage({
          type: 'translation-complete',
          count: translatedCount
        });
      } else {
        figma.ui.postMessage({
          type: 'translation-error',
          error: '텍스트 번역에 실패했습니다'
        });
      }

    } catch (error) {
      figma.ui.postMessage({
        type: 'translation-error',
        error: error.message
      });
    }
  }
};

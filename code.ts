import { GEMINI_API_KEY } from './config';

// Language names mapping for better translation prompts
const languageNames: { [key: string]: string } = {
  'en': 'English',
  'ko': 'Korean',
  'ja': 'Japanese',
  'zh-CN': 'Simplified Chinese',
  'zh-TW': 'Traditional Chinese',
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
function findAllTextNodes(node: SceneNode, depth: number = 0): TextNode[] {
  const textNodes: TextNode[] = [];
  const indent = '  '.repeat(depth);

  console.log(`${indent}[FindText] Checking node: ${node.name} (type: ${node.type})`);

  if (node.type === 'TEXT') {
    const textNode = node as TextNode;
    console.log(`${indent}[FindText] ✓ Found TEXT node: "${textNode.characters}"`);
    textNodes.push(textNode);
  }

  if ('children' in node) {
    const childCount = (node as ChildrenMixin).children.length;
    console.log(`${indent}[FindText] Node has ${childCount} children`);
    for (const child of (node as ChildrenMixin).children) {
      textNodes.push(...findAllTextNodes(child, depth + 1));
    }
  }

  return textNodes;
}

// Clone a node and return the clone
function cloneNode(node: SceneNode): SceneNode {
  const clone = node.clone();

  // Position the clone next to the original (offset by width + 100px)
  if ('x' in node && 'width' in node) {
    clone.x = node.x + node.width + 100;
    clone.y = node.y;
  }

  return clone;
}

// Translate text using Gemini API with improved prompt
async function translateWithGemini(
  text: string,
  targetLanguage: string,
  apiKey: string
): Promise<string> {
  const languageName = languageNames[targetLanguage] || targetLanguage;

  // Improved prompt for better translation accuracy
  const prompt = `You are a professional translator. Translate the following text to ${languageName}.

IMPORTANT RULES:
- Translate ONLY the text content, preserve any special formatting
- Return ONLY the translated text, no explanations or quotes
- Maintain the same tone and style as the original
- If the text contains UI elements, button labels, or technical terms, translate appropriately for UI context
- Do NOT add quotation marks around the translation

Text to translate:
${text}`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;

  console.log(`[Translation] Translating to ${languageName}: "${text.substring(0, 50)}..."`);
  console.log(`[Translation] API URL: ${url.substring(0, 80)}...`);

  try {
    console.log('[Translation] Sending fetch request...');
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
          temperature: 0.2,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      })
    });
    console.log('[Translation] Fetch request completed, status:', response.status);

    if (!response.ok) {
      const errorData = await response.text();
      console.error(`[API Error] ${response.status}: ${errorData}`);
      throw new Error(`API request failed: ${response.status} - ${errorData}`);
    }

    const data = await response.json();
    console.log('[API Response]', JSON.stringify(data, null, 2));

    if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
      const translatedText = data.candidates[0].content.parts[0].text.trim();
      // Remove quotes if Gemini added them
      const cleanedText = translatedText.replace(/^["'](.*)["']$/, '$1');
      console.log(`[Translation Success] Result: "${cleanedText}"`);
      return cleanedText;
    } else {
      console.error('[API Error] Invalid response structure:', data);
      throw new Error('Invalid response from Gemini API');
    }
  } catch (error) {
    console.error('[Translation Error] Caught exception');
    console.error('[Translation Error] Error type:', error.constructor.name);
    console.error('[Translation Error] Error message:', error.message);
    console.error('[Translation Error] Full error:', error);
    if (error.stack) {
      console.error('[Translation Error] Stack:', error.stack);
    }
    throw new Error(`Translation failed: ${error.message}`);
  }
}

// Replace text in a text node while preserving styles
async function replaceTextPreservingStyle(node: TextNode, newText: string) {
  try {
    // Load all fonts used in the text node
    const fontNames = new Set<string>();
    const len = node.characters.length;

    // Get all unique fonts used in the text
    if (len > 0) {
      for (let i = 0; i < len; i++) {
        const fontName = node.getRangeFontName(i, i + 1) as FontName;
        fontNames.add(`${fontName.family}|||${fontName.style}`);
      }
    } else {
      // If text is empty, just get the default font
      const fontName = node.fontName as FontName;
      fontNames.add(`${fontName.family}|||${fontName.style}`);
    }

    // Load all unique fonts
    for (const fontKey of fontNames) {
      const [family, style] = fontKey.split('|||');
      await figma.loadFontAsync({ family, style });
    }

    // Replace the text
    node.characters = newText;
    console.log(`[Text Replaced] "${newText}"`);
  } catch (error) {
    console.error('[Error replacing text]', error);
    throw error;
  }
}

// Get or prompt for API key
async function getApiKey(): Promise<string | null> {
  // First, try to get from config
  if (GEMINI_API_KEY && GEMINI_API_KEY !== "YOUR_GEMINI_API_KEY_HERE") {
    console.log('[API Key] Using key from config.ts');
    return GEMINI_API_KEY;
  }

  // Try to get from client storage
  const storedKey = await figma.clientStorage.getAsync('gemini-api-key');
  if (storedKey) {
    console.log('[API Key] Using stored key from client storage');
    return storedKey;
  }

  console.log('[API Key] No API key found');
  return null;
}

// Save API key to client storage
async function saveApiKey(apiKey: string) {
  await figma.clientStorage.setAsync('gemini-api-key', apiKey);
  console.log('[API Key] Saved to client storage');
}

// Main translation function
async function translateSelection(targetLanguage: string) {
  console.log(`[Start] Translation to ${languageNames[targetLanguage]}`);

  try {
    // Get API key
    const apiKey = await getApiKey();

    if (!apiKey) {
      console.error('[API Key] No API key configured');
      figma.notify('⚠️ API 키가 설정되지 않았습니다. Settings 메뉴에서 API 키를 입력해주세요.', { error: true });
      return;
    }

    console.log('[API Key] API key found, length:', apiKey.length);

    // Check if something is selected
    const selection = figma.currentPage.selection;

    if (selection.length === 0) {
      console.error('[Selection] Nothing selected');
      figma.notify('⚠️ 텍스트를 선택하거나 프레임을 선택해주세요.', { error: true });
      return;
    }

    console.log('[Selection] Selected nodes:', selection.length);

    // Clone selected nodes
    const clonedNodes: SceneNode[] = [];

    for (const node of selection) {
      console.log(`[Clone] Cloning node: ${node.name} (${node.type})`);
      const clone = cloneNode(node);
      clone.name = `${node.name} (${languageNames[targetLanguage]})`;
      clonedNodes.push(clone);
    }

    console.log(`[Clone] Created ${clonedNodes.length} clones`);

    // Collect all text nodes from cloned nodes
    const allTextNodes: TextNode[] = [];

    for (const node of clonedNodes) {
      allTextNodes.push(...findAllTextNodes(node));
    }

    if (allTextNodes.length === 0) {
      console.error('[Text Nodes] No text nodes found in cloned nodes');
      figma.notify('⚠️ 선택한 영역에 텍스트가 없습니다.', { error: true });
      return;
    }

    console.log(`[Found] ${allTextNodes.length} text nodes in clones`);
    figma.notify(`🔄 ${allTextNodes.length}개의 텍스트를 번역 중...`);

    // Translate each text node
    let translatedCount = 0;
    let errorCount = 0;

    for (const textNode of allTextNodes) {
      const originalText = textNode.characters;

      if (originalText.trim() === '') {
        console.log('[Skip] Empty text node');
        continue;
      }

      try {
        console.log(`[Translating] "${originalText}"`);

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
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.error(`[Error] Failed to translate: "${originalText}"`);
        console.error('[Error] Error type:', error.constructor.name);
        console.error('[Error] Error message:', error.message);
        console.error('[Error] Full error:', error);
        if (error.stack) {
          console.error('[Error] Stack trace:', error.stack);
        }
        errorCount++;
        // Continue with other nodes even if one fails
      }
    }

    // Select the cloned nodes
    figma.currentPage.selection = clonedNodes as SceneNode[];

    // Show result
    if (translatedCount > 0) {
      const message = errorCount > 0
        ? `✅ ${translatedCount}개 번역 완료 (${errorCount}개 실패)`
        : `✅ ${translatedCount}개의 텍스트가 번역되었습니다!`;
      figma.notify(message);
      console.log(`[Complete] ${translatedCount} translated, ${errorCount} failed`);
    } else {
      figma.notify('❌ 모든 텍스트 번역에 실패했습니다. Console을 확인해주세요.', { error: true });
      console.error('[Failed] No texts were translated. Total errors:', errorCount);
      console.error('[Failed] Check the console logs above for detailed error messages');
      // Keep clones for debugging - do not delete
    }

  } catch (error) {
    console.error('[Error]', error);
    figma.notify(`❌ 오류: ${error.message}`, { error: true });
  }
}

// Handle commands
figma.on('run', async ({ command }: RunEvent) => {
  console.log(`[Command] Received command: ${command}`);

  // Settings command - show UI for API key input
  if (command === 'settings') {
    console.log('[Settings] Opening settings UI');
    figma.showUI(__html__, { width: 400, height: 280 });

    // Send current API key status to UI
    const apiKey = await getApiKey();
    figma.ui.postMessage({
      type: 'init',
      hasApiKey: !!apiKey
    });

    return;
  }

  // Translation commands
  if (command && command.startsWith('translate-')) {
    const targetLanguage = command.replace('translate-', '');
    console.log(`[Translation] Target language: ${targetLanguage}`);
    await translateSelection(targetLanguage);
    figma.closePlugin();
  } else {
    console.error('[Command] Unknown command:', command);
  }
});

// Handle messages from UI (settings)
figma.ui.onmessage = async (msg) => {
  if (msg.type === 'save-api-key') {
    const { apiKey } = msg;

    if (!apiKey || apiKey.trim() === '') {
      figma.ui.postMessage({
        type: 'error',
        message: 'API 키를 입력해주세요'
      });
      return;
    }

    try {
      await saveApiKey(apiKey.trim());
      figma.ui.postMessage({
        type: 'success',
        message: 'API 키가 저장되었습니다!'
      });

      // Close UI after 1 second
      setTimeout(() => {
        figma.closePlugin();
      }, 1000);
    } catch (error) {
      figma.ui.postMessage({
        type: 'error',
        message: `저장 실패: ${error.message}`
      });
    }
  }

  if (msg.type === 'close') {
    figma.closePlugin();
  }
};

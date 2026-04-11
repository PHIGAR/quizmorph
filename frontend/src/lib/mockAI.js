// Mock AI Generation Engine
// Designed to be hot-swapped with actual OpenAI / Anthropic REST endpoints later.

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const generateQuizWithAI = async ({ prompt, tone, questionCount, resultCount, language, modifier }) => {
  await sleep(2500); // simulate heavy LLM inference latency

  if (!prompt) {
    throw new Error("Prompt is required to generate a quiz.");
  }

  // A basic dynamic logic builder injecting the prompt context into dummy structures
  const baseTitle = prompt.charAt(0).toUpperCase() + prompt.slice(1);
  let title = `What kind of ${baseTitle} are you?`;
  let desc = `Take this highly accurate personality quiz to find out exactly what flavor of ${baseTitle} aligns with your soul. Built intuitively using AI.`;

  if (modifier === 'funnier') {
    title = `What ✨chaotic✨ ${baseTitle} are you? 😂`;
    desc = `Literally the most unhinged personality quiz about ${baseTitle} you will ever take. RIP to your ego.`;
  } else if (modifier === 'softer') {
    title = `Discover your inner ${baseTitle} 🌸`;
    desc = `A gentle journey to discover which beautiful ${baseTitle} vibration matches your heart today.`;
  }

  // Generate dynamic Result Keys based on count
  const results = [];
  const generatedKeys = [];
  for (let i = 1; i <= (resultCount || 3); i++) {
    const key = `result_${i}`;
    generatedKeys.push(key);
    results.push({
      key,
      title: `${baseTitle} Variant ${i}`,
      description: `You are highly aligned with the energy of Variant ${i}. Your vibe is distinct and powerful.`,
      image: ''
    });
  }

  // Generate dynamic Questions mapping natively to Results
  const questions = [];
  for (let q = 1; q <= (questionCount || 4); q++) {
    const options = [];
    // We create exactly enough options to uniquely map 1 core result per option
    for (let o = 1; o <= (resultCount || 3); o++) {
       const mappedKey = generatedKeys[o - 1];
       const mapObj = {};
       mapObj[mappedKey] = 2; // +2 affinity to this result

       options.push({
         text: `I strongly resonate with path ${o}`,
         image: '',
         scoreMap: mapObj
       });
    }

    questions.push({
      questionText: `Scenario ${q}: How do you approach feeling like a ${baseTitle}?`,
      image: '',
      options
    });
  }

  return {
    title,
    slug: `ai-quiz-${Date.now()}`,
    description: desc,
    theme: 'violet',
    category: 'Personality',
    results,
    questions
  };
};

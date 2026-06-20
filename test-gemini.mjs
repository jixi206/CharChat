import { generateCharacterReply } from './src/ai.js';

global.localStorage = {
  getItem: (key) => {
    if (key === 'charchat_api_key') return 'AQ.Ab8RN6I1H9mIwxb-y3NtSO2EecUaRayk-7Rl5iQIcctdqgIcdg';
    if (key.startsWith('charchat_memory')) return '[]';
    return null;
  },
  setItem: () => {}
};

async function run() {
  console.log("Running...");
  const res = await generateCharacterReply(
    {id: 1, name: 'Zoya', tagline: 'funny', description: 'bestie'},
    [
      {id: 1, text: 'Hello', sender: 'ai'},
      {id: 2, text: 'hi zoya', sender: 'user'}
    ]
  );
  console.log("Result:", res);
}

run();

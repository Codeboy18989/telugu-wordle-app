import React, { useState, useEffect } from 'react';
import './App.css';

// Telugu alphabet - basic consonants and vowels
const teluguConsonants = [
  'క', 'ఖ', 'గ', 'ఘ', 'ఙ',
  'చ', 'ఛ', 'జ', 'ఝ', 'ఞ',
  'ట', 'ఠ', 'డ', 'ఢ', 'ణ',
  'త', 'థ', 'ద', 'ధ', 'న',
  'ప', 'ఫ', 'బ', 'భ', 'మ',
  'య', 'ర', 'ల', 'వ', 'శ', 
  'ష', 'స', 'హ', 'ళ', 'క్ష'
];

const teluguVowels = ['అ', 'ఆ', 'ఇ', 'ఈ', 'ఉ', 'ఊ', 'ఋ', 'ౠ', 'ఎ', 'ఏ', 'ఐ', 'ఒ', 'ఓ', 'ఔ', 'అం', 'అః'];

// Vowel signs (used to create graphemes)
const teluguVowelSigns = ['ా', 'ి', 'ీ', 'ు', 'ూ', 'ృ', 'ౄ', 'ె', 'ే', 'ై', 'ొ', 'ో', 'ౌ', 'ం', 'ః'];

// Dictionary of common Telugu words (would need to be expanded)
const teluguWordDictionary = [
  'అమ్మ', // amma (mother)
  'నాన్న', // naanna (father)
  'ప్రేమ', // prema (love)
  'తెలుగు', // telugu
  'భారత', // bhaarata (India)
  'దేశము', // deshamu (country)
  'పుస్తకం', // pustakam (book)
  'ఇల్లు', // illu (house)
  'స్నేహం', // sneham (friendship)
  'ఆనందం', // anandam (happiness)
  'విద్య', // vidya (education)
  'మనసు', // manasu (mind)
  'నీరు', // neeru (water)
  'భోజనం', // bhojanam (food)
  'జీవితం', // jeevitam (life)
  'ప్రపంచం', // prapancham (world)
  'వాయు', // vaayu (air)
  'భూమి', // bhoomi (earth)
  'నగరం', // nagaram (city)
  'గ్రామం', // graamam (village)
];

// Helper function to get a random word from the dictionary
const getRandomWord = (): string => {
  const randomIndex = Math.floor(Math.random() * teluguWordDictionary.length);
  return teluguWordDictionary[randomIndex];
};

// Helper to split a Telugu word into graphemes (handles complex characters correctly)
const splitToGraphemes = (word: string): string[] => {
  // This uses the Intl.Segmenter API for accurate grapheme splitting
  if ('Intl' in window && 'Segmenter' in Intl) {
    const segmenter = new Intl.Segmenter('te', { granularity: 'grapheme' });
    return Array.from(segmenter.segment(word), segment => segment.segment);
  } else {
    // Fallback method (not as accurate but better than nothing)
    return Array.from(word);
  }
};

// Define the cell state types
type CellState = 'empty' | 'filled' | 'correct' | 'present' | 'absent';

// Define types for our game
interface Cell {
  grapheme: string;
  state: CellState;
}

// The main component
const TeluguWordle: React.FC = () => {
  // Game state
  const [targetWord, setTargetWord] = useState<string>('');
  const [targetGraphemes, setTargetGraphemes] = useState<string[]>([]);
  const [currentAttempt, setCurrentAttempt] = useState<number>(0);
  const [currentPosition, setCurrentPosition] = useState<number>(0);
  const [gameBoard, setGameBoard] = useState<Cell[][]>([]);
  const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'lost'>('playing');
  const [message, setMessage] = useState<string>('');
  const [showKeyboard, setShowKeyboard] = useState<boolean>(true);
  const [usedLetters, setUsedLetters] = useState<Record<string, CellState>>({});
  const [showGraphemeSelection, setShowGraphemeSelection] = useState<boolean>(false);
  const [selectedConsonant, setSelectedConsonant] = useState<string>('');

  // Maximum attempts and word length
  const MAX_ATTEMPTS = 6;

  // Initialize the game
  useEffect(() => {
    startNewGame();
  }, []);

  const startNewGame = () => {
    const newTargetWord = getRandomWord();
    const graphemes = splitToGraphemes(newTargetWord);
    const wordLength = graphemes.length;
    
    console.log('Target word:', newTargetWord);
    console.log('Graphemes:', graphemes);
    
    // Initialize the game board
    const newBoard: Cell[][] = Array(MAX_ATTEMPTS).fill(null).map(() => 
      Array(wordLength).fill(null).map(() => ({ grapheme: '', state: 'empty' }))
    );
    
    setTargetWord(newTargetWord);
    setTargetGraphemes(graphemes);
    setGameBoard(newBoard);
    setCurrentAttempt(0);
    setCurrentPosition(0);
    setGameStatus('playing');
    setMessage('');
    setUsedLetters({});
  };

  // Function to handle regular keyboard input
  const handleKeyInput = (grapheme: string) => {
    if (gameStatus !== 'playing') return;
    
    // If we're at the end of the word, do nothing
    if (currentPosition >= targetGraphemes.length) return;
    
    // Update the board
    const newBoard = [...gameBoard];
    newBoard[currentAttempt][currentPosition] = {
      grapheme,
      state: 'filled'
    };
    
    setGameBoard(newBoard);
    setCurrentPosition(currentPosition + 1);
  };

  // Function to handle grapheme selection
  const handleGraphemeSelect = (consonant: string) => {
    setSelectedConsonant(consonant);
    setShowGraphemeSelection(true);
  };

  // Function to handle vowel sign selection
  const handleVowelSignSelect = (vowelSign: string) => {
    // Combine the consonant with the vowel sign to create a grapheme
    const grapheme = selectedConsonant + vowelSign;
    handleKeyInput(grapheme);
    setShowGraphemeSelection(false);
  };

  // Function to handle backspace
  const handleBackspace = () => {
    if (gameStatus !== 'playing' || currentPosition === 0) return;
    
    const newBoard = [...gameBoard];
    newBoard[currentAttempt][currentPosition - 1] = {
      grapheme: '',
      state: 'empty'
    };
    
    setGameBoard(newBoard);
    setCurrentPosition(currentPosition - 1);
  };

  // Function to check the current guess
  const checkGuess = () => {
    if (currentPosition !== targetGraphemes.length) {
      setMessage('పదం పూర్తి చేయండి!'); // "Complete the word!"
      return;
    }
    
    const currentGuess = gameBoard[currentAttempt].map(cell => cell.grapheme).join('');
    const guessGraphemes = gameBoard[currentAttempt].map(cell => cell.grapheme);
    
    // Check if word exists in dictionary (this is simplistic, should be expanded)
    if (!teluguWordDictionary.includes(currentGuess)) {
      setMessage('చెల్లుబాటు అయ్యే పదం కాదు!'); // "Not a valid word!"
      return;
    }
    
    // Check each grapheme and update states
    const newBoard = [...gameBoard];
    const newUsedLetters = { ...usedLetters };
    
    // Create a set to track which positions in the target word have been matched
    const matchedPositions = new Set<number>();
    
    // First pass: Find exact matches
    for (let i = 0; i < guessGraphemes.length; i++) {
      const grapheme = guessGraphemes[i];
      
      if (grapheme === targetGraphemes[i]) {
        newBoard[currentAttempt][i].state = 'correct';
        newUsedLetters[grapheme] = 'correct';
        matchedPositions.add(i); // Mark this position as matched
      }
    }
    
    // Second pass: Find partial matches
    for (let i = 0; i < guessGraphemes.length; i++) {
      if (newBoard[currentAttempt][i].state === 'correct') continue;
      
      const grapheme = guessGraphemes[i];
      let partialMatch = false;
      
      // Check if the current grapheme appears in an unmatched position in the target word
      for (let j = 0; j < targetGraphemes.length; j++) {
        if (!matchedPositions.has(j) && targetGraphemes[j] === grapheme) {
          newBoard[currentAttempt][i].state = 'present';
          if (newUsedLetters[grapheme] !== 'correct') {
            newUsedLetters[grapheme] = 'present';
          }
          matchedPositions.add(j); // Mark this position as matched now
          partialMatch = true;
          break;
        }
      }
      
      // If no match found, mark as absent
      if (!partialMatch) {
        newBoard[currentAttempt][i].state = 'absent';
        if (!newUsedLetters[grapheme]) {
          newUsedLetters[grapheme] = 'absent';
        }
      }
    }
    
    setGameBoard(newBoard);
    setUsedLetters(newUsedLetters);
    
    // Check if the player won
    if (currentGuess === targetWord) {
      setGameStatus('won');
      setMessage('అభినందనలు! మీరు గెలిచారు!'); // "Congratulations! You won!"
    } else if (currentAttempt === MAX_ATTEMPTS - 1) {
      setGameStatus('lost');
      setMessage(`ఆహ్! సరైన పదం: ${targetWord}`); // "Ah! The correct word was: [word]"
    } else {
      setCurrentAttempt(currentAttempt + 1);
      setCurrentPosition(0);
    }
  };

  // Render the game board
  return (
    <div className="telugu-wordle">
      <header>
        <h1>తెలుగు వర్డిల్</h1> {/* Telugu Wordle */}
        <button onClick={startNewGame}>కొత్త ఆట</button> {/* New Game */}
      </header>
      
      {message && <div className="message">{message}</div>}
      
      <div className="game-board">
        {gameBoard.map((row, rowIndex) => (
          <div key={rowIndex} className="row">
            {row.map((cell, cellIndex) => (
              <div
                key={cellIndex}
                className={`cell ${cell.state}`}
              >
                {cell.grapheme}
              </div>
            ))}
          </div>
        ))}
      </div>
      
      {showKeyboard && gameStatus === 'playing' && (
        <div className="keyboard">
          <div className="keyboard-section">
            <h3>అచ్చులు (Vowels)</h3>
            <div className="key-row">
              {teluguVowels.map(vowel => (
                <button 
                  key={vowel} 
                  onClick={() => handleKeyInput(vowel)}
                  className={usedLetters[vowel] || ''}
                >
                  {vowel}
                </button>
              ))}
            </div>
          </div>
          
          <div className="keyboard-section">
            <h3>హల్లులు (Consonants)</h3>
            <div className="key-grid">
              {teluguConsonants.map(consonant => (
                <button 
                  key={consonant} 
                  onClick={() => handleGraphemeSelect(consonant)}
                  className={usedLetters[consonant] || ''}
                >
                  {consonant}
                </button>
              ))}
            </div>
          </div>
          
          {showGraphemeSelection && (
            <div className="grapheme-selection">
              <h3>గుణింతాలు (Vowel Signs)</h3>
              <div className="vowel-sign-grid">
                <button onClick={() => handleKeyInput(selectedConsonant)}>
                  {selectedConsonant} (హల్లు)
                </button>
                {teluguVowelSigns.map((sign, index) => (
                  <button 
                    key={sign} 
                    onClick={() => handleVowelSignSelect(sign)}
                  >
                    {selectedConsonant + sign} ({teluguVowels[index + 1]})
                  </button>
                ))}
              </div>
              <button onClick={() => setShowGraphemeSelection(false)}>రద్దు</button> {/* Cancel */}
            </div>
          )}
          
          <div className="control-keys">
            <button onClick={handleBackspace}>తొలగించు</button> {/* Backspace */}
            <button onClick={checkGuess}>సమర్పించు</button> {/* Submit */}
          </div>
        </div>
      )}
      
      {gameStatus !== 'playing' && (
        <div className="game-over">
          <p>{message}</p>
          <button onClick={startNewGame}>మళ్ళీ ఆడండి</button> {/* Play Again */}
        </div>
      )}
    </div>
  );
};

export default TeluguWordle;
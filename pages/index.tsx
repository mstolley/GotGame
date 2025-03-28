import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { Character } from '../interfaces/Character';
import { loadFromLocalStorage, saveToLocalStorage } from '../utils/localStorage';
import { shuffleArray } from '../utils/shuffleArray';
import { getRandomKey } from '../utils/getRandomKey';
import { Header } from '../components/Header';
import styles from '../styles/GotGame.module.css';
import { getLegibleKey } from '../utils/getLegibleKey';

const GotGame = () => {
    const [isCheatMode, setIsCheatMode] = useState(false);
    const [localHighScore, setLocalHighScore] = useState<number | null>(loadFromLocalStorage('highScore'));
    const [localCharacters, setLocalCharacters] = useState<Character[] | null>(loadFromLocalStorage('characters'));
    const [gameCharacters, setGameCharacters] = useState<Character[] | null>(null);
    const [winner, setWinner] = useState<Character | null>(null);
    const [question, setQuestion] = useState<string | null>(null);
    const [wins, setWins] = useState(0);
    const [isLoss, setIsLoss] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const prevWinsRef = useRef<number>(wins); // Initialize with the current wins value

    const memoizedGetRandomKey = useCallback((getRandomKey), []);

    const fetchData = async () => {
        setIsLoading(true);

        try {
            const response = await fetch('/api');

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const result = await response.json();

            saveToLocalStorage('characters', result);
            setLocalCharacters(result);
        } catch (error) {
            setError(error as Error);
        } finally {
            setIsLoading(false);
        }
    };

    const launchRound = useCallback(() => {
        if (localCharacters && localCharacters.length >= 4) {
            const shuffledCharacters = shuffleArray(localCharacters);
            const selectedCharacters = shuffledCharacters?.slice(0, 4);
            const randomKey = memoizedGetRandomKey(localCharacters[0]);
            const legibleKey = getLegibleKey(randomKey);
            const winner = selectedCharacters?.find((char: Character) => char[randomKey] !== undefined && char[randomKey] !== null);
            const question = winner?.[randomKey]?.length > 0
                ? `Which character has a ${legibleKey} of ${winner?.[randomKey]}?`
                : `Which character has no ${legibleKey}?`;

            const shuffledSelectedCharacters = shuffleArray(selectedCharacters);

            setGameCharacters(shuffledSelectedCharacters);
            setWinner(winner || null);
            setQuestion(question);
        } else {
            setError(new Error('Not enough characters to start the game.'));
        }

        setIsLoading(false);
    }, [localCharacters, memoizedGetRandomKey]);

    const resetGame = useCallback(() => {
        const isNewHighScore = wins > (localHighScore || 0);
        const scoreToSet = isNewHighScore ? wins : localHighScore;

        setLocalHighScore(scoreToSet);
        saveToLocalStorage('highScore', scoreToSet);

        setIsLoss(false);
        setGameCharacters(null);
        setWinner(null);
        setQuestion(null);
        setWins(0);

        launchRound();
    }, [launchRound, wins, localHighScore]);

    useEffect(() => {
        localCharacters === null ? fetchData() : setIsLoading(false);
    }, [localCharacters]);

    useEffect(() => {
        isCheatMode && winner && console.log(winner);
    }, [isCheatMode, winner]);

    useEffect(() => {
        prevWinsRef.current !== wins && launchRound();
        prevWinsRef.current = wins;
    }, [wins, launchRound]);

    if (error) return <div>Error: {error.message}</div>;

    return (
        <div className={styles.container}>
            <Header />
            {isLoading ? (
                <div className={styles.loader}>Loading...</div>
            ) : (
                <>
                    {!gameCharacters ? (
                        <div className={styles.startContainer}>
                            <button className={styles.button} onClick={launchRound}>Start</button>
                            <div className={styles.cheatModeContainer}>
                                <input
                                    className={styles.cheatMode}
                                    id="cheatMode"
                                    name="cheatMode"
                                    aria-label="Cheat Mode"
                                    aria-describedby="cheatMode"
                                    aria-checked={isCheatMode}
                                    aria-invalid={isCheatMode ? 'true' : 'false'}
                                    aria-required="false"
                                    aria-labelledby="cheatMode"
                                    aria-live="polite"
                                    type="checkbox"
                                    checked={isCheatMode}
                                    onChange={() => setIsCheatMode(!isCheatMode)}
                                />
                                <label className={styles.cheatModeLabel} htmlFor="cheatMode">Cheat Mode</label>
                            </div>
                        </div>
                    ) : (
                        <div className={styles.scoreContainer}>
                            <div className={styles.wins}>
                                <span className={styles.scoreKey}>Wins</span>
                                <span className={styles.scoreValue}>{wins}</span>
                            </div>
                            <div className={styles.high}>
                                <span className={styles.scoreKey}>High</span>
                                <span className={styles.scoreValue}>{localHighScore}</span>
                            </div>
                        </div>
                    )}
                    {isLoss && (
                        <>
                            <div className={styles.lostContainer}>
                                <h5 className={styles.lostText}>You lost!</h5>
                            </div>
                            <div className={styles.buttonContainer}>
                                <button className={styles.button} onClick={resetGame}>Play again</button>
                            </div>
                        </>
                    )}
                    {gameCharacters && !isLoss && (
                        <>
                            {question && (
                                <div className={styles.question}>
                                    <h5 className="text-3xl font-bold underline">{question}</h5>
                                </div>
                            )}
                            {gameCharacters && (
                                <div className={styles.grid}>
                                    {gameCharacters.map(character => (
                                        <div key={character.id} className={styles.card}>
                                            <div className={styles.imageContainer} onClick={() => character === winner ? setWins(wins + 1) : setIsLoss(true)}>
                                                <Image
                                                    priority
                                                    src={character.imageUrl}
                                                    blurDataURL={character.imageUrl}
                                                    alt={`image_${character.id}`}
                                                    className={styles.image}
                                                    width={268}
                                                    height={268}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </>
            )}
        </div>
    );
};

export default GotGame;

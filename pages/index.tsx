import { useCallback, useEffect, useMemo, useState } from 'react';
import { Container, Card, CardContent, Typography, Button } from '@mui/material';
import Image from 'next/image';
import { Character } from '../interfaces/Character';
import { loadFromLocalStorage, saveToLocalStorage } from '../utils/localStorage';
import { shuffleArray } from '../utils/shuffleArray';
import { getRandomKey } from '../utils/getRandomKey';
import { Header } from '../components/Header';
import styles from '../styles/GotGame.module.css';
import { getLegibleKey } from '../utils/getLegibleKey';

const GotGame = () => {
    const [localCharacters, setLocalCharacters] = useState<Character[] | null>(loadFromLocalStorage('characters'));
    const [gameCharacters, setGameCharacters] = useState<Character[] | null>(null);
    const [winner, setWinner] = useState<Character | null>(null);
    const [question, setQuestion] = useState<string | null>(null);
    const [wins, setWins] = useState(0);
    const [isLoss, setIsLoss] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

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
            const question = winner
                ? `Which character has a ${legibleKey} of ${winner[randomKey]}?`
                : `Which character has no ${legibleKey}?`;

            setGameCharacters(selectedCharacters);
            setWinner(winner || null);
            setQuestion(question);
        } else {
            setError(new Error('Not enough characters to start the game.'));
        }

        setIsLoading(false);
    }, [localCharacters, memoizedGetRandomKey]);

    const resetGame = () => {
        setIsLoss(false);
        setGameCharacters(null);
        setWinner(null);
        setQuestion(null);
        setWins(0);

        launchRound();
    };

    useEffect(() => {
        localCharacters === null ? fetchData() : setIsLoading(false);
    }, [localCharacters]);

    useEffect(() => {
        winner && console.log(winner);
    }, [winner]);

    if (error) return <div>Error: {error.message}</div>;

    return (
        <Container className={styles.container}>
            <Header />
            {isLoading ? (
                <div className={styles.loader}>Loading...</div>
            ) : (
                <>
                    {!isLoss && (
                        <div className={styles.buttonContainer}>
                            <Button className={styles.button} onClick={launchRound}>Start</Button>
                        </div>
                    )}
                    {gameCharacters && (
                        <div className={styles.scoreContainer}>
                            <div className={styles.wins}>
                                <span className={styles.scoreKey}>Wins</span>
                                <span className={styles.scoreValue}>{wins}</span>
                            </div>
                        </div>
                    )}
                    {isLoss && (
                        <div className={styles.lostContainer}>
                            <Typography className={styles.lostText} component='h5' variant='h5'>You lost!</Typography>
                            <Button className={styles.button} onClick={() => resetGame()}>Try again</Button>
                        </div>
                    )}
                    {gameCharacters && gameCharacters.length > 3 && !isLoss && (
                        <>
                            {question && (
                                <div className={styles.question}>
                                    <Typography component='h5' variant='h5'>{question}</Typography>
                                </div>
                            )}
                            <div className={styles.grid}>
                                {gameCharacters && gameCharacters.map(character => (
                                    <Card key={character.id} className={styles.card}>
                                        <CardContent>
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
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </>
                    )}
                </>
            )}
        </Container>
    );
};

export default GotGame;

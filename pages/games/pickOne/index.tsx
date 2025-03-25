import { useCallback, useEffect, useMemo, useState } from 'react';
import { Container, Card, CardContent } from '@mui/material';
import Image from 'next/image';
import { Character } from '../../../interfaces/Character';
import { loadFromLocalStorage } from '../../../utils/localStorage';
import { shuffleArray } from '../../../utils/shuffleArray';
import { getRandomKey } from '../../../utils/getRandomKey';
import { Header } from '../../../components/Header';
import { Navigation } from '../../../components/Navigation';
import styles from '../../../styles/GotGame.module.css';

const PickOne = () => {
    const localCharacters = useMemo(() => {
        return loadFromLocalStorage('characters') as Character[] || null;
    }, []);
    const [gameCharacters, setGameCharacters] = useState<Character[] | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const memoizedGetRandomKey = useCallback((getRandomKey), []);

    useEffect(() => {
        if (localCharacters && localCharacters.length >= 4) {
            const shuffledCharacters = shuffleArray(localCharacters);
            const selectedCharacters = shuffledCharacters.slice(0, 4);
            const randomKey = memoizedGetRandomKey(localCharacters[0]);

            randomKey && console.log(randomKey);

            setGameCharacters(selectedCharacters);
        } else {
            setError(new Error('Characters not found'));
        }

        setIsLoading(false);
    }, [localCharacters, memoizedGetRandomKey]);

    useEffect(() => {
        gameCharacters && console.log(gameCharacters);
    }, [gameCharacters]);

    if (error) return <div>Error: {error.message}</div>;

    return (
        <Container className={styles.container}>
            <Header />
            {isLoading ? (
                <div className={styles.loader}>Loading...</div>
            ) : (
                <>
                    <Navigation />
                    {gameCharacters && gameCharacters.length > 3 && (
                        <div className={styles.grid}>
                            {gameCharacters && gameCharacters.map(character => (
                                <Card key={character.id} className={styles.card}>
                                    <CardContent>
                                        <div className={styles.imageContainer}>
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
                    )}
                </>
            )}
        </Container>
    );
};

export default PickOne;

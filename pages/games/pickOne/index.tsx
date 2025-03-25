import { useEffect, useMemo, useState } from 'react';
import { Container, Card, CardContent } from '@mui/material';
import Image from 'next/image';
import { loadFromLocalStorage } from '../../../utils/localStorage';
import styles from '../../../styles/GotGame.module.css';
import { Header } from '../../../components/Header';
import { Navigation } from '../../../components/Navigation';

const PickOne = () => {
    interface Character {
        id: number;
        firstName: string;
        lastName: string;
        fullName: string;
        title: string;
        family: string;
        imageUrl: string;
    }

    const localCharacters = useMemo(() => {
        return loadFromLocalStorage('characters') as Character[] || null;
    }, []);
    const [gameCharacters, setGameCharacters] = useState<Character[] | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (localCharacters && localCharacters.length >= 4) {
            // Shuffle the localCharacters array
            const shuffledCharacters = localCharacters.sort(() => 0.5 - Math.random());
            // Select the first 4 characters
            const selectedCharacters = shuffledCharacters.slice(0, 4);

            // // Ensure one of the character values is unique
            // if (selectedCharacters.length > 0) {
            //     selectedCharacters[0] = {
            //         ...selectedCharacters[0],
            //         firstName: 'Arya' // Replace 'uniqueValue' with the actual unique value
            //     };
            // }

            setGameCharacters(selectedCharacters);
        } else {
            setError(new Error('Characters not found'));
        }

        setIsLoading(false);
    }, [localCharacters]);

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

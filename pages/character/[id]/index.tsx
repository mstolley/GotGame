import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Container, Typography, Card, CardContent } from '@mui/material';
import Image from 'next/image';
import Link from 'next/link';
import { loadFromLocalStorage } from '../../../utils/localStorage';
import styles from '../../../styles/GotGame.module.css';
import { Header } from '../../../components/Header';

const Character = () => {
    const router = useRouter();
    const { id } = router.query;

    interface Character {
        id: number;
        firstName: string;
        lastName: string;
        fullName: string;
        title: string;
        family: string;
        imageUrl: string;
    }

    const [character, setCharacter] = useState<Character | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (id) {
            const localCharacters = loadFromLocalStorage('characters');
            const localCharacter = localCharacters?.find((char: Character) => char.id === Number(id));

            if (localCharacter) {
                setCharacter(localCharacter);
                setIsLoading(false);
            } else {
                const fetchCharacter = async () => {
                    try {
                        const response = await fetch(`/api/character/${id}`);

                        if (!response.ok) {
                            throw new Error('Network response was not ok');
                        }

                        const result = await response.json();

                        setCharacter(result);
                    } catch (error) {
                        setError(error as Error);
                    } finally {
                        setIsLoading(false);
                    }
                };

                fetchCharacter();
            }
        }
    }, [id]);

    if (error) return <div>Error: {error.message}</div>;

    return (
        <Container className={styles.container}>
            <Header />
            {isLoading ? (
                <div className={styles.loader}>Loading...</div>
            ) : (
                <>
                    <div className={styles.headNav}>
                        <Link href={"/"}>Back to Home</Link>
                    </div>
                    {character && (
                        <Card className={styles.card}>
                            <CardContent>
                                <Typography variant="h5" component="h5">
                                    {character.fullName}
                                </Typography>
                                <Typography variant="body1">
                                    <span>First Name:</span> {character.firstName}
                                </Typography>
                                <Typography variant="body1">
                                    <span>Last Name:</span> {character.lastName}
                                </Typography>
                                <Typography variant="body1">
                                    <span>Title:</span> {character.title}
                                </Typography>
                                <Typography variant="body1">
                                    <span>Family:</span> {character.family}
                                </Typography>
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
                    )}
                </>
            )}
        </Container>
    );
};

export default Character;

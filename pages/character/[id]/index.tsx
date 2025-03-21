import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Container, Typography, Card, CardContent } from '@mui/material';
import styles from '../../../styles/GotGame.module.css';

const Character = () => {
    const router = useRouter();
    const { id } = router.query;

    interface Character {
        fullName: string;
        title: string;
        family: string;
        imageUrl: string;
    }

    const [character, setCharacter] = useState<Character | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (id) {
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
                    setLoading(false);
                }
            };

            fetchCharacter();
        }
    }, [id]);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error.message}</div>;

    return (
        <Container className={styles.container}>
            {character && (
                <Card className={styles.card}>
                    <CardContent>
                        <Typography variant="h5" component="h5">
                            {character.fullName}
                        </Typography>
                        <Typography variant="body1">
                            {character.title}
                        </Typography>
                        <Typography variant="body1">
                            {character.family}
                        </Typography>
                        <img src={character.imageUrl} alt={character.fullName} className={styles.image} />
                    </CardContent>
                </Card>
            )}
        </Container>
    );
};

export default Character;

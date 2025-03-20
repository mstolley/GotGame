import { useState, useEffect } from 'react';
import { Container, Typography, Card, CardContent } from '@mui/material';
import styles from '../styles/Home.module.css';

const Home = () => {
    interface Character {
        id: number;
        firstName: string;
        lastName: string;
        fullName: string;
        title: string;
        family: string;
        imageUrl: string;
    }

    const [data, setData] = useState<Character[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    console.log('data:', data);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('/api');
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const result = await response.json();
                setData(result);
            } catch (error) {
                setError(error as Error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error.message}</div>;

    return (
        <Container className={styles.container}>
            <Typography variant="h2" component="h2" gutterBottom>
                Game of Thrones Characters
            </Typography>
            {data && data.length > 0 && (
                <div className={styles.grid}>
                    {data.map((character) => (
                        <Card key={character.id} className={styles.card}>
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
                    ))}
                </div>
            )}
        </Container>
    );
};

export default Home;

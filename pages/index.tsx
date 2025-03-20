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
    const [selectedFamily, setSelectedFamily] = useState<string>('');

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

    const handleFamilyChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedFamily(event.target.value);
    };

    const filteredData = data?.filter(character => character.family.includes(selectedFamily));

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error.message}</div>;

    return (
        <Container className={styles.container}>
            <Typography variant="h2" component="h2" gutterBottom>
                Game of Thrones Characters
            </Typography>
            <select onChange={handleFamilyChange} value={selectedFamily}>
                <option value="">All Families</option>
                {data && Array.from(new Set(data.map(character => character.family)))
                    .filter(family => family.trim() !== '') // Filter out empty values
                    .sort((a, b) => a.localeCompare(b)) // Sort alphabetically
                    .map(family => (
                        <option key={family} value={family}>{family}</option>
                    ))}
            </select>
            {data && data.length > 0 && (
                <div className={styles.grid}>
                    {filteredData && filteredData.length > 0 && (
                        <div className={styles.grid}>
                            {filteredData.map((character) => (
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
                </div>
            )}
        </Container>
    );
};

export default Home;

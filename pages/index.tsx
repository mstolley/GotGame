import { useState, useEffect } from 'react';
import { Container, Typography, Card, CardContent } from '@mui/material';
import Link from 'next/link';
// import { loadFromLocalStorage, saveToLocalStorage } from '../utils/localStorage';
import styles from '../styles/GotGame.module.css';

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
            <div className={styles.selectContainer}>
                <select onChange={handleFamilyChange} value={selectedFamily} name='family' id='family' className={styles.select}>
                    <option value="">All Families</option>
                    {data && Array.from(new Set(data.map(character => character.family)))
                        .filter(family => family.trim() !== '') // Filter out empty values
                        .sort((a, b) => a.localeCompare(b)) // Sort alphabetically
                        .map(family => (
                            <option key={family} value={family}>{family}</option>
                        ))}
                </select>
            </div>
            {filteredData && filteredData.length > 0 && (
                <div className={styles.grid}>
                    {filteredData.map((character) => (
                        <Card key={`card_${character.id}`} className={styles.card}>
                            <CardContent>
                                <Link href={`/character/${character.id}`}>
                                    <Typography variant="h5" component="h5">
                                        {character.fullName}
                                    </Typography>
                                </Link>
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

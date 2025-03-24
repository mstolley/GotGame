import { useState, useEffect } from 'react';
import { Container, Card, CardContent } from '@mui/material';
import Image from 'next/image';
import Link from 'next/link';
import { loadFromLocalStorage, saveToLocalStorage } from '../utils/localStorage';
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

    const [isClient, setIsClient] = useState(false);
    const [data, setData] = useState<Character[] | null>(loadFromLocalStorage('characters') || null);
    const [isLoading, setIsLoading] = useState(!data);
    const [error, setError] = useState<Error | null>(null);
    const [selectedFamily, setSelectedFamily] = useState<string>('');

    const handleFamilyChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedFamily(event.target.value);
    };

    const filteredData = data?.filter(character => character.family.includes(selectedFamily));

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('/api');
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const result = await response.json();
                setData(result);
                saveToLocalStorage('characters', result);
            } catch (error) {
                setError(error as Error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        setIsClient(true);
    }, []);

    if (error) return <div>Error: {error.message}</div>;

    return (
        <Container className={styles.container}>
            {isClient && !isLoading ? (
                <>
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
                    <div>
                        {filteredData && filteredData.length > 0 && (
                            <div className={styles.grid}>
                                {filteredData.map((character) => (
                                    <Card key={`card_${character.id}`} className={styles.card}>
                                        <CardContent>
                                            <Link href={`/character/${character.id}`}>
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
                                            </Link>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                </>
            ) : (
                <div>Loading...</div>
            )}
        </Container>
    );
};

export default Home;

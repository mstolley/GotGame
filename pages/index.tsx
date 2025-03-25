import { useEffect, useMemo, useState } from 'react';
import {
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Container,
    Card,
    CardContent,
    NoSsr,
    Typography
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Image from 'next/image';
import Link from 'next/link';
import { Character } from '../interfaces/Character';
import { loadFromLocalStorage, saveToLocalStorage } from '../utils/localStorage';
import { Header } from '../components/Header';
import styles from '../styles/GotGame.module.css';

const Home = () => {
    const localCharacters = useMemo(() => {
        return loadFromLocalStorage('characters') as Character[] || null;
    }, []);

    const [isClient, setIsClient] = useState(false);
    const [data, setData] = useState<Character[] | null>(localCharacters);
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

        localCharacters === null && fetchData();
    }, [localCharacters]);

    useEffect(() => {
        setIsClient(true);
    }, []);

    if (error) return <div>Error: {error.message}</div>;

    return (
        <Container className={styles.container}>
            <Header />
            {!isClient || isLoading ? (
                <div className={styles.loader}>Loading...</div>
            ) : (
                <>
                    <Accordion>
                        <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            aria-controls="characters-content"
                            id="characters-header"
                        >
                            <Typography variant="h5" component="h5">Characters</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <div className={styles.selectContainer}>
                                <select value={selectedFamily} name='family' id='family' onChange={handleFamilyChange}>
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
                                            <Card
                                                key={`card_${character.id}`}
                                                className={styles.card}
                                            >
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
                        </AccordionDetails>
                    </Accordion>
                    <Accordion>
                        <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            aria-controls="games-content"
                            id="games-header"
                        >
                            <Typography variant="h5" component="h5">Games</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <div className={styles.gameDetails}>
                                <Link href={'/games/pickOne'}>Pick 1 Game</Link>
                            </div>
                        </AccordionDetails>
                    </Accordion>
                </>
            )}
        </Container>
    );
};

export default Home;

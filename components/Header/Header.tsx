import { Typography } from '@mui/material';
import styles from '../../styles/GotGame.module.css';

const Header = () => {
    return (
        <header className={styles.header}>
            <Typography variant="h3" component="h1">GotGame</Typography>
        </header>
    );
};

export default Header;
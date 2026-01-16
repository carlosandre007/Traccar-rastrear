import React from 'react';
import { useTheme, useMediaQuery } from '@mui/material';
import { useSelector } from 'react-redux';
import { makeStyles } from '@mui/styles';
import Logo from '../resources/images/LogoRam.png';

const useStyles = makeStyles((theme) => ({
  image: {
    display: 'block',
    maxWidth: '100%', // permite que a imagem não ultrapasse o container
    height: 'auto',    // mantém a proporção
    margin: '0 auto',  // centraliza horizontalmente
  },
}));

const LogoImage = ({ color }) => {
  const theme = useTheme();
  const classes = useStyles();

  const expanded = !useMediaQuery(theme.breakpoints.down('lg'));

  const logo = useSelector((state) => state.session.server.attributes?.logo);
  const logoInverted = useSelector((state) => state.session.server.attributes?.logoInverted);

  if (logo) {
    if (expanded && logoInverted) {
      return <img className={classes.image} src={logo} alt="" />;
    }
    return <img className={classes.image} src={logo} alt="" />;
  }
  return <img className={classes.image} src={Logo} alt="" />;
};

export default LogoImage;

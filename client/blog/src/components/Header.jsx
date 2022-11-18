import './Header.scss';

import Logo from '../img/logo-projeto.svg';
import { useNavigate } from 'react-router-dom';
import React from 'react';

export const Header = React.memo(function () {
  const navigate = useNavigate();

  return (
    <div className='header'>
      <img className='header__logo' onClick={() => navigate('/')} src={Logo} alt='Projeto Amamenta' draggable={false} />
      <div className='header__title'>
        O aleitamento materno é a mais sabia estratégia natural de vínculo, afeto, proteção e nutrição para o bebê.
      </div>
    </div>
  );
});

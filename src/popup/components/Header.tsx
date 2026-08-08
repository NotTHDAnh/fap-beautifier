import React from 'react';

type HeaderProps = {
  version: string;
};

/**
 * Header component cho popup
 */
const Header: React.FC<HeaderProps> = ({ version }) => {
  return (
    <div className="header">
      <h4 className="title">
        <img src="../media/icons/128.png" className="header-logo" alt="dadx-custom-fap Logo" />
        dadx-custom-fap
      </h4>
      <span className="version">v{version}</span>
    </div>
  );
};

export default Header; 
import React from 'react';
import { getPasswordStrength, getPasswordStrengthLabel } from '../utils/helpers';

export const PasswordStrengthMeter = ({ password }) => {
  if (!password) return null;

  const strength = getPasswordStrength(password);
  const { text, class: strengthClass } = getPasswordStrengthLabel(strength);

  return (
    <div className="password-strength-container">
      <div className="strength-meter">
        <div className={`strength-bar ${strengthClass}`}></div>
      </div>
      <div className={`strength-text text-${strengthClass.split('-')[1]}`}>
        {text}
      </div>
    </div>
  );
};

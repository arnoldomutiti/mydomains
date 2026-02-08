import React from 'react';

function PasswordStrengthMeter({ password }) {
  if (!password) return null;

  const getStrength = (pass) => {
    let strength = 0;
    if (pass.length > 5) strength++;
    if (pass.length > 8) strength++;
    if (/[A-Z]/.test(pass)) strength++;
    if (/[0-9]/.test(pass)) strength++;
    if (/[^A-Za-z0-9]/.test(pass)) strength++;
    return strength;
  };

  const strength = getStrength(password);
  let strengthClass = 'strength-weak';
  let text = 'Weak';

  if (strength > 2) { strengthClass = 'strength-medium'; text = 'Medium'; }
  if (strength > 4) { strengthClass = 'strength-strong'; text = 'Strong'; }

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
}

export default PasswordStrengthMeter;

import React from "react";

import './toggle.css';
  
const ToggleSwitch = ({ label, onChange, checked, disabled }) => {
  console.log(`Checked: ${checked}`);
  console.log(`Disabled: ${disabled}`)
  return (
    <div className="container">
      <div className="toggle-switch">
        <input type="checkbox" className="checkbox" 
               name={label} id={label} onChange={onChange} checked={!!checked} disabled={!!disabled} />
        <label className="label" htmlFor={label}>
          <span className="inner" />
          <span className="switch" />
        </label>
      </div>
    </div>
  );
};
  
export default ToggleSwitch;
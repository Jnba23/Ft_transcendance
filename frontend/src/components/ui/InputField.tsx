import React from "react";

type InputFieldProps = {
  placeholder: string;
  icon?: string;
  value: string,
  setInputVal: React.Dispatch<React.SetStateAction<string>>
};

function InputField({ placeholder, icon, value, setInputVal}: InputFieldProps) {

  return (
    <div className="text-white relative w-full">
      <span
        className={[
          'material-symbols-outlined',
          'absolute top-1/2 -translate-y-1/2 left-3',
          '!text-base text-white/50',
        ].join(' ')}
      >
        {icon}
      </span>
      <input
        type="text"
        placeholder={placeholder}
        className={[
          `${icon ? 'py-1.5 pl-9 pr-3 text-sm' : 'py-2.5 px-4'}`,
          'w-full placeholder-white/50',
          'bg-white/5 border border-white/10 rounded-lg',
          'focus:border-primary focus:outline-none',
          'focus:ring-primary focus:ring-1 ',
        ].join(' ')}
        value={value}
        onChange={(e) => setInputVal(e.target.value)}
      />
    </div>
  );
}

export default InputField;

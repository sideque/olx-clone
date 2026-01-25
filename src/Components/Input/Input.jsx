import React from "react";

const Input = ({
  name,
  type = "text",
  value,
  setInput,
  placeholder,
  error,
  onBlur,
}) => {
  const handleChange = (event) => {
    setInput(event.target.value);
  };

  return (
    <div className="pt-2 w-full ralative">
      <div className="pt-2 w-full relative">
        <input
          id={name}
          name={name}
          value={value}
          onChange={handleChange}
          onBlur={onBlur}
          type={type}
          aria-invalid={!!error}
          aria-describedby={error ? `${name}-error` : undefined}
          className={`w-full border-2 rounded-md p-3 pt-4 pb-2 focus:outline-none peer ${
            error ? "border-red-500" : "border-black"
          }`}
          placeholder=" "
        />
        <label
          htmlFor={name}
          className="absolute pl-1 pr-1 left-2.5 top-0 bg-white text-sm peer-focus:top-0 peer-focus:text-sm transition-all duration-200 peer-placeholder-shown:text-base peer-placeholder-shown:top-5"
        >
          {placeholder}
        </label>
      </div>
      {error && (
        <p id={`${name}-error`} className="text-xs text-red-600 pt-1 pl-1">
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;

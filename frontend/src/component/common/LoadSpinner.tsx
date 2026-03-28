import React from "react";

export interface LoadSpinnerProps {
  title: string;
};

const LoadSpinner = (p: LoadSpinnerProps) => {
const { title } = p;
  return (
    <div>{title}</div>
  );
};

export default LoadSpinner;
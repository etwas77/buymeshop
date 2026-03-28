import React from "react";

export interface NoProductsAvailableProps {
  title: string;
};

const NoProductsAvailable = (p: NoProductsAvailableProps) => {
const { title } = p;
  return (
    <div>{title}</div>
  );
};

export default NoProductsAvailable;
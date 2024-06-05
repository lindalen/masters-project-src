import { createBox } from "@shopify/restyle";
import React, { ReactNode } from "react";
import { Theme } from "../theme";

const Box = createBox<Theme>();

interface HeaderProps {
  children?: ReactNode; // Optional ReactNode type to accept children
}

const Header: React.FC<HeaderProps> = ({ children }) => {
  return (
    <Box
      flexDirection="row"
      justifyContent="space-between"
      alignItems="center"
      padding="m"
      paddingTop="l"
    >
      {children}
    </Box>
  );
};

export default Header;

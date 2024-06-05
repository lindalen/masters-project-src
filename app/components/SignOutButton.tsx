import React from "react";
import { useAppStore } from "../state";
import ActionButton from "./ActionButton";

const SignOutButton = () => {
  const signOut = useAppStore((state) => state.signOut);

  return <ActionButton title="Sign Out" onPress={signOut} />;
};

export default SignOutButton;

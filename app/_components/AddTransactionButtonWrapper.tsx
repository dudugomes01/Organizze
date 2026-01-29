"use client";

import { useState } from "react";
import AddTransactionButton from "./add-transaction-button";

interface AddTransactionButtonWrapperProps {
  userCanAddTransaction: boolean;
  userIsPremium?: boolean;
}

const AddTransactionButtonWrapper = ({
  userCanAddTransaction,
  userIsPremium
}: AddTransactionButtonWrapperProps) => {
  const [dialogIsOpen, setDialogIsOpen] = useState(false);

  return (
    <AddTransactionButton
      userCanAddTransaction={userCanAddTransaction}
      userIsPremium={userIsPremium}
      dialogIsOpen={dialogIsOpen}
      setDialogIsOpen={setDialogIsOpen}
    />
  );
};

export default AddTransactionButtonWrapper;

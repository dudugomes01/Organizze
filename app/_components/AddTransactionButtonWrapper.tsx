"use client";

import { useState } from "react";
import AddTransactionButton from "./add-transaction-button";

interface AddTransactionButtonWrapperProps {
  userCanAddTransaction: boolean;
}

const AddTransactionButtonWrapper = ({
  userCanAddTransaction
}: AddTransactionButtonWrapperProps) => {
  const [dialogIsOpen, setDialogIsOpen] = useState(false);

  return (
    <AddTransactionButton
      userCanAddTransaction={userCanAddTransaction}
      dialogIsOpen={dialogIsOpen}
      setDialogIsOpen={setDialogIsOpen}
    />
  );
};

export default AddTransactionButtonWrapper;

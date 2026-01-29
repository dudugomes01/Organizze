"use client";

import { ArrowDownUpIcon } from "lucide-react";
import { Button } from "./ui/button";
import UpsertTransactionDialog from "./upsert-transaction-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

interface AddTransactionButtonProps {
  userCanAddTransaction?: boolean;
  userIsPremium?: boolean;
  dialogIsOpen: boolean; 
  setDialogIsOpen: React.Dispatch<React.SetStateAction<boolean>>; 
}

const AddTransactionButton = ({
  userCanAddTransaction,
  userIsPremium,
  dialogIsOpen,
  setDialogIsOpen,
}: AddTransactionButtonProps) => {
  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              className="hidden sm:flex rounded-full font-bold max-w-[270px]"
              onClick={() => setDialogIsOpen(true)}
              disabled={!userCanAddTransaction}
            >
              Adicionar transação
              <ArrowDownUpIcon />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {!userCanAddTransaction &&
              "Você atingiu o limite de transações. Atualize seu plano para criar ilimitadas."}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <UpsertTransactionDialog
        isOpen={dialogIsOpen}
        setIsOpen={setDialogIsOpen}
        userIsPremium={userIsPremium}
      />
    </>
  );
};

export default AddTransactionButton;
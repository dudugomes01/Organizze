import { Button } from "./ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import { MoneyInput } from "./money-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  TRANSACTION_CATEGORY_OPTIONS,
  TRANSACTION_PAYMENT_METHOD_OPTIONS,
  TRANSACTION_TYPE_OPTIONS,
} from "../_constants/transactions";
import { DatePicker } from "./ui/data.picker";
import { z } from "zod";
import {
  TransactionType,
  TransactionCategory,
  TransactionPaymentMethod,
} from "@prisma/client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { upsertTransaction } from "../_actions/upsert-transaction";
import { useRef, useState } from "react";
import * as ofx from "ofx-js";

const SUGGESTED_CATEGORIES: { [key: string]: TransactionCategory } = {
  posto: TransactionCategory.TRANSPORTATION,
  gasolina: TransactionCategory.TRANSPORTATION,
  burger: TransactionCategory.FOOD,
  mercado: TransactionCategory.FOOD,
  farmácia: TransactionCategory.HEALTH,
  "pague menos": TransactionCategory.HEALTH,
  escola: TransactionCategory.EDUCATION,
  faculdade: TransactionCategory.EDUCATION,
  aluguel: TransactionCategory.HOUSING,
  energia: TransactionCategory.UTILITY,
  água: TransactionCategory.UTILITY,
  salário: TransactionCategory.SALARY,
  pix: TransactionCategory.OTHER,
};

function suggestCategory(memo: string): TransactionCategory {
  const lower = memo.toLowerCase();
  for (const key in SUGGESTED_CATEGORIES) {
    if (lower.includes(key)) return SUGGESTED_CATEGORIES[key];
  }
  return TransactionCategory.OTHER;
}

interface UpsertTransactionDialogProps {
  isOpen: boolean;
  defaultValues?: FormSchema;
  transactionId?: string;
  setIsOpen: (isOpen: boolean) => void;
}

const formSchema = z.object({
  name: z.string().trim().min(1, {
    message: "O nome é obrigatório.",
  }),
  amount: z
    .number({
      required_error: "O valor é obrigatório.",
    })
    .positive({
      message: "O valor deve ser positivo.",
    }),
  type: z.nativeEnum(TransactionType, {
    required_error: "O tipo é obrigatório.",
  }),
  category: z.nativeEnum(TransactionCategory, {
    required_error: "A categoria é obrigatória.",
  }),
  paymentMethod: z.nativeEnum(TransactionPaymentMethod, {
    required_error: "O método de pagamento é obrigatório.",
  }),
  date: z.date({
    required_error: "A data é obrigatória.",
  }),
});

type FormSchema = z.infer<typeof formSchema>;

const UpsertTransactionDialog = ({
  isOpen,
  defaultValues,
  transactionId,
  setIsOpen,
}: UpsertTransactionDialogProps) => {
  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues ?? {
      amount: undefined,
      category: TransactionCategory.OTHER,
      date: new Date(),
      name: "",
      paymentMethod: TransactionPaymentMethod.CASH,
      type: TransactionType.EXPENSE,
    },
  });

  const onSubmit = async (data: FormSchema) => {
    try {
      await upsertTransaction({ ...data, id: transactionId });
      setIsOpen(false);
      form.reset();
    } catch (error) {
      console.error(error);
    }
  };

  const isUpdate = Boolean(transactionId);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importPreview, setImportPreview] = useState<FormSchema[]>([]);
  const [isImporting, setIsImporting] = useState(false);

  async function handleOfxImport(e: React.ChangeEvent<HTMLInputElement>) {
    console.log("handleOfxImport: evento disparado");
    const file = e.target.files?.[0];
    if (!file) {
      console.log("Nenhum arquivo selecionado");
      return;
    }

    try {
      console.log("Lendo arquivo OFX...");
      const text = await file.text();
      console.log("Arquivo lido, conteúdo:", text.slice(0, 200)); // Mostra só o início

      console.log("Fazendo parse do OFX...");
      const json = await ofx.parse(text); // <-- await aqui!
      console.log("Resultado do parse:", json);

      const stmts = json?.OFX?.BANKMSGSRSV1?.STMTTRNRS?.STMTRS?.BANKTRANLIST?.STMTTRN || [];
      console.log("Transações extraídas:", stmts);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const imported: FormSchema[] = stmts.map((trn: any, idx: number) => {
        const amount = Number(trn.TRNAMT || 0);
        const type = trn.TRNTYPE === "CREDIT" || amount > 0
          ? TransactionType.DEPOSIT
          : TransactionType.EXPENSE;
        const category = suggestCategory(trn.MEMO || "");

        // Parse da data do formato YYYYMMDD
        let parsedDate = new Date();
        if (trn.DTPOSTED && trn.DTPOSTED.length >= 8) {
          const year = trn.DTPOSTED.slice(0, 4);
          const month = trn.DTPOSTED.slice(4, 6);
          const day = trn.DTPOSTED.slice(6, 8);
          parsedDate = new Date(`${year}-${month}-${day}`);
        }

        const obj = {
          name: trn.MEMO || "Sem descrição",
          amount: Math.abs(amount),
          type,
          category,
          paymentMethod: TransactionPaymentMethod.OTHER,
          date: parsedDate,
        };
        console.log(`Transação mapeada [${idx}]:`, obj);
        return obj;
      });

      setImportPreview(imported);
      console.log("Preview de importação setado:", imported);
    } catch (error) {
      console.error("Erro ao processar arquivo OFX:", error);
      alert("Erro ao processar arquivo OFX. Verifique se o arquivo é válido.");
    }
  }

  async function handleImportConfirm() {
    console.log("Iniciando importação das transações...");
    setIsImporting(true);
    try {
      for (let idx = 0; idx < importPreview.length; idx++) {
        const data = importPreview[idx];
        console.log(`Importando transação ${idx + 1}/${importPreview.length}:`, data);
        await upsertTransaction(data);
      }
      setImportPreview([]);
      setIsOpen(false);
      form.reset();
      console.log("Importação concluída com sucesso!");
    } catch (error) {
      console.error("Erro ao importar transações:", error);
      alert("Erro ao importar transações.");
    } finally {
      setIsImporting(false);
      console.log("Finalizou processo de importação.");
    }
  }
return (
  <Dialog
    open={isOpen}
    onOpenChange={(open) => {
      setIsOpen(open);
      if (!open) {
        form.reset();
      }
    }}
  >
    <DialogTrigger asChild></DialogTrigger>
    <DialogContent
      className="custom-scrollbar"
      style={{
        height: "80%",
        overflow: "auto",
        width: "90%",
        padding: "30px 40px",
        backgroundColor: "#252525",
        pointerEvents: "auto",
        boxShadow: "4px 4px 10px #b8b8b852",
        borderRadius: "15px",
        zIndex: 1,
      }}
    >
      <DialogHeader>
        <DialogTitle>
          {isUpdate ? "Atualizar" : "Criar"} transação
        </DialogTitle>
        <DialogDescription>Insira as informações abaixo</DialogDescription>
      </DialogHeader>

      {importPreview.length > 0 && (
        <div className="mb-4 bg-neutral-800 rounded">
          <h4 className="font-bold mb-4">Prévia da importação</h4>
          <ul className="max-h-[19rem] overflow-auto text-sm">
            {importPreview.map((tr, i) => (
              <li key={i} className="mb-1">
                <b>{tr.name}</b> — {tr.type} — R$ {tr.amount} — {tr.category}
              </li>
            ))}
          </ul>
          <div className="flex gap-2 mt-2 items-center">
            <Button size="sm" onClick={handleImportConfirm} disabled={isImporting}>
              {isImporting ? (
                <>
                  <span className="animate-spin mr-2 border-2 border-t-transparent border-white rounded-full w-4 h-4 inline-block align-middle" />
                  Importando...
                </>
              ) : (
                <>Importar {importPreview.length} transações</>
              )}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setImportPreview([])}
              disabled={isImporting}
            >
              Cancelar
            </Button>
          </div>
        </div>
      )}

      {importPreview.length === 0 && (
        <div className="mb-4 flex gap-2">
          <div className="flex justify-center w-full">
            <Button
              type="button"
              variant="secondary"
              onClick={() => fileInputRef.current?.click()}
              style={{ backgroundColor: "#c50000", color: "white" }}
            >
              Importar OFX
            </Button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".ofx"
            className="hidden"
            onChange={handleOfxImport}
          />
        </div>
      )}

      {importPreview.length === 0 && (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input placeholder="Digite o nome..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor</FormLabel>
                  <FormControl>
                    <MoneyInput
                      placeholder="R$ 350"
                      value={field.value}
                      onValueChange={({ floatValue }) =>
                        field.onChange(floatValue)
                      }
                      onBlur={field.onBlur}
                      disabled={field.disabled}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo</FormLabel>
                  <Select
                    onValueChange={(val) =>
                      field.onChange(val as TransactionType)
                    }
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {TRANSACTION_TYPE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoria</FormLabel>
                  <Select
                    onValueChange={(val) =>
                      field.onChange(val as TransactionCategory)
                    }
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a categoria..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {TRANSACTION_CATEGORY_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="paymentMethod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Método de pagamento</FormLabel>
                  <Select
                    onValueChange={(val) =>
                      field.onChange(val as TransactionPaymentMethod)
                    }
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um método de pagamento..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {TRANSACTION_PAYMENT_METHOD_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data</FormLabel>
                  <DatePicker value={field.value} onChange={field.onChange} />
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancelar
                </Button>
              </DialogClose>
              <Button type="submit">
                {isUpdate ? "Atualizar" : "Adicionar"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      )}
    </DialogContent>
  </Dialog>
);
}
  //   return (
  //     <Dialog
  //       open={isOpen}
  //       onOpenChange={(open) => {
  //         setIsOpen(open);
  //         if (!open) {
  //           form.reset();
  //         }
  //       }}
  //     >
  //       <DialogTrigger asChild></DialogTrigger>
  //       <DialogContent
  //         className="custom-scrollbar"
  //         style={{
  //           height: "80%",
  //           overflow: "auto",
  //           width: "90%",
  //           padding: "30px 40px",
  //           backgroundColor: "#252525",
  //           pointerEvents: "auto",
  //           boxShadow: "4px 4px 10px #b8b8b852",
  //           borderRadius: "15px",
  //         }}
  //       >
  //         <DialogHeader>
  //           <DialogTitle>
  //             {isUpdate ? "Atualizar" : "Criar"} transação
  //           </DialogTitle>
  //           <DialogDescription>Insira as informações abaixo</DialogDescription>
  //         </DialogHeader>

  //         {/* <div className="mb-4 flex gap-2">
  //           <div className="flex justify-center w-full">
  //             <Button
  //               type="button"
  //               variant="secondary"
  //               onClick={() => fileInputRef.current?.click()}
  //               style={{ backgroundColor: '#c50000', color: 'white' }}
  //             >
  //               Importar OFX
  //             </Button>
  //           </div>
  //           <input
  //             ref={fileInputRef}
  //             type="file"
  //             accept=".ofx"
  //             className="hidden"
  //             onChange={handleOfxImport}
  //           />
  //         </div> */}

  //         {importPreview.length > 0 && (
  //           <div className="mb-4 bg-neutral-800 rounded">
  //             <h4 className="font-bold mb-4">Prévia da importação</h4>
  //             <ul className="max-h-[19rem] overflow-auto text-sm">
  //               {importPreview.map((tr, i) => (
  //               <li key={i} className="mb-1">
  //                 <b>{tr.name}</b> — {tr.type} — R$ {tr.amount} — {tr.category}
  //               </li>
  //               ))}
  //             </ul>
  //             <div className="flex gap-2 mt-2 items-center">
  //               <Button
  //                 size="sm"
  //                 onClick={handleImportConfirm}
  //                 disabled={isImporting}
  //               >
  //                 {isImporting ? (
  //                   <>
  //                     <span className="animate-spin mr-2 border-2 border-t-transparent border-white rounded-full w-4 h-4 inline-block align-middle" />
  //                     Importando...
  //                   </>
  //                 ) : (
  //                   <>Importar {importPreview.length} transações</>
  //                 )}
  //               </Button>
  //               <Button
  //                 size="sm"
  //                 variant="outline"
  //                 onClick={() => setImportPreview([])}
  //                 disabled={isImporting}
  //               >
  //                 Cancelar
  //               </Button>
  //             </div>
  //           </div>
  //         )}

  //         {importPreview.length === 0 && (
  //           <div className="mb-4 flex gap-2">
  //             <div className="flex justify-center w-full">
  //               <Button
  //                 type="button"
  //                 variant="secondary"
  //                 onClick={() => fileInputRef.current?.click()}
  //                 style={{ backgroundColor: '#c50000', color: 'white' }}
  //               >
  //                 Importar OFX
  //               </Button>
  //             </div>
  //             <input
  //               ref={fileInputRef}
  //               type="file"
  //               accept=".ofx"
  //               className="hidden"
  //               onChange={handleOfxImport}
  //             />
  //           </div>
  //         )}

  //         {importPreview.length === 0 && (
  //           <Form {...form}>
  //             <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
  //               <FormField
  //                 control={form.control}
  //                 name="name"
  //                 render={({ field }) => (
  //                   <FormItem>
  //                     <FormLabel>Nome</FormLabel>
  //                     <FormControl>
  //                       <Input placeholder="Digite o nome..." {...field} />
  //                     </FormControl>
  //                     <FormMessage />
  //                   </FormItem>
  //                 )}
  //               />
  //               <FormField
  //                 control={form.control}
  //                 name="amount"
  //                 render={({ field }) => (
  //                   <FormItem>
  //                     <FormLabel>Valor</FormLabel>
  //                     <FormControl>
  //                       <MoneyInput
  //                         placeholder="R$ 350"
  //                         value={field.value}
  //                         onValueChange={({ floatValue }) =>
  //                           field.onChange(floatValue)
  //                         }
  //                         onBlur={field.onBlur}
  //                         disabled={field.disabled}
  //                       />
  //                     </FormControl>
  //                     <FormMessage />
  //                   </FormItem>
  //                 )}
  //               />
  //               <FormField
  //                 control={form.control}
  //                 name="type"
  //                 render={({ field }) => (
  //                   <FormItem>
  //                     <FormLabel>Tipo</FormLabel>
  //                     <Select
  //                       onValueChange={field.onChange}
  //                       defaultValue={field.value}
  //                     >
  //                       <FormControl>
  //                         <SelectTrigger>
  //                           <SelectValue placeholder="Selecione o tipo..." />
  //                         </SelectTrigger>
  //                       </FormControl>
  //                       <SelectContent>
  //                         {TRANSACTION_TYPE_OPTIONS.map((option) => (
  //                           <SelectItem key={option.value} value={option.value}>
  //                             {option.label}
  //                           </SelectItem>
  //                         ))}
  //                       </SelectContent>
  //                     </Select>
  //                     <FormMessage />
  //                   </FormItem>
  //                 )}
  //               />
  //               <FormField
  //                 control={form.control}
  //                 name="category"
  //                 render={({ field }) => (
  //                   <FormItem>
  //                     <FormLabel>Categoria</FormLabel>
  //                     <Select
  //                       onValueChange={field.onChange}
  //                       defaultValue={field.value}
  //                     >
  //                       <FormControl>
  //                         <SelectTrigger>
  //                           <SelectValue placeholder="Selecione a categoria..." />
  //                         </SelectTrigger>
  //                       </FormControl>
  //                       <SelectContent>
  //                         {TRANSACTION_CATEGORY_OPTIONS.map((option) => (
  //                           <SelectItem key={option.value} value={option.value}>
  //                             {option.label}
  //                           </SelectItem>
  //                         ))}
  //                       </SelectContent>
  //                     </Select>
  //                     <FormMessage />
  //                   </FormItem>
  //                 )}
  //               />
  //               <FormField
  //                 control={form.control}
  //                 name="paymentMethod"
  //                 render={({ field }) => (
  //                   <FormItem>
  //                     <FormLabel>Método de pagamento</FormLabel>
  //                     <Select
  //                       onValueChange={field.onChange}
  //                       defaultValue={field.value}
  //                     >
  //                       <FormControl>
  //                         <SelectTrigger>
  //                           <SelectValue placeholder="Selecione um método de pagamento..." />
  //                         </SelectTrigger>
  //                       </FormControl>
  //                       <SelectContent>
  //                         {TRANSACTION_PAYMENT_METHOD_OPTIONS.map((option) => (
  //                           <SelectItem key={option.value} value={option.value}>
  //                             {option.label}
  //                           </SelectItem>
  //                         ))}
  //                       </SelectContent>
  //                     </Select>
  //                     <FormMessage />
  //                   </FormItem>
  //                 )}
  //               />
  //               <FormField
  //                 control={form.control}
  //                 name="date"
  //                 render={({ field }) => (
  //                   <FormItem>
  //                     <FormLabel>Data</FormLabel>
  //                     <DatePicker value={field.value} onChange={field.onChange} />
  //                     <FormMessage />
  //                   </FormItem>
  //                 )}
  //               />
  //               <DialogFooter>
  //                 <DialogClose asChild>
  //                   <Button type="button" variant="outline">
  //                     Cancelar
  //                   </Button>
  //                 </DialogClose>
  //                 <Button type="submit">
  //                   {isUpdate ? "Atualizar" : "Adicionar"}
  //                 </Button>
  //               </DialogFooter>
  //             </form>
  //           </Form>
  //         )}
  //       </DialogContent>
  //     </Dialog>
  //   );
  // };

  export default UpsertTransactionDialog;
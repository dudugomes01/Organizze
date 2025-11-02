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
import { 
  Upload, 
  FileText, 
  Check, 
  X, 
  AlertCircle, 
  Loader2,
  Download,
  Eye,
  Trash2,
  Edit3
} from "lucide-react";

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

  const [step, setStep] = useState<'form' | 'import' | 'preview'>('form');
  const [importPreview, setImportPreview] = useState<FormSchema[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onSubmit = async (data: FormSchema) => {
    setIsSubmitting(true);
    try {
      await upsertTransaction({ ...data, id: transactionId });
      setIsOpen(false);
      form.reset();
      setStep('form');
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isUpdate = Boolean(transactionId);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleFileProcess = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.ofx')) {
      alert('Por favor, selecione um arquivo OFX válido.');
      return;
    }

    try {
      setIsImporting(true);
      const text = await file.text();
      const json = await ofx.parse(text);

      const stmts = json?.OFX?.BANKMSGSRSV1?.STMTTRNRS?.STMTRS?.BANKTRANLIST?.STMTTRN || [];

      type OfxTransaction = {
        TRNAMT?: string;
        TRNTYPE?: string;
        MEMO?: string;
        DTPOSTED?: string;
      };

      const imported: FormSchema[] = stmts.map((trn: OfxTransaction) => {
        const amount = Number(trn.TRNAMT || 0);
        const type = trn.TRNTYPE === "CREDIT" || amount > 0
          ? TransactionType.DEPOSIT
          : TransactionType.EXPENSE;
        const category = suggestCategory(trn.MEMO || "");

        let parsedDate = new Date();
        if (trn.DTPOSTED && trn.DTPOSTED.length >= 8) {
          const year = trn.DTPOSTED.slice(0, 4);
          const month = trn.DTPOSTED.slice(4, 6);
          const day = trn.DTPOSTED.slice(6, 8);
          parsedDate = new Date(`${year}-${month}-${day}`);
        }

        return {
          name: trn.MEMO || "Sem descrição",
          amount: Math.abs(amount),
          type,
          category,
          paymentMethod: TransactionPaymentMethod.OTHER,
          date: parsedDate,
        };
      });

      setImportPreview(imported);
      setStep('preview');
    } catch (error) {
      console.error("Erro ao processar arquivo OFX:", error);
      alert("Erro ao processar arquivo OFX. Verifique se o arquivo é válido.");
    } finally {
      setIsImporting(false);
    }
  };

  async function handleOfxImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      await handleFileProcess(file);
    }
  }

  async function handleImportConfirm() {
    setIsImporting(true);
    try {
      for (const data of importPreview) {
        await upsertTransaction(data);
      }
      setImportPreview([]);
      setIsOpen(false);
      form.reset();
      setStep('form');
    } catch (error) {
      console.error("Erro ao importar transações:", error);
      alert("Erro ao importar transações.");
    } finally {
      setIsImporting(false);
    }
  }

  const handleClose = () => {
    setIsOpen(false);
    form.reset();
    setStep('form');
    setImportPreview([]);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogTrigger asChild></DialogTrigger>
      <DialogContent className="sm:max-w-[600px] w-[95%] max-h-[90vh] h-[700px] overflow-hidden bg-white dark:bg-gray-900 border-0 shadow-2xl">
      <DialogHeader className="pb-6 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {step === 'form' ? (
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            {isUpdate ? <Edit3 className="h-5 w-5 text-blue-600" /> : <FileText className="h-5 w-5 text-blue-600" />}
          </div>
          ) : step === 'import' ? (
          <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
            <Upload className="h-5 w-5 text-green-600" />
          </div>
          ) : (
          <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
            <Eye className="h-5 w-5 text-purple-600" />
          </div>
          )}
              <div>
                <DialogTitle className="text-xl font-semibold text-white">
                  {step === 'form' 
                    ? (isUpdate ? "Editar Transação" : "Nova Transação")
                    : step === 'import' 
                    ? "Importar Transações"
                    : "Visualizar Importação"
                  }
                </DialogTitle>
                <DialogDescription className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {step === 'form' 
                    ? "Preencha os dados da transação"
                    : step === 'import'
                    ? "Arraste seu arquivo OFX ou clique para selecionar"
                    : `${importPreview.length} transações encontradas`
                  }
                </DialogDescription>
              </div>
            </div>
            
            {step !== 'form' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setStep('form');
                  setImportPreview([]);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Progress indicator */}
          <div className="flex space-x-2 mt-4">
            <div className={`h-1 flex-1 rounded ${step === 'form' ? 'bg-blue-500' : 'bg-gray-200'}`} />
            <div className={`h-1 flex-1 rounded ${step === 'import' ? 'bg-green-500' : 'bg-gray-200'}`} />
            <div className={`h-1 flex-1 rounded ${step === 'preview' ? 'bg-purple-500' : 'bg-gray-200'}`} />
          </div>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[calc(90vh-200px)] py-6">
          {/* Manual Form */}
          {step === 'form' && (
            <div className="space-y-6">
              {!isUpdate && (
                <div className="flex justify-center">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep('import')}
                    className="flex items-center space-x-2 border-dashed border-2 hover:border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                  >
                    <Download className="h-4 w-4" />
                    <span>Importar via OFX</span>
                  </Button>
                </div>
              )}

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Nome da Transação
                          </FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Ex: Compra no mercado" 
                              {...field} 
                              className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                            />
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
                          <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Valor
                          </FormLabel>
                          <FormControl>
                            <MoneyInput
                              placeholder="R$ 0,00"
                              value={field.value}
                              onValueChange={({ floatValue }) =>
                                field.onChange(floatValue)
                              }
                              onBlur={field.onBlur}
                              disabled={field.disabled}
                              className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Data
                          </FormLabel>
                          <DatePicker value={field.value} onChange={field.onChange} />
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Tipo
                          </FormLabel>
                          <Select
                            onValueChange={(val) => field.onChange(val as TransactionType)}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                                <SelectValue placeholder="Selecione o tipo" />
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
                          <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Categoria
                          </FormLabel>
                          <Select
                            onValueChange={(val) => field.onChange(val as TransactionCategory)}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                                <SelectValue placeholder="Selecione a categoria" />
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
                        <FormItem className="md:col-span-2">
                          <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Método de Pagamento
                          </FormLabel>
                          <Select
                            onValueChange={(val) => field.onChange(val as TransactionPaymentMethod)}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                                <SelectValue placeholder="Selecione o método" />
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
                  </div>
                </form>
              </Form>
            </div>
          )}

          {/* Import Screen */}
          {step === 'import' && (
            <div className="space-y-6">
              <div
                className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                  dragActive 
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                    : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".ofx"
                  className="hidden"
                  onChange={handleOfxImport}
                />
                
                <div className="space-y-4">
                  <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                    {isImporting ? (
                      <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
                    ) : (
                      <Upload className="h-8 w-8 text-gray-400" />
                    )}
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      {isImporting ? 'Processando arquivo...' : 'Importar arquivo OFX'}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Arraste e solte seu arquivo aqui ou clique para selecionar
                    </p>
                  </div>

                  <Button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isImporting}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Selecionar arquivo OFX
                  </Button>
                </div>
              </div>

              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div className="text-sm">
                    <p className="text-amber-800 dark:text-amber-200 font-medium">
                      Sobre arquivos OFX
                    </p>
                    <p className="text-amber-700 dark:text-amber-300 mt-1">
                      Arquivos OFX são extratos bancários padronizados. Você pode baixá-los 
                      diretamente do seu banco para importar todas as transações de uma vez.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

            {/* Preview Screen */}
            {step === 'preview' && importPreview.length > 0 && (
            <div className="space-y-6">
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <Check className="flex-shrink-0 h-5 w-5 text-green-600" />
                <div className="flex-1 min-w-0">
                <p className="text-green-800 dark:text-green-200 font-medium">
                  Arquivo processado com sucesso!
                </p>
                <p className="text-green-700 dark:text-green-300 text-sm">
                  {importPreview.length} transações encontradas para importação
                </p>
                </div>
              </div>
              </div>

              <div className="border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <h4 className="font-medium text-white">
                Prévia das Transações
                </h4>
              </div>
              
              <div className="max-h-60 overflow-y-auto">
                {importPreview.map((transaction, index) => (
                <div 
                  key={index} 
                  className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                    {transaction.name}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      transaction.type === TransactionType.DEPOSIT 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {transaction.type === TransactionType.DEPOSIT ? 'Receita' : 'Despesa'}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {transaction.date.toLocaleDateString('pt-BR')}
                    </span>
                    </div>
                  </div>
                  <div className="text-left sm:text-right flex-shrink-0">
                    <p className={`text-sm font-semibold ${
                    transaction.type === TransactionType.DEPOSIT 
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400'
                    }`}>
                    R$ {transaction.amount.toFixed(2).replace('.', ',')}
                    </p>
                  </div>
                  </div>
                </div>
                ))}
              </div>
              </div>
            </div>
            )}
          </div>

          <DialogFooter className="pt-6 border-t border-gray-100 dark:border-gray-700">
            {step === 'form' && (
            <div className="flex flex-col-reverse sm:flex-row justify-between w-full gap-2">
              <DialogClose asChild>
              <Button variant="outline" type="button" className="w-full sm:w-auto">
                Cancelar
              </Button>
              </DialogClose>
              <Button 
              type="submit" 
              onClick={form.handleSubmit(onSubmit)}
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto"
              >
              {isSubmitting ? (
                <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isUpdate ? 'Atualizando...' : 'Salvando...'}
                </>
              ) : (
                <>
                <Check className="mr-2 h-4 w-4" />
                {isUpdate ? 'Atualizar' : 'Salvar'}
                </>
              )}
              </Button>
            </div>
            )}

            {step === 'import' && (
            <div className="flex justify-between w-full">
              <Button variant="outline" onClick={() => setStep('form')} className="w-full sm:w-auto">
              Voltar
              </Button>
            </div>
            )}

            {step === 'preview' && (
            <div className="flex flex-col-reverse sm:flex-row justify-between w-full gap-2">
              <div className="flex flex-col sm:flex-row gap-2">
              <Button variant="outline" onClick={() => setStep('import')} className="w-full sm:w-auto">
                Voltar
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                setImportPreview([]);
                setStep('form');
                }}
                className="w-full sm:w-auto"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Descartar
              </Button>
              </div>
              <Button
              onClick={handleImportConfirm}
              disabled={isImporting}
              className="bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto"
              >
              {isImporting ? (
                <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Importando...
                </>
              ) : (
                <>
                <Check className="mr-2 h-4 w-4" />
                Importar {importPreview.length} transações
                </>
              )}
              </Button>
            </div>
            )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UpsertTransactionDialog;
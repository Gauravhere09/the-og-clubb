
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle, X, HelpCircle, ArrowLeft, ChevronRight } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";

interface PollCreatorProps {
  onPollCreate: (poll: { question: string; options: string[] }) => void;
  onCancel: () => void;
}

export function PollCreator({ onPollCreate, onCancel }: PollCreatorProps) {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState<string[]>(["", ""]);
  const [allowMultipleAnswers, setAllowMultipleAnswers] = useState(false);
  const maxOptions = 4;

  const addOption = () => {
    if (options.length < maxOptions) {
      setOptions([...options, ""]);
    }
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = () => {
    if (question.trim() && options.every(opt => opt.trim())) {
      onPollCreate({
        question: question.trim(),
        options: options.map(opt => opt.trim())
      });
    }
  };

  const isValid = question.trim() && options.every(opt => opt.trim());

  return (
    <div className="space-y-4 p-4 bg-background">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={onCancel}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-xl font-semibold">Crea una encuesta</h2>
      </div>
      
      <div className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm text-muted-foreground" htmlFor="poll-question">Pregunta</label>
          <Input
            id="poll-question"
            name="poll-question"
            placeholder="Escribe tu pregunta"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="bg-background border-muted-foreground/20"
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm text-muted-foreground">Opciones</label>
          {options.map((option, index) => (
            <div key={index} className="flex items-center gap-2">
              <Input
                placeholder={`Opción ${index + 1}`}
                value={option}
                onChange={(e) => updateOption(index, e.target.value)}
                className="bg-background border-muted-foreground/20"
                id={`poll-option-${index}`}
                name={`poll-option-${index}`}
              />
              {options.length > 2 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeOption(index)}
                  className="shrink-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </div>
          ))}
        </div>

        {options.length < maxOptions && (
          <Button
            variant="ghost"
            size="sm"
            onClick={addOption}
            className="w-full text-primary"
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Añadir
          </Button>
        )}

        <div className="flex items-center justify-between py-4 border-t border-muted-foreground/20">
          <span className="text-sm">Permitir varias respuestas</span>
          <Switch
            checked={allowMultipleAnswers}
            onCheckedChange={setAllowMultipleAnswers}
            id="multiple-answers"
            name="multiple-answers"
          />
        </div>
      </div>

      <Button
        onClick={handleSubmit}
        disabled={!isValid}
        className="w-full bg-primary text-primary-foreground mt-4"
        size="lg"
      >
        Publicar
      </Button>
    </div>
  );
}

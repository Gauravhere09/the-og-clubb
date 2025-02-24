
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle, X } from "lucide-react";

interface PollCreatorProps {
  onPollCreate: (poll: { question: string; options: string[] }) => void;
  onCancel: () => void;
}

export function PollCreator({ onPollCreate, onCancel }: PollCreatorProps) {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState<string[]>(["", ""]);

  const addOption = () => {
    if (options.length < 4) {
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

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-background">
      <Input
        placeholder="Escribe tu pregunta"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
      />
      <div className="space-y-2">
        {options.map((option, index) => (
          <div key={index} className="flex gap-2">
            <Input
              placeholder={`Opción ${index + 1}`}
              value={option}
              onChange={(e) => updateOption(index, e.target.value)}
            />
            {options.length > 2 && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeOption(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
      </div>
      {options.length < 4 && (
        <Button
          variant="outline"
          size="sm"
          onClick={addOption}
          className="w-full"
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Agregar opción
        </Button>
      )}
      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={!question.trim() || !options.every(opt => opt.trim())}
        >
          Crear encuesta
        </Button>
      </div>
    </div>
  );
}

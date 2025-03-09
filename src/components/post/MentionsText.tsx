
import { Link } from "react-router-dom";
import { Fragment } from "react";

interface MentionsTextProps {
  content: string;
}

export function MentionsText({ content }: MentionsTextProps) {
  if (!content) return null;
  
  // Expresión regular para encontrar menciones con el formato @usuario
  const mentionRegex = /@(\w+)/g;
  
  // Dividir el contenido en partes: texto normal y menciones
  const parts = [];
  let lastIndex = 0;
  let match;
  
  // Encontrar todas las coincidencias de menciones en el texto
  while ((match = mentionRegex.exec(content)) !== null) {
    // Añadir el texto antes de la mención
    if (match.index > lastIndex) {
      parts.push({
        type: 'text',
        content: content.substring(lastIndex, match.index)
      });
    }
    
    // Añadir la mención
    parts.push({
      type: 'mention',
      username: match[1],
      content: match[0]
    });
    
    lastIndex = match.index + match[0].length;
  }
  
  // Añadir el resto del texto después de la última mención
  if (lastIndex < content.length) {
    parts.push({
      type: 'text',
      content: content.substring(lastIndex)
    });
  }
  
  return (
    <>
      {parts.map((part, index) => (
        <Fragment key={index}>
          {part.type === 'text' ? (
            part.content
          ) : (
            <Link 
              to={`/profile/${part.username}`} 
              className="text-primary font-semibold hover:underline"
            >
              {part.content}
            </Link>
          )}
        </Fragment>
      ))}
    </>
  );
}

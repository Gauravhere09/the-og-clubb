
import { Link } from "react-router-dom";
import { Fragment, useMemo, useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface MentionsTextProps {
  content: string;
}

export function MentionsText({ content }: MentionsTextProps) {
  const [userIds, setUserIds] = useState<Record<string, string>>({});
  
  if (!content) return null;
  
  // Usamos useMemo para evitar reprocesar el texto en cada renderizado
  const parts = useMemo(() => {
    // Expresión regular para encontrar menciones con el formato @usuario
    const mentionRegex = /@(\w+)/g;
    
    // Dividir el contenido en partes: texto normal y menciones
    const contentParts = [];
    let lastIndex = 0;
    let match;
    
    // Encontrar todas las coincidencias de menciones en el texto
    while ((match = mentionRegex.exec(content)) !== null) {
      // Añadir el texto antes de la mención
      if (match.index > lastIndex) {
        contentParts.push({
          type: 'text',
          content: content.substring(lastIndex, match.index)
        });
      }
      
      // Añadir la mención
      contentParts.push({
        type: 'mention',
        username: match[1],
        content: match[0]
      });
      
      lastIndex = match.index + match[0].length;
    }
    
    // Añadir el resto del texto después de la última mención
    if (lastIndex < content.length) {
      contentParts.push({
        type: 'text',
        content: content.substring(lastIndex)
      });
    }
    
    return contentParts;
  }, [content]);
  
  // Efecto para buscar los IDs de usuario para todas las menciones
  useEffect(() => {
    const fetchUserIds = async () => {
      const usernames = parts
        .filter(part => part.type === 'mention')
        .map(part => (part as { username: string }).username);
      
      if (usernames.length === 0) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, username')
          .in('username', usernames);
        
        if (error) {
          console.error("Error fetching user IDs:", error);
          return;
        }
        
        const userMap: Record<string, string> = {};
        data?.forEach(user => {
          if (user.username) {
            userMap[user.username] = user.id;
          }
        });
        
        setUserIds(userMap);
      } catch (error) {
        console.error("Error fetching user IDs:", error);
      }
    };
    
    fetchUserIds();
  }, [parts]);
  
  return (
    <>
      {parts.map((part, index) => (
        <Fragment key={index}>
          {part.type === 'text' ? (
            part.content
          ) : (
            <Link 
              to={`/profile/${userIds[(part as { username: string }).username] || (part as { username: string }).username}`} 
              className="text-primary font-semibold hover:underline inline-flex items-center"
            >
              {part.content}
            </Link>
          )}
        </Fragment>
      ))}
    </>
  );
}

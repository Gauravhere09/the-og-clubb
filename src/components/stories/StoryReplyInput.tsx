
interface StoryReplyInputProps {
  onFocus: () => void;
}

export function StoryReplyInput({ onFocus }: StoryReplyInputProps) {
  return (
    <div className="absolute left-0 right-0 bottom-0">
      <form className="flex items-center px-4 py-2 bg-black/80 backdrop-blur-sm">
        <input
          type="text"
          placeholder="Responder..."
          className="w-full bg-transparent text-white border-none focus:outline-none placeholder:text-gray-400"
          onClick={onFocus}
        />
      </form>
    </div>
  );
}

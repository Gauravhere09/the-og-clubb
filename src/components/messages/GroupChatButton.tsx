
interface GroupChatButtonProps {
  onClick: () => void;
}

export const GroupChatButton = ({ onClick }: GroupChatButtonProps) => {
  return (
    <button
      onClick={onClick}
      className="w-full p-4 flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-neutral-900 transition-colors border-b border-gray-200 dark:border-neutral-800"
    >
      <div className="w-12 h-12 rounded-full bg-[#9b87f5] dark:bg-black border border-[#7E69AB] dark:border-neutral-800 flex items-center justify-center">
        <span className="text-lg font-semibold text-white">H</span>
      </div>
      <div className="flex-1">
        <div className="font-medium">Red H</div>
        <div className="text-sm text-gray-500 dark:text-gray-400">Chat grupal</div>
      </div>
      <div className="text-xs text-gray-500 dark:text-gray-400">
        {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </div>
    </button>
  );
};

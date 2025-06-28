import {
  ArrowLeftIcon,
  HomeIcon,
  MagnifyingGlassIcon,
  FireIcon,
  BookmarkIcon,
} from "@heroicons/react/24/outline";
import { useNavigation } from "../contexts/NavigationContext";

function SmartBackButton({ className = "" }) {
  const { canGoBack, getBackButtonInfo, goBack } = useNavigation();

  // Don't render if we can't go back
  if (!canGoBack()) {
    return null;
  }

  const backInfo = getBackButtonInfo();

  const getIcon = (iconType) => {
    switch (iconType) {
      case 'search':
        return MagnifyingGlassIcon;
      case 'home':
        return HomeIcon;
      case 'trending':
        return FireIcon;
      case 'watchlist':
        return BookmarkIcon;
      default:
        return ArrowLeftIcon;
    }
  };

  const IconComponent = getIcon(backInfo.icon);

  return (
    <button
      onClick={goBack}
      className={`
        inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium 
        bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700
        text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white
        transition-all duration-200 group
        ${className}
      `}
      title={backInfo.subtitle ? `${backInfo.text} - ${backInfo.subtitle}` : backInfo.text}
    >
      <IconComponent className="h-4 w-4 mr-2 group-hover:-translate-x-0.5 transition-transform duration-200" />
      <div className="flex flex-col items-start">
        <span className="text-sm font-medium">{backInfo.text}</span>
        {backInfo.subtitle && (
          <span className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[200px]">
            {backInfo.subtitle}
          </span>
        )}
      </div>
    </button>
  );
}

export default SmartBackButton;

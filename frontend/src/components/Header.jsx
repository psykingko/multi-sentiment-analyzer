const Header = () => {
  return (
    <header className="mb-10 text-center">
      <h1 className="text-4xl font-extrabold text-indigo-700 dark:text-indigo-400">
        Multi-Sentiment Analyzer
      </h1>
      <p className="text-gray-600 dark:text-gray-300 mt-2 text-lg">
        Analyze sentiment of each sentence in your paragraph using AI
      </p>
    </header>
  );
};

export default Header;

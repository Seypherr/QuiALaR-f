function Welcome({ title, description, ctaText = "Commencer" }) {
  return (
    <div className="text-center space-y-6">
      <h1 className="text-4xl font-bold text-gray-900">
        {title || "Bienvenue !"}
      </h1>
      <p className="text-lg text-gray-600 max-w-md mx-auto">
        {description || "Bienvenue sur notre application. Découvrez nos fonctionnalités et commencez votre aventure."}
      </p>
      <button className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors">
        {ctaText}
      </button>
    </div>
  );
}

export default Welcome;
